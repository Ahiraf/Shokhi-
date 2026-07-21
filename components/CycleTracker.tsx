"use client";

import { useEffect, useMemo, useState } from "react";
import { analyzeCycle } from "@/lib/api";
import type { CycleLog, CycleAnalysis } from "@/lib/types";
import { useLang } from "./LanguageProvider";
import type { StringKey } from "@/lib/i18n";

const STORE_KEY = "shokhi_cycle_logs";

const FLOW_KEY: Record<NonNullable<CycleLog["flow"]>, StringKey> = {
  light: "flow.light",
  normal: "flow.normal",
  heavy: "flow.heavy",
};
const PAIN_KEY: StringKey[] = ["pain.0", "pain.1", "pain.2", "pain.3"];
// pads soaked per day; 6+ is a heavy-bleeding (menorrhagia) signal
const PAD_OPTIONS: { value: number; label_bn: string; label_en: string }[] = [
  { value: 2, label_bn: "১–২", label_en: "1–2" },
  { value: 4, label_bn: "৩–৪", label_en: "3–4" },
  { value: 6, label_bn: "৫–৬", label_en: "5–6" },
  { value: 8, label_bn: "৬+", label_en: "6+" },
];

function loadLogs(): CycleLog[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
  } catch {
    return [];
  }
}

/**
 * Client-side menstrual cycle & symptom tracker. History is kept privately in the
 * browser (localStorage) — nothing personal is stored on the server. On demand it sends
 * just the dates/flow/pain/pad-count to /api/cycle/analyze (with the chosen language) for
 * pattern insight, which is exactly how PCOS/endometriosis/heavy-bleeding get noticed
 * over months instead of one message.
 */
export default function CycleTracker() {
  const { t, lang } = useLang();
  const [logs, setLogs] = useState<CycleLog[]>([]);
  const [start, setStart] = useState("");
  const [flow, setFlow] = useState<CycleLog["flow"]>("normal");
  const [pain, setPain] = useState<CycleLog["pain"]>(0);
  const [pads, setPads] = useState(0); // 0 = not recorded
  const [analysis, setAnalysis] = useState<CycleAnalysis | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => setLogs(loadLogs()), []);

  const sorted = useMemo(
    () => [...logs].sort((a, b) => (a.start < b.start ? 1 : -1)),
    [logs]
  );

  function persist(next: CycleLog[]) {
    setLogs(next);
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
    setAnalysis(null);
  }

  function addLog() {
    if (!start) return;
    if (logs.some((l) => l.start === start)) return; // avoid duplicate date
    persist([...logs, { start, flow, pain, ...(pads ? { pads } : {}) }]);
    setStart("");
    setFlow("normal");
    setPain(0);
    setPads(0);
  }

  function removeLog(date: string) {
    persist(logs.filter((l) => l.start !== date));
  }

  async function runAnalysis() {
    setBusy(true);
    try {
      setAnalysis(await analyzeCycle(logs, lang));
    } catch {
      setAnalysis(null);
    } finally {
      setBusy(false);
    }
  }

  const padLabel = (n: number) =>
    n >= 6 ? (lang === "en" ? "6+" : "৬+") : String(n);

  return (
    <div className="space-y-6 py-6">
      <div className="rounded-2xl bg-rose-soft/50 p-4">
        <h2 className="text-lg font-bold text-rose-deep">{t("tracker.cardTitle")}</h2>
        <p className="mt-1 text-sm text-rose-deep/70">{t("tracker.cardIntro")}</p>
        <p className="mt-1 text-xs text-rose-deep/50">{t("tracker.privacy")}</p>
      </div>

      {/* add a log */}
      <div className="space-y-3 rounded-2xl border border-rose-soft p-4">
        <label className="block text-sm font-medium text-rose-deep/80">
          {t("tracker.startDate")}
          <input
            type="date"
            value={start}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setStart(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-rose-soft px-3 py-2 text-rose-deep focus:outline-none focus:ring-2 focus:ring-rose/40"
          />
        </label>

        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-rose-deep/70">{t("tracker.flow")}</span>
            <div className="mt-1 flex gap-1">
              {(["light", "normal", "heavy"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFlow(f)}
                  className={`rounded-full px-3 py-1 ${
                    flow === f ? "bg-rose-deep text-white" : "bg-rose-soft text-rose-deep"
                  }`}
                >
                  {t(FLOW_KEY[f])}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="text-rose-deep/70">{t("tracker.pain")}</span>
            <div className="mt-1 flex gap-1">
              {[0, 1, 2, 3].map((p) => (
                <button
                  key={p}
                  onClick={() => setPain(p as CycleLog["pain"])}
                  className={`rounded-full px-3 py-1 ${
                    pain === p ? "bg-rose-deep text-white" : "bg-rose-soft text-rose-deep"
                  }`}
                >
                  {t(PAIN_KEY[p])}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="text-rose-deep/70">{t("tracker.padsPerDay")}</span>
            <div className="mt-1 flex gap-1">
              {PAD_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setPads(pads === o.value ? 0 : o.value)}
                  className={`rounded-full px-3 py-1 ${
                    pads === o.value ? "bg-rose-deep text-white" : "bg-rose-soft text-rose-deep"
                  }`}
                >
                  {lang === "en" ? o.label_en : o.label_bn}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={addLog}
          disabled={!start}
          className="w-full rounded-full bg-rose-deep py-2.5 font-medium text-white transition hover:bg-rose-deep/90 disabled:opacity-40"
        >
          {t("tracker.add")}
        </button>
      </div>

      {/* logged history */}
      {sorted.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-rose-deep/60">
            {t("tracker.logged")} ({sorted.length})
          </p>
          {sorted.map((l) => (
            <div
              key={l.start}
              className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-rose-soft"
            >
              <span className="text-rose-deep">
                📅 {l.start}
                {l.flow && ` · ${t("tracker.flowShort")}: ${t(FLOW_KEY[l.flow])}`}
                {typeof l.pain === "number" && ` · ${t(PAIN_KEY[l.pain])}`}
                {l.pads ? ` · ${t("tracker.padShort")}: ${padLabel(l.pads)}` : ""}
              </span>
              <button
                onClick={() => removeLog(l.start)}
                className="text-rose-deep/40 hover:text-rose-deep"
                aria-label={t("tracker.delete")}
              >
                ✕
              </button>
            </div>
          ))}

          <button
            onClick={runAnalysis}
            disabled={busy || logs.length < 2}
            className="mt-2 w-full rounded-full bg-rose-soft py-2.5 font-medium text-rose-deep transition hover:bg-rose-soft disabled:opacity-40"
          >
            {busy
              ? t("tracker.analyzing")
              : logs.length < 2
              ? t("tracker.needTwo")
              : t("tracker.analyze")}
          </button>
        </div>
      )}

      {/* analysis */}
      {analysis && (
        <div className="space-y-3 rounded-2xl bg-rose-soft/40 p-4">
          {analysis.avg_cycle_length && (
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-white px-3 py-1 font-medium text-rose-deep">
                {t("tracker.avgCycle")}: {analysis.avg_cycle_length} {t("tracker.days")}
              </span>
              {analysis.regular !== null && (
                <span className="rounded-full bg-white px-3 py-1 font-medium text-rose-deep">
                  {analysis.regular ? t("tracker.regular") : t("tracker.irregular")}
                </span>
              )}
              {analysis.predicted_next_start && (
                <span className="rounded-full bg-white px-3 py-1 font-medium text-rose-deep">
                  {t("tracker.nextEst")}: {analysis.predicted_next_start}
                </span>
              )}
            </div>
          )}
          <ul className="space-y-1.5 text-sm text-rose-deep/90">
            {analysis.insights_bn.map((i, idx) => (
              <li key={idx}>• {i}</li>
            ))}
          </ul>
          <p className="text-xs text-rose-deep/50">ℹ️ {analysis.disclaimer_bn}</p>
        </div>
      )}
    </div>
  );
}
