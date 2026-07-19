// The feature set shown on the landing page — each links to its own route.
export type Accent = "rose" | "sage" | "apricot";

export interface Feature {
  href: string;
  icon: string;
  title: string;
  desc: string;
  accent: Accent;
}

export const FEATURES: Feature[] = [
  {
    href: "/chat",
    icon: "💬",
    title: "লক্ষণ পরামর্শ",
    desc: "বাংলায় উপসর্গ বলুন — Gemma বুঝে নিরাপদ পরামর্শ দেবে।",
    accent: "rose",
  },
  {
    href: "/tracker",
    icon: "🩸",
    title: "মাসিক ট্র্যাকার",
    desc: "পিরিয়ড, ব্যথা ও প্যাড লিখুন — চক্র নিয়মিত কিনা জানুন।",
    accent: "sage",
  },
  {
    href: "/tracker",
    icon: "⏰",
    title: "প্যাড রিমাইন্ডার",
    desc: "প্রতি ৪–৬ ঘণ্টায় প্যাড বদলানোর মৃদু মনে করানো।",
    accent: "apricot",
  },
  {
    href: "/guides",
    icon: "📚",
    title: "স্বাস্থ্য গাইড",
    desc: "জন্মনিয়ন্ত্রণ, পুষ্টি, মেনোপজ ও আরও অনেক বিষয়ে সহজ পরামর্শ।",
    accent: "rose",
  },
  {
    href: "/learn",
    icon: "🧠",
    title: "রোগ সম্পর্কে জানুন",
    desc: "পিসিওএস, এন্ডোমেট্রিওসিস, ইউটিআই — সহজ ভাষায় ব্যাখ্যা।",
    accent: "sage",
  },
  {
    href: "/myths",
    icon: "💡",
    title: "ভুল ধারণা ভাঙুন",
    desc: "মাসিক ও নারীস্বাস্থ্য নিয়ে প্রচলিত ভুল তথ্যের সঠিক জবাব।",
    accent: "apricot",
  },
  {
    href: "/hotline",
    icon: "☎️",
    title: "ভয়েস হটলাইন",
    desc: "ফোন করে বাংলায় বলুন, পরামর্শ শুনুন — পড়তে হবে না।",
    accent: "rose",
  },
  {
    href: "/about",
    icon: "🛡️",
    title: "নিরাপত্তা ও তথ্য",
    desc: "জরুরি নম্বর, বিপদচিহ্ন এবং সখী সম্পর্কে জানুন।",
    accent: "sage",
  },
];
