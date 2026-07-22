"use client";

import type { RiskSignal } from "@/lib/types";
import { useLang } from "./LanguageProvider";

export default function RiskBar({ signal }: { signal: RiskSignal }) {
  const { t, lang } = useLang();
  const pct = Math.round(signal.probability * 100);
  const name = lang === "en" ? signal.name_en || signal.name_bn : signal.name_bn;
  return (
    <div className="mt-3 rounded-xl bg-surface/70 p-3 ring-1 ring-rose-soft">
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-rose-deep">
          {t("message.riskHint")} — {name}
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
        ML support · AUC {signal.auc ?? "—"} · {t("message.riskFooter")}
      </p>
    </div>
  );
}
