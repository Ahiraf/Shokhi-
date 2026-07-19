"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getGuides } from "@/lib/api";
import type { GuideCard } from "@/lib/types";
import PageHeader from "@/components/PageHeader";

export default function GuidesPage() {
  const [guides, setGuides] = useState<GuideCard[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    getGuides().then(setGuides).catch(() => setError(true));
  }, []);

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <PageHeader
        icon="📚"
        title="স্বাস্থ্য গাইড"
        sub="নারীস্বাস্থ্যের নানা বিষয়ে সহজ, নির্ভরযোগ্য বাংলা পরামর্শ — যেকোনোটিতে চাপ দিন।"
      />

      {error && (
        <p className="mt-8 text-center text-sm text-plum/50">
          গাইড আনা গেল না। ব্যাকএন্ড চালু আছে কিনা দেখুন।
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((g) => (
          <Link
            key={g.id}
            href={`/guides/${g.id}`}
            className="group flex flex-col rounded-2xl bg-white/80 p-5 ring-1 ring-rose-soft transition hover:-translate-y-0.5 hover:shadow-card"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blush text-xl">
              {g.icon}
            </span>
            <h2 className="mt-3 font-display text-base font-bold text-plum">{g.title_bn}</h2>
            <p className="mt-1 flex-1 text-sm leading-relaxed text-plum/60">{g.summary_bn}</p>
            <span className="mt-3 text-sm font-semibold text-rose">পড়ুন →</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
