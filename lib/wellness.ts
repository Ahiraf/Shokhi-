// Client-side helpers for the wellness feature: estimate the current cycle phase from
// the tracker's local history, and map the saved profile to wellness condition ids.
// All local/offline — nothing leaves the device.

import { loadProfile } from "./profile";

export type Phase = "menstrual" | "follicular" | "ovulatory" | "luteal" | null;

/** Estimate the current cycle phase from localStorage tracker history. `day` is 1-based. */
export function currentPhase(): { phase: Phase; day: number | null; cycle: number | null } {
  if (typeof window === "undefined") return { phase: null, day: null, cycle: null };
  try {
    const logs: { start?: string }[] = JSON.parse(localStorage.getItem("shokhi_cycle_logs") || "[]");
    const starts = logs
      .map((l) => (l.start ? new Date(l.start).getTime() : NaN))
      .filter((n) => !Number.isNaN(n))
      .sort((a, b) => a - b);
    if (!starts.length) return { phase: null, day: null, cycle: null };

    const last = starts[starts.length - 1];
    const day0 = Math.floor((Date.now() - last) / 86_400_000); // days since last start (0-based)

    let cycle = 28;
    if (starts.length >= 2) {
      const gaps: number[] = [];
      for (let i = 1; i < starts.length; i++) {
        const d = Math.round((starts[i] - starts[i - 1]) / 86_400_000);
        if (d > 0) gaps.push(d);
      }
      if (gaps.length) cycle = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
    }

    // stale/implausible (e.g. logged long ago, or overdue) → don't guess a phase
    if (day0 < 0 || day0 > cycle + 20) return { phase: null, day: null, cycle };

    const ovulation = cycle - 14;
    let phase: Phase;
    if (day0 <= 5) phase = "menstrual";
    else if (day0 < ovulation - 1) phase = "follicular";
    else if (day0 <= ovulation + 1) phase = "ovulatory";
    else phase = "luteal";
    return { phase, day: day0 + 1, cycle };
  } catch {
    return { phase: null, day: null, cycle: null };
  }
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
