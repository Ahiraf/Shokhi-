import type { RiskSignal } from "@/lib/types";

export default function RiskBar({ signal }: { signal: RiskSignal }) {
  const pct = Math.round(signal.probability * 100);
  return (
    <div className="mt-3 rounded-xl bg-white/70 p-3 ring-1 ring-rose-soft">
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-rose-deep">
          📊 সহায়ক ইঙ্গিত — {signal.name_bn}
        </span>
        <span className="tabular-nums text-rose-deep/70">~{pct}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-rose-soft">
        <div
          className="h-full rounded-full bg-gradient-to-r from-rose to-rose-deep transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-rose-deep/60">
        ML support · AUC {signal.auc ?? "—"} · নিশ্চিত রোগ নয়, ডাক্তার দেখান।
      </p>
    </div>
  );
}
