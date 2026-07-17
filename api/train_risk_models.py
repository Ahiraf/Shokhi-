"""
Train Shokhi's lightweight risk classifiers (SUPPORT signals, not the primary AI).

Two small scikit-learn models — one for PCOS, one for endometriosis — trained on public
self-report symptom datasets. They output a probability that feeds the deterministic
triage engine as an extra signal. Gemma 4 remains the primary AI (all language
understanding + guidance); these are non-generative ML support, which the hackathon
rules explicitly allow.

Key design choice: we train ONLY on features Shokhi can actually obtain from a Bangla
conversation (things a woman can self-report), so the model is usable at inference —
no lab values (FSH/LH/AMH/ultrasound) that a chat can't provide.

Datasets (downloaded to data/datasets/):
  * PCOS — Kaggle "Polycystic Ovary Syndrome (PCOS)" (Prasoon Kottarathil), 541 records.
  * Endometriosis — self-report symptom dataset (886 records) from the Scientific Reports
    study, via github.com/TristanLecourtois/endodetect-based-on-symptoms.

Run:  cd src && python3 train_risk_models.py
"""

from __future__ import annotations

import json
from pathlib import Path

import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, accuracy_score
import joblib

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data" / "datasets"
MODELS = ROOT / "data" / "models"
MODELS.mkdir(parents=True, exist_ok=True)

# --- feature maps: Shokhi symptom field -> how to derive it from the dataset ----
# Every key is a field Shokhi extracts from conversation, so inference is possible.
PCOS_FEATURES = ["age", "cycles_irregular", "unexplained_weight_gain",
                 "excess_hair", "persistent_acne"]
ENDO_FEATURES = ["cycles_irregular", "heavy_bleeding", "periods_disrupt_daily_life",
                 "pain_during_sex", "chronic_pelvic_pain", "trouble_conceiving"]


def build_pcos_frame() -> tuple[pd.DataFrame, pd.Series]:
    d = pd.read_csv(DATA / "pcos_raw.csv")
    X = pd.DataFrame({
        "age": pd.to_numeric(d["Age"], errors="coerce"),
        # Cycle: 2 = Regular, 4/5 = Irregular
        "cycles_irregular": (pd.to_numeric(d["Cycle"], errors="coerce") >= 4).astype(int),
        "unexplained_weight_gain": pd.to_numeric(d["Weight_gain"], errors="coerce"),
        "excess_hair": pd.to_numeric(d["Hair_growth"], errors="coerce"),
        "persistent_acne": pd.to_numeric(d["Pimples"], errors="coerce"),
    })
    y = pd.to_numeric(d["PCOS"], errors="coerce")
    ok = X.notna().all(axis=1) & y.notna()
    return X[ok].reset_index(drop=True), y[ok].astype(int).reset_index(drop=True)


def build_endo_frame() -> tuple[pd.DataFrame, pd.Series]:
    e = pd.read_excel(DATA / "endometriosis_raw.xlsx")
    col = {
        "cycles_irregular": "Irregular / Missed periods",
        "heavy_bleeding": "Heavy / Extreme menstrual bleeding",
        "periods_disrupt_daily_life": "Menstrual pain (Dysmenorrhea)",
        "pain_during_sex": "Painful / Burning pain during sex (Dyspareunia)",
        "chronic_pelvic_pain": "Pelvic pain",
        "trouble_conceiving": "Infertility",
    }
    X = pd.DataFrame({k: pd.to_numeric(e[v], errors="coerce") for k, v in col.items()})
    y = pd.to_numeric(e["label"], errors="coerce")
    ok = X.notna().all(axis=1) & y.notna()
    return X[ok].reset_index(drop=True), y[ok].astype(int).reset_index(drop=True)


def train_one(name: str, X: pd.DataFrame, y: pd.Series, features: list[str],
              median_fill: dict) -> dict:
    X = X[features]
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
    clf = GradientBoostingClassifier(random_state=42)
    clf.fit(Xtr, ytr)
    proba = clf.predict_proba(Xte)[:, 1]
    metrics = {
        "n": int(len(X)), "positives": int(y.sum()),
        "test_accuracy": round(accuracy_score(yte, clf.predict(Xte)), 3),
        "test_auc": round(roc_auc_score(yte, proba), 3),
    }
    bundle = {"model": clf, "features": features, "median_fill": median_fill,
              "metrics": metrics}
    joblib.dump(bundle, MODELS / f"{name}_model.joblib")
    print(f"[{name}] n={metrics['n']} pos={metrics['positives']} "
          f"acc={metrics['test_accuracy']} auc={metrics['test_auc']}  "
          f"features={features}")
    return metrics


def main():
    all_metrics = {}

    Xp, yp = build_pcos_frame()
    all_metrics["pcos"] = train_one(
        "pcos", Xp, yp, PCOS_FEATURES,
        median_fill={"age": int(Xp["age"].median())},
    )

    Xe, ye = build_endo_frame()
    all_metrics["endometriosis"] = train_one(
        "endometriosis", Xe, ye, ENDO_FEATURES, median_fill={},
    )

    (MODELS / "metrics.json").write_text(json.dumps(all_metrics, indent=2))
    print("\nSaved models + metrics to", MODELS)


if __name__ == "__main__":
    main()
