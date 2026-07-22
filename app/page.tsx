"use client";

import Link from "next/link";
import Mascot3D from "@/components/Mascot3D";
import FeatureCard from "@/components/FeatureCard";
import { FEATURES } from "@/lib/features";
import { useLang } from "@/components/LanguageProvider";

const CONDITIONS: { bn: string; en: string }[] = [
  { bn: "মাসিক", en: "Periods" },
  { bn: "পিসিওএস", en: "PCOS" },
  { bn: "পিএমএস", en: "PMS" },
  { bn: "এন্ডোমেট্রিওসিস", en: "Endometriosis" },
  { bn: "গর্ভকাল", en: "Pregnancy" },
  { bn: "প্রসব-পরবর্তী", en: "Postpartum" },
  { bn: "মেনোপজ", en: "Menopause" },
  { bn: "ইউটিআই", en: "UTI" },
  { bn: "রক্তস্বল্পতা", en: "Anaemia" },
  { bn: "সংক্রমণ", en: "Infections" },
];

const STEPS: { n_bn: string; n_en: string; icon: string; title_bn: string; title_en: string; desc_bn: string; desc_en: string }[] = [
  {
    n_bn: "১", n_en: "1", icon: "🗣️",
    title_bn: "আপনি বলুন", title_en: "You speak",
    desc_bn: "বাংলায় লিখুন বা কণ্ঠে বলুন কেমন লাগছে।",
    desc_en: "Type or speak, in Bangla, how you feel.",
  },
  {
    n_bn: "২", n_en: "2", icon: "🛡️",
    title_bn: "নিরাপদে যাচাই", title_en: "Safe check",
    desc_bn: "নিয়ম-ভিত্তিক ইঞ্জিন বিপদচিহ্ন যাচাই করে — কখনো ভুল করে না।",
    desc_en: "A rule-based engine checks for danger signs — it never slips.",
  },
  {
    n_bn: "৩", n_en: "3", icon: "🌸",
    title_bn: "উষ্ণ পরামর্শ", title_en: "Warm guidance",
    desc_bn: "সহজ বাংলায় বোঝানো হয়, সবসময় ডাক্তারের পরামর্শসহ।",
    desc_en: "Explained in simple language, always with a doctor's advice.",
  },
];

export default function Home() {
  const { t, lang } = useLang();
  return (
    <main>
      {/* hero */}
      <section className="mx-auto max-w-5xl px-5 pt-10 pb-4 sm:pt-16">
        <div className="grid items-center gap-8 sm:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface/70 px-3 py-1 text-xs font-semibold text-plum/60 ring-1 ring-rose-soft">
              {t("home.badge")}
            </span>
            <h1 className="mt-4 whitespace-pre-line font-display text-4xl font-bold leading-tight text-plum sm:text-5xl">
              {t("home.heroTitle")}
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-plum/65">
              {t("home.heroDesc")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/chat"
                className="rounded-full bg-rose px-6 py-3 font-semibold text-white shadow-lift transition hover:brightness-105"
              >
                {t("home.ctaStart")}
              </Link>
              <Link
                href="/guides"
                className="rounded-full bg-surface px-6 py-3 font-semibold text-plum ring-1 ring-rose-soft transition hover:bg-blush"
              >
                {t("home.ctaGuides")}
              </Link>
            </div>
          </div>

          <div className="order-first flex justify-center sm:order-none">
            <div className="animate-float">
              <Mascot3D variant="hero" size={260} priority />
            </div>
          </div>
        </div>
      </section>

      {/* feature grid */}
      <section className="mx-auto max-w-5xl px-5 py-12">
        <h2 className="text-center font-display text-2xl font-bold text-plum">
          {t("home.featuresTitle")}
        </h2>
        <p className="mt-1.5 text-center text-sm text-plum/55">{t("home.featuresSub")}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <FeatureCard key={`${f.href}-${i}`} feature={f} />
          ))}
        </div>
      </section>

      {/* conditions covered */}
      <section className="mx-auto max-w-5xl px-5 py-8">
        <div className="rounded-3xl bg-gradient-to-br from-panel to-panel-deep px-6 py-10 text-center text-white">
          <h2 className="font-display text-2xl font-bold">{t("home.conditionsTitle")}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/70">{t("home.conditionsSub")}</p>
          <div className="mx-auto mt-6 flex max-w-2xl flex-wrap justify-center gap-2">
            {CONDITIONS.map((c) => (
              <span
                key={c.en}
                className="rounded-full bg-surface/12 px-3.5 py-1.5 text-sm font-medium text-white/90"
              >
                {lang === "en" ? c.en : c.bn}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* how it works */}
      <section className="mx-auto max-w-5xl px-5 py-12">
        <h2 className="text-center font-display text-2xl font-bold text-plum">
          {t("home.howTitle")}
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n_en} className="rounded-2xl bg-surface/80 p-6 text-center ring-1 ring-rose-soft">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blush text-2xl">
                {s.icon}
              </div>
              <h3 className="mt-3 font-display text-lg font-bold text-plum">
                <span className="text-rose">{lang === "en" ? s.n_en : s.n_bn}.</span>{" "}
                {lang === "en" ? s.title_en : s.title_bn}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-plum/60">
                {lang === "en" ? s.desc_en : s.desc_bn}
              </p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-lg text-center text-xs text-plum/45">
          {t("home.safetyNote")}
        </p>
      </section>

      {/* hotline CTA */}
      <section className="mx-auto max-w-5xl px-5 pb-4">
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-sage-soft px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="font-display text-xl font-bold text-plum">{t("home.hotlineTitle")}</h2>
            <p className="mt-1 max-w-md text-sm text-plum/65">{t("home.hotlineDesc")}</p>
          </div>
          <Link
            href="/hotline"
            className="shrink-0 rounded-full bg-sage-deep px-6 py-3 font-semibold text-white transition hover:brightness-105"
          >
            {t("home.hotlineCta")}
          </Link>
        </div>
      </section>
    </main>
  );
}
