"use client";

import { useEffect, useState } from "react";
import PageIntro from "@/components/PageIntro";
import WeeklyPlan from "@/components/WeeklyPlan";
import { useLang } from "@/components/LanguageProvider";
import { getWellness } from "@/lib/api";
import type { Wellness } from "@/lib/types";

export default function WellnessPage() {
  const { t, lang } = useLang();
  const [w, setW] = useState<Wellness | null>(null);
  const [error, setError] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pick = (o: any, base: string): string =>
    (lang === "en" ? o[`${base}_en`] : "") || o[`${base}_bn`];

  useEffect(() => {
    getWellness().then(setW).catch(() => setError(true));
  }, []);

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <PageIntro icon="🌿" title={t("wellness.title")} sub={t("wellness.sub")} variant="wellness" side="left" size={165} />

      {error && <p className="mt-8 text-center text-sm text-plum/50">{t("wellness.error")}</p>}

      {w && (
        <div className="mt-8 space-y-10">
          <p className="mx-auto max-w-2xl text-center text-[15px] leading-relaxed text-plum/70">
            {pick(w, "intro")}
          </p>

          {/* personalized 7-day plan */}
          <WeeklyPlan />

          {/* by cycle phase */}
          <section>
            <h2 className="font-display text-xl font-bold text-plum">{t("wellness.byPhase")}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {w.phases.map((p) => (
                <div key={p.id} className="rounded-2xl bg-surface/80 p-5 ring-1 ring-rose-soft">
                  <p className="font-display text-base font-bold text-plum">{pick(p, "label")}</p>
                  <p className="text-xs text-plum/45">{pick(p, "days")}</p>
                  <p className="mt-3 text-sm leading-relaxed text-plum/80">
                    <span className="font-semibold text-rose-deep">{t("wellness.move")}</span> — {pick(p, "move")}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-plum/80">
                    <span className="font-semibold text-sage-deep">{t("wellness.food")}</span> — {pick(p, "food")}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* by condition */}
          <section>
            <h2 className="font-display text-xl font-bold text-plum">{t("wellness.forConditions")}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {w.conditions.map((c) => (
                <div key={c.id} className="rounded-2xl bg-blush/50 p-5 ring-1 ring-rose-soft">
                  <p className="font-display text-base font-bold text-plum">{pick(c, "label")}</p>
                  <p className="mt-3 text-sm leading-relaxed text-plum/80">
                    <span className="font-semibold text-rose-deep">{t("wellness.move")}</span> — {pick(c, "move")}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-plum/80">
                    <span className="font-semibold text-sage-deep">{t("wellness.food")}</span> — {pick(c, "food")}
                  </p>
                  <p className="mt-3 rounded-xl bg-surface/70 px-3 py-2 text-xs leading-relaxed text-plum/60">
                    🩺 {pick(c, "note")}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* simple home moves */}
          <section>
            <h2 className="font-display text-xl font-bold text-plum">{t("wellness.movesTitle")}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {w.moves.map((m) => (
                <div key={m.id} className="flex gap-3 rounded-2xl bg-surface/80 p-4 ring-1 ring-rose-soft">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sage-soft text-2xl">
                    {m.icon}
                  </span>
                  <div>
                    <p className="font-display text-sm font-bold text-plum">{pick(m, "name")}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-plum/65">{pick(m, "how")}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <p className="rounded-2xl bg-apricot-soft/60 px-4 py-3.5 text-xs leading-relaxed text-plum/60">
            ℹ️ {pick(w, "disclaimer")}
          </p>
        </div>
      )}
    </main>
  );
}
