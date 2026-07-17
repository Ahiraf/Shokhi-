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
