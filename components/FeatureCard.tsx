"use client";

import Link from "next/link";
import type { Feature, Accent } from "@/lib/features";
import { useLang } from "./LanguageProvider";

const ICON_BG: Record<Accent, string> = {
  rose: "bg-rose-soft text-rose-deep",
  sage: "bg-sage-soft text-sage-deep",
  apricot: "bg-apricot-soft text-gold",
};

/** A tappable feature tile on the landing page, linking to that feature's page. */
export default function FeatureCard({ feature }: { feature: Feature }) {
  const { t, lang } = useLang();
  return (
    <Link
      href={feature.href}
      className="group flex flex-col rounded-2xl bg-surface/80 p-5 ring-1 ring-rose-soft transition hover:-translate-y-0.5 hover:shadow-card"
    >
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${ICON_BG[feature.accent]}`}
      >
        {feature.icon}
      </span>
      <h3 className="mt-3 font-display text-base font-bold text-plum">
        {lang === "en" ? feature.title_en : feature.title_bn}
      </h3>
      <p className="mt-1 flex-1 text-sm leading-relaxed text-plum/60">
        {lang === "en" ? feature.desc_en : feature.desc_bn}
      </p>
      <span className="mt-3 text-sm font-semibold text-rose transition group-hover:translate-x-0.5">
        {t("common.open")}
      </span>
    </Link>
  );
}
