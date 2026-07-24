"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { triage } from "@/lib/server/triage";
import { riskSignals } from "@/lib/server/risk";
import { useLang } from "./LanguageProvider";
import Icon from "./Icon";

type Schema = Record<string, { desc_bn?: string; desc_en?: string; question_bn?: string; question_en?: string }>;

/**
 * Interactive "Am I at risk?" self-check for one condition — the thing that makes /learn
 * an ASSESSMENT tool, not a read-only page. It asks the condition's own screening questions,
 * then runs the SAME deterministic triage + logistic-regression risk models the chat uses,
 * so the result is safe and consistent (never a diagnosis; always points to a doctor).
 */
export default function ConditionSelfCheck({ condition, schema }: { condition: any; schema: Schema }) {
  const { lang } = useLang();
  const en = lang === "en";

  const fields: string[] = useMemo(() => {
    const sw = condition?.suspect_when ?? {};
    const all = (sw.all ?? []).map((c: any) => c.field);
    const any = (sw.any ?? []).map((c: any) => c.field);
    return Array.from(new Set([...all, ...any])).filter((f) => schema[f]);
  }, [condition, schema]);

  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<null | { suspected: boolean; signals: any[] }>(null);

  const question = (f: string) => {
    const s = schema[f] || {};
    if (en) return s.question_en || (s.desc_en ? `Do you have ${s.desc_en}?` : f);
    return s.question_bn || s.desc_bn || f;
  };

  const answeredCount = fields.filter((f) => f in answers).length;
  const name = en ? condition.name_en || condition.name_bn : condition.name_bn;

  function run() {
    const profile: Record<string, boolean> = {};
    for (const f of fields) profile[f] = answers[f] === true;
    const r = triage(profile);
    const suspected = (r.suspected_conditions ?? []).some((c: any) => c.id === condition.id);
    const signals = riskSignals(profile).filter((s: any) => s.elevated);
    setResult({ suspected, signals });
  }
  function reset() { setAnswers({}); setResult(null); }

  if (!fields.length) return null;

  return (
    <section className="mt-8 rounded-2xl border border-rose-soft bg-surface p-5">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-plum">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-soft text-rose-deep">
          <Icon name="health" size={18} />
        </span>
        {en ? "Quick self-check" : "দ্রুত সেল্ফ-চেক"}
      </h2>
      <p className="mt-1 text-sm text-plum/60">
        {en
          ? "Answer a few questions to see if this is worth checking with a doctor. Private, on this phone."
          : "কয়েকটি প্রশ্নের উত্তর দিন — এটি ডাক্তার দেখানোর মতো কিনা বুঝুন। গোপনীয়, শুধু এই ফোনে।"}
      </p>

      {!result ? (
        <>
          <div className="mt-4 space-y-3">
            {fields.map((f) => (
              <div key={f} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-rose-mist/60 px-3 py-2.5">
                <span className="text-sm text-plum/85">{question(f)}</span>
                <div className="flex gap-1.5">
                  {([["yes", true], ["no", false]] as const).map(([label, val]) => (
                    <button
                      key={label}
                      onClick={() => setAnswers((a) => ({ ...a, [f]: val }))}
                      className={`rounded-full px-4 py-1 text-sm font-medium transition ${
                        answers[f] === val ? "bg-rose-deep text-accentink" : "bg-surface text-rose-deep ring-1 ring-rose-soft"
                      }`}
                    >
                      {label === "yes" ? (en ? "Yes" : "হ্যাঁ") : en ? "No" : "না"}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={run}
            disabled={answeredCount < fields.length}
            className="mt-4 w-full rounded-full bg-rose-deep py-2.5 font-medium text-accentink transition hover:brightness-105 disabled:opacity-40"
          >
            {en ? "See my result" : "আমার ফলাফল দেখুন"}
          </button>
        </>
      ) : (
        <div className="mt-4 space-y-3">
          <div className={`rounded-2xl p-4 ${result.suspected ? "bg-amber-100 text-amber-900" : "bg-sage-soft text-sage-deep"}`}>
            <p className="font-semibold">
              {result.suspected
                ? en ? `Your answers suggest it's worth asking a doctor about ${name}.` : `আপনার উত্তর অনুযায়ী ${name} নিয়ে একজন ডাক্তারের সাথে কথা বলা ভালো।`
                : en ? `Your answers don't strongly point to ${name} right now.` : `আপনার উত্তর এখন ${name}-এর দিকে জোরালোভাবে ইঙ্গিত করছে না।`}
            </p>
            {result.signals.map((s) => (
              <p key={s.id ?? s.name_en} className="mt-1 flex items-center gap-1.5 text-sm">
                <Icon name="activity" size={15} />
                {(en ? s.name_en || s.name_bn : s.name_bn)} — ~{Math.round((s.probability ?? 0) * 100)}%{" "}
                {en ? "signal; please confirm with a doctor." : "ইঙ্গিত; ডাক্তারের সাথে নিশ্চিত করুন।"}
              </p>
            ))}
          </div>
          <p className="text-xs text-plum/55">
            {en
              ? "This is a general impression from your answers — not a diagnosis. A doctor can confirm."
              : "এটি আপনার উত্তরের ভিত্তিতে একটি সাধারণ ধারণা — নিশ্চিত রোগ নির্ণয় নয়। ডাক্তার নিশ্চিত করতে পারেন।"}
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/chat" className="rounded-full bg-rose px-5 py-2 text-sm font-semibold text-accentink">
              {en ? "Discuss with Shokhi" : "সখীর সাথে আলোচনা করুন"}
            </Link>
            <button onClick={reset} className="rounded-full bg-rose-soft px-5 py-2 text-sm font-medium text-rose-deep">
              {en ? "Retake" : "আবার করুন"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
