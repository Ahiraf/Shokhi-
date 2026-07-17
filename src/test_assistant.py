"""
Tests for the Shokhi orchestrator with the deterministic mock backend.

Zero-dependency runner. Verifies the conversation -> symptom -> triage -> explanation
pipeline holds together, and that the mock symptom extractor understands Bangla.
"""

from assistant import Assistant
from gemma_backend import get_backend

PASS = 0
FAIL = 0


def check(name, cond):
    global PASS, FAIL
    if cond:
        PASS += 1
        print(f"PASS  {name}")
    else:
        FAIL += 1
        print(f"FAIL  {name}")


def fresh():
    return Assistant(backend=get_backend("mock"))


# --- symptom extraction (Bangla) ---------------------------------------------
def test_extracts_age_bangla():
    a = fresh()
    a.add_user_message("আমার বয়স ২৩ বছর।")
    check("test_extracts_age_bangla", a.profile.get("age") == 23)


def test_extracts_pcos_signals():
    a = fresh()
    a.add_user_message("আমার মাসিক অনিয়মিত, মুখে অতিরিক্ত লোম উঠছে, ওজন বেড়ে যাচ্ছে।")
    p = a.profile
    check("test_extracts_pcos_signals",
          p.get("cycles_irregular") and p.get("excess_hair") and p.get("unexplained_weight_gain"))


def test_pcos_flow_end_to_end():
    a = fresh()
    a.add_user_message("আমার বয়স ২৪, মাসিক অনিয়মিত আর মুখে অতিরিক্ত লোম।")
    r = a.triage()
    ids = [c["id"] for c in r["suspected_conditions"]]
    check("test_pcos_flow_end_to_end", "pcos" in ids)


def test_emergency_flow_end_to_end():
    a = fresh()
    a.add_user_message("আমার প্রচণ্ড ব্যথা হচ্ছে আর আমি গর্ভবতী হতে পারি।")
    check("test_emergency_flow_end_to_end", a.is_emergency())


def test_explain_returns_bangla_text():
    a = fresh()
    a.add_user_message("আমার মাসিকের আগে মেজাজ খারাপ হয় আর পেট ফাঁপা লাগে।")
    text = a.explain()
    check("test_explain_returns_bangla_text", isinstance(text, str) and len(text) > 0)


def test_emergency_explanation_mentions_action():
    a = fresh()
    a.add_user_message("অতিরিক্ত রক্ত যাচ্ছে আর মাথা ঘুরছে, খুব দুর্বল লাগছে।")
    text = a.explain()
    check("test_emergency_explanation_mentions_action",
          a.is_emergency() and ("999" in text or "হাসপাতাল" in text))


def test_next_question_when_empty():
    a = fresh()
    check("test_next_question_when_empty", a.next_question() is not None)


def test_set_symptoms_direct():
    a = fresh()
    r = a.set_symptoms(periods_disrupt_daily_life=True)
    ids = [c["id"] for c in r["suspected_conditions"]]
    check("test_set_symptoms_direct", "endometriosis" in ids)


def test_myth_busting_grounds_on_kb():
    a = fresh()
    reply = a.bust_myth("মাসিকের সময় গোসল করা যাবে না")
    check("test_myth_busting_grounds_on_kb", isinstance(reply, str) and len(reply) > 0)


def test_negation_not_pregnant():
    a = fresh()
    a.add_user_message("আমার তীব্র ব্যথা হচ্ছে কিন্তু আমি গর্ভবতী নই।")
    # pregnancy should not be set true, so no ectopic emergency from pregnancy branch
    check("test_negation_not_pregnant", a.profile.get("is_pregnant_possible") is not True)


if __name__ == "__main__":
    for fn in list(globals().values()):
        if callable(fn) and getattr(fn, "__name__", "").startswith("test_"):
            fn()
    print(f"\n{PASS}/{PASS + FAIL} passed")
    if FAIL:
        raise SystemExit(1)
