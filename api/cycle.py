"""
Shokhi — menstrual cycle & symptom tracking analysis.

Turns a woman's logged period history into plain-Bangla insight: average cycle length,
how regular it is, a gentle next-period estimate, and patterns worth showing a doctor
(very long/short/irregular cycles, repeated heavy flow or severe pain). This is what
gives Shokhi *continuity* — "your cycles have been 45–60 days for months, worth
checking" — instead of one-shot Q&A.

Like triage.py, this is a PURE, deterministic, offline module (no LLM, no network): the
observations are computed by rules so they are stable and unit-testable. It never
diagnoses; it surfaces patterns and can *suggest* symptom flags (e.g. cycles_irregular)
that the normal triage engine may then act on.

A "log" is one recorded period:
    {"start": "2026-06-01", "end": "2026-06-05",   # ISO dates; end optional
     "flow": "light|normal|heavy",                  # optional
     "pain": 0-3,                                    # optional (0 none … 3 severe)
     "note": "..."}                                  # optional
"""

from __future__ import annotations

from datetime import date, datetime
from statistics import mean

# Normal-range guides (days). Outside these is worth a doctor's look, not a diagnosis.
_NORMAL_CYCLE_MIN = 21
_NORMAL_CYCLE_MAX = 35
_IRREGULAR_SPREAD = 9   # >9 days between shortest & longest cycle => "irregular"
_LONG_GAP_MISSED = 90   # a 3+ month gap => missed_periods_3plus signal


def _parse(d: str) -> date | None:
    try:
        return datetime.strptime(d.strip()[:10], "%Y-%m-%d").date()
    except (ValueError, AttributeError):
        return None


def _sorted_starts(logs: list[dict]) -> list[date]:
    return sorted(d for d in (_parse(l.get("start", "")) for l in logs) if d)


def analyze(logs: list[dict], today: date | None = None) -> dict:
    """Analyse a list of period logs into numbers + Bangla insights + suggested symptoms."""
    today = today or date.today()
    starts = _sorted_starts(logs)

    result: dict = {
        "logged_count": len(starts),
        "cycle_lengths": [],
        "avg_cycle_length": None,
        "shortest_cycle": None,
        "longest_cycle": None,
        "avg_period_length": None,
        "regular": None,
        "predicted_next_start": None,
        "days_until_next": None,
        "insights_bn": [],
        "suggested_symptoms": {},
        "disclaimer_bn": "এটি শুধু আপনার লেখা তথ্যের ভিত্তিতে একটি ধারণা — নিশ্চিত "
                         "রোগ নির্ণয় নয়। কোনো দুশ্চিন্তা থাকলে ডাক্তার দেখান।",
    }

    if len(starts) < 2:
        result["insights_bn"].append(
            "প্যাটার্ন বুঝতে অন্তত ২টি মাসিকের তারিখ লিখুন। প্রতিবার মাসিক শুরু হলে "
            "তারিখটি এখানে যোগ করুন — সখী আপনার চক্র বুঝতে সাহায্য করবে।"
        )
        return result

    # cycle lengths = gaps between consecutive start dates
    lengths = [(b - a).days for a, b in zip(starts, starts[1:]) if (b - a).days > 0]
    if not lengths:
        return result
    avg = round(mean(lengths))
    result["cycle_lengths"] = lengths
    result["avg_cycle_length"] = avg
    result["shortest_cycle"] = min(lengths)
    result["longest_cycle"] = max(lengths)

    # period (bleeding) duration where an end date was given
    durations = []
    for l in logs:
        s, e = _parse(l.get("start", "")), _parse(l.get("end", "") or "")
        if s and e and e >= s:
            durations.append((e - s).days + 1)
    if durations:
        result["avg_period_length"] = round(mean(durations))

    # regularity
    spread = max(lengths) - min(lengths)
    regular = spread <= _IRREGULAR_SPREAD and _NORMAL_CYCLE_MIN <= avg <= _NORMAL_CYCLE_MAX
    result["regular"] = regular

    # next-period estimate from the last start + average cycle
    predicted = starts[-1].fromordinal(starts[-1].toordinal() + avg)
    result["predicted_next_start"] = predicted.isoformat()
    result["days_until_next"] = (predicted - today).days

    # --- Bangla insights + suggested symptom flags ----------------------------
    ins = result["insights_bn"]
    ins.append(f"আপনার গড় মাসিক চক্র প্রায় {avg} দিন।")
    if result["avg_period_length"]:
        ins.append(f"মাসিক সাধারণত {result['avg_period_length']} দিন স্থায়ী হয়।")

    if regular:
        ins.append("আপনার মাসিক মোটামুটি নিয়মিত — এটি ভালো লক্ষণ।")
    else:
        ins.append(
            f"আপনার চক্র কিছুটা অনিয়মিত (সবচেয়ে ছোট {min(lengths)} দিন, বড় "
            f"{max(lengths)} দিন)। মাঝে মাঝে এমন হতে পারে, তবে ধারাবাহিক হলে ডাক্তার দেখান।"
        )
        result["suggested_symptoms"]["cycles_irregular"] = True

    if avg > _NORMAL_CYCLE_MAX:
        ins.append(
            "আপনার চক্র স্বাভাবিকের চেয়ে লম্বা। দীর্ঘ ও অনিয়মিত চক্র কখনো কখনো "
            "পিসিওএস-এর সাথে যুক্ত থাকে — একজন স্ত্রীরোগ বিশেষজ্ঞের সাথে আলোচনা করা ভালো।"
        )
        result["suggested_symptoms"]["cycles_irregular"] = True
    elif avg < _NORMAL_CYCLE_MIN:
        ins.append("আপনার চক্র স্বাভাবিকের চেয়ে ছোট — একজন ডাক্তারের সাথে আলোচনা করা ভালো।")
        result["suggested_symptoms"]["cycles_irregular"] = True

    # a very long gap since the last period
    gap_since_last = (today - starts[-1]).days
    if gap_since_last >= _LONG_GAP_MISSED:
        ins.append(
            f"শেষ মাসিকের পর প্রায় {gap_since_last} দিন হয়ে গেছে। ৩ মাসের বেশি মাসিক বন্ধ "
            "থাকলে (গর্ভাবস্থা ছাড়া) ডাক্তার দেখানো উচিত।"
        )
        result["suggested_symptoms"]["missed_periods_3plus"] = True

    # repeated heavy flow / severe pain patterns
    heavy = sum(1 for l in logs if str(l.get("flow", "")).lower() == "heavy")
    severe_pain = sum(1 for l in logs if isinstance(l.get("pain"), (int, float)) and l["pain"] >= 3)
    if heavy >= 2:
        ins.append("কয়েকবার ভারী রক্তক্ষরণ লিখেছেন। বারবার অতিরিক্ত রক্তক্ষরণে "
                   "রক্তস্বল্পতা হতে পারে — ডাক্তার দেখান ও আয়রন-সমৃদ্ধ খাবার খান।")
    if severe_pain >= 2:
        ins.append("কয়েকবার তীব্র ব্যথা লিখেছেন। মাসিকের তীব্র ব্যথা যা জীবন থামিয়ে দেয় "
                   "তা 'স্বাভাবিক' নয় — এটি নিয়ে ডাক্তারের সাথে কথা বলুন।")
        result["suggested_symptoms"]["periods_disrupt_daily_life"] = True

    return result


# --- manual smoke test --------------------------------------------------------
if __name__ == "__main__":
    import json
    demo = [
        {"start": "2026-01-05", "end": "2026-01-09", "flow": "heavy", "pain": 3},
        {"start": "2026-02-20", "flow": "heavy", "pain": 3},
        {"start": "2026-04-10"},
    ]
    print(json.dumps(analyze(demo, today=date(2026, 5, 1)), ensure_ascii=False, indent=2))
