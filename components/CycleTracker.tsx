"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CycleLog } from "@/lib/types";
import { getInsights, fromDays, toDays, todayDays, type Phase } from "@/lib/cycle-insights";
import { useLang } from "./LanguageProvider";
import type { StringKey } from "@/lib/i18n";
import CycleCalendar from "./CycleCalendar";
import CycleTrends from "./CycleTrends";
import Icon, { EmojiIcon } from "./Icon";

const STORE_KEY = "shokhi_cycle_logs";
const BN = "০১২৩৪৫৬৭৮৯";
const toBn = (n: number | string) => String(n).replace(/\d/g, (d) => BN[+d]);

const FLOW_KEY: Record<NonNullable<CycleLog["flow"]>, StringKey> = {
  light: "flow.light", normal: "flow.normal", heavy: "flow.heavy",
};
const PAIN_KEY: StringKey[] = ["pain.0", "pain.1", "pain.2", "pain.3"];
const PAD_OPTIONS = [
  { value: 2, bn: "১–২", en: "1–2" },
  { value: 4, bn: "৩–৪", en: "3–4" },
  { value: 6, bn: "৫–৬", en: "5–6" },
  { value: 8, bn: "৬+", en: "6+" },
];
const PHASE_KEY: Record<Phase, StringKey> = {
  menstrual: "tracker.phaseMenstrual", follicular: "tracker.phaseFollicular",
  ovulatory: "tracker.phaseOvulatory", luteal: "tracker.phaseLuteal",
};

function loadLogs(): CycleLog[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || "[]"); } catch { return []; }
}

export default function CycleTracker() {
  const { t, lang } = useLang();
  const num = (n: number | string) => (lang === "en" ? String(n) : toBn(n));

  const [logs, setLogs] = useState<CycleLog[]>([]);
  const [start, setStart] = useState("");
  const [flow, setFlow] = useState<CycleLog["flow"]>("normal");
  const [pain, setPain] = useState<CycleLog["pain"]>(0);
  const [pads, setPads] = useState(0);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [undo, setUndo] = useState<CycleLog | null>(null);
  const [showTrends, setShowTrends] = useState(false);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => setLogs(loadLogs()), []);

  // auto-analysis: insights recompute on every change (instant, on-device)
  const insights = useMemo(() => getInsights(logs, lang), [logs, lang]);
  const analysis = insights.analysis;
  const sorted = useMemo(() => [...logs].sort((a, b) => (a.start < b.start ? 1 : -1)), [logs]);

  function persist(next: CycleLog[]) {
    setLogs(next);
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
  }
  function resetForm() {
    setStart(""); setFlow("normal"); setPain(0); setPads(0); setEditing(null); setShowForm(false);
  }
  const todayIso = fromDays(todayDays());

  function quickLog(iso: string) {
    if (toDays(iso) > todayDays()) return;
    if (logs.some((l) => l.start === iso)) { openEdit(iso); return; }
    persist([...logs, { start: iso, flow: "normal", pain: 0 }]);
  }
  function openEdit(iso: string) {
    const l = logs.find((x) => x.start === iso);
    setStart(iso);
    setFlow(l?.flow ?? "normal");
    setPain((l?.pain ?? 0) as CycleLog["pain"]);
    setPads(l?.pads ?? 0);
    setEditing(l ? iso : null);
    setShowForm(true);
  }
  function saveForm() {
    if (!start) return;
    if (logs.some((l) => l.start === start && l.start !== editing)) { openEdit(start); return; }
    const entry: CycleLog = { start, flow, pain, ...(pads ? { pads } : {}) };
    persist(editing ? logs.map((l) => (l.start === editing ? entry : l)) : [...logs, entry]);
    resetForm();
  }
  function removeLog(iso: string) {
    const entry = logs.find((l) => l.start === iso) ?? null;
    if (editing === iso) resetForm();
    persist(logs.filter((l) => l.start !== iso));
    setUndo(entry);
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndo(null), 6000);
  }
  function doUndo() {
    if (undo) persist([...logs, undo]);
    setUndo(null);
  }

  // --- backup / restore -------------------------------------------------------
  function exportData() {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `shokhi-cycle-${todayIso}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  function importData(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (Array.isArray(data)) {
          const valid = data.filter((d) => d && typeof d.start === "string" && /^\d{4}-\d{2}-\d{2}/.test(d.start));
          const map = new Map<string, CycleLog>();
          [...logs, ...valid].forEach((l) => map.set(l.start, l));
          persist([...map.values()]);
        }
      } catch { /* ignore malformed file */ }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  // --- hero prediction --------------------------------------------------------
  const hero = (() => {
    const s = insights.status;
    if (!insights.hasData) return { big: t("tracker.heroEmptyBig"), small: t("tracker.heroEmptySmall"), tone: "calm" as const };
    if (s.kind === "period") return { big: `${t("tracker.heroPeriodDay")} ${num(s.value ?? 1)}`, small: t("tracker.heroPeriodSmall"), tone: "period" as const };
    if (s.kind === "ovulation") return { big: t("tracker.heroFertile"), small: t("tracker.fertileNote"), tone: "fertile" as const };
    if (s.kind === "late") return { big: `${t("tracker.heroLate")} ${num(s.value ?? 0)} ${t("tracker.days")}`, small: t("tracker.heroLateSmall"), tone: "late" as const };
    return { big: `${t("tracker.heroUpcomingPre")} ${num(s.value ?? 0)} ${t("tracker.days")}`, small: t("tracker.heroUpcomingSmall"), tone: "upcoming" as const };
  })();
  const heroTone: Record<string, string> = {
    period: "from-rose-deep to-rose", fertile: "from-emerald-400 to-emerald-500",
    late: "from-amber-400 to-rose", upcoming: "from-rose to-rose-deep", calm: "from-rose to-rose-deep",
  };

  // week strip: today in the middle (−3 … +3)
  const weekStrip = Array.from({ length: 7 }, (_, i) => {
    const d = todayDays() - 3 + i;
    const iso = fromDays(d);
    return { iso, day: Number(iso.slice(8, 10)), dow: new Date(d * 86_400_000).getDay(), future: d > todayDays() };
  });
  const DOW = lang === "en" ? ["S","M","T","W","T","F","S"] : ["র","সো","ম","বু","বৃ","শু","শ"];

  return (
    <div className="space-y-5 py-6">
      {/* ---- hero prediction ---- */}
      <div className={`rounded-3xl bg-gradient-to-br ${heroTone[hero.tone]} p-5 text-center text-accentink shadow-lift`}>
        {/* week strip */}
        <div className="mb-4 grid grid-cols-7 gap-1">
          {weekStrip.map((d) => {
            const isToday = d.iso === todayIso;
            const isPeriod = insights.periodDays.has(d.iso);
            const isPred = !isPeriod && insights.predictedPeriodDays.has(d.iso);
            return (
              <button
                key={d.iso}
                onClick={() => !d.future && quickLog(d.iso)}
                disabled={d.future}
                className="flex flex-col items-center gap-1"
              >
                <span className="text-[10px] font-medium opacity-80">{DOW[d.dow]}</span>
                <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm transition
                  ${isToday ? "bg-white/95 font-bold text-rose-deep ring-2 ring-white" : isPeriod ? "bg-white/30 font-semibold" : isPred ? "ring-1 ring-dashed ring-white/70" : "hover:bg-white/15"}
                  ${d.future ? "opacity-45" : ""}`}>
                  {num(d.day)}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-sm font-medium opacity-90">{insights.hasData && insights.status.kind === "upcoming" ? t("tracker.heroUpcomingPre") : ""}</p>
        <p className="text-3xl font-extrabold leading-tight sm:text-4xl">{hero.big}</p>
        <p className="mt-2 text-sm opacity-90">{hero.small}</p>

        {insights.hasData && insights.cycleDay != null && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
            {t("tracker.cycleDayLabel")}: {num(insights.cycleDay)}
            {insights.phase && <span className="opacity-80">· {t(PHASE_KEY[insights.phase])}</span>}
          </div>
        )}
      </div>

      {/* ---- quick actions ---- */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <button onClick={() => quickLog(todayIso)} className="flex flex-col items-center gap-1.5 rounded-2xl bg-rose-deep p-3 text-accentink shadow-soft transition hover:brightness-105">
          <Icon name="drop" size={24} />
          <span className="text-xs font-semibold">{t("tracker.logToday")}</span>
        </button>
        <button onClick={() => { resetForm(); setShowForm(true); setStart(todayIso); }} className="flex flex-col items-center gap-1.5 rounded-2xl bg-surface p-3 text-rose-deep ring-1 ring-rose-soft transition hover:bg-rose-mist">
          <Icon name="note" size={24} />
          <span className="text-xs font-semibold">{t("tracker.logSymptoms")}</span>
        </button>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="col-span-2 flex flex-col items-center gap-1.5 rounded-2xl bg-surface p-3 text-rose-deep ring-1 ring-rose-soft transition hover:bg-rose-mist sm:col-span-1">
          <Icon name="calendar" size={24} />
          <span className="text-xs font-semibold">{t("tracker.addDate")}</span>
        </button>
      </div>

      {/* ---- insights chips (auto) ---- */}
      {insights.hasData && (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {insights.predictedNextStart && (
            <Chip icon="🌸" label={t("tracker.nextEst")} value={insights.predictedNextStart} />
          )}
          {analysis.avg_cycle_length && (
            <Chip icon="🔄" label={t("tracker.avgCycle")} value={`${num(analysis.avg_cycle_length)} ${t("tracker.days")}`} />
          )}
          {analysis.regular !== null && (
            <Chip icon={analysis.regular ? "✅" : "⚠️"} label={t("tracker.statusLabel")} value={analysis.regular ? t("tracker.regular") : t("tracker.irregular")} />
          )}
          {insights.phase && (
            <Chip icon="🌙" label={t("tracker.phaseLabel")} value={t(PHASE_KEY[insights.phase])} />
          )}
        </div>
      )}

      {/* ---- add / edit form (collapsible) ---- */}
      {showForm && (
        <div className="space-y-3 rounded-2xl border border-rose-soft bg-surface p-4">
          <label className="block text-sm font-medium text-rose-deep/80">
            {t("tracker.startDate")}
            <input type="date" value={start} max={todayIso} onChange={(e) => setStart(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-rose-soft px-3 py-2 text-rose-deep focus:outline-none focus:ring-2 focus:ring-rose/40" />
          </label>
          <div className="flex flex-wrap gap-4 text-sm">
            <Field label={t("tracker.flow")}>
              {(["light","normal","heavy"] as const).map((f) => (
                <Pill key={f} on={flow === f} onClick={() => setFlow(f)}>{t(FLOW_KEY[f])}</Pill>
              ))}
            </Field>
            <Field label={t("tracker.pain")}>
              {[0,1,2,3].map((p) => (
                <Pill key={p} on={pain === p} onClick={() => setPain(p as CycleLog["pain"])}>{t(PAIN_KEY[p])}</Pill>
              ))}
            </Field>
            <Field label={t("tracker.padsPerDay")}>
              {PAD_OPTIONS.map((o) => (
                <Pill key={o.value} on={pads === o.value} onClick={() => setPads(pads === o.value ? 0 : o.value)}>{lang === "en" ? o.en : o.bn}</Pill>
              ))}
            </Field>
          </div>
          {editing && <p className="text-xs font-medium text-rose-deep/70">✎ {t("tracker.editingHint")}</p>}
          <div className="flex gap-2">
            <button onClick={saveForm} disabled={!start} className="w-full rounded-full bg-rose-deep py-2.5 font-medium text-accentink transition hover:brightness-105 disabled:opacity-40">
              {editing ? t("tracker.save") : t("tracker.add")}
            </button>
            <button onClick={resetForm} className="rounded-full bg-rose-soft px-5 py-2.5 font-medium text-rose-deep transition hover:bg-rose-soft/70">
              {t("tracker.cancel")}
            </button>
          </div>
        </div>
      )}

      {/* ---- calendar ---- */}
      <CycleCalendar
        periodDays={insights.periodDays}
        predictedPeriodDays={insights.predictedPeriodDays}
        fertileDays={insights.fertileDays}
        ovulationDay={insights.ovulationDay}
        onPickDay={openEdit}
      />

      {/* ---- cycle history (dot rows) ---- */}
      {(analysis.cycles?.length ?? 0) > 0 && (
        <div className="space-y-3 rounded-2xl border border-rose-soft bg-surface p-4">
          <p className="text-sm font-bold text-rose-deep">{t("tracker.historyTitle")}</p>
          {[...(analysis.cycles ?? [])].reverse().map((c) => (
            <CycleRow key={c.start} start={c.start} length={c.length} periodLen={analysis.avg_period_length ?? 5} num={num} />
          ))}
        </div>
      )}

      {/* ---- trends (all-time) ---- */}
      {insights.hasData && (
        <div className="rounded-2xl border border-rose-soft bg-surface p-4">
          <button onClick={() => setShowTrends((v) => !v)} className="flex w-full items-center justify-between text-sm font-bold text-rose-deep">
            <span className="flex items-center gap-2"><Icon name="activity" size={18} /> {t("tracker.trendsTitle")}</span>
            <span className="text-rose-deep/50">{showTrends ? "▲" : "▼"}</span>
          </button>
          {showTrends && (
            <div className="mt-4">
              <CycleTrends periodDays={insights.periodDays} cycles={analysis.cycles ?? []} />
            </div>
          )}
        </div>
      )}

      {/* ---- manage entries ---- */}
      {sorted.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-rose-deep/60">{t("tracker.logged")} ({num(sorted.length)})</p>
          {sorted.map((l) => (
            <div key={l.start} className={`flex items-center justify-between rounded-lg bg-surface px-3 py-2 text-sm ring-1 ${editing === l.start ? "ring-2 ring-rose-deep" : "ring-rose-soft"}`}>
              <span className="text-rose-deep">
                📅 {l.start}
                {l.flow && ` · ${t(FLOW_KEY[l.flow])}`}
                {typeof l.pain === "number" && ` · ${t(PAIN_KEY[l.pain])}`}
              </span>
              <div className="flex shrink-0 items-center gap-1">
                <button onClick={() => openEdit(l.start)} title={t("tracker.edit")} aria-label={t("tracker.edit")} className="rounded-lg p-1.5 text-rose-deep/70 transition hover:bg-rose-soft hover:text-rose-deep"><Icon name="edit" size={16} /></button>
                <button onClick={() => removeLog(l.start)} title={t("tracker.delete")} aria-label={t("tracker.delete")} className="rounded-lg p-1.5 text-rose-deep/70 transition hover:bg-red-100 hover:text-red-600"><Icon name="trash" size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---- insight text + disclaimer ---- */}
      {analysis.insights_bn.length > 0 && (
        <div className="space-y-1.5 rounded-2xl bg-rose-soft/40 p-4 text-sm text-rose-deep/90">
          <ul className="space-y-1.5">{analysis.insights_bn.map((i, idx) => <li key={idx}>• {i}</li>)}</ul>
          <p className="pt-1 text-xs text-rose-deep/50">ℹ️ {analysis.disclaimer_bn}</p>
        </div>
      )}

      {/* ---- backup ---- */}
      <div className="rounded-2xl border border-dashed border-rose-soft bg-surface/70 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-rose-deep"><Icon name="save" size={18} /> {t("tracker.backupTitle")}</p>
        <p className="mt-1 text-xs text-rose-deep/60">{t("tracker.backupNote")}</p>
        <div className="mt-3 flex gap-2">
          <button onClick={exportData} disabled={!logs.length} className="flex items-center gap-1.5 rounded-full bg-rose-soft px-4 py-2 text-sm font-medium text-rose-deep transition hover:bg-rose-soft/70 disabled:opacity-40"><Icon name="download" size={16} /> {t("tracker.export")}</button>
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 rounded-full bg-rose-soft px-4 py-2 text-sm font-medium text-rose-deep transition hover:bg-rose-soft/70"><Icon name="upload" size={16} /> {t("tracker.import")}</button>
          <input ref={fileRef} type="file" accept="application/json" onChange={importData} className="hidden" />
        </div>
      </div>

      {/* ---- undo toast ---- */}
      {undo && (
        <div className="fixed inset-x-0 bottom-4 z-50 mx-auto flex w-[min(92%,26rem)] items-center justify-between rounded-full bg-plum px-4 py-3 text-sm text-white shadow-lift">
          <span>{t("tracker.deleted")}</span>
          <button onClick={doUndo} className="font-bold text-rose-mist underline">{t("tracker.undo")}</button>
        </div>
      )}
    </div>
  );
}

function Chip({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex shrink-0 items-center gap-2 rounded-2xl bg-rose-soft/60 px-3 py-2">
      <span className="text-rose-deep"><EmojiIcon glyph={icon} size={18} /></span>
      <div className="leading-tight">
        <p className="text-[10px] text-rose-deep/60">{label}</p>
        <p className="whitespace-nowrap text-sm font-semibold text-rose-deep">{value}</p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="text-rose-deep/70">{label}</span>
      <div className="mt-1 flex flex-wrap gap-1">{children}</div>
    </div>
  );
}

function Pill({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-full px-3 py-1 ${on ? "bg-rose-deep text-accentink" : "bg-rose-soft text-rose-deep"}`}>
      {children}
    </button>
  );
}

/** One cycle in the history: length + start, and a dot row (period days filled, rest teal). */
function CycleRow({ start, length, periodLen, num }: { start: string; length: number; periodLen: number; num: (n: number | string) => string }) {
  const { t } = useLang();
  const startDay = toDays(start);
  const end = fromDays(startDay + length - 1);
  const dots = Array.from({ length: Math.min(length, 40) }, (_, i) => i < periodLen);
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold text-rose-deep">{num(length)} {t("tracker.days")}</p>
        <p className="text-xs text-rose-deep/50">{start.slice(5)} – {end.slice(5)}</p>
      </div>
      <div className="mt-1 flex flex-wrap gap-1">
        {dots.map((isPeriod, i) => (
          <span key={i} className={`h-2 w-2 rounded-full ${isPeriod ? "bg-rose-deep" : "bg-teal-300/60"}`} />
        ))}
      </div>
    </div>
  );
}
