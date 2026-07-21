// Risk-model inference (SUPPORT signal only — never changes the deterministic urgency).
// Runs the exported logistic-regression coefficients (see ml/train_export.py) in plain
// JS: standardize each feature, dot with the coefficients, sigmoid. No Python at runtime.

import MODELS from "./risk-models.json";

const ELEVATED = 0.5;

interface Model {
  features: string[];
  mean: number[];
  scale: number[];
  coef: number[];
  intercept: number;
  median_fill: Record<string, number>;
  auc: number;
}

export interface RiskSignal {
  id: string;
  name_bn: string;
  name_en: string;
  probability: number;
  elevated: boolean;
  auc: number | null;
}

type Profile = Record<string, unknown>;

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

function predict(model: Model, profile: Profile): number {
  let logit = model.intercept;
  model.features.forEach((f, i) => {
    let v: number;
    if (f === "age") {
      const a = profile.age;
      v = typeof a === "number" ? a : model.median_fill.age ?? 25;
    } else {
      v = profile[f] === true ? 1 : 0;
    }
    logit += model.coef[i] * ((v - model.mean[i]) / model.scale[i]);
  });
  return sigmoid(logit);
}

// [id, name_bn, name_en, symptom fields that must be present for the signal to fire]
const SPECS: [string, string, string, string[]][] = [
  ["pcos", "পিসিওএস", "PCOS",
    ["cycles_irregular", "excess_hair", "persistent_acne", "unexplained_weight_gain"]],
  ["endometriosis", "এন্ডোমেট্রিওসিস", "Endometriosis",
    ["periods_disrupt_daily_life", "chronic_pelvic_pain", "pain_during_sex",
      "trouble_conceiving", "heavy_bleeding"]],
];

/** Elevated risk signals for conditions whose symptoms are present. Advisory only. */
export function riskSignals(profile: Profile): RiskSignal[] {
  const out: RiskSignal[] = [];
  for (const [id, bn, en, triggers] of SPECS) {
    if (!triggers.some((f) => profile[f] === true)) continue;
    const model = (MODELS as Record<string, Model>)[id];
    if (!model) continue;
    const p = predict(model, profile);
    out.push({
      id,
      name_bn: bn,
      name_en: en,
      probability: Math.round(p * 100) / 100,
      elevated: p >= ELEVATED,
      auc: model.auc ?? null,
    });
  }
  return out;
}
