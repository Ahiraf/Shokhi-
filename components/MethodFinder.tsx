"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "./LanguageProvider";
import Icon from "./Icon";

/**
 * Interactive contraception "method finder" — the thing that makes the contraception guide a
 * TOOL (do/choose), not a read-only article. A few plain questions narrow the general options.
 * It stays high-level (categories, no doses/brands) and always defers to a health worker; the
 * eligibility logic follows WHO family-planning guidance (in the RAG corpus). General info,
 * never a prescription.
 */

type Method = {
  id: string;
  name_bn: string; name_en: string;
  desc_bn: string; desc_en: string;
  bfSafe: boolean; longActing: boolean; sti: boolean; permanent: boolean; daily: boolean;
};

const METHODS: Method[] = [
  { id: "condom", name_bn: "কনডম", name_en: "Condoms", bfSafe: true, longActing: false, sti: true, permanent: false, daily: false,
    desc_bn: "প্রতিবার ব্যবহার করতে হয়; হরমোন নেই এবং সংক্রমণ (STI) থেকেও রক্ষা করে।", desc_en: "Used each time; no hormones, and also protects against infections (STIs)." },
  { id: "pop", name_bn: "প্রোজেস্টেরন-only পিল", name_en: "Progestogen-only pill", bfSafe: true, longActing: false, sti: false, permanent: false, daily: true,
    desc_bn: "প্রতিদিন খেতে হয়; বুকের দুধ খাওয়ানোর সময়ও নিরাপদ।", desc_en: "Taken daily; safe while breastfeeding." },
  { id: "combined_pill", name_bn: "সম্মিলিত পিল", name_en: "Combined pill", bfSafe: false, longActing: false, sti: false, permanent: false, daily: true,
    desc_bn: "প্রতিদিন খেতে হয়; ৬ মাসের কম বয়সী শিশুকে দুধ খাওয়ালে সাধারণত এড়ানো হয়।", desc_en: "Taken daily; usually avoided while breastfeeding a baby under 6 months." },
  { id: "injectable", name_bn: "ইনজেকশন", name_en: "Injectable", bfSafe: true, longActing: true, sti: false, permanent: false, daily: false,
    desc_bn: "প্রতি ৩ মাসে একটি ইনজেকশন; মনে রাখার ঝামেলা কম।", desc_en: "One injection every ~3 months; little to remember." },
  { id: "implant", name_bn: "ইমপ্লান্ট", name_en: "Implant", bfSafe: true, longActing: true, sti: false, permanent: false, daily: false,
    desc_bn: "হাতের চামড়ার নিচে ছোট রড, ৩–৫ বছর কাজ করে; খুব কার্যকর ও ফিরিয়ে আনা যায়।", desc_en: "A small rod under the skin, works 3–5 years; very effective and reversible." },
  { id: "iud", name_bn: "আইইউডি (কপার/হরমোন)", name_en: "IUD (copper/hormonal)", bfSafe: true, longActing: true, sti: false, permanent: false, daily: false,
    desc_bn: "জরায়ুতে বসানো হয়, ৫–১০ বছর কাজ করে; কপারটি হরমোন-মুক্ত।", desc_en: "Placed in the womb, works 5–10 years; the copper one is hormone-free." },
  { id: "permanent", name_bn: "স্থায়ী পদ্ধতি (বন্ধ্যাকরণ)", name_en: "Permanent method (sterilisation)", bfSafe: true, longActing: true, sti: false, permanent: true, daily: false,
    desc_bn: "আর সন্তান না চাইলে একটি স্থায়ী সমাধান।", desc_en: "A permanent option when you don't want any more children." },
];

type Ans = { bf?: boolean; future?: boolean; lowMaint?: boolean; sti?: boolean };

export default function MethodFinder() {
  const { lang } = useLang();
  const en = lang === "en";
  const [a, setA] = useState<Ans>({});
  const [show, setShow] = useState(false);

  const Q: { key: keyof Ans; bn: string; en: string }[] = [
    { key: "bf", bn: "আপনি কি ৬ মাসের কম বয়সী শিশুকে বুকের দুধ খাওয়াচ্ছেন?", en: "Are you breastfeeding a baby under 6 months?" },
    { key: "future", bn: "ভবিষ্যতে কি আরও সন্তান নিতে চান?", en: "Do you want (more) children in the future?" },
    { key: "lowMaint", bn: "প্রতিদিন মনে রাখতে হয় না — এমন পদ্ধতি চান?", en: "Prefer something you don't have to remember daily?" },
    { key: "sti", bn: "সংক্রমণ (STI) থেকেও সুরক্ষা চান?", en: "Also want protection from infections (STIs)?" },
  ];
  const answered = Q.every((q) => q.key in a);

  function score(m: Method): number {
    let s = 1;
    if (a.bf && !m.bfSafe) return -1; // exclude unsafe-while-breastfeeding
    if (a.future === false && m.permanent) s += 3;
    if (a.future !== false && m.permanent) return -1; // hide permanent if she may want children
    if (a.lowMaint && m.longActing) s += 2;
    if (a.lowMaint && m.daily) s -= 1;
    if (a.lowMaint === false && m.daily) s += 1;
    if (a.sti && m.sti) s += 3;
    return s;
  }

  const results = METHODS.map((m) => ({ m, s: score(m) })).filter((x) => x.s >= 0).sort((a, b) => b.s - a.s).slice(0, 3);

  return (
    <section className="mt-8 rounded-2xl border border-rose-soft bg-surface p-5">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-plum">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-soft text-rose-deep">
          <Icon name="search" size={17} />
        </span>
        {en ? "Find a method that may suit you" : "আপনার উপযোগী পদ্ধতি খুঁজুন"}
      </h2>
      <p className="mt-1 text-sm text-plum/60">
        {en
          ? "A few questions to narrow the options. General information — a health worker helps choose what's right for you."
          : "কয়েকটি প্রশ্ন দিয়ে পছন্দ ছোট করুন। এটি সাধারণ তথ্য — সঠিকটি বেছে নিতে একজন স্বাস্থ্যকর্মী সাহায্য করবেন।"}
      </p>

      <div className="mt-4 space-y-3">
        {Q.map((q) => (
          <div key={q.key} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-rose-mist/60 px-3 py-2.5">
            <span className="text-sm text-plum/85">{en ? q.en : q.bn}</span>
            <div className="flex gap-1.5">
              {([["yes", true], ["no", false]] as const).map(([label, val]) => (
                <button
                  key={label}
                  onClick={() => { setA((p) => ({ ...p, [q.key]: val })); setShow(false); }}
                  className={`rounded-full px-4 py-1 text-sm font-medium transition ${
                    a[q.key] === val ? "bg-rose-deep text-accentink" : "bg-surface text-rose-deep ring-1 ring-rose-soft"
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
        onClick={() => setShow(true)}
        disabled={!answered}
        className="mt-4 w-full rounded-full bg-rose-deep py-2.5 font-medium text-accentink transition hover:brightness-105 disabled:opacity-40"
      >
        {en ? "Show suggestions" : "পরামর্শ দেখুন"}
      </button>

      {show && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-semibold text-plum">{en ? "Options worth discussing:" : "আলোচনার মতো পদ্ধতি:"}</p>
          {results.map(({ m }) => (
            <div key={m.id} className="rounded-xl bg-sage-soft/60 px-4 py-3">
              <p className="text-sm font-bold text-sage-deep">{en ? m.name_en : m.name_bn}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-plum/75">{en ? m.desc_en : m.desc_bn}</p>
            </div>
          ))}
          <p className="text-xs text-plum/55">
            {en
              ? "General information based on WHO guidance — not a prescription. A doctor or family-planning worker will help you choose and start safely."
              : "WHO নির্দেশনার ভিত্তিতে সাধারণ তথ্য — কোনো প্রেসক্রিপশন নয়। একজন ডাক্তার বা পরিবার-পরিকল্পনা কর্মী নিরাপদে বেছে নিতে সাহায্য করবেন।"}
          </p>
          <Link href="/chat" className="inline-block rounded-full bg-rose px-5 py-2 text-sm font-semibold text-accentink">
            {en ? "Ask Shokhi about these" : "সখীকে এগুলো নিয়ে জিজ্ঞাসা করুন"}
          </Link>
        </div>
      )}
    </section>
  );
}
