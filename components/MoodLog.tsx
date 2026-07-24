"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLang } from "./LanguageProvider";
import { getInsights, toDays, fromDays, todayDays } from "@/lib/cycle-insights";
import type { CycleLog } from "@/lib/types";

const STORE = "shokhi_mood_logs";

const MOODS = [
  { id: "great", face: "😄", bn: "দারুণ", en: "Great", neg: false },
  { id: "okay", face: "🙂", bn: "ঠিক আছে", en: "Okay", neg: false },
  { id: "low", face: "😔", bn: "মন খারাপ", en: "Low", neg: true },
  { id: "irritable", face: "😣", bn: "খিটখিটে", en: "Irritable", neg: true },
  { id: "anxious", face: "😰", bn: "উদ্বিগ্ন", en: "Anxious", neg: true },
  { id: "tearful", face: "😢", bn: "কান্না পাচ্ছে", en: "Tearful", neg: true },
];

function load(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(STORE) || "{}"); } catch { return {}; }
}
function loadCycle(): CycleLog[] {
  try { return JSON.parse(localStorage.getItem("shokhi_cycle_logs") || "[]"); } catch { return []; }
}

/**
 * Daily mood check-in. Beyond logging, it looks for the CYCLICAL pattern — if low/irritable/
 * anxious moods keep landing in the days around her period, it gently tells her: this is PMS,
 * it's real, it's not your fault. Validating that turns "what's wrong with me" into
 * "this is my body, and it passes". All on-device.
 */
export default function MoodLog() {
  const { lang } = useLang();
  const en = lang === "en";
  const [moods, setMoods] = useState<Record<string, string>>({});
  const today = fromDays(todayDays());

  useEffect(() => setMoods(load()), []);

  function set(id: string) {
    const next = { ...moods, [today]: id };
    setMoods(next);
    localStorage.setItem(STORE, JSON.stringify(next));
  }

  // does the woman's low mood cluster in the premenstrual / menstrual window?
  const pattern = useMemo(() => {
    const ins = getInsights(loadCycle(), lang);
    if (!ins.hasData || !ins.analysis.last_period_start) return false;
    const lastStart = toDays(ins.analysis.last_period_start);
    const cyc = ins.avgCycle || 28;
    let neg = 0, premen = 0;
    for (const [date, mood] of Object.entries(moods)) {
      const m = MOODS.find((x) => x.id === mood);
      if (!m?.neg) continue;
      neg++;
      const cd = (((toDays(date) - lastStart) % cyc) + cyc) % cyc;
      if (cd >= cyc - 7 || cd <= 4) premen++; // last week before period, or during it
    }
    return neg >= 2 && premen >= 2 && premen >= neg * 0.5;
  }, [moods, lang]);

  const chosen = moods[today];

  return (
    <div className="space-y-3 rounded-2xl border border-rose-soft bg-surface p-4">
      <h2 className="text-base font-bold text-rose-deep">{en ? "How do you feel today?" : "আজ আপনার মন কেমন?"}</h2>
      <div className="flex flex-wrap gap-2">
        {MOODS.map((m) => (
          <button
            key={m.id}
            onClick={() => set(m.id)}
            className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition ${
              chosen === m.id ? "bg-rose-deep text-accentink" : "bg-rose-mist/70 text-rose-deep hover:bg-rose-soft"
            }`}
          >
            <span className="text-2xl">{m.face}</span>
            <span className="text-[11px] font-medium">{en ? m.en : m.bn}</span>
          </button>
        ))}
      </div>

      {chosen && (
        <p className="text-xs text-rose-deep/60">
          {en ? "Saved on this phone. Logging daily helps you see your own pattern." : "এই ফোনে সংরক্ষিত। প্রতিদিন লিখলে নিজের ধরন বুঝতে পারবেন।"}
        </p>
      )}

      {pattern && (
        <div className="rounded-xl bg-sage-soft/70 p-3 text-sm text-sage-deep">
          <p className="font-semibold">
            {en
              ? "You've often felt this way in the days around your period — that's PMS, and it's real. It's not your fault, and it passes."
              : "আপনি প্রায়ই মাসিকের আশপাশের দিনগুলোতে এমন অনুভব করেন — এটি পিএমএস, আর এটি সত্যি। এটি আপনার দোষ নয়, আর এটি কেটে যায়।"}
          </p>
          <Link href="/guides/period_emotions" className="mt-1 inline-block text-xs font-semibold text-rose underline">
            {en ? "Learn what helps" : "কী করলে ভালো লাগে জানুন"}
          </Link>
        </div>
      )}
    </div>
  );
}
