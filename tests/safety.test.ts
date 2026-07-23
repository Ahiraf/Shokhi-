// Safety-layer tests. These lock the guarantees that make Shokhi responsible health AI:
//   1. urgency is decided by deterministic rules (triage.ts), never the LLM;
//   2. an emergency is NEVER downgraded, and NEVER fired on a missing field;
//   3. the ML risk signal never overrides urgency;
//   4. RAG degrades gracefully (no throw, sensible empties).
// Pure logic — no network, no model, no API key needed.

import { describe, it, expect } from "vitest";
import { triage } from "../lib/server/triage";
import { riskSignals } from "../lib/server/risk";
import { retrieve, corpusInfo } from "../lib/server/rag";
import { Assistant } from "../lib/server/assistant";

describe("triage — deterministic urgency", () => {
  it("fires an emergency for an emergency red flag (eclampsia: convulsions in pregnancy)", () => {
    const r = triage({ pregnancy_convulsions: true });
    expect(r.urgency).toBe("emergency");
    expect(r.red_flags.map((f: any) => f.id)).toContain("eclampsia");
  });

  it("NEVER downgrades: an emergency stays emergency even alongside a milder condition", () => {
    const r = triage({
      pregnancy_convulsions: true, // emergency red flag
      cycles_irregular: true, // + a see_doctor_soon condition (PCOS)
      excess_hair: true,
    });
    expect(r.urgency).toBe("emergency"); // must not drop to see_doctor_soon
  });

  it("NEVER fires an emergency on a missing field — empty profile is 'info' and asks questions", () => {
    const r = triage({});
    expect(r.urgency).toBe("info");
    expect(r.red_flags).toHaveLength(0);
    // critical unknowns are surfaced as screening questions, not assumed dangerous
    expect(Object.keys(r.outstanding_questions).length).toBeGreaterThan(0);
  });

  it("suspects PCOS (see_doctor_soon) for irregular cycles + a supporting sign", () => {
    const r = triage({ cycles_irregular: true, persistent_acne: true });
    expect(r.suspected_conditions.map((c: any) => c.id)).toContain("pcos");
    expect(r.urgency).toBe("see_doctor_soon");
  });
});

describe("ML risk signal — supports, never overrides", () => {
  it("returns well-formed signals (probability 0..1, elevated boolean)", () => {
    const signals = riskSignals({ cycles_irregular: true, excess_hair: true, persistent_acne: true });
    expect(Array.isArray(signals)).toBe(true);
    for (const s of signals) {
      expect(s.probability).toBeGreaterThanOrEqual(0);
      expect(s.probability).toBeLessThanOrEqual(1);
      expect(typeof s.elevated).toBe("boolean");
    }
  });

  it("an elevated risk signal does NOT escalate urgency past the rules", () => {
    // PCOS-shaped profile: risk may be elevated, but no emergency red flag fires.
    const a = new Assistant({ cycles_irregular: true, excess_hair: true, persistent_acne: true });
    const r = a.triage();
    expect(r.urgency).not.toBe("emergency"); // signal can't manufacture an emergency
    // the signal is attached for context, but urgency came from triage rules
    if (r.risk_signals) expect(Array.isArray(r.risk_signals)).toBe(true);
  });
});

describe("RAG — graceful degradation", () => {
  it("has a non-empty corpus", () => {
    expect(corpusInfo().chunks).toBeGreaterThan(0);
  });

  it("never throws and returns an array (even with no embedding key available)", async () => {
    const hits = await retrieve("menstrual health", 3);
    expect(Array.isArray(hits)).toBe(true);
  });

  it("returns nothing for gibberish (no false grounding)", async () => {
    const hits = await retrieve("zzzxqwk vvv qqqq", 3);
    expect(hits).toHaveLength(0);
  });
});
