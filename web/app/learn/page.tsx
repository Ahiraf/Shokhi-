"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getKnowledge } from "@/lib/api";
import type { Condition } from "@/lib/types";
import PageHeader from "@/components/PageHeader";

const URGENCY_TAG: Record<string, { label: string; cls: string }> = {
  emergency: { label: "জরুরি", cls: "bg-red-100 text-red-700" },
  see_doctor_soon: { label: "ডাক্তার দেখান", cls: "bg-amber-100 text-amber-800" },
  self_care: { label: "ঘরোয়া যত্ন", cls: "bg-sage-soft text-sage-deep" },
  info: { label: "তথ্য", cls: "bg-blush text-rose-deep" },
};

export default function LearnPage() {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    getKnowledge().then((k) => setConditions(k.conditions)).catch(() => setError(true));
  }, []);

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <PageHeader
        icon="🧠"
        title="রোগ সম্পর্কে জানুন"
        sub="নারীস্বাস্থ্যের সাধারণ অবস্থাগুলো সহজ বাংলায় — লক্ষণ, ঘরোয়া যত্ন ও কখন ডাক্তার দেখাবেন।"
      />

      {error && (
        <p className="mt-8 text-center text-sm text-plum/50">তথ্য আনা গেল না।</p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {conditions.map((c) => {
          const tag = URGENCY_TAG[c.urgency ?? "info"] ?? URGENCY_TAG.info;
          return (
            <Link
              key={c.id}
              href={`/learn/${c.id}`}
              className="group flex flex-col rounded-2xl bg-white/80 p-5 ring-1 ring-rose-soft transition hover:-translate-y-0.5 hover:shadow-card"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-display text-base font-bold text-plum">{c.name_bn}</h2>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tag.cls}`}>
                  {tag.label}
                </span>
              </div>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-plum/60 line-clamp-3">
                {c.about_bn}
              </p>
              <span className="mt-3 text-sm font-semibold text-rose">বিস্তারিত →</span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
