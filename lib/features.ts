// The feature set shown on the landing page — each links to its own route.
export type Accent = "rose" | "sage" | "apricot";

export interface Feature {
  href: string;
  icon: string;
  title_bn: string;
  title_en: string;
  desc_bn: string;
  desc_en: string;
  accent: Accent;
}

export const FEATURES: Feature[] = [
  {
    href: "/chat",
    icon: "💬",
    title_bn: "লক্ষণ পরামর্শ",
    title_en: "Symptom advice",
    desc_bn: "বাংলায় উপসর্গ বলুন — Gemma বুঝে নিরাপদ পরামর্শ দেবে।",
    desc_en: "Describe your symptoms — Gemma understands and gives safe guidance.",
    accent: "rose",
  },
  {
    href: "/tracker",
    icon: "🩸",
    title_bn: "মাসিক ট্র্যাকার",
    title_en: "Period tracker",
    desc_bn: "পিরিয়ড, ব্যথা ও প্যাড লিখুন — চক্র নিয়মিত কিনা জানুন।",
    desc_en: "Log periods, pain and pads — see if your cycle is regular.",
    accent: "sage",
  },
  {
    href: "/tracker",
    icon: "⏰",
    title_bn: "প্যাড রিমাইন্ডার",
    title_en: "Pad reminder",
    desc_bn: "প্রতি ৪–৬ ঘণ্টায় প্যাড বদলানোর মৃদু মনে করানো।",
    desc_en: "A gentle nudge to change your pad every 4–6 hours.",
    accent: "apricot",
  },
  {
    href: "/guides",
    icon: "📚",
    title_bn: "স্বাস্থ্য গাইড",
    title_en: "Health guides",
    desc_bn: "জন্মনিয়ন্ত্রণ, পুষ্টি, মেনোপজ ও আরও অনেক বিষয়ে সহজ পরামর্শ।",
    desc_en: "Simple advice on contraception, nutrition, menopause and more.",
    accent: "rose",
  },
  {
    href: "/learn",
    icon: "🧠",
    title_bn: "রোগ সম্পর্কে জানুন",
    title_en: "Learn about conditions",
    desc_bn: "পিসিওএস, এন্ডোমেট্রিওসিস, ইউটিআই — সহজ ভাষায় ব্যাখ্যা।",
    desc_en: "PCOS, endometriosis, UTI — explained in plain language.",
    accent: "sage",
  },
  {
    href: "/myths",
    icon: "💡",
    title_bn: "ভুল ধারণা ভাঙুন",
    title_en: "Bust the myths",
    desc_bn: "মাসিক ও নারীস্বাস্থ্য নিয়ে প্রচলিত ভুল তথ্যের সঠিক জবাব।",
    desc_en: "Straight answers to common myths about periods and women's health.",
    accent: "apricot",
  },
  {
    href: "/hotline",
    icon: "☎️",
    title_bn: "ভয়েস হটলাইন",
    title_en: "Voice hotline",
    desc_bn: "ফোন করে বাংলায় বলুন, পরামর্শ শুনুন — পড়তে হবে না।",
    desc_en: "Call, speak in Bangla, and listen to the advice — no reading needed.",
    accent: "rose",
  },
  {
    href: "/about",
    icon: "🛡️",
    title_bn: "নিরাপত্তা ও তথ্য",
    title_en: "Safety & info",
    desc_bn: "জরুরি নম্বর, বিপদচিহ্ন এবং সখী সম্পর্কে জানুন।",
    desc_en: "Emergency numbers, danger signs, and about Shokhi.",
    accent: "sage",
  },
];
