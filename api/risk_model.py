"""
Shokhi — risk-model inference (SUPPORT signal, not the primary AI).

Loads the trained PCOS / endometriosis classifiers and turns a Shokhi symptom profile
into calibrated risk probabilities. These are non-generative ML support signals that
feed the triage engine alongside the rules; Gemma 4 remains the primary AI.

Fully optional and graceful: if scikit-learn/joblib or the trained model files are not
present, every function returns empty/None and the rest of the app runs unchanged (the
deterministic rules and Gemma still work). Train the models with:
    cd src && python3 train_risk_models.py
"""

from __future__ import annotations

from pathlib import Path

MODELS = Path(__file__).resolve().parent / "data" / "models"

# thresholds above which we surface the signal to the user as "elevated"
_ELEVATED = 0.5

_CACHE: dict[str, object] = {}


def _load(name: str):
    """Lazy-load a model bundle; return None if unavailable (kept fully optional)."""
    if name in _CACHE:
        return _CACHE[name]
    path = MODELS / f"{name}_model.joblib"
    bundle = None
    if path.exists():
        try:
            import joblib
            bundle = joblib.load(path)
        except Exception:
            bundle = None
    _CACHE[name] = bundle
    return bundle


def _feature_vector(profile: dict, bundle: dict) -> list[float]:
    """Map a Shokhi profile to the model's feature order. Unknown booleans -> 0
    (not stated = symptom absent); unknown age -> training median."""
    row = []
    for f in bundle["features"]:
        if f == "age":
            v = profile.get("age")
            row.append(float(v) if v is not None else float(bundle["median_fill"].get("age", 25)))
        else:
            row.append(1.0 if profile.get(f) is True else 0.0)
    return row


def _predict(name: str, profile: dict) -> float | None:
    bundle = _load(name)
    if not bundle:
        return None
    try:
        import pandas as pd
        x = pd.DataFrame([_feature_vector(profile, bundle)], columns=bundle["features"])
        return float(bundle["model"].predict_proba(x)[0, 1])
    except Exception:
        return None


def predict_pcos_risk(profile: dict) -> float | None:
    return _predict("pcos", profile)


def predict_endometriosis_risk(profile: dict) -> float | None:
    return _predict("endometriosis", profile)


def risk_signals(profile: dict) -> list[dict]:
    """
    Return a list of risk signals for conditions whose probability is elevated, e.g.
        [{"id": "pcos", "name_bn": "পিসিওএস", "probability": 0.72, "elevated": True,
          "auc": 0.835}]
    Only emitted when the relevant symptoms are present at all (avoids noise on an empty
    profile) and the model is available. This is advisory support for the LLM/rules —
    it never overrides the deterministic urgency.
    """
    out = []
    specs = [
        ("pcos", "পিসিওএস", "PCOS",
         any(profile.get(f) for f in ["cycles_irregular", "excess_hair",
                                      "persistent_acne", "unexplained_weight_gain"])),
        ("endometriosis", "এন্ডোমেট্রিওসিস", "Endometriosis",
         any(profile.get(f) for f in ["periods_disrupt_daily_life", "chronic_pelvic_pain",
                                      "pain_during_sex", "trouble_conceiving",
                                      "heavy_bleeding"])),
    ]
    for name, bn, en, has_symptoms in specs:
        if not has_symptoms:
            continue
        p = predict_pcos_risk(profile) if name == "pcos" else predict_endometriosis_risk(profile)
        if p is None:
            continue
        bundle = _load(name)
        out.append({
            "id": name, "name_bn": bn, "name_en": en,
            "probability": round(p, 2), "elevated": p >= _ELEVATED,
            "auc": bundle["metrics"]["test_auc"] if bundle else None,
        })
    return out


if __name__ == "__main__":
    demo = {"age": 24, "cycles_irregular": True, "excess_hair": True,
            "unexplained_weight_gain": True}
    print("PCOS risk:", predict_pcos_risk(demo))
    print("signals:", risk_signals(demo))
