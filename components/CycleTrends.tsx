"use client";

import { useMemo } from "react";
import { useLang } from "./LanguageProvider";
import { fromDays, toDays, todayDays } from "@/lib/cycle-insights";

const BN = "০১২৩৪৫৬৭৮৯";
const toBn = (n: number | string) => String(n).replace(/\d/g, (d) => BN[+d]);
const MONTHS_EN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_BN = ["জানু","ফেব","মার্চ","এপ্রি","মে","জুন","জুল","আগ","সেপ","অক্টো","নভে","ডিসে"];

/**
 * All-time period visualisation (never capped at N months):
 *   1) a GitHub-contribution-style heatmap of EVERY logged period day, and
 *   2) a bar graph of EVERY completed cycle's length with the normal 21–35 day band.
 * Both scroll horizontally so the full history is always visible.
 */
export default function CycleTrends({
  periodDays,
  cycles,
}: {
  periodDays: Set<string>;
  cycles: { start: string; length: number }[];
}) {
  const { t, lang } = useLang();
  const num = (n: number | string) => (lang === "en" ? String(n) : toBn(n));
  const months = lang === "en" ? MONTHS_EN : MONTHS_BN;

  // ---- heatmap weeks (all-time) ----
  const weeks = useMemo(() => {
    if (!periodDays.size) return [];
    const days = [...periodDays].map(toDays).sort((a, b) => a - b);
    const today = todayDays();
    // start on the Sunday on/before the first logged day
    const firstDate = new Date(days[0] * 86_400_000);
    let startDay = days[0] - firstDate.getDay();
    const cols: { iso: string; on: boolean; dow: number }[][] = [];
    let col: { iso: string; on: boolean; dow: number }[] = [];
    for (let d = startDay; d <= today; d++) {
      const iso = fromDays(d);
      const dow = new Date(d * 86_400_000).getDay();
      col.push({ iso, on: periodDays.has(iso), dow });
      if (dow === 6) { cols.push(col); col = []; }
    }
    if (col.length) cols.push(col);
    return cols;
  }, [periodDays]);

  // month labels aligned to the first column of each month
  const monthMarks = useMemo(() => {
    const marks: { idx: number; label: string }[] = [];
    let lastKey = "";
    weeks.forEach((wk, i) => {
      const firstReal = wk.find(Boolean);
      if (!firstReal) return;
      const d = new Date(firstReal.iso);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (key !== lastKey) {
        lastKey = key;
        marks.push({ idx: i, label: `${months[d.getMonth()]}${d.getMonth() === 0 ? " " + num(d.getFullYear()) : ""}` });
      }
    });
    return marks;
  }, [weeks, months, lang]);

  const maxLen = Math.max(40, ...cycles.map((c) => c.length));

  return (
    <div className="space-y-5">
      {/* 1) period heatmap */}
      <div>
        <p className="mb-2 text-sm font-semibold text-rose-deep">{t("tracker.heatmapTitle")}</p>
        {weeks.length === 0 ? (
          <p className="text-xs text-rose-deep/50">{t("tracker.trendEmpty")}</p>
        ) : (
          <div className="overflow-x-auto pb-1">
            <div className="inline-block">
              <div className="mb-1 flex text-[9px] text-rose-deep/50" style={{ gap: 2 }}>
                {weeks.map((_, i) => {
                  const mark = monthMarks.find((m) => m.idx === i);
                  return <div key={i} style={{ width: 12 }}>{mark ? <span className="whitespace-nowrap">{mark.label}</span> : ""}</div>;
                })}
              </div>
              <div className="flex" style={{ gap: 2 }}>
                {weeks.map((wk, i) => (
                  <div key={i} className="flex flex-col" style={{ gap: 2 }}>
                    {Array.from({ length: 7 }, (_, dow) => {
                      const cell = wk.find((c) => c.dow === dow);
                      const on = cell?.on;
                      return (
                        <div
                          key={dow}
                          title={cell?.iso}
                          style={{ width: 12, height: 12 }}
                          className={`rounded-[3px] ${on ? "bg-rose-deep" : "bg-rose-soft/50"}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2) all-time cycle-length bars */}
      <div>
        <p className="mb-2 text-sm font-semibold text-rose-deep">{t("tracker.trendTitle")}</p>
        {cycles.length === 0 ? (
          <p className="text-xs text-rose-deep/50">{t("tracker.trendNeedTwo")}</p>
        ) : (
          <div className="overflow-x-auto pb-1">
            <div className="relative flex items-end gap-1.5" style={{ height: 140, minWidth: cycles.length * 28 }}>
              {/* normal-range band (21–35 days) */}
              <div
                className="pointer-events-none absolute inset-x-0 bg-emerald-100/50"
                style={{ bottom: `${(21 / maxLen) * 100}%`, top: `${(1 - 35 / maxLen) * 100}%` }}
              />
              {cycles.map((c, i) => {
                const h = Math.max(6, (c.length / maxLen) * 130);
                const color = c.length < 21 ? "bg-amber-400" : c.length > 35 ? "bg-rose-deep" : "bg-rose";
                return (
                  <div key={i} className="relative z-10 flex flex-col items-center justify-end" style={{ width: 22 }}>
                    <span className="mb-0.5 text-[9px] font-medium text-rose-deep/70">{num(c.length)}</span>
                    <div className={`w-full rounded-t ${color}`} style={{ height: h }} title={c.start} />
                    <span className="mt-0.5 w-full truncate text-center text-[8px] text-rose-deep/45">{c.start.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <p className="mt-1.5 text-[10px] text-rose-deep/50">{t("tracker.trendBand")}</p>
      </div>
    </div>
  );
}
