"""
Shokhi — deterministic symptom-triage & safety engine.

Consumes data/knowledge.json + a symptom profile dict and decides:
  * the URGENCY level (emergency / see_doctor_soon / self_care / info),
  * which clinical RED FLAGS fired,
  * which CONDITIONS are worth discussing with a doctor (PCOS / endometriosis / PMS …),
  * which screening QUESTIONS are still worth asking.

Design principle (mirrors the whole app's safety model): the URGENCY DECISION is
made HERE by rules, never by the LLM. Gemma only turns this structured result into
warm, literacy-appropriate Bangla. This module has zero LLM dependency, no network,
no API key — so it is fully unit-testable, and it can never *under-triage* an
emergency because of a language-model mistake.

`suspect_when` / `when` use a tiny operator table over the symptom fields. A clause
only fires on a CONFIRMED-true field; unknown fields never trigger a red flag (safe
default), but they are surfaced as screening questions so the assistant can ask.
"""

from __future__ import annotations

import json
import operator
from pathlib import Path
from typing import Any, Callable

KNOWLEDGE_PATH = Path(__file__).resolve().parent / "data" / "knowledge.json"

# --- urgency ranking ----------------------------------------------------------
EMERGENCY = "emergency"
SEE_DOCTOR = "see_doctor_soon"
SELF_CARE = "self_care"
INFO = "info"
_RANK = {EMERGENCY: 3, SEE_DOCTOR: 2, SELF_CARE: 1, INFO: 0}

# --- operator table -----------------------------------------------------------
_OPS: dict[str, Callable[[Any, Any], bool]] = {
    "is_true": lambda a, _b: a is True,
    "is_false": lambda a, _b: a is False,
    "gte": operator.ge,
    "lte": operator.le,
    "gt": operator.gt,
    "lt": operator.lt,
    "eq": operator.eq,
    "in": lambda a, b: a in b,
}
_UNARY_OPS = {"is_true", "is_false"}

# Fields that are critical to rule an emergency in or out. If any is unknown we ask.
_CRITICAL_SCREENING = [
    "severe_pelvic_pain", "heavy_bleeding", "fainting_or_dizzy",
    "is_pregnant_possible", "fever",
]


def load_knowledge(path: str | Path = KNOWLEDGE_PATH) -> dict:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def _clause_passes(clause: dict, profile: dict) -> bool | None:
    """True/False if the field is known, None if the field is missing."""
    fld = clause["field"]
    if fld not in profile or profile[fld] is None:
        return None
    fn = _OPS[clause["op"]]
    pv = profile[fld]
    return fn(pv, None) if clause["op"] in _UNARY_OPS else fn(pv, clause.get("value"))


def _all_pass(clauses: list[dict], profile: dict) -> bool:
    """AND over clauses. A missing field counts as not-passing (conservative)."""
    return all(_clause_passes(c, profile) is True for c in clauses)


def _any_pass(clauses: list[dict], profile: dict) -> bool:
    return any(_clause_passes(c, profile) is True for c in clauses)


def _match_red_flags(knowledge: dict, profile: dict) -> list[dict]:
    """A red flag fires when its `when` (AND) clauses all pass. If it also declares an
    optional `any` list, at least one of those must pass too (e.g. pregnancy + one of
    several danger signs)."""
    fired = []
    for rf in knowledge.get("red_flags", []):
        any_clauses = rf.get("any", [])
        ok_any = _any_pass(any_clauses, profile) if any_clauses else True
        if _all_pass(rf["when"], profile) and ok_any:
            fired.append({
                "id": rf["id"], "name_bn": rf["name_bn"], "name_en": rf["name_en"],
                "urgency": rf["urgency"], "message_bn": rf["message_bn"],
                "message_en": rf["message_en"], "action_bn": rf["action_bn"],
                "action_en": rf["action_en"],
            })
    return fired


def _match_conditions(knowledge: dict, profile: dict) -> list[dict]:
    """A condition is 'suspected' when its all-clauses pass AND its any-clauses pass."""
    suspected = []
    for cond in knowledge.get("conditions", []):
        sw = cond.get("suspect_when", {})
        ok_all = _all_pass(sw.get("all", []), profile)   # empty -> all([]) -> True
        any_clauses = sw.get("any", [])
        ok_any = _any_pass(any_clauses, profile) if any_clauses else True
        if ok_all and ok_any:
            suspected.append({
                "id": cond["id"], "name_bn": cond["name_bn"], "name_en": cond["name_en"],
                "urgency": cond["urgency"], "about_bn": cond["about_bn"],
                "about_en": cond["about_en"],
                "self_care_bn": cond.get("self_care_bn", []),
                "self_care_en": cond.get("self_care_en", []),
                "see_doctor_bn": cond.get("see_doctor_bn", ""),
                "see_doctor_en": cond.get("see_doctor_en", ""),
            })
    return suspected


def _screening_questions(knowledge: dict, profile: dict) -> dict[str, str]:
    """Unanswered critical questions worth asking to rule an emergency in/out."""
    schema = knowledge.get("symptom_schema", {})
    out: dict[str, str] = {}
    for fld in _CRITICAL_SCREENING:
        if profile.get(fld) is None and fld in schema:
            out[fld] = schema[fld].get("question_bn", "")
    return out


def triage(profile: dict, knowledge: dict | None = None) -> dict:
    """
    Run the full deterministic triage. Returns a JSON-serializable summary that the
    Gemma layer / UI consumes. The overall `urgency` is the highest rank among all
    fired red flags and suspected conditions (default: info).
    """
    kb = knowledge if knowledge is not None else load_knowledge()

    red_flags = _match_red_flags(kb, profile)
    conditions = _match_conditions(kb, profile)

    ranks = [_RANK[r["urgency"]] for r in red_flags] + \
            [_RANK[c["urgency"]] for c in conditions]
    top = max(ranks) if ranks else _RANK[INFO]
    urgency = next(k for k, v in _RANK.items() if v == top)

    meta = kb.get("meta", {})
    return {
        "urgency": urgency,
        "urgency_label_bn": meta.get("urgency_levels", {}).get(urgency, {}).get("label_bn", ""),
        "urgency_label_en": meta.get("urgency_levels", {}).get(urgency, {}).get("label_en", ""),
        "red_flags": red_flags,
        "suspected_conditions": conditions,
        "outstanding_questions": _screening_questions(kb, profile),
        "emergency_number_bd": meta.get("emergency_number_bd", "999"),
        "health_hotline_bd": meta.get("health_hotline_bd", ""),
        "disclaimer_bn": meta.get("disclaimer_bn", ""),
        "disclaimer_en": meta.get("disclaimer_en", ""),
    }


# --- manual smoke test --------------------------------------------------------
if __name__ == "__main__":
    demo = {
        "age": 24,
        "cycles_irregular": True,
        "excess_hair": True,
        "unexplained_weight_gain": True,
        "severe_pelvic_pain": False,
    }
    print(json.dumps(triage(demo), ensure_ascii=False, indent=2))
