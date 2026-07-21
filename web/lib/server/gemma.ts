// Gemma 4 backend abstraction — ported from gemma_backend.py.
//   * MockBackend   — deterministic, no network (offline / no-key fallback).
//   * GeminiBackend — hosted Gemma 4 via Google AI Studio (@google/genai), multi-key
//                     quota fallback + native-audio transcription.
// The urgency DECISION is made by triage.ts, never here — Gemma only does the NLP.

import * as P from "./prompts";
import type { Lang } from "./prompts";

type Profile = Record<string, unknown>;

export interface Backend {
  name: string;
  extractSymptoms(conversation: string, known: Profile): Promise<Profile>;
  explainTriage(triage: any, lang: Lang): Promise<string>;
  bustMyth(belief: string, fact: string, lang: Lang): Promise<string>;
  explainGuide(guide: any, question: string, lang: Lang): Promise<string>;
  supportsAudio(): boolean;
  transcribeAudio(bytes: Buffer, mime: string): Promise<string>;
}

const pickField = (obj: any, base: string, lang: Lang) =>
  (lang === "en" ? obj?.[`${base}_en`] : undefined) ?? obj?.[`${base}_bn`];

// --- deterministic guide render (offline default; both backends can use it) ----
function renderGuide(guide: any, lang: Lang): string {
  const lines: string[] = [];
  const title = pickField(guide, "title", lang);
  if (title) lines.push(`**${guide.icon ?? "🌸"} ${title}**\n`);
  const summary = pickField(guide, "summary", lang);
  if (summary) lines.push(summary + "\n");
  for (const p of pickField(guide, "points", lang) ?? []) lines.push(`• ${p}`);
  const wsd = pickField(guide, "when_see_doctor", lang);
  if (wsd) lines.push(`\n🩺 ${wsd}`);
  return lines.join("\n");
}

// =============================================================================
// Mock backend
// =============================================================================
const BN_DIGITS: Record<string, string> = { "০":"0","১":"1","২":"2","৩":"3","৪":"4","৫":"5","৬":"6","৭":"7","৮":"8","৯":"9" };
const toInt = (s: string) => parseInt(s.replace(/[০-৯]/g, (d) => BN_DIGITS[d]), 10);

const TRIGGERS: [string, string[]][] = [
  ["severe_pelvic_pain", ["তীব্র ব্যথা", "অসহ্য ব্যথা", "প্রচণ্ড ব্যথা", "severe pain", "unbearable pain"]],
  ["heavy_bleeding", ["অতিরিক্ত রক্ত", "প্রচুর রক্ত", "চাকা চাকা রক্ত", "প্যাড ভিজে", "heavy bleeding", "clots", "soaking"]],
  ["fainting_or_dizzy", ["মাথা ঘুর", "অজ্ঞান", "খুব দুর্বল", "faint", "dizzy", "dizziness", "very weak"]],
  ["fever", ["জ্বর", "fever"]],
  ["foul_discharge", ["দুর্গন্ধ", "গন্ধযুক্ত স্রাব", "foul", "smelly discharge"]],
  ["is_pregnant_possible", ["গর্ভবতী হতে পারি", "গর্ভধারণের সম্ভাবনা", "might be pregnant", "could be pregnant", "possibly pregnant"]],
  ["post_menopausal", ["মেনোপজ", "মাসিক বন্ধ হয়ে গেছে", "menopause", "periods stopped"]],
  ["bleeding_between_periods", ["মাঝে রক্ত", "দুই মাসিকের মাঝ", "between periods", "spotting"]],
  ["bleeding_after_sex", ["সহবাসের পর রক্ত", "মিলনের পর রক্ত", "after sex", "after intercourse"]],
  ["cycles_irregular", ["অনিয়মিত মাসিক", "মাসিক অনিয়মিত", "অনিয়মিত পিরিয়ড", "irregular period", "irregular cycle"]],
  ["missed_periods_3plus", ["৩ মাস মাসিক বন্ধ", "তিন মাস মাসিক", "মাসিক হচ্ছে না", "no period for 3", "missed period"]],
  ["excess_hair", ["অতিরিক্ত লোম", "মুখে লোম", "শরীরে লোম", "excess hair", "facial hair", "hirsut"]],
  ["persistent_acne", ["ব্রণ", "acne", "pimple"]],
  ["unexplained_weight_gain", ["ওজন বেড়ে", "ওজন বৃদ্ধি", "মোটা হয়ে", "weight gain", "gaining weight"]],
  ["pain_during_sex", ["সহবাসে ব্যথা", "মিলনে ব্যথা", "pain during sex", "painful intercourse"]],
  ["periods_disrupt_daily_life", ["ব্যথায় স্কুল", "ব্যথায় কাজ", "কাজ করতে পারি না", "can't go to school", "miss work", "stops my life"]],
  ["chronic_pelvic_pain", ["সবসময় তলপেটে ব্যথা", "মাসিক ছাড়াও ব্যথা", "constant pelvic pain", "pain all the time"]],
  ["trouble_conceiving", ["সন্তান হচ্ছে না", "বাচ্চা নিতে সমস্যা", "সন্তান নিতে সমস্যা", "trouble conceiving", "can't get pregnant", "infertil"]],
  ["pms_mood_symptoms", ["মাসিকের আগে মেজাজ", "আগে কান্না", "আগে রাগ", "mood swing", "irritable before"]],
  ["pms_physical_symptoms", ["পেট ফাঁপা", "স্তনে ব্যথা", "মাথাব্যথা", "bloating", "breast tender", "headache before"]],
  ["genital_itching", ["যৌনাঙ্গে চুলকানি", "গোপনাঙ্গে চুলকানি", "চুলকানি", "genital itch", "itching down there", "vaginal itch"]],
  ["painful_urination", ["প্রস্রাবে জ্বালা", "প্রস্রাবে ব্যথা", "burning urine", "painful urination", "burning when i pee"]],
  ["frequent_urination", ["বারবার প্রস্রাব", "ঘন ঘন প্রস্রাব", "frequent urination", "peeing often"]],
  ["fatigue_weakness", ["সবসময় ক্লান্ত", "খুব দুর্বল লাগে", "অল্পতেই হাঁপিয়ে", "always tired", "very weak", "fatigue"]],
  ["breast_lump", ["স্তনে চাকা", "স্তনে দলা", "breast lump", "lump in breast"]],
  ["pregnancy_bleeding", ["গর্ভাবস্থায় রক্ত", "গর্ভবতী অবস্থায় রক্ত", "bleeding while pregnant", "bleeding in pregnancy"]],
  ["pregnancy_severe_headache", ["গর্ভাবস্থায় তীব্র মাথাব্যথা", "severe headache pregnant", "bad headache pregnant"]],
  ["pregnancy_vision_changes", ["ঝাপসা দেখ", "চোখে ঝলক", "blurred vision", "flashing light", "spots in vision"]],
  ["pregnancy_face_hand_swelling", ["মুখ ফুলে", "হাত ফুলে", "face swelling", "hands swollen", "swollen face"]],
  ["pregnancy_convulsions", ["খিঁচুনি", "convulsion", "fits", "seizure"]],
  ["reduced_fetal_movement", ["বাচ্চা নড়ছে না", "শিশু নড়াচড়া কম", "baby not moving", "reduced movement", "baby stopped moving"]],
  ["recently_gave_birth", ["সন্তান প্রসব করেছি", "বাচ্চা হয়েছে", "সদ্য মা হয়েছি", "just gave birth", "recently delivered", "after delivery"]],
  ["postpartum_heavy_bleeding", ["প্রসবের পর অতিরিক্ত রক্ত", "প্রসবের পর প্রচুর রক্ত", "bleeding after delivery", "postpartum bleeding"]],
  ["postpartum_fever", ["প্রসবের পর জ্বর", "fever after delivery", "fever after birth"]],
  ["postpartum_foul_lochia", ["প্রসবের পর দুর্গন্ধ", "foul discharge after delivery", "smelly discharge after birth"]],
  ["breast_pain_fever", ["স্তন লাল হয়ে ব্যথা", "স্তনে ব্যথা ও জ্বর", "red painful breast", "mastitis"]],
  ["postpartum_sadness", ["প্রসবের পর মন খারাপ", "বাচ্চা হওয়ার পর কান্না", "sad after birth", "depressed after delivery", "postpartum sad"]],
  ["hot_flashes", ["হট ফ্ল্যাশ", "হঠাৎ শরীর গরম", "গরম লাগে হঠাৎ", "hot flash", "hot flush"]],
  ["night_sweats", ["রাতে ঘাম", "night sweat"]],
  ["vaginal_dryness", ["যোনিপথে শুষ্ক", "যোনি শুষ্ক", "vaginal dryness", "dryness down there"]],
  ["menopause_mood_changes", ["মাঝবয়সে মেজাজ", "ঘুমের সমস্যা", "mid-life mood", "menopause mood"]],
];
const NEG = ["না", "নেই", "নয়", "not ", "no ", "without", "don't", "doesn't"];

const T = {
  bn: {
    emergency: "⚠️ **এটি জরুরি অবস্থা হতে পারে।**\n",
    call: (n: string) => `\n📞 জরুরি প্রয়োজনে কল করুন: **${n}**`,
    discuss: "আপনার বর্ণনা শুনে নিচের বিষয়গুলো একজন ডাক্তারের সাথে আলোচনা করা ভালো (এটি নিশ্চিত রোগ নির্ণয় নয়):\n",
    canDo: "  যা করতে পারেন:",
    noDanger: "আপনার বর্ণনায় এই মুহূর্তে বিপদের কোনো লক্ষণ পাওয়া যায়নি। তবে কোনো দুশ্চিন্তা থাকলে নির্দ্বিধায় জিজ্ঞাসা করুন।",
    risk: "\n📊 আপনার উপসর্গের ভিত্তিতে একটি সহায়ক ঝুঁকি-ইঙ্গিত (নিশ্চিত রোগ নয়, শুধু ডাক্তার দেখানোর তাগিদ):",
    riskLine: (name: string, pct: number) => `  • ${name}: ~${pct}% ইঙ্গিত — একজন ডাক্তারের সাথে যাচাই করুন।`,
    hotline: (n: string) => `\n☎️ স্বাস্থ্য পরামর্শের জন্য বিনামূল্যে কল করতে পারেন: ${n}`,
    mythFact: (f: string) => `আপনি যা শুনেছেন তা অনেকেই বিশ্বাস করেন, তবে আসল তথ্যটি হলো: ${f}`,
    mythGeneric: "এই বিষয়ে অনেক ভুল ধারণা প্রচলিত আছে। নির্ভরযোগ্য তথ্যের জন্য একজন স্বাস্থ্যকর্মী বা ডাক্তারের সাথে কথা বলুন — লজ্জার কিছু নেই।",
  },
  en: {
    emergency: "⚠️ **This may be an emergency.**\n",
    call: (n: string) => `\n📞 In an emergency, call: **${n}**`,
    discuss: "From what you've described, it's worth discussing the following with a doctor (this is not a confirmed diagnosis):\n",
    canDo: "  What you can do:",
    noDanger: "From what you've described, there's no sign of danger right now. But if anything worries you, feel free to ask.",
    risk: "\n📊 Based on your symptoms, one supporting risk signal (not a diagnosis, just a nudge to see a doctor):",
    riskLine: (name: string, pct: number) => `  • ${name}: ~${pct}% signal — please check with a doctor.`,
    hotline: (n: string) => `\n☎️ For free health advice you can call: ${n}`,
    mythFact: (f: string) => `Many people believe what you've heard, but the real fact is: ${f}`,
    mythGeneric: "There are many myths about this. For reliable information, talk to a health worker or doctor — there's nothing to be shy about.",
  },
} as const;

class MockBackend implements Backend {
  name = "mock";

  async extractSymptoms(conversation: string, known: Profile): Promise<Profile> {
    const text = conversation;
    const low = text.toLowerCase();
    const out: Profile = {};
    let m = text.match(/(?:বয়স|age)\D{0,4}([০-৯0-9]{1,3})/);
    if (!m) m = text.match(/([০-৯0-9]{1,3})\s*(?:বছর|years?)/);
    if (m) out.age = toInt(m[1]);
    if (text.includes("গর্ভবতী") && !["গর্ভবতী নই", "গর্ভবতী না"].some((n) => text.includes(n)))
      out.is_pregnant_possible = true;
    for (const [field, kws] of TRIGGERS) {
      for (const kw of kws) {
        const idx = low.indexOf(kw.toLowerCase());
        if (idx === -1) continue;
        const tail = low.slice(idx + kw.length, idx + kw.length + 14);
        out[field] = !NEG.some((n) => tail.includes(n));
        break;
      }
    }
    if (["মাসিক হচ্ছে", "পিরিয়ড চলছে", "রক্ত যাচ্ছে"].some((w) => text.includes(w)) || low.includes("on my period"))
      out.bleeding_now ??= true;
    return Object.fromEntries(Object.entries(out).filter(([k, v]) => known[k] !== v));
  }

  async explainTriage(tr: any, lang: Lang): Promise<string> {
    const t = T[lang] ?? T.bn;
    const f = (o: any, base: string) => pickField(o, base, lang);
    const urgency = tr.urgency ?? "info";
    const lines: string[] = [];
    if (urgency === "emergency") {
      lines.push(t.emergency);
      for (const rf of tr.red_flags ?? []) { lines.push(`• ${f(rf, "message")}`); lines.push(`  👉 ${f(rf, "action")}`); }
      lines.push(t.call(tr.emergency_number_bd ?? "999"));
    } else {
      const label = f(tr, "urgency_label");
      if (label) lines.push(`**${label}**\n`);
      for (const rf of tr.red_flags ?? []) lines.push(`• ${f(rf, "message")} — ${f(rf, "action")}`);
      const conds = tr.suspected_conditions ?? [];
      if (conds.length) {
        lines.push(t.discuss);
        for (const c of conds) {
          lines.push(`**• ${f(c, "name")}** — ${f(c, "about")}`);
          const sc = f(c, "self_care");
          if (sc?.length) { lines.push(t.canDo); for (const tip of sc) lines.push(`    - ${tip}`); }
          const sd = f(c, "see_doctor");
          if (sd) lines.push(`  🩺 ${sd}`);
          lines.push("");
        }
      } else if (urgency === "info") lines.push(t.noDanger);
    }
    const signals = (tr.risk_signals ?? []).filter((s: any) => s.elevated);
    if (signals.length) {
      lines.push(t.risk);
      for (const s of signals) lines.push(t.riskLine(f(s, "name"), Math.round(s.probability * 100)));
    }
    if (tr.health_hotline_bd) lines.push(t.hotline(tr.health_hotline_bd));
    const disclaimer = f(tr, "disclaimer");
    if (disclaimer) lines.push(`\nℹ️ ${disclaimer}`);
    return lines.join("\n");
  }

  async bustMyth(_belief: string, fact: string, lang: Lang): Promise<string> {
    const t = T[lang] ?? T.bn;
    return fact ? t.mythFact(fact) : t.mythGeneric;
  }

  async explainGuide(guide: any, _q: string, lang: Lang): Promise<string> {
    return renderGuide(guide, lang);
  }

  supportsAudio() { return false; }
  async transcribeAudio(): Promise<string> { throw new Error("Mock backend has no audio."); }
}

// =============================================================================
// Gemini backend (hosted Gemma 4) with multi-key quota fallback
// =============================================================================
function geminiKeys(): string[] {
  const cands = [
    process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY_2 || process.env.GEMINI_API_KEY_2,
    process.env.GOOGLE_API_KEY_3 || process.env.GEMINI_API_KEY_3,
  ];
  const seen = new Set<string>();
  const keys: string[] = [];
  for (const k of cands) {
    if (!k || k.startsWith("paste_your") || seen.has(k)) continue;
    seen.add(k); keys.push(k);
  }
  return keys;
}

function isRetryable(err: unknown): boolean {
  const msg = String((err as any)?.message ?? err).toLowerCase();
  return ["429", "quota", "resource_exhausted", "rate limit", "too many requests",
    "503", "overloaded", "service unavailable", "500", "internal server error",
    "invalid api key", "api_key_invalid", "permission_denied", "401", "403"].some((m) => msg.includes(m));
}

const parseJson = (text: string): Profile => {
  try { return JSON.parse(text); } catch { /* fall through */ }
  const m = text.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch { return {}; } }
  return {};
};

class GeminiBackend implements Backend {
  name = "gemini";
  private keys = geminiKeys();
  private clients: any[] = [];
  private model = process.env.SHOKHI_GEMMA_MODEL || "gemma-4-26b-a4b-it";
  private audioModel = process.env.SHOKHI_GEMMA_AUDIO_MODEL || "gemma-4-e4b-it";

  constructor() {
    if (!this.keys.length) throw new Error("No API key. Set GOOGLE_API_KEY (+ optional _2/_3).");
    this.clients = new Array(this.keys.length).fill(null);
  }

  private async clientFor(i: number) {
    if (!this.clients[i]) {
      const { GoogleGenAI } = await import("@google/genai");
      this.clients[i] = new GoogleGenAI({ apiKey: this.keys[i] });
    }
    return this.clients[i];
  }

  private async withFallback<T>(call: (client: any) => Promise<T>): Promise<T> {
    let lastErr: unknown;
    for (let i = 0; i < this.keys.length; i++) {
      try {
        const r = await call(await this.clientFor(i));
        if (i > 0) console.log(`[gemini] succeeded with API key #${i + 1}`);
        return r;
      } catch (err) {
        lastErr = err;
        if (isRetryable(err) && i < this.keys.length - 1) {
          console.log(`[gemini] key #${i + 1} exhausted, falling back…`);
          continue;
        }
        throw err;
      }
    }
    throw new Error(`All Gemini API keys exhausted. Last error: ${lastErr}`);
  }

  private async generate(system: string, user: string, temperature = 0.3): Promise<string> {
    const prompt = `${system}\n\n${user}`;
    const resp: any = await this.withFallback((c) =>
      c.models.generateContent({ model: this.model, contents: prompt, config: { temperature } }));
    return (resp.text ?? "").trim();
  }

  async extractSymptoms(conversation: string, known: Profile): Promise<Profile> {
    const raw = await this.generate(P.EXTRACT_SYSTEM,
      P.extractUser(conversation, JSON.stringify(known)), 0.0);
    const data = parseJson(raw);
    const allowed = new Set(P.SYMPTOM_FIELDS);
    const out: Profile = {};
    for (let [k, v] of Object.entries(data)) {
      if (!allowed.has(k)) continue;
      if (k === "age") { const n = Number(v); if (Number.isNaN(n)) continue; v = n; }
      else if (typeof v === "string") {
        const lv = v.toLowerCase();
        if (["true", "yes", "হ্যাঁ"].includes(lv)) v = true;
        else if (["false", "no", "না"].includes(lv)) v = false;
      }
      if (known[k] !== v) out[k] = v;
    }
    return out;
  }

  explainTriage(tr: any, lang: Lang) {
    return this.generate(P.withLanguage(P.EXPLAIN_SYSTEM, lang), P.explainUser(JSON.stringify(tr)), 0.4);
  }
  bustMyth(belief: string, fact: string, lang: Lang) {
    return this.generate(P.withLanguage(P.MYTH_SYSTEM, lang), P.mythUser(belief, fact), 0.4);
  }
  explainGuide(guide: any, question: string, lang: Lang) {
    return this.generate(P.withLanguage(P.GUIDE_SYSTEM, lang), P.guideUser(JSON.stringify(guide), question), 0.4);
  }

  supportsAudio() { return true; }
  async transcribeAudio(bytes: Buffer, mime: string): Promise<string> {
    const resp: any = await this.withFallback((c) =>
      c.models.generateContent({
        model: this.audioModel,
        contents: [{ parts: [
          { text: P.TRANSCRIBE_INSTRUCTION },
          { inlineData: { mimeType: mime, data: bytes.toString("base64") } },
        ] }],
      }));
    return (resp.text ?? "").trim();
  }
}

// =============================================================================
// Factory — gemini if a key is present (or SHOKHI_BACKEND=gemini), else mock.
// =============================================================================
let cached: Backend | null = null;
export function getBackend(): Backend {
  if (cached) return cached;
  const forced = process.env.SHOKHI_BACKEND;
  const hasKey = geminiKeys().length > 0;
  cached = forced === "mock" ? new MockBackend()
    : forced === "gemini" || hasKey ? new GeminiBackend()
    : new MockBackend();
  return cached;
}
