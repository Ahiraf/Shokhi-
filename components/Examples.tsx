"use client";

import { useLang } from "./LanguageProvider";

const EXAMPLES: { label_bn: string; label_en: string; text_bn: string; text_en: string }[] = [
  {
    label_bn: "পিসিওএস",
    label_en: "PCOS",
    text_bn: "আমার বয়স ২৩, মাসিক খুব অনিয়মিত, মুখে অতিরিক্ত লোম উঠছে আর ওজন বেড়ে যাচ্ছে।",
    text_en: "I'm 23, my periods are very irregular, I'm getting excess facial hair and gaining weight.",
  },
  {
    label_bn: "এন্ডোমেট্রিওসিস",
    label_en: "Endometriosis",
    text_bn: "মাসিকের সময় এত ব্যথা হয় যে আমি স্কুলে বা কাজে যেতে পারি না।",
    text_en: "My period pain is so bad that I can't go to school or work.",
  },
  {
    label_bn: "জরুরি",
    label_en: "Emergency",
    text_bn: "আমার প্রচণ্ড ব্যথা হচ্ছে আর আমি গর্ভবতী হতে পারি।",
    text_en: "I have severe pain and I might be pregnant.",
  },
  {
    label_bn: "পিএমএস",
    label_en: "PMS",
    text_bn: "মাসিকের আগে মেজাজ খারাপ থাকে আর পেট ফাঁপা লাগে।",
    text_en: "Before my period my mood is bad and I feel bloated.",
  },
];

export default function Examples({
  onPick,
}: {
  onPick: (text: string) => void;
}) {
  const { lang } = useLang();
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {EXAMPLES.map((e) => (
        <button
          key={e.label_en}
          onClick={() => onPick(lang === "en" ? e.text_en : e.text_bn)}
          className="rounded-full bg-surface/80 px-4 py-1.5 text-sm font-medium text-rose-deep ring-1 ring-rose-soft backdrop-blur transition hover:bg-rose-soft"
        >
          {lang === "en" ? e.label_en : e.label_bn}
        </button>
      ))}
    </div>
  );
}
