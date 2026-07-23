// Shokhi orchestrator. Ties conversation → symptom profile
// (Gemma) → deterministic triage (+ ML risk signals) → warm guidance (Gemma).

import { triage as runTriage, knowledge, type Profile } from "./triage";
import { riskSignals } from "./risk";
import { getBackend, type Backend } from "./gemma";
import { retrieve, type Retrieved } from "./rag";
import type { Lang } from "./prompts";

/** Dedup retrieved chunks down to unique {source, url} citations. */
function citations(hits: Retrieved[]): { source: string; url: string }[] {
  const seen = new Set<string>();
  const out: { source: string; url: string }[] = [];
  for (const h of hits) {
    const key = h.url || h.source;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push({ source: h.source, url: h.url });
  }
  return out;
}

/** A markdown "Sources" footer appended to a grounded answer. */
function sourcesFooter(hits: Retrieved[], lang: Lang): string {
  const cites = citations(hits);
  if (!cites.length) return "";
  const label = lang === "en" ? "📚 Sources" : "📚 সূত্র";
  const links = cites.map((c) => (c.url ? `[${c.source}](${c.url})` : c.source)).join(" · ");
  return `\n\n**${label}:** ${links}`;
}

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

    // RAG: retrieve trusted passages for this topic (uses the guide's title/summary to
    // improve recall). If anything is found, Gemma answers grounded ONLY in that context
    // and we cite the sources. Otherwise we fall back to the static knowledge-base guide.
    const query = [topic, g?.title_en, g?.title_bn, g?.summary_en].filter(Boolean).join(" ");
    const hits = await retrieve(query, 4);
    if (!g && !hits.length) return null;

    const guideMeta = g
      ? { id: g.id, icon: g.icon ?? "🌸", title_bn: g.title_bn ?? "", title_en: g.title_en ?? "" }
      : { id: "topic", icon: "🌸", title_bn: topic, title_en: topic };

    if (hits.length) {
      const context = hits.map((h, i) => `[${i + 1}] (${h.source})\n${h.text}`).join("\n\n");
      const answer = await this.backend.answerGrounded(topic, context, lang);
      return {
        guide: guideMeta,
        guidance: answer + sourcesFooter(hits, lang),
        grounded: true,
        sources: citations(hits),
      };
    }

    // no retrieval hits — fall back to the hand-written guide render
    return {
      guide: guideMeta,
      guidance: await this.backend.explainGuide(g, topic, lang),
      grounded: false,
      sources: [],
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
