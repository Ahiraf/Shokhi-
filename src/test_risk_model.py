"""
Tests for the optional ML risk-signal layer.

These verify the SUPPORT model behaves sanely and — critically — that it stays a
support signal: it must never change the deterministic triage urgency. If the trained
models are absent, the risk tests are skipped (the layer is optional by design).
"""

import risk_model
from assistant import Assistant
from gemma_backend import get_backend

PASS = 0
FAIL = 0
SKIP = 0


def check(name, cond):
    global PASS, FAIL
    if cond:
        PASS += 1
        print(f"PASS  {name}")
    else:
        FAIL += 1
        print(f"FAIL  {name}")


def skip(name):
    global SKIP
    SKIP += 1
    print(f"SKIP  {name} (trained models not present — run train_risk_models.py)")


MODELS_PRESENT = risk_model._load("pcos") is not None


def test_pcos_risk_higher_with_more_symptoms():
    if not MODELS_PRESENT:
        return skip("test_pcos_risk_higher_with_more_symptoms")
    low = risk_model.predict_pcos_risk({"age": 25})
    high = risk_model.predict_pcos_risk({
        "age": 25, "cycles_irregular": True, "excess_hair": True,
        "unexplained_weight_gain": True, "persistent_acne": True})
    check("test_pcos_risk_higher_with_more_symptoms", high > low)


def test_endo_risk_higher_with_more_symptoms():
    if not MODELS_PRESENT:
        return skip("test_endo_risk_higher_with_more_symptoms")
    low = risk_model.predict_endometriosis_risk({"cycles_irregular": True})
    high = risk_model.predict_endometriosis_risk({
        "periods_disrupt_daily_life": True, "chronic_pelvic_pain": True,
        "pain_during_sex": True, "trouble_conceiving": True})
    check("test_endo_risk_higher_with_more_symptoms", high > low)


def test_signals_empty_on_empty_profile():
    if not MODELS_PRESENT:
        return skip("test_signals_empty_on_empty_profile")
    check("test_signals_empty_on_empty_profile", risk_model.risk_signals({}) == [])


def test_risk_is_support_not_override():
    # An emergency must stay an emergency even when risk signals are attached.
    a = Assistant(backend=get_backend("mock"))
    a.set_symptoms(is_pregnant_possible=True, severe_pelvic_pain=True,
                   cycles_irregular=True, excess_hair=True)
    r = a.triage()
    check("test_risk_is_support_not_override", r["urgency"] == "emergency")


def test_missing_models_are_graceful():
    # risk_signals must never raise, even if it returns nothing.
    try:
        risk_model.risk_signals({"cycles_irregular": True})
        ok = True
    except Exception:
        ok = False
    check("test_missing_models_are_graceful", ok)


if __name__ == "__main__":
    for fn in list(globals().values()):
        if callable(fn) and getattr(fn, "__name__", "").startswith("test_"):
            fn()
    print(f"\n{PASS}/{PASS + FAIL} passed, {SKIP} skipped")
    if FAIL:
        raise SystemExit(1)
