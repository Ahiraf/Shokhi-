"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getGuides } from "@/lib/api";
import type { GuideCard } from "@/lib/types";
import PageIntro from "@/components/PageIntro";
import { EmojiIcon } from "@/components/Icon";
import { useLang } from "@/components/LanguageProvider";

export default function GuidesPage() {
  const { t, lang } = useLang();
  const [guides, setGuides] = useState<GuideCard[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    getGuides().then(setGuides).catch(() => setError(true));
  }, []);

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <PageIntro icon="📚" title={t("guides.title")} sub={t("guides.sub")} variant="guides" side="left" size={165} />

      {error && (
        <p className="mt-8 text-center text-sm text-plum/50">{t("guides.error")}</p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((g) => (
          <Link
            key={g.id}
            href={`/guides/${g.id}`}
            className="group flex flex-col rounded-2xl bg-surface/80 p-5 ring-1 ring-rose-soft transition hover:-translate-y-0.5 hover:shadow-card"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blush text-rose-deep">
              <EmojiIcon glyph={g.icon} size={22} />
            </span>
            <h2 className="mt-3 font-display text-base font-bold text-plum">
              {lang === "en" ? g.title_en || g.title_bn : g.title_bn}
            </h2>
            <p className="mt-1 flex-1 text-sm leading-relaxed text-plum/60">
              {lang === "en" ? g.summary_en || g.summary_bn : g.summary_bn}
            </p>
            <span className="mt-3 text-sm font-semibold text-rose">{t("common.read")}</span>
          </Link>
        ))}
      </div>

      {/* the curated guides cover the common topics; anything else → ask Shokhi (RAG + chat) */}
      <div className="mt-8 rounded-2xl bg-blush/70 px-5 py-5 text-center">
        <p className="text-sm text-plum/75">
          {lang === "en" ? "Can't find your topic here? Ask Shokhi anything in Bangla." : "আপনার বিষয় এখানে নেই? সখীকে বাংলায় যেকোনো প্রশ্ন করুন।"}
        </p>
        <Link href="/chat" className="mt-2 inline-block rounded-full bg-rose px-5 py-2 text-sm font-semibold text-accentink">
          {t("common.askShokhi")}
        </Link>
      </div>
    </main>
  );
}
