"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getWellness } from "@/lib/api";
import type { Wellness, WellnessMove } from "@/lib/types";
import { useLang } from "./LanguageProvider";
import { weeklyPhases } from "@/lib/wellness";

// during menstrual/luteal phases, keep the suggested move gentle
const GENTLE = ["walk", "stretch", "yoga", "breathing"];

/**
 * "This week for you" — maps each of the next 7 days to its estimated cycle phase (from
 * the local period history) and suggests a gentle, phase-appropriate move + a short food
 * focus for that day. All on-device; body-positive, not a training regimen.
 */
export default function WeeklyPlan() {
  const { t, lang } = useLang();
  const [w, setW] = useState<Wellness | null>(null);
  const [days, setDays] = useState<{ offset: number; phaseId: string }[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pick = (o: any, base: string): string => (lang === "en" ? o[`${base}_en`] : "") || o[`${base}_bn`];

  useEffect(() => {
    getWellness().then(setW).catch(() => {});
    setDays(weeklyPhases());
  }, []);

  if (!w) return null;

  if (!days.length) {
    return (
      <section className="rounded-2xl bg-white/80 p-5 ring-1 ring-rose-soft">
        <h2 className="font-display text-xl font-bold text-plum">{t("wellness.weekTitle")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-plum/60">
          {t("wellness.tipNoData")}{" "}
          <Link href="/tracker" className="font-semibold text-rose hover:underline">
            {t("profile.goTracker")}
          </Link>
        </p>
      </section>
    );
  }

  const moveFor = (phaseId: string, offset: number): WellnessMove => {
    const pool = phaseId === "menstrual" || phaseId === "luteal"
      ? w.moves.filter((m) => GENTLE.includes(m.id))
      : w.moves;
    return pool[offset % pool.length];
  };
  const dayLabel = (offset: number) => {
    if (offset === 0) return t("wellness.today");
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return new Intl.DateTimeFormat(lang === "en" ? "en-US" : "bn-BD", { weekday: "short" }).format(d);
  };
  const phase = (id: string) => w.phases.find((p) => p.id === id);

  return (
    <section className="rounded-2xl bg-white/80 p-5 ring-1 ring-rose-soft">
      <h2 className="font-display text-xl font-bold text-plum">{t("wellness.weekTitle")}</h2>
      <p className="mt-1 text-sm text-plum/55">{t("wellness.weekSub")}</p>
      <div className="mt-4 space-y-2">
        {days.map(({ offset, phaseId }) => {
          const m = moveFor(phaseId, offset);
          const p = phase(phaseId);
          return (
            <div
              key={offset}
              className={`flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl px-3 py-2.5 text-sm ${
                offset === 0 ? "bg-sage-soft/60 ring-1 ring-rose-soft" : "bg-cream"
              }`}
            >
              <span className="w-11 shrink-0 font-semibold text-plum/70">{dayLabel(offset)}</span>
              {p && (
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-rose-deep ring-1 ring-rose-soft">
                  {pick(p, "label")}
                </span>
              )}
              <span className="text-plum/80">{m.icon} {pick(m, "name")}</span>
              {p && <span className="text-plum/45">· {pick(p, "focus")}</span>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
