"""
Shokhi orchestrator — the single entry point the UI (and demos) use.

Ties together:
  conversation  --(Gemma backend)-->  symptom profile
  symptom profile --(triage engine)-->  urgency + red flags + suspected conditions
  triage result --(Gemma backend)-->  warm, safe Bangla guidance

Holds the running symptom profile across turns so Shokhi can keep asking the critical
screening questions until it can safely triage.
"""

from __future__ import annotations

from dataclasses import dataclass, field

import triage as triage_engine
from gemma_backend import GemmaBackend, get_backend


@dataclass
class Assistant:
    backend: GemmaBackend = field(default_factory=get_backend)
    knowledge: dict = field(default_factory=triage_engine.load_knowledge)
    profile: dict = field(default_factory=dict)
    history: list[str] = field(default_factory=list)

    # --- conversation ---------------------------------------------------------
    def add_user_message(self, message: str) -> dict:
        """Ingest one message: update the symptom profile, then re-triage."""
        self.history.append(message)
        conversation = "\n".join(self.history)
        updates = self.backend.extract_symptoms(conversation, self.profile)
        self.profile.update(updates)
        return self.triage()

    def set_symptoms(self, **fields) -> dict:
        """Directly set/patch symptom fields (used by the checkbox UI)."""
        self.profile.update(fields)
        return self.triage()

    # --- decisions ------------------------------------------------------------
    def triage(self) -> dict:
        result = triage_engine.triage(self.profile, self.knowledge)
        # Attach the optional ML risk signals (support only — never changes urgency).
        # Fully graceful: if models/sklearn are missing, this is simply skipped.
        try:
            import risk_model
            signals = risk_model.risk_signals(self.profile)
            if signals:
                result["risk_signals"] = signals
        except Exception:
            pass
        return result

    def explain(self) -> str:
        """Warm, safe Bangla guidance for the current triage result."""
        return self.backend.explain_triage(self.triage())

    def is_emergency(self) -> bool:
        return self.triage()["urgency"] == triage_engine.EMERGENCY

    def next_question(self) -> str | None:
        """Next Bangla screening question to ask, or None if nothing critical is left."""
        qs = self.triage()["outstanding_questions"]
        return next(iter(qs.values()), None)

    def list_guides(self) -> list[dict]:
        """Short cards for the health-info guides (contraception, family planning, …)."""
        return [
            {"id": g["id"], "icon": g.get("icon", "🌸"),
             "title_bn": g.get("title_bn", ""), "title_en": g.get("title_en", ""),
             "summary_bn": g.get("summary_bn", "")}
            for g in self.knowledge.get("guides", [])
        ]

    def get_guide(self, gid: str) -> dict | None:
        """Return the full guide object by its id (for its own detail page)."""
        for g in self.knowledge.get("guides", []):
            if g["id"] == gid:
                return g
        return None

    def find_guide(self, topic: str) -> dict | None:
        """Match a guide by id, or by a keyword found in a free-text question."""
        guides = self.knowledge.get("guides", [])
        for g in guides:
            if g["id"] == topic:
                return g
        low = (topic or "").lower()
        if not low:
            return None
        # Prefer the most specific match: the guide whose LONGEST matching keyword wins,
        # so "কাপড়ের প্যাড" routes to cloth_pad rather than a generic "প্যাড" guide.
        best, best_len = None, 0
        for g in guides:
            for kw in g.get("keywords", []):
                k = kw.lower()
                if k in low and len(k) > best_len:
                    best, best_len = g, len(k)
        return best

    def explain_guide(self, topic: str) -> dict | None:
        """Look up a guide by id/keyword and return it with warm Bangla guidance."""
        g = self.find_guide(topic)
        if not g:
            return None
        return {"guide": self.list_guides_entry(g), "guidance": self.backend.explain_guide(g, topic)}

    @staticmethod
    def list_guides_entry(g: dict) -> dict:
        return {"id": g["id"], "icon": g.get("icon", "🌸"),
                "title_bn": g.get("title_bn", ""), "title_en": g.get("title_en", "")}

    def bust_myth(self, belief: str) -> str:
        """Answer a menstrual-health myth, grounding on the knowledge base if matched."""
        fact = ""
        low = belief.lower()
        for m in self.knowledge.get("myths", []):
            key = m["myth_bn"][:8]
            if key and key in belief or any(w in low for w in m["myth_en"].lower().split()[:3]):
                fact = m["fact_bn"]
                break
        return self.backend.bust_myth(belief, fact)


# --- CLI demo: a short scripted conversation ---------------------------------
if __name__ == "__main__":
    a = Assistant(backend=get_backend("mock"))

    turns = [
        "আমার বয়স ২৩ বছর।",
        "আমার মাসিক খুব অনিয়মিত, আর মুখে অতিরিক্ত লোম উঠছে এবং ওজন বেড়ে যাচ্ছে।",
    ]
    for t in turns:
        print(f"\n👤 {t}")
        a.add_user_message(t)

    print("\n" + "=" * 60)
    print("সখীর পরামর্শ:\n")
    print(a.explain())
