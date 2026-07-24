// Shokhi orchestrator. Ties conversation → symptom profile
// (Gemma) → deterministic triage (+ ML risk signals) → warm guidance (Gemma).

import { triage as runTriage, knowledge, type Profile } from "./triage";
import { riskSignals } from "./risk";
import { getBackend, type Backend } from "./gemma";
import { retrieve, type Retrieved } from "./rag";
import type { Lang } from "./prompts";

type Citation = { source: string; url: string; section?: string; pub_year?: string };

/** Dedup retrieved chunks down to unique citations, keeping section + year metadata. */
function citations(hits: Retrieved[]): Citation[] {
  const seen = new Set<string>();
  const out: Citation[] = [];
  for (const h of hits) {
    const key = h.url || h.source;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push({ source: h.source, url: h.url, section: h.section, pub_year: h.pub_year });
  }
  return out;
}

/** A markdown "Sources" footer appended to a grounded answer, with section + year when known. */
function sourcesFooter(hits: Retrieved[], lang: Lang): string {
  const cites = citations(hits);
  if (!cites.length) return "";
  const label = lang === "en" ? "📚 Sources" : "📚 সূত্র";
  const links = cites
    .map((c) => {
      const detail = [c.section, c.pub_year].filter(Boolean).join(", ");
      const name = detail ? `${c.source} — ${detail}` : c.source;
      return c.url ? `[${name}](${c.url})` : name;
    })
    .join(" · ");
  return `\n\n**${label}:** ${links}`;
}

/**
 * Apply the escalate-only LLM safety net to a deterministic triage result.
 *
 * If the safety classifier flagged an emergency the rules engine did NOT already catch, we
 * ESCALATE to emergency by attaching a synthetic red flag. This can only ever RAISE urgency —
 * the deterministic red flags still fire independently, so the "never under-triage" guarantee
 * holds and a real deterministic emergency is never softened. Returns the (possibly) mutated
 * result plus whether it escalated.
 */
export function applySafetyNet(
  result: any,
  safety: { emergency: boolean; reason: string | null },
): { result: any; escalated: boolean } {
  if (!safety.emergency || result.urgency === "emergency") {
    return { result, escalated: false };
  }
  const reason = safety.reason || "possible emergency symptoms";
  result.urgency = "emergency";
  result.red_flags = [
    ...(result.red_flags ?? []),
    {
      id: "safety_net",
      source: "safety_net",
      name_bn: "সম্ভাব্য জরুরি লক্ষণ",
      name_en: "Possible emergency symptoms",
      urgency: "emergency",
      message_bn: "আপনার কথায় জরুরি হতে পারে এমন লক্ষণ শুনতে পাচ্ছি।",
      message_en: `This may be urgent (${reason}).`,
      action_bn: "দয়া করে এখনই নিকটস্থ হাসপাতালে যান বা ৯৯৯-এ কল করুন।",
      action_en: "Please go to the nearest hospital now or call 999.",
    },
  ];
  result.safety_net = { escalated: true, reason };
  return { result, escalated: true };
}

/** The user's life stage, derived from the (safe, demographic) symptom profile. */
export function lifeStageOf(profile: Profile): string {
  if (profile.is_pregnant === true || profile.is_pregnant_possible === true) return "pregnant";
  if (profile.recently_gave_birth === true) return "postpartum";
  if (profile.post_menopausal === true) return "menopause";
  const age = typeof profile.age === "number" ? profile.age : undefined;
  if (age !== undefined && age > 0 && age < 20) return "teen";
  return "";
}

/** Map a life stage to the corpus topic to gently prefer during retrieval. */
function topicForStage(stage: string): string | undefined {
  switch (stage) {
    case "pregnant":
    case "postpartum":
      return "pregnancy";
    case "menopause":
      return "menopause";
    default:
      return undefined;
  }
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
    // life stage lets Gemma tailor tone/advice to where she is in life (context, not a rule)
    const stage = lifeStageOf(this.profile);
    if (stage) result.life_stage = stage;
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
    const stage = lifeStageOf(this.profile);
    const hits = await retrieve(query, 4, { boostTopic: topicForStage(stage) });
    if (!g && !hits.length) return null;

    const guideMeta = g
      ? { id: g.id, icon: g.icon ?? "🌸", title_bn: g.title_bn ?? "", title_en: g.title_en ?? "" }
      : { id: "topic", icon: "🌸", title_bn: topic, title_en: topic };

    if (hits.length) {
      const context = hits.map((h, i) => `[${i + 1}] (${h.source})\n${h.text}`).join("\n\n");
      // give Gemma the life-stage as context so the same topic is answered stage-appropriately
      const question = stage ? `${topic}\n(Reader's life stage: ${stage}.)` : topic;
      const answer = await this.backend.answerGrounded(question, context, lang);
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
