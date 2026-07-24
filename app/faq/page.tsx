"use client";

import Link from "next/link";
import PageIntro from "@/components/PageIntro";
import { useLang } from "@/components/LanguageProvider";

// Frequently asked questions about Shokhi. Bilingual and self-contained (like the
// About page) — the health *content* lives in knowledge.json, but these are questions
// about the app itself, so they live here as static UI copy.
const FAQS: { q_bn: string; q_en: string; a_bn: string; a_en: string }[] = [
  {
    q_bn: "সখী আসলে কী?",
    q_en: "What is Shokhi?",
    a_bn: "সখী একটি বাংলা নারী-স্বাস্থ্য সহায়ক। মাসিক, পিসিওএস, গর্ভকাল থেকে মেনোপজ পর্যন্ত — আপনি বাংলায় বললে সখী বুঝে সহজ, নিরাপদ পরামর্শ দেয়। এটি শহরের কিশোরী থেকে গ্রামের নারী, সবার জন্য।",
    a_en: "Shokhi is a Bangla women's-health companion. From periods, PCOS and pregnancy to menopause — you speak in Bangla and Shokhi understands and gives simple, safe guidance. It's for everyone, from urban teens to rural women.",
  },
  {
    q_bn: "সখী কি ডাক্তার? এটা কি রোগ নির্ণয় করে?",
    q_en: "Is Shokhi a doctor? Can it diagnose me?",
    a_bn: "না। সখী একজন স্বাস্থ্য-বন্ধু, ডাক্তার নয়। এটি প্রাথমিক ধারণা ও নিরাপদ পরামর্শ দেয়, কিন্তু নিশ্চিত রোগ নির্ণয় ও চিকিৎসা সবসময় একজন যোগ্য চিকিৎসকই করেন। সন্দেহ হলে অবশ্যই ডাক্তার দেখান।",
    a_en: "No. Shokhi is a health companion, not a doctor. It gives an initial sense and safe guidance, but a firm diagnosis and treatment always come from a qualified doctor. When in doubt, always see a doctor.",
  },
  {
    q_bn: "সখী কীভাবে ঠিক করে কোনটা জরুরি অবস্থা?",
    q_en: "How does Shokhi decide if something is an emergency?",
    a_bn: "জরুরি সিদ্ধান্ত (এটা কি বিপদ?) সবসময় নির্দিষ্ট চিকিৎসা-নিয়ম দিয়ে নেওয়া হয়, AI-এর অনুমানে নয়। তাই সখী কখনো ভুল করে কোনো জরুরি অবস্থাকে হালকা করে দেখে না — বিপদের লক্ষণ থাকলে সোজা হাসপাতালে যেতে বলে।",
    a_en: "Urgent decisions (is this dangerous?) are always made by fixed medical rules, not by AI guesswork. So Shokhi never mistakenly under-plays an emergency — if there are danger signs, it tells you to go straight to a hospital.",
  },
  {
    q_bn: "আমার তথ্য কি গোপন থাকে?",
    q_en: "Is my data private?",
    a_bn: "হ্যাঁ। আপনার ট্র্যাকার ও প্রোফাইলের তথ্য শুধু আপনার ফোনেই থাকে, কোনো সার্ভারে জমা হয় না। কোনো অ্যাকাউন্ট লাগে না, এবং আপনি যেকোনো সময় সব মুছে ফেলতে পারেন।",
    a_en: "Yes. Your tracker and profile data stay only on your phone; nothing is stored on a server. No account is needed, and you can clear everything at any time.",
  },
  {
    q_bn: "সখী ব্যবহার করতে কি টাকা লাগে?",
    q_en: "Does Shokhi cost anything?",
    a_bn: "সখী বিনামূল্যে এবং কোনো অ্যাকাউন্ট লাগে না। প্রোফাইল ও ট্র্যাকার এই ফোনেই থাকে, তবে উত্তর তৈরি করতে চ্যাটের লেখা সার্ভারে পাঠানো হয় — তাই নাম, ঠিকানা বা ফোন নম্বর লিখবেন না।",
    a_en: "Shokhi is free and requires no account. Your profile and tracker stay on this phone, but chat text is sent to the server to generate a reply—so don't include your name, address, or phone number.",
  },
  {
    q_bn: "আমি পড়তে পারি না — তবু কি ব্যবহার করতে পারব?",
    q_en: "I can't read — can I still use it?",
    a_bn: "সমর্থিত ব্রাউজারে লেখার বদলে কণ্ঠে বাংলায় বলতে পারেন। যাঁদের স্মার্টফোন নেই, তাঁদের জন্য ভয়েস হটলাইন এখনো ভবিষ্যৎ পরিকল্পনা — এই ডেমোতে চালু নয়।",
    a_en: "In a supported browser, you can speak in Bangla instead of typing. A phone hotline for people without smartphones is still a roadmap feature and is not live in this demo.",
  },
  {
    q_bn: "সখী কোন কোন বিষয়ে সাহায্য করে?",
    q_en: "What can Shokhi help with?",
    a_bn: "মাসিক ও অনিয়মিত চক্র, ব্যথা ও পিএমএস, পিসিওএস, এন্ডোমেট্রিওসিস, গর্ভকাল ও প্রসব-পরবর্তী যত্ন, মেনোপজ, এবং নারীস্বাস্থ্য নিয়ে প্রচলিত ভুল ধারণা ভাঙা। মাসিক ট্র্যাকার ও সুস্থতার পরামর্শও আছে।",
    a_en: "Periods and irregular cycles, cramps and PMS, PCOS, endometriosis, pregnancy and postpartum care, menopause, and busting common myths about women's health. There's also a period tracker and wellness tips.",
  },
  {
    q_bn: "সখী কোন ভাষায় কথা বলে?",
    q_en: "What language does Shokhi speak?",
    a_bn: "সখী বাংলা-প্রথম — আপনার এলোমেলো, ঘরোয়া বাংলা কথাও বোঝে ও বাংলায় উত্তর দেয়। চাইলে উপরের 🌐 বোতাম দিয়ে পুরো অ্যাপটি English-এ দেখতে পারেন।",
    a_en: "Shokhi is Bangla-first — it understands your everyday, informal Bangla and replies in Bangla. If you prefer, the 🌐 button at the top switches the whole app to English.",
  },
  {
    q_bn: "'সহায়ক ইঙ্গিত' বা ঝুঁকির স্কোর কি রোগ নির্ণয়?",
    q_en: "Is the 'supporting signal' or risk score a diagnosis?",
    a_bn: "না। কিছু ক্ষেত্রে (যেমন পিসিওএস বা এন্ডোমেট্রিওসিস) সখী একটি সহায়ক ইঙ্গিত দেখায়, যা শুধু ডাক্তার দেখানোর একটি বাড়তি কারণ হিসেবে ভাবা উচিত। এটি কখনো জরুরি সিদ্ধান্তকে বদলায় না এবং নিশ্চিত রোগ নয়।",
    a_en: "No. For some topics (like PCOS or endometriosis) Shokhi shows a supporting signal that should be treated only as one more reason to see a doctor. It never overrides the urgency decision and is not a diagnosis.",
  },
  {
    q_bn: "সখীকে কী শক্তি জোগায়?",
    q_en: "What powers Shokhi?",
    a_bn: "সখীর 'মস্তিষ্ক' হলো Gemma 4 — এটি আপনার বাংলা কথা বোঝে ও উষ্ণ, সহজ ভাষায় উত্তর দেয়। এর সাথে একটি নির্দিষ্ট নিয়ম-ভিত্তিক নিরাপত্তা স্তর কাজ করে, যা জরুরি অবস্থা যাচাই করে।",
    a_en: "Shokhi's 'brain' is Gemma 4 — it understands your Bangla and replies in warm, simple language. Alongside it runs a fixed rule-based safety layer that checks for emergencies.",
  },
  {
    q_bn: "জরুরি অবস্থায় আমি কী করব?",
    q_en: "What should I do in an emergency?",
    a_bn: "অ্যাপে অপেক্ষা করবেন না — সরাসরি জাতীয় জরুরি সেবা ৯৯৯-এ কল করুন বা নিকটস্থ হাসপাতালে যান। স্বাস্থ্য বিষয়ক তথ্যের জন্য স্বাস্থ্য বাতায়ন ১৬২৬৩-এ কল করতে পারেন।",
    a_en: "Don't wait on the app — call the national emergency service 999 directly or go to the nearest hospital. For health information you can call the health hotline 16263.",
  },
];

export default function FaqPage() {
  const { t, lang } = useLang();
  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <PageIntro icon="❓" title={t("faq.title")} sub={t("faq.sub")} variant="about" side="right" size={140} />

      <section className="mt-8 space-y-3">
        {FAQS.map((f) => (
          <details
            key={f.q_en}
            className="group rounded-2xl bg-surface/80 px-5 py-4 ring-1 ring-rose-soft transition open:bg-blush/50"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-3 font-display text-base font-bold text-plum marker:content-none">
              <span>{lang === "en" ? f.q_en : f.q_bn}</span>
              <span className="shrink-0 text-rose transition group-open:rotate-45" aria-hidden>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-plum/70">
              {lang === "en" ? f.a_en : f.a_bn}
            </p>
          </details>
        ))}
      </section>

      {/* still have a question */}
      <section className="mt-8 rounded-2xl bg-blush/60 px-5 py-5 text-center">
        <h2 className="font-display text-lg font-bold text-plum">{t("faq.stillTitle")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-plum/70">{t("faq.stillBody")}</p>
        <Link
          href="/chat"
          className="mt-4 inline-block rounded-full bg-rose px-5 py-2 text-sm font-semibold text-accentink"
        >
          {t("common.askShokhi")}
        </Link>
      </section>
    </main>
  );
}
