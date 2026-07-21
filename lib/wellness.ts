// Client-side helpers for the wellness feature: estimate the cycle phase (today and for
// the coming week) from the tracker's local history, and map the saved profile to wellness
// condition ids. All local/offline — nothing leaves the device.

import { loadProfile } from "./profile";

export type Phase = "menstrual" | "follicular" | "ovulatory" | "luteal" | null;

/** Days since the last logged period start (0-based) + average cycle length, or null. */
function cycleState(): { day0: number; cycle: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const logs: { start?: string }[] = JSON.parse(localStorage.getItem("shokhi_cycle_logs") || "[]");
    const starts = logs
      .map((l) => (l.start ? new Date(l.start).getTime() : NaN))
      .filter((n) => !Number.isNaN(n))
      .sort((a, b) => a - b);
    if (!starts.length) return null;

    const day0 = Math.floor((Date.now() - starts[starts.length - 1]) / 86_400_000);
    let cycle = 28;
    if (starts.length >= 2) {
      const gaps: number[] = [];
      for (let i = 1; i < starts.length; i++) {
        const d = Math.round((starts[i] - starts[i - 1]) / 86_400_000);
        if (d > 0) gaps.push(d);
      }
      if (gaps.length) cycle = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
    }
    if (day0 < 0 || day0 > cycle + 20) return null; // stale/implausible → don't guess
    return { day0, cycle };
  } catch {
    return null;
  }
}

/** Phase for a given day-of-cycle (wraps into the next cycle for future days). */
function phaseOf(day: number, cycle: number): Exclude<Phase, null> {
  const d = ((day % cycle) + cycle) % cycle;
  const ov = cycle - 14;
  if (d <= 5) return "menstrual";
  if (d < ov - 1) return "follicular";
  if (d <= ov + 1) return "ovulatory";
  return "luteal";
}

/** The current cycle phase. `day` is 1-based day-of-cycle. */
export function currentPhase(): { phase: Phase; day: number | null; cycle: number | null } {
  const s = cycleState();
  if (!s) return { phase: null, day: null, cycle: null };
  return { phase: phaseOf(s.day0, s.cycle), day: s.day0 + 1, cycle: s.cycle };
}

/** Phase for each of the next 7 days (offset 0 = today). Empty if there's no cycle data. */
export function weeklyPhases(): { offset: number; phaseId: Exclude<Phase, null> }[] {
  const s = cycleState();
  if (!s) return [];
  return Array.from({ length: 7 }, (_, i) => ({
    offset: i,
    phaseId: phaseOf(s.day0 + i, s.cycle),
  }));
}

/** Wellness condition ids relevant to the saved profile (conditions + life stage). */
export function wellnessConditionIds(): string[] {
  const p = loadProfile();
  const ids = new Set<string>();
  for (const c of p.conditions ?? []) {
    if (["pcos", "anemia", "pms"].includes(c)) ids.add(c);
  }
  if (p.stage === "menopause") ids.add("menopause");
  return [...ids];
}
