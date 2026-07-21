"""
OFFLINE (not deployed). Retrain Shokhi's two risk classifiers as LOGISTIC REGRESSION and
export them to plain JSON so the TypeScript backend can run inference with no Python at
runtime. Same self-reportable features as before (no lab values). Support signals only —
they never change the deterministic triage decision.

Run once (needs the gitignored datasets in api/data/datasets/):
    python3 ml/train_export.py
"""
from __future__ import annotations
import json
from pathlib import Path
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, accuracy_score

ROOT = Path(__file__).resolve().parent.parent
DATA = Path(__file__).resolve().parent / "datasets"   # ml/datasets/ (public sources; gitignored)
OUT = ROOT / "lib" / "server" / "risk-models.json"

PCOS_FEATURES = ["age", "cycles_irregular", "unexplained_weight_gain", "excess_hair", "persistent_acne"]
ENDO_FEATURES = ["cycles_irregular", "heavy_bleeding", "periods_disrupt_daily_life",
                 "pain_during_sex", "chronic_pelvic_pain", "trouble_conceiving"]

def build_pcos():
    d = pd.read_csv(DATA / "pcos_raw.csv")
    X = pd.DataFrame({
        "age": pd.to_numeric(d["Age"], errors="coerce"),
        "cycles_irregular": (pd.to_numeric(d["Cycle"], errors="coerce") >= 4).astype(int),
        "unexplained_weight_gain": pd.to_numeric(d["Weight_gain"], errors="coerce"),
        "excess_hair": pd.to_numeric(d["Hair_growth"], errors="coerce"),
        "persistent_acne": pd.to_numeric(d["Pimples"], errors="coerce"),
    })
    y = pd.to_numeric(d["PCOS"], errors="coerce")
    ok = X.notna().all(axis=1) & y.notna()
    return X[ok].reset_index(drop=True), y[ok].astype(int).reset_index(drop=True)

def build_endo():
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

def train(name, X, y, feats, median_fill):
    X = X[feats]
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
    pipe = Pipeline([("scaler", StandardScaler()), ("lr", LogisticRegression(max_iter=1000))])
    pipe.fit(Xtr, ytr)
    proba = pipe.predict_proba(Xte)[:, 1]
    auc = round(roc_auc_score(yte, proba), 3)
    acc = round(accuracy_score(yte, pipe.predict(Xte)), 3)
    sc = pipe.named_steps["scaler"]; lr = pipe.named_steps["lr"]
    print(f"[{name}] LogisticRegression  n={len(X)} pos={int(y.sum())} acc={acc} auc={auc}")
    return {
        "features": feats,
        "mean": [round(float(v), 6) for v in sc.mean_],
        "scale": [round(float(v), 6) for v in sc.scale_],
        "coef": [round(float(v), 6) for v in lr.coef_[0]],
        "intercept": round(float(lr.intercept_[0]), 6),
        "median_fill": median_fill,
        "auc": auc, "accuracy": acc,
    }

Xp, yp = build_pcos()
Xe, ye = build_endo()
out = {
    "pcos": train("pcos", Xp, yp, PCOS_FEATURES, {"age": int(Xp["age"].median())}),
    "endometriosis": train("endometriosis", Xe, ye, ENDO_FEATURES, {}),
}
OUT.write_text(json.dumps(out, indent=2))
print("wrote", OUT)
