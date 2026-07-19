"use client";

import { useEffect, useMemo, useState } from "react";
import { analyzeCycle } from "@/lib/api";
import type { CycleLog, CycleAnalysis } from "@/lib/types";

const STORE_KEY = "shokhi_cycle_logs";

const FLOW_LABELS: Record<NonNullable<CycleLog["flow"]>, string> = {
  light: "কম",
  normal: "স্বাভাবিক",
  heavy: "বেশি",
};
const PAIN_LABELS = ["ব্যথা নেই", "হালকা", "মাঝারি", "তীব্র"];

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
 * just the dates/flow/pain to /api/cycle/analyze for Bangla pattern insight, which is
 * exactly how PCOS/endometriosis get noticed over months instead of one message.
 */
export default function CycleTracker() {
  const [logs, setLogs] = useState<CycleLog[]>([]);
  const [start, setStart] = useState("");
  const [flow, setFlow] = useState<CycleLog["flow"]>("normal");
  const [pain, setPain] = useState<CycleLog["pain"]>(0);
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
    persist([...logs, { start, flow, pain }]);
    setStart("");
    setFlow("normal");
    setPain(0);
  }

  function removeLog(date: string) {
    persist(logs.filter((l) => l.start !== date));
  }

  async function runAnalysis() {
    setBusy(true);
    try {
      setAnalysis(await analyzeCycle(logs));
    } catch {
      setAnalysis(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 py-6">
      <div className="rounded-2xl bg-rose-soft/50 p-4">
        <h2 className="text-lg font-bold text-rose-deep">🩸 মাসিক ট্র্যাকার</h2>
        <p className="mt-1 text-sm text-rose-deep/70">
          প্রতিবার মাসিক শুরু হলে তারিখটি লিখুন। সখী আপনার চক্র বুঝে জানাবে এটি নিয়মিত
          কিনা এবং কিছু নিয়ে ভাবার আছে কিনা।
        </p>
        <p className="mt-1 text-xs text-rose-deep/50">
          🔒 আপনার তথ্য শুধু এই ফোনেই থাকে, সার্ভারে জমা হয় না।
        </p>
      </div>

      {/* add a log */}
      <div className="space-y-3 rounded-2xl border border-rose-soft p-4">
        <label className="block text-sm font-medium text-rose-deep/80">
          মাসিক শুরুর তারিখ
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
            <span className="text-rose-deep/70">রক্তক্ষরণ</span>
            <div className="mt-1 flex gap-1">
              {(["light", "normal", "heavy"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFlow(f)}
                  className={`rounded-full px-3 py-1 ${
                    flow === f
                      ? "bg-rose-deep text-white"
                      : "bg-rose-soft text-rose-deep"
                  }`}
                >
                  {FLOW_LABELS[f]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="text-rose-deep/70">ব্যথা</span>
            <div className="mt-1 flex gap-1">
              {[0, 1, 2, 3].map((p) => (
                <button
                  key={p}
                  onClick={() => setPain(p as CycleLog["pain"])}
                  className={`rounded-full px-3 py-1 ${
                    pain === p
                      ? "bg-rose-deep text-white"
                      : "bg-rose-soft text-rose-deep"
                  }`}
                >
                  {PAIN_LABELS[p]}
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
          + যোগ করুন
        </button>
      </div>

      {/* logged history */}
      {sorted.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-rose-deep/60">
            লেখা মাসিক ({sorted.length})
          </p>
          {sorted.map((l) => (
            <div
              key={l.start}
              className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-rose-soft"
            >
              <span className="text-rose-deep">
                📅 {l.start}
                {l.flow && ` · রক্ত: ${FLOW_LABELS[l.flow]}`}
                {typeof l.pain === "number" && ` · ${PAIN_LABELS[l.pain]}`}
              </span>
              <button
                onClick={() => removeLog(l.start)}
                className="text-rose-deep/40 hover:text-rose-deep"
                aria-label="মুছুন"
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
              ? "দেখা হচ্ছে…"
              : logs.length < 2
              ? "প্যাটার্ন দেখতে অন্তত ২টি তারিখ লিখুন"
              : "🔍 আমার চক্র বিশ্লেষণ করুন"}
          </button>
        </div>
      )}

      {/* analysis */}
      {analysis && (
        <div className="space-y-3 rounded-2xl bg-rose-soft/40 p-4">
          {analysis.avg_cycle_length && (
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-white px-3 py-1 font-medium text-rose-deep">
                গড় চক্র: {analysis.avg_cycle_length} দিন
              </span>
              {analysis.regular !== null && (
                <span className="rounded-full bg-white px-3 py-1 font-medium text-rose-deep">
                  {analysis.regular ? "নিয়মিত ✅" : "অনিয়মিত ⚠️"}
                </span>
              )}
              {analysis.predicted_next_start && (
                <span className="rounded-full bg-white px-3 py-1 font-medium text-rose-deep">
                  পরবর্তী আনুমানিক: {analysis.predicted_next_start}
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
