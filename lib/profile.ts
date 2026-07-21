// Local-first, anonymous user profile — no account, no server, no PII risk.
//
// Stored in localStorage (like the cycle tracker and pad reminder), so it lives only on
// the woman's own device. It personalises the experience: greeting her by name, and
// seeding the chat's symptom profile with her age/life-stage so triage doesn't have to
// re-ask those. Known conditions are kept for her own reference and shown to Shokhi as
// context; they never by themselves trigger a triage red flag (that stays symptom-driven).

export const PROFILE_KEY = "shokhi_profile";

export type LifeStage =
  | ""
  | "teen"
  | "reproductive"
  | "pregnant"
  | "postpartum"
  | "menopause";

export interface Profile {
  name?: string;
  age?: number | "";
  stage?: LifeStage;
  conditions?: string[]; // condition ids (see CONDITION_OPTIONS)
}

export const STAGE_OPTIONS: { value: LifeStage; bn: string; en: string }[] = [
  { value: "teen", bn: "কিশোরী", en: "Teenager" },
  { value: "reproductive", bn: "প্রজননক্ষম বয়স", en: "Reproductive age" },
  { value: "pregnant", bn: "গর্ভবতী", en: "Pregnant" },
  { value: "postpartum", bn: "সদ্য মা হয়েছি", en: "Recently gave birth" },
  { value: "menopause", bn: "মেনোপজ / মাসিক বন্ধ", en: "Menopause" },
];

export const CONDITION_OPTIONS: { id: string; bn: string; en: string }[] = [
  { id: "pcos", bn: "পিসিওএস", en: "PCOS" },
  { id: "endometriosis", bn: "এন্ডোমেট্রিওসিস", en: "Endometriosis" },
  { id: "pms", bn: "পিএমএস", en: "PMS" },
  { id: "uti", bn: "ইউটিআই", en: "UTI" },
  { id: "anemia", bn: "রক্তস্বল্পতা", en: "Anaemia" },
  { id: "thyroid", bn: "থাইরয়েড", en: "Thyroid" },
];

export function loadProfile(): Profile {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveProfile(p: Profile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

export function clearProfile(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PROFILE_KEY);
}

/**
 * Map a saved profile to the symptom fields the triage engine understands, so the chat
 * starts already knowing the safe demographic facts. Only maps fields that are genuine
 * `symptom_schema` keys — never invents symptoms.
 */
export function toChatProfile(p: Profile): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (typeof p.age === "number" && p.age > 0) out.age = p.age;
  switch (p.stage) {
    case "pregnant":
      out.is_pregnant = true;
      out.is_pregnant_possible = true;
      break;
    case "postpartum":
      out.recently_gave_birth = true;
      break;
    case "menopause":
      out.post_menopausal = true;
      break;
    default:
      break;
  }
  return out;
}

/** Average cycle length (days) from the tracker's localStorage history, or null. */
export function cycleAverageFromTracker(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const logs: { start?: string }[] = JSON.parse(
      localStorage.getItem("shokhi_cycle_logs") || "[]"
    );
    const starts = logs
      .map((l) => (l.start ? new Date(l.start).getTime() : NaN))
      .filter((n) => !Number.isNaN(n))
      .sort((a, b) => a - b);
    if (starts.length < 2) return null;
    const gaps: number[] = [];
    for (let i = 1; i < starts.length; i++) {
      const d = Math.round((starts[i] - starts[i - 1]) / 86_400_000);
      if (d > 0) gaps.push(d);
    }
    if (!gaps.length) return null;
    return Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
  } catch {
    return null;
  }
}
