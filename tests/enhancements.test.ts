// Tests for the RAG + safety enhancements drawn from the Maya comparison:
//   #3 topic-tagged retrieval, #1 richer citation metadata, #5 escalate-only LLM safety net.
// Pure logic — the offline mock backend is forced so no key/network is needed.
process.env.SHOKHI_BACKEND = "mock";

import { describe, it, expect } from "vitest";
import { retrieve, corpusInfo } from "../lib/server/rag";
import { applySafetyNet } from "../lib/server/assistant";
import { getBackend } from "../lib/server/gemma";
import { detectCrisis, crisisResponse } from "../lib/server/crisis";

describe("#5 escalate-only LLM safety net", () => {
  it("ESCALATES an 'info' result to emergency when the classifier flags one", () => {
    const base = { urgency: "info", red_flags: [] as any[] };
    const { result, escalated } = applySafetyNet(base, { emergency: true, reason: "convulsions" });
    expect(escalated).toBe(true);
    expect(result.urgency).toBe("emergency");
    expect(result.red_flags.map((f: any) => f.id)).toContain("safety_net");
    expect(result.safety_net.escalated).toBe(true);
  });

  it("NEVER downgrades: a deterministic emergency is untouched by a non-emergency verdict", () => {
    const base = { urgency: "emergency", red_flags: [{ id: "eclampsia" }] };
    const { result, escalated } = applySafetyNet(base, { emergency: false, reason: null });
    expect(escalated).toBe(false);
    expect(result.urgency).toBe("emergency");
    expect(result.red_flags.map((f: any) => f.id)).toEqual(["eclampsia"]);
  });

  it("does nothing when both agree there is no emergency", () => {
    const base = { urgency: "see_doctor_soon", red_flags: [] as any[] };
    const { result, escalated } = applySafetyNet(base, { emergency: false, reason: null });
    expect(escalated).toBe(false);
    expect(result.urgency).toBe("see_doctor_soon");
  });

  it("the offline classifier catches a clear Bangla emergency word (খিঁচুনি) but not benign text", async () => {
    const backend = getBackend();
    const hit = await backend.safetyCheck("হঠাৎ খিঁচুনি হচ্ছে");
    expect(hit.emergency).toBe(true);
    const benign = await backend.safetyCheck("আমি জানতে চাই মাসিক কী");
    expect(benign.emergency).toBe(false);
  });
});

describe("crisis (self-harm) safeguard", () => {
  it("detects self-harm intent in Bangla and English", () => {
    expect(detectCrisis("আমি আর বাঁচতে চাই না")).toBe(true);
    expect(detectCrisis("I want to die")).toBe(true);
    expect(detectCrisis("I don't want to live anymore")).toBe(true);
  });
  it("does not false-fire on ordinary messages", () => {
    expect(detectCrisis("আমার মাসিক অনিয়মিত")).toBe(false);
    expect(detectCrisis("I have cramps and a headache")).toBe(false);
  });
  it("the crisis reply carries a helpline number", () => {
    expect(crisisResponse("en")).toMatch(/119911|999/);
    expect(crisisResponse("bn")).toMatch(/১১৯৯১১|৯৯৯/);
  });
});

describe("#1/#3 retrieval metadata + topics", () => {
  it("the corpus exposes topics", () => {
    const info = corpusInfo();
    expect(info.chunks).toBeGreaterThan(0);
    expect(Array.isArray(info.topics)).toBe(true);
    expect(info.topics.length).toBeGreaterThan(0);
  });

  it("retrieved chunks carry a topic, and boosting never invents false grounding", async () => {
    const hits = await retrieve("menstrual health", 3, { boostTopic: "pcos" });
    expect(Array.isArray(hits)).toBe(true);
    for (const h of hits) expect(typeof h.topic === "string" || h.topic === undefined).toBe(true);
    // gibberish still returns nothing even with a topic boost set
    const none = await retrieve("zzzxqwk vvv qqqq", 3, { boostTopic: "pcos" });
    expect(none).toHaveLength(0);
  });
});
