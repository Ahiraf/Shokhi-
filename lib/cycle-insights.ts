// Client-side cycle insights for the tracker's Flo-style dashboard. Builds on the
// deterministic analyze() engine and adds today's prediction (period countdown / phase /
// fertile window). 100% on-device — the logs never leave the phone.

import { analyze } from "./server/cycle";
import type { CycleAnalysis, CycleLog } from "./types";

export type Phase = "menstrual" | "follicular" | "ovulatory" | "luteal";

const DAY = 86_400_000;
export const toDays = (isoStr: string) => Math.floor(new Date(isoStr.slice(0, 10)).getTime() / DAY);
export const fromDays = (d: number) => new Date(d * DAY).toISOString().slice(0, 10);
export const todayDays = () => Math.floor(Date.now() / DAY);

/** Phase for a 0-based day-of-cycle (same rule as lib/wellness). */
function phaseOf(day0: number, cycle: number): Phase {
  const d = ((day0 % cycle) + cycle) % cycle;
  const ov = cycle - 14;
  if (d <= 5) return "menstrual";
  if (d < ov - 1) return "follicular";
  if (d <= ov + 1) return "ovulatory";
  return "luteal";
}

export type StatusKind = "period" | "ovulation" | "upcoming" | "late" | "unknown";

export interface CycleInsights {
  analysis: CycleAnalysis;
  hasData: boolean;
  periodDays: Set<string>; // logged bleeding days (ISO)
  predictedPeriodDays: Set<string>; // predicted next-period days
  fertileDays: Set<string>; // predicted fertile window
  ovulationDay: string | null;
  predictedNextStart: string | null;
  daysUntilNext: number | null;
  cycleDay: number | null;
  avgCycle: number;
  periodLen: number;
  phase: Phase | null;
  status: { kind: StatusKind; value: number | null };
}

export function getInsights(logs: CycleLog[], lang: "bn" | "en" = "bn"): CycleInsights {
  const analysis = analyze(logs, lang) as CycleAnalysis;
  const periodDays = new Set(analysis.period_days ?? []);
  const empty: CycleInsights = {
    analysis, hasData: false, periodDays, predictedPeriodDays: new Set(), fertileDays: new Set(),
    ovulationDay: null, predictedNextStart: null, daysUntilNext: null, cycleDay: null,
    avgCycle: 28, periodLen: 5, phase: null, status: { kind: "unknown", value: null },
  };
  if (!analysis.last_period_start) return empty;

  const today = todayDays();
  const lastStart = toDays(analysis.last_period_start);
  const avgCycle = analysis.avg_cycle_length ?? 28;
  const periodLen = analysis.avg_period_length ?? 5;

  // Predict the next period even with limited history (uses 28d default until 2+ cycles).
  const nextStart = lastStart + avgCycle;
  const predictedNextStart = fromDays(nextStart);
  const daysUntilNext = nextStart - today;

  const predictedPeriodDays = new Set<string>();
  for (let i = 0; i < Math.max(1, periodLen); i++) predictedPeriodDays.add(fromDays(nextStart + i));

  // Ovulation ≈ 14 days before the next period; fertile window ≈ 5 days before to 1 after.
  const ovDay = nextStart - 14;
  const ovulationDay = fromDays(ovDay);
  const fertileDays = new Set<string>();
  for (let i = -5; i <= 1; i++) fertileDays.add(fromDays(ovDay + i));

  const cycleDay = today - lastStart + 1;
  const phase = phaseOf(cycleDay - 1, avgCycle);

  const inPeriodToday =
    periodDays.has(fromDays(today)) || (today >= lastStart && today < lastStart + periodLen);

  let status: CycleInsights["status"];
  if (inPeriodToday) status = { kind: "period", value: today - lastStart + 1 };
  else if (fertileDays.has(fromDays(today))) status = { kind: "ovulation", value: null };
  else if (daysUntilNext >= 0) status = { kind: "upcoming", value: daysUntilNext };
  else status = { kind: "late", value: -daysUntilNext };

  return {
    analysis, hasData: true, periodDays, predictedPeriodDays, fertileDays, ovulationDay,
    predictedNextStart, daysUntilNext, cycleDay, avgCycle, periodLen, phase, status,
  };
}
