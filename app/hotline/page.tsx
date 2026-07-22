"use client";

import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import Mascot3D from "@/components/Mascot3D";
import { useLang } from "@/components/LanguageProvider";

const STEPS: { icon: string; title_bn: string; title_en: string; desc_bn: string; desc_en: string }[] = [
  {
    icon: "📞",
    title_bn: "ফোন করুন", title_en: "Call in",
    desc_bn: "সখীর হটলাইন নম্বরে সাধারণ ফোন থেকে কল করুন — স্মার্টফোন লাগবে না।",
    desc_en: "Call Shokhi's hotline number from any ordinary phone — no smartphone needed.",
  },
  {
    icon: "🗣️",
    title_bn: "বাংলায় বলুন", title_en: "Speak in Bangla",
    desc_bn: "বিপ শব্দের পর আপনার সমস্যাটি বাংলায় বলুন, ঠিক যেমন কাউকে বলতেন।",
    desc_en: "After the beep, describe your concern in Bangla, just as you would to a friend.",
  },
  {
    icon: "👂",
    title_bn: "পরামর্শ শুনুন", title_en: "Listen to the advice",
    desc_bn: "সখী আপনার কথা বুঝে বাংলায় নিরাপদ পরামর্শ শোনাবে — পড়তে হবে না।",
    desc_en: "Shokhi understands and speaks safe guidance back in Bangla — no reading needed.",
  },
];

export default function HotlinePage() {
  const { t, lang } = useLang();
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <PageHeader icon="☎️" title={t("hotline.title")} sub={t("hotline.sub")} />

      <div className="mt-8 flex flex-col items-center gap-5 rounded-3xl bg-gradient-to-br from-panel to-panel-deep px-6 py-8 text-center text-white sm:flex-row sm:text-left">
        <div className="shrink-0">
          <Mascot3D variant="hotline" size={110} />
        </div>
        <div>
          <p className="text-sm text-white/70">{t("hotline.anyPhone")}</p>
          <p className="font-display text-2xl font-bold">{t("hotline.brand")}</p>
          <p className="mt-1 text-sm text-white/80">{t("hotline.brandDesc")}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.title_en} className="rounded-2xl bg-surface/80 p-5 text-center ring-1 ring-rose-soft">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blush text-2xl">
              {s.icon}
            </div>
            <h3 className="mt-3 font-display text-base font-bold text-plum">
              {lang === "en" ? s.title_en : s.title_bn}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-plum/60">
              {lang === "en" ? s.desc_en : s.desc_bn}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-apricot-soft px-5 py-4">
        <p className="text-sm leading-relaxed text-plum/75">{t("hotline.techNote")}</p>
      </div>

      <div className="mt-8 rounded-2xl bg-surface/80 px-5 py-4 text-center ring-1 ring-rose-soft">
        <p className="text-sm font-semibold text-rose-deep">{t("hotline.needEmergency")}</p>
        <p className="mt-1 text-sm text-plum/70">{t("hotline.emergencyLine")}</p>
      </div>

      <div className="mt-8 text-center">
        <Link href="/chat" className="text-sm font-semibold text-rose hover:underline">
          {t("hotline.preferText")}
        </Link>
      </div>
    </main>
  );
}
