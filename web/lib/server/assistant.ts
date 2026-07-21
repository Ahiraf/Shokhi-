// Shokhi orchestrator — ported from assistant.py. Ties conversation → symptom profile
// (Gemma) → deterministic triage (+ ML risk signals) → warm guidance (Gemma).

import { triage as runTriage, knowledge, type Profile } from "./triage";
import { riskSignals } from "./risk";
import { getBackend, type Backend } from "./gemma";
import type { Lang } from "./prompts";

export class Assistant {
  profile: Profile;
  history: string[];
  backend: Backend;

  constructor(profile: Profile = {}, history: string[] = []) {
    this.profile = { ...profile };
    this.history = [...history];
    this.backend = getBackend();
  }

  async addUserMessage(message: string): Promise<void> {
    this.history.push(message);
    const updates = await this.backend.extractSymptoms(this.history.join("\n"), this.profile);
    this.profile = { ...this.profile, ...updates };
  }

  triage(): any {
    const result = runTriage(this.profile);
    const signals = riskSignals(this.profile);
    if (signals.length) result.risk_signals = signals;
    return result;
  }

  explain(lang: Lang = "bn"): Promise<string> {
    return this.backend.explainTriage(this.triage(), lang);
  }

  nextQuestion(): string | null {
    const qs = this.triage().outstanding_questions as Record<string, string>;
    const first = Object.values(qs)[0];
    return first ?? null;
  }

  listGuides(): any[] {
    return (knowledge.guides ?? []).map((g: any) => ({
      id: g.id, icon: g.icon ?? "🌸",
      title_bn: g.title_bn ?? "", title_en: g.title_en ?? "",
      summary_bn: g.summary_bn ?? "", summary_en: g.summary_en ?? "",
    }));
  }

  getGuide(gid: string): any | null {
    return (knowledge.guides ?? []).find((g: any) => g.id === gid) ?? null;
  }

  findGuide(topic: string): any | null {
    const guides = knowledge.guides ?? [];
    const byId = guides.find((g: any) => g.id === topic);
    if (byId) return byId;
    const low = (topic || "").toLowerCase();
    if (!low) return null;
    let best: any = null, bestLen = 0;
    for (const g of guides) {
      for (const kw of g.keywords ?? []) {
        const k = String(kw).toLowerCase();
        if (low.includes(k) && k.length > bestLen) { best = g; bestLen = k.length; }
      }
    }
    return best;
  }

  async explainGuide(topic: string, lang: Lang = "bn"): Promise<any | null> {
    const g = this.findGuide(topic);
    if (!g) return null;
    return {
      guide: { id: g.id, icon: g.icon ?? "🌸", title_bn: g.title_bn ?? "", title_en: g.title_en ?? "" },
      guidance: await this.backend.explainGuide(g, topic, lang),
    };
  }

  async bustMyth(belief: string, lang: Lang = "bn"): Promise<string> {
    let fact = "";
    const low = belief.toLowerCase();
    for (const mth of knowledge.myths ?? []) {
      const key = String(mth.myth_bn).slice(0, 8);
      const enWords = String(mth.myth_en).toLowerCase().split(/\s+/).slice(0, 3);
      if ((key && belief.includes(key)) || enWords.some((w: string) => w && low.includes(w))) {
        fact = lang === "en" ? mth.fact_en || mth.fact_bn : mth.fact_bn;
        break;
      }
    }
    return this.backend.bustMyth(belief, fact, lang);
  }
}
