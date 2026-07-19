"""
Tests for Shokhi's IVR voice-hotline logic (ivr.py).

Zero-dependency runner. Covers the PURE, deterministic pieces — the TwiML builders and
the spoken-Bangla summary — plus one end-to-end spoken turn through the mock backend.
The network parts (recording download, gTTS) are intentionally not exercised here; they
degrade gracefully at runtime.
"""

import ivr
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


def test_twiml_wraps_response():
    doc = ivr.twiml(ivr.say("hello"))
    check("test_twiml_wraps_response",
          doc.startswith("<?xml") and "<Response>" in doc and "</Response>" in doc)


def test_say_escapes_and_sets_lang():
    out = ivr.say("a & b")
    check("test_say_escapes_and_sets_lang", "a &amp; b" in out and 'language="bn-IN"' in out)


def test_welcome_records_to_action():
    doc = ivr.build_welcome("https://x.test/api/ivr/handle")
    check("test_welcome_records_to_action",
          "<Record" in doc and 'action="https://x.test/api/ivr/handle"' in doc
          and "playBeep=\"true\"" in doc)


def test_voice_summary_emergency_mentions_999():
    result = {
        "urgency": "emergency",
        "red_flags": [{"action_bn": "এখনই হাসপাতালে যান।", "message_bn": "বিপদ।"}],
        "suspected_conditions": [],
    }
    txt = ivr.voice_summary(result)
    check("test_voice_summary_emergency_mentions_999",
          ivr.EMERGENCY_BD in txt and "জরুরি" in txt and "*" not in txt)


def test_voice_summary_has_no_markdown():
    # a plain spoken script must never contain markdown/bullets that a TTS would read out
    result = {
        "urgency": "see_doctor_soon",
        "urgency_label_bn": "শীঘ্রই ডাক্তার দেখান",
        "red_flags": [],
        "suspected_conditions": [{"name_bn": "পিসিওএস"}],
    }
    txt = ivr.voice_summary(result)
    check("test_voice_summary_has_no_markdown",
          all(sym not in txt for sym in ("*", "#", "•", "👉")) and "পিসিওএস" in txt)


def test_guidance_for_transcript_pipeline():
    # a spoken PCOS-like Bangla description should come back as see-a-doctor guidance
    out = ivr.guidance_for_transcript(
        "আমার মাসিক অনিয়মিত, মুখে অতিরিক্ত লোম উঠছে, ওজন বেড়ে যাচ্ছে।",
        backend=get_backend("mock"),
    )
    check("test_guidance_for_transcript_pipeline",
          out["triage"]["urgency"] == "see_doctor_soon"
          and "ডাক্তার" in out["spoken_bn"])


def test_emergency_transcript_is_urgent():
    out = ivr.guidance_for_transcript(
        "আমি গর্ভবতী হতে পারি আর আমার তীব্র ব্যথা হচ্ছে।",
        backend=get_backend("mock"),
    )
    check("test_emergency_transcript_is_urgent",
          out["triage"]["urgency"] == "emergency" and ivr.EMERGENCY_BD in out["spoken_bn"])


if __name__ == "__main__":
    for fn in list(globals().values()):
        if callable(fn) and getattr(fn, "__name__", "").startswith("test_"):
            fn()
    print(f"\n{PASS}/{PASS + FAIL} passed")
    if FAIL:
        raise SystemExit(1)
