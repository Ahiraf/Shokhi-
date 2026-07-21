// Deterministic symptom-triage & safety engine — ported 1:1 from the Python triage.py.
// The URGENCY DECISION is made HERE by rules, never by the LLM, so Gemma can never
// under-triage an emergency. Pure logic over knowledge.json; no network, no model.

import KB from "./knowledge.json";

export type Urgency = "emergency" | "see_doctor_soon" | "self_care" | "info";
export type Profile = Record<string, unknown>;

const RANK: Record<Urgency, number> = {
  emergency: 3,
  see_doctor_soon: 2,
  self_care: 1,
  info: 0,
};

// Fields critical to rule an emergency in/out. If unknown, we surface them as questions.
const CRITICAL_SCREENING = [
  "severe_pelvic_pain", "heavy_bleeding", "fainting_or_dizzy",
  "is_pregnant_possible", "fever",
];

interface Clause { field: string; op: string; value?: unknown }

const OPS: Record<string, (a: any, b: any) => boolean> = {
  is_true: (a) => a === true,
  is_false: (a) => a === false,
  gte: (a, b) => a >= b,
  lte: (a, b) => a <= b,
  gt: (a, b) => a > b,
  lt: (a, b) => a < b,
  eq: (a, b) => a === b,
  in: (a, b) => Array.isArray(b) && b.includes(a),
};
const UNARY = new Set(["is_true", "is_false"]);

function clausePasses(c: Clause, p: Profile): boolean | null {
  if (!(c.field in p) || p[c.field] == null) return null;
  const fn = OPS[c.op];
  const pv = p[c.field];
  return UNARY.has(c.op) ? fn(pv, null) : fn(pv, c.value);
}
const allPass = (cs: Clause[], p: Profile) => cs.every((c) => clausePasses(c, p) === true);
const anyPass = (cs: Clause[], p: Profile) => cs.some((c) => clausePasses(c, p) === true);

function matchRedFlags(p: Profile): any[] {
  const fired: any[] = [];
  for (const rf of (KB as any).red_flags ?? []) {
    const anyClauses = rf.any ?? [];
    const okAny = anyClauses.length ? anyPass(anyClauses, p) : true;
    if (allPass(rf.when, p) && okAny) {
      fired.push({
        id: rf.id, name_bn: rf.name_bn, name_en: rf.name_en, urgency: rf.urgency,
        message_bn: rf.message_bn, message_en: rf.message_en,
        action_bn: rf.action_bn, action_en: rf.action_en,
      });
    }
  }
  return fired;
}

function matchConditions(p: Profile): any[] {
  const suspected: any[] = [];
  for (const cond of (KB as any).conditions ?? []) {
    const sw = cond.suspect_when ?? {};
    const okAll = allPass(sw.all ?? [], p);
    const anyClauses = sw.any ?? [];
    const okAny = anyClauses.length ? anyPass(anyClauses, p) : true;
    if (okAll && okAny) {
      suspected.push({
        id: cond.id, name_bn: cond.name_bn, name_en: cond.name_en, urgency: cond.urgency,
        about_bn: cond.about_bn, about_en: cond.about_en,
        self_care_bn: cond.self_care_bn ?? [], self_care_en: cond.self_care_en ?? [],
        see_doctor_bn: cond.see_doctor_bn ?? "", see_doctor_en: cond.see_doctor_en ?? "",
      });
    }
  }
  return suspected;
}

function screeningQuestions(p: Profile): Record<string, string> {
  const schema = (KB as any).symptom_schema ?? {};
  const out: Record<string, string> = {};
  for (const f of CRITICAL_SCREENING) {
    if (p[f] == null && f in schema) out[f] = schema[f].question_bn ?? "";
  }
  return out;
}

export function triage(profile: Profile): any {
  const redFlags = matchRedFlags(profile);
  const conditions = matchConditions(profile);
  const ranks = [
    ...redFlags.map((r) => RANK[r.urgency as Urgency]),
    ...conditions.map((c) => RANK[c.urgency as Urgency]),
  ];
  const top = ranks.length ? Math.max(...ranks) : RANK.info;
  const urgency = (Object.keys(RANK) as Urgency[]).find((k) => RANK[k] === top)!;

  const meta = (KB as any).meta ?? {};
  const levels = meta.urgency_levels ?? {};
  return {
    urgency,
    urgency_label_bn: levels[urgency]?.label_bn ?? "",
    urgency_label_en: levels[urgency]?.label_en ?? "",
    red_flags: redFlags,
    suspected_conditions: conditions,
    outstanding_questions: screeningQuestions(profile),
    emergency_number_bd: meta.emergency_number_bd ?? "999",
    health_hotline_bd: meta.health_hotline_bd ?? "",
    disclaimer_bn: meta.disclaimer_bn ?? "",
    disclaimer_en: meta.disclaimer_en ?? "",
  };
}

export const knowledge = KB as any;
