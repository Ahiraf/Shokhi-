"use client";

import { useEffect, useMemo, useState } from "react";
import { analyze as analyzeLocal } from "@/lib/server/cycle";
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
  const [editing, setEditing] = useState<string | null>(null); // original date being edited
  const [analysis, setAnalysis] = useState<CycleAnalysis | null>(null);

  useEffect(() => setLogs(loadLogs()), []);

  const sorted = useMemo(
    () => [...logs].sort((a, b) => (a.start < b.start ? 1 : -1)),
    [logs]
  );

  function persist(next: CycleLog[]) {
    setLogs(next);
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
    setAnalysis(null); // any change invalidates the previous analysis
  }

  function resetForm() {
    setStart("");
    setFlow("normal");
    setPain(0);
    setPads(0);
    setEditing(null);
  }

  // Handles both adding a new entry and saving edits to an existing one.
  function addLog() {
    if (!start) return;
    // block a duplicate date, unless it's the very entry we're editing
    if (logs.some((l) => l.start === start && l.start !== editing)) return;
    const entry: CycleLog = { start, flow, pain, ...(pads ? { pads } : {}) };
    const next = editing
      ? logs.map((l) => (l.start === editing ? entry : l))
      : [...logs, entry];
    persist(next);
    resetForm();
  }

  // Load an existing entry back into the form to edit it.
  function startEdit(l: CycleLog) {
    setStart(l.start);
    setFlow(l.flow ?? "normal");
    setPain((l.pain ?? 0) as CycleLog["pain"]);
    setPads(l.pads ?? 0);
    setEditing(l.start);
  }

  function removeLog(date: string) {
    if (editing === date) resetForm();
    persist(logs.filter((l) => l.start !== date));
  }

  // Analysis is pure, deterministic math — run it on-device (instant, offline-safe,
  // and the logs never leave the phone, matching the privacy note above).
  function runAnalysis() {
    setAnalysis(analyzeLocal(logs, lang) as CycleAnalysis);
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
        <p className="-mt-1 text-xs text-rose-deep/55">{t("tracker.dateHint")}</p>

        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-rose-deep/70">{t("tracker.flow")}</span>
            <div className="mt-1 flex gap-1">
              {(["light", "normal", "heavy"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFlow(f)}
                  className={`rounded-full px-3 py-1 ${
                    flow === f ? "bg-rose-deep text-accentink" : "bg-rose-soft text-rose-deep"
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
                    pain === p ? "bg-rose-deep text-accentink" : "bg-rose-soft text-rose-deep"
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
                    pads === o.value ? "bg-rose-deep text-accentink" : "bg-rose-soft text-rose-deep"
                  }`}
                >
                  {lang === "en" ? o.label_en : o.label_bn}
                </button>
              ))}
            </div>
          </div>
        </div>

        {editing && (
          <p className="text-xs font-medium text-rose-deep/70">✎ {t("tracker.editingHint")}</p>
        )}
        <div className="flex gap-2">
          <button
            onClick={addLog}
            disabled={!start}
            className="w-full rounded-full bg-rose-deep py-2.5 font-medium text-accentink transition hover:bg-rose-deep/90 disabled:opacity-40"
          >
            {editing ? t("tracker.save") : t("tracker.add")}
          </button>
          {editing && (
            <button
              onClick={resetForm}
              className="rounded-full bg-rose-soft px-5 py-2.5 font-medium text-rose-deep transition hover:bg-rose-soft/70"
            >
              {t("tracker.cancel")}
            </button>
          )}
        </div>
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
              className={`flex items-center justify-between rounded-lg bg-surface px-3 py-2 text-sm ring-1 ${
                editing === l.start ? "ring-2 ring-rose-deep" : "ring-rose-soft"
              }`}
            >
              <span className="text-rose-deep">
                📅 {l.start}
                {l.flow && ` · ${t("tracker.flowShort")}: ${t(FLOW_KEY[l.flow])}`}
                {typeof l.pain === "number" && ` · ${t(PAIN_KEY[l.pain])}`}
                {l.pads ? ` · ${t("tracker.padShort")}: ${padLabel(l.pads)}` : ""}
              </span>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => startEdit(l)}
                  className="rounded-md p-1 text-rose-deep/40 transition hover:bg-rose-soft hover:text-rose-deep"
                  aria-label={t("tracker.edit")}
                  title={t("tracker.edit")}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                  </svg>
                </button>
                <button
                  onClick={() => removeLog(l.start)}
                  className="rounded-md p-1 text-rose-deep/40 transition hover:bg-rose-soft hover:text-rose-deep"
                  aria-label={t("tracker.delete")}
                  title={t("tracker.delete")}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={runAnalysis}
            disabled={logs.length < 2}
            className="mt-2 w-full rounded-full bg-rose-soft py-2.5 font-medium text-rose-deep transition hover:bg-rose-soft disabled:opacity-40"
          >
            {logs.length < 2 ? t("tracker.needTwo") : t("tracker.analyze")}
          </button>
        </div>
      )}

      {/* analysis */}
      {analysis && (
        <div className="space-y-3 rounded-2xl bg-rose-soft/40 p-4">
          {analysis.avg_cycle_length && (
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-surface px-3 py-1 font-medium text-rose-deep">
                {t("tracker.avgCycle")}: {analysis.avg_cycle_length} {t("tracker.days")}
              </span>
              {analysis.regular !== null && (
                <span className="rounded-full bg-surface px-3 py-1 font-medium text-rose-deep">
                  {analysis.regular ? t("tracker.regular") : t("tracker.irregular")}
                </span>
              )}
              {analysis.predicted_next_start && (
                <span className="rounded-full bg-surface px-3 py-1 font-medium text-rose-deep">
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
