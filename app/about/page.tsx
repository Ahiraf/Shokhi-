"use client";

import Link from "next/link";
import PageIntro from "@/components/PageIntro";
import { useLang } from "@/components/LanguageProvider";

const DANGER_SIGNS: { bn: string; en: string }[] = [
  {
    bn: "তীব্র তলপেটে ব্যথা, বিশেষত গর্ভাবস্থার সম্ভাবনা থাকলে",
    en: "Severe lower-abdominal pain, especially if pregnancy is possible",
  },
  {
    bn: "এত রক্ত যাচ্ছে যে প্রতি ঘণ্টায় প্যাড/কাপড় ভিজে যাচ্ছে",
    en: "Bleeding so heavy that a pad/cloth soaks through every hour",
  },
  {
    bn: "মাথা ঘোরা, অজ্ঞান হওয়া বা প্রচণ্ড দুর্বলতা",
    en: "Dizziness, fainting, or severe weakness",
  },
  {
    bn: "গর্ভাবস্থায় রক্তক্ষরণ, তীব্র মাথাব্যথা, খিঁচুনি বা শিশুর নড়াচড়া কমে যাওয়া",
    en: "Bleeding, severe headache, convulsions, or reduced fetal movement during pregnancy",
  },
  {
    bn: "প্রসবের পর অতিরিক্ত রক্তক্ষরণ বা জ্বর",
    en: "Heavy bleeding or fever after childbirth",
  },
  {
    bn: "জ্বরের সাথে তীব্র তলপেটে ব্যথা",
    en: "Severe lower-abdominal pain together with fever",
  },
];

const SAFE_CARDS: { t_bn: string; t_en: string; d_bn: string; d_en: string }[] = [
  {
    t_bn: "নিয়ম আগে, AI পরে", t_en: "Rules first, AI second",
    d_bn: "জরুরি সিদ্ধান্ত (এটি কি বিপদ?) সবসময় নির্দিষ্ট চিকিৎসা-নিয়ম দিয়ে নেওয়া হয় — AI-এর অনুমানে নয়। তাই সখী কখনো ভুল করে কোনো জরুরি অবস্থাকে হালকা করে দেখে না।",
    d_en: "Urgent decisions (is this dangerous?) are always made by fixed medical rules — never by AI guesswork. So Shokhi never mistakenly under-plays an emergency.",
  },
  {
    t_bn: "Gemma 4 ভাষা বোঝে", t_en: "Gemma 4 understands language",
    d_bn: "সখীর 'মস্তিষ্ক' Gemma 4 — এটি আপনার এলোমেলো বাংলা কথা বোঝে এবং উষ্ণ, সহজ ভাষায় উত্তর দেয়।",
    d_en: "Shokhi's 'brain' is Gemma 4 — it understands your everyday Bangla and replies in warm, simple language.",
  },
  {
    t_bn: "ডাক্তার নয়, বন্ধু", t_en: "A friend, not a doctor",
    d_bn: "সখী প্রাথমিক ধারণা ও নিরাপদ পরামর্শ দেয়; নিশ্চিত রোগ নির্ণয় সবসময় একজন ডাক্তারই করেন।",
    d_en: "Shokhi gives an initial sense and safe guidance; a firm diagnosis always comes from a doctor.",
  },
  {
    t_bn: "গোপনীয়", t_en: "Private",
    d_bn: "আপনার ট্র্যাকারের তথ্য শুধু আপনার ফোনেই থাকে, সার্ভারে জমা হয় না।",
    d_en: "Your tracker data stays only on your phone; nothing is stored on a server.",
  },
];

export default function AboutPage() {
  const { t, lang } = useLang();
  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <PageIntro icon="🛡️" title={t("about.title")} sub={t("about.sub")} variant="about" side="left" size={140} />

      {/* emergency */}
      <section id="emergency" className="mt-8 rounded-2xl bg-red-50 px-5 py-5 ring-1 ring-red-100">
        <h2 className="font-display text-lg font-bold text-red-700">{t("about.emergencyTitle")}</h2>
        <ul className="mt-3 space-y-2">
          {DANGER_SIGNS.map((d) => (
            <li key={d.en} className="flex gap-2.5 text-sm leading-relaxed text-plum/80">
              <span className="text-red-500">•</span>
              {lang === "en" ? d.en : d.bn}
            </li>
          ))}
        </ul>
        <p className="mt-4 rounded-xl bg-white/70 px-3 py-2 text-sm font-semibold text-red-700">
          {t("about.emergencyLine")}
        </p>
      </section>

      {/* how safe */}
      <section className="mt-8">
        <h2 className="font-display text-xl font-bold text-plum">{t("about.safeTitle")}</h2>
        <div className="mt-4 space-y-3">
          {SAFE_CARDS.map((x) => (
            <div key={x.t_en} className="rounded-2xl bg-white/80 px-4 py-3.5 ring-1 ring-rose-soft">
              <p className="text-sm font-bold text-plum">{lang === "en" ? x.t_en : x.t_bn}</p>
              <p className="mt-1 text-sm leading-relaxed text-plum/65">{lang === "en" ? x.d_en : x.d_bn}</p>
            </div>
          ))}
        </div>
      </section>

      {/* mission */}
      <section className="mt-8 rounded-2xl bg-blush/60 px-5 py-5">
        <h2 className="font-display text-lg font-bold text-plum">{t("about.missionTitle")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-plum/70">{t("about.missionBody")}</p>
        <Link
          href="/chat"
          className="mt-4 inline-block rounded-full bg-rose px-5 py-2 text-sm font-semibold text-white"
        >
          {t("about.talkToShokhi")}
        </Link>
      </section>
    </main>
  );
}
