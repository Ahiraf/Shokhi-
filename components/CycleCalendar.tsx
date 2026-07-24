"use client";

import { useState } from "react";
import { useLang } from "./LanguageProvider";
import { fromDays, toDays, todayDays } from "@/lib/cycle-insights";

const BN = "০১২৩৪৫৬৭৮৯";
const toBn = (n: number | string) => String(n).replace(/\d/g, (d) => BN[+d]);

const MONTHS_BN = ["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"];
const MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW_BN = ["র","সো","ম","বু","বৃ","শু","শ"];
const DOW_EN = ["S","M","T","W","T","F","S"];

export default function CycleCalendar({
  periodDays,
  predictedPeriodDays,
  fertileDays,
  ovulationDay,
  onPickDay,
}: {
  periodDays: Set<string>;
  predictedPeriodDays: Set<string>;
  fertileDays: Set<string>;
  ovulationDay: string | null;
  onPickDay: (iso: string) => void;
}) {
  const { t, lang } = useLang();
  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const num = (n: number | string) => (lang === "en" ? String(n) : toBn(n));

  const first = new Date(view.y, view.m, 1);
  const startDow = first.getDay(); // 0=Sun
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const today = fromDays(todayDays());

  const cells: (string | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(view.y, view.m, d).toLocaleDateString("en-CA")); // YYYY-MM-DD (local)
  }

  const shift = (delta: number) => {
    const m = view.m + delta;
    setView({ y: view.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 });
  };

  const months = lang === "en" ? MONTHS_EN : MONTHS_BN;
  const dows = lang === "en" ? DOW_EN : DOW_BN;

  return (
    <div className="rounded-2xl border border-rose-soft p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => shift(-1)} aria-label="prev" className="flex h-8 w-8 items-center justify-center rounded-full text-rose-deep hover:bg-rose-soft">‹</button>
        <p className="text-sm font-bold text-rose-deep">{months[view.m]} {num(view.y)}</p>
        <button onClick={() => shift(1)} aria-label="next" className="flex h-8 w-8 items-center justify-center rounded-full text-rose-deep hover:bg-rose-soft">›</button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-medium text-rose-deep/50">
        {dows.map((d, i) => <div key={i} className="py-1">{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((iso, i) => {
          if (!iso) return <div key={i} />;
          const day = Number(iso.slice(8, 10));
          const isPeriod = periodDays.has(iso);
          const isPredicted = !isPeriod && predictedPeriodDays.has(iso);
          const isFertile = !isPeriod && !isPredicted && fertileDays.has(iso);
          const isOv = iso === ovulationDay;
          const isToday = iso === today;
          const isFuture = toDays(iso) > todayDays();

          let cls = "text-rose-deep/80";
          if (isPeriod) cls = "bg-rose-deep text-accentink font-semibold";
          else if (isPredicted) cls = "text-rose-deep ring-1 ring-dashed ring-rose-deep/60";
          else if (isOv) cls = "bg-emerald-400/80 text-white font-semibold";
          else if (isFertile) cls = "bg-emerald-100 text-emerald-700";

          return (
            <button
              key={i}
              onClick={() => !isFuture && onPickDay(iso)}
              disabled={isFuture}
              className={`relative aspect-square rounded-full text-xs transition ${cls}
                ${isToday ? "ring-2 ring-rose ring-offset-1" : ""}
                ${isFuture ? "cursor-default opacity-45" : "hover:brightness-95"}`}
            >
              {num(day)}
            </button>
          );
        })}
      </div>

      {/* legend */}
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-rose-deep/60">
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-rose-deep" /> {t("tracker.legendPeriod")}</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full ring-1 ring-dashed ring-rose-deep/60" /> {t("tracker.legendPredicted")}</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-100" /> {t("tracker.legendFertile")}</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" /> {t("tracker.legendOvulation")}</span>
      </div>
    </div>
  );
}
