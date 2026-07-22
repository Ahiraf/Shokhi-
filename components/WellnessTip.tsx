"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getWellness } from "@/lib/api";
import type { Wellness } from "@/lib/types";
import { useLang } from "./LanguageProvider";
import { currentPhase, wellnessConditionIds } from "@/lib/wellness";

/**
 * Personalised wellness tip on the tracker: estimates the current cycle phase from the
 * logged history and reads the saved profile's conditions (both local/offline), then
 * shows the matching movement + food advice. Falls back to a prompt when there's no data.
 */
export default function WellnessTip() {
  const { t, lang } = useLang();
  const [w, setW] = useState<Wellness | null>(null);
  const [phaseId, setPhaseId] = useState<string | null>(null);
  const [condIds, setCondIds] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pick = (o: any, base: string): string =>
    (lang === "en" ? o[`${base}_en`] : "") || o[`${base}_bn`];

  useEffect(() => {
    getWellness().then(setW).catch(() => {});
    setPhaseId(currentPhase().phase);
    setCondIds(wellnessConditionIds());
  }, []);

  if (!w) return null;
  const phase = phaseId ? w.phases.find((p) => p.id === phaseId) : null;
  const cond = condIds.length ? w.conditions.find((c) => c.id === condIds[0]) : null;

  return (
    <div className="mt-4 rounded-2xl bg-sage-soft/60 p-4 ring-1 ring-rose-soft">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-sage-deep">{t("wellness.tipTitle")}</h2>
        <Link href="/wellness" className="shrink-0 text-xs font-semibold text-rose hover:underline">
          {t("wellness.seeAll")}
        </Link>
      </div>

      {phase ? (
        <div className="mt-2 space-y-1.5 text-sm leading-relaxed text-plum/80">
          <p>
            <span className="text-plum/55">{t("wellness.tipPhase")}</span> <b>{pick(phase, "label")}</b>
          </p>
          <p>
            <span className="font-semibold text-rose-deep">{t("wellness.move")}</span> — {pick(phase, "move")}
          </p>
          <p>
            <span className="font-semibold text-sage-deep">{t("wellness.food")}</span> — {pick(phase, "food")}
          </p>
        </div>
      ) : (
        <p className="mt-2 text-sm leading-relaxed text-plum/60">{t("wellness.tipNoData")}</p>
      )}

      {cond && (
        <p className="mt-2.5 rounded-xl bg-surface/70 px-3 py-2 text-sm leading-relaxed text-plum/75">
          <b>{pick(cond, "label")}:</b> {pick(cond, "move")}
        </p>
      )}
    </div>
  );
}
