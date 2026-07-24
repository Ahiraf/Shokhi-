// Clinician-review-oriented safety tests.
//
// Two guarantees that most affect a real user's safety:
//
//   A. BANGLA NEGATION — when a woman says she does NOT have a symptom
//      ("আমার জ্বর নেই" = "I don't have fever"), Shokhi must not record it as present,
//      and must not invent a symptom she denied. Equally, a plainly-stated symptom
//      ("জ্বর আছে") must be recorded so a real red flag is never missed.
//
//   B. EMERGENCY RED FLAGS — every emergency in the knowledge base must actually fire
//      as `urgency: "emergency"` when its defining symptoms are present. This is the
//      list a clinician signs off on; each case below is annotated with what it means.
//
// These are pure-logic tests (deterministic triage + offline mock NLP) — no network,
// no model, no API key. Force the offline mock so negation parsing is exercised
// directly rather than depending on a hosted model.
process.env.SHOKHI_BACKEND = "mock";

import { describe, it, expect } from "vitest";
import { triage } from "../lib/server/triage";
import { Assistant } from "../lib/server/assistant";

/** Run one Bangla/English message through the offline symptom extractor. */
async function extract(message: string) {
  const a = new Assistant();
  await a.addUserMessage(message);
  return a.profile;
}

describe("A. Bangla negation — deny vs. affirm a symptom", () => {
  it("'জ্বর নেই' (no fever) must NOT record fever as present", async () => {
    const p = await extract("আমার জ্বর নেই, ভালো আছি");
    expect(p.fever).not.toBe(true);
  });

  it("'জ্বর আছে' (I have fever) MUST record fever as present", async () => {
    const p = await extract("আমার জ্বর আছে");
    expect(p.fever).toBe(true);
  });

  it("'গর্ভবতী নই' (not pregnant) must NOT set the pregnancy flag", async () => {
    const p = await extract("আমি গর্ভবতী নই");
    expect(p.is_pregnant_possible).not.toBe(true);
  });

  it("'মাথা ঘুরছে না' (not dizzy) must NOT record dizziness", async () => {
    const p = await extract("এখন আর মাথা ঘুরছে না");
    expect(p.fainting_or_dizzy).not.toBe(true);
  });

  it("English negation: \"I don't have fever\" must NOT record fever", async () => {
    const p = await extract("I don't have fever anymore");
    expect(p.fever).not.toBe(true);
  });

  it("a denied symptom must never manufacture an emergency", async () => {
    // She denies the severe pain and heavy bleeding — nothing should escalate.
    const p = await extract("আমার তীব্র ব্যথা নেই, অতিরিক্ত রক্ত নেই");
    const r = triage(p);
    expect(r.urgency).not.toBe("emergency");
  });

  it("negation must not suppress a genuine, separately-stated red flag", async () => {
    // "no fever, BUT heavy bleeding and I feel faint" → hemorrhage emergency must stand.
    const p = await extract("জ্বর নেই, কিন্তু প্রচুর রক্ত যাচ্ছে আর মাথা ঘুরছে");
    const r = triage(p);
    expect(r.urgency).toBe("emergency");
  });
});

// Every emergency in knowledge.json, keyed by the exact symptom profile that defines it.
// A clinician can read this table directly against the red-flag list.
const EMERGENCY_CASES: Array<{ id: string; label: string; profile: Record<string, unknown> }> = [
  { id: "eclampsia", label: "convulsions in pregnancy (eclampsia)",
    profile: { pregnancy_convulsions: true } },
  { id: "preeclampsia", label: "pregnant + severe headache (pre-eclampsia)",
    profile: { is_pregnant: true, pregnancy_severe_headache: true } },
  { id: "preeclampsia", label: "pregnant + vision changes (pre-eclampsia)",
    profile: { is_pregnant: true, pregnancy_vision_changes: true } },
  { id: "preeclampsia", label: "pregnant + face/hand swelling (pre-eclampsia)",
    profile: { is_pregnant: true, pregnancy_face_hand_swelling: true } },
  { id: "pregnancy_bleeding", label: "bleeding during pregnancy",
    profile: { is_pregnant: true, pregnancy_bleeding: true } },
  { id: "reduced_fetal_movement", label: "reduced fetal movement",
    profile: { is_pregnant: true, reduced_fetal_movement: true } },
  { id: "ectopic_risk", label: "possible pregnancy + severe pelvic pain (ectopic risk)",
    profile: { is_pregnant_possible: true, severe_pelvic_pain: true } },
  { id: "postpartum_hemorrhage", label: "heavy bleeding after birth (postpartum haemorrhage)",
    profile: { recently_gave_birth: true, postpartum_heavy_bleeding: true } },
  { id: "postpartum_sepsis", label: "fever after birth (postpartum sepsis)",
    profile: { recently_gave_birth: true, postpartum_fever: true } },
  { id: "hemorrhage", label: "heavy bleeding + faint/dizzy (haemorrhagic shock risk)",
    profile: { heavy_bleeding: true, fainting_or_dizzy: true } },
  { id: "pelvic_infection", label: "fever + severe pelvic pain (pelvic infection)",
    profile: { fever: true, severe_pelvic_pain: true } },
];

describe("B. Every emergency red flag fires (clinician-reviewed)", () => {
  for (const c of EMERGENCY_CASES) {
    it(`fires emergency for: ${c.label}`, () => {
      const r = triage(c.profile);
      expect(r.urgency).toBe("emergency");
      expect(r.red_flags.map((f: any) => f.id)).toContain(c.id);
      // an emergency must always carry an action + the emergency number to call
      expect(r.emergency_number_bd).toBeTruthy();
    });
  }

  it("the emergency set is complete — no emergency red flag is left untested", () => {
    // Guard against someone adding a new emergency to knowledge.json without a test:
    // every red_flag with urgency 'emergency' must appear in EMERGENCY_CASES above.
    const kb = require("../lib/server/knowledge.json");
    const declared = new Set(
      (kb.red_flags ?? []).filter((r: any) => r.urgency === "emergency").map((r: any) => r.id),
    );
    const tested = new Set(EMERGENCY_CASES.map((c) => c.id));
    for (const id of declared) {
      expect(tested.has(id as string)).toBe(true);
    }
  });
});
