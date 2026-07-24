// Deterministic self-harm / crisis safeguard. If a message expresses suicidal thoughts or
// self-harm, Shokhi must respond with warmth AND immediate help — never brush it off, and never
// leave it to the LLM alone. A plain keyword scan (Bangla + English), independent of the symptom
// triage, so it can't be missed.

const CRISIS_TERMS = [
  // Bangla
  "আত্মহত্যা", "আত্মহনন", "মরে যেতে চাই", "মরে যাব", "মরে যাই", "মরে যেতে ইচ্ছে",
  "বাঁচতে চাই না", "বাঁচতে ইচ্ছে করছে না", "আর বাঁচতে চাই না", "নিজেকে শেষ",
  "নিজের ক্ষতি", "শেষ করে দিতে ইচ্ছে", "জীবন শেষ করে",
  // English
  "suicide", "kill myself", "end my life", "want to die", "don't want to live",
  "dont want to live", "hurt myself", "harm myself", "self harm", "self-harm",
  "no reason to live", "better off dead", "end it all",
];

export function detectCrisis(message: string): boolean {
  const low = (message || "").toLowerCase();
  return CRISIS_TERMS.some((t) => low.includes(t.toLowerCase()));
}

/** A compassionate crisis reply with Bangladesh emotional-support + emergency numbers. */
export function crisisResponse(lang: "bn" | "en"): string {
  if (lang === "en") {
    return (
      "I'm really glad you told me — thank you for trusting me, and I'm here with you. What you're " +
      "feeling right now is very heavy, but you are not alone and you truly matter.\n\n" +
      "Please reach out to someone who can support you right now:\n" +
      "• Kaan Pete Roi (free emotional support): 09612-119911 / 09604-119911\n" +
      "• National emergency: 999\n\n" +
      "If you can, tell someone you trust nearby too. These feelings can ease with support — " +
      "please don't go through this alone. 🤍"
    );
  }
  return (
    "আপনি আমাকে বলেছেন — এজন্য সত্যিই ধন্যবাদ, আর আমি আপনার পাশে আছি। এই মুহূর্তে আপনার অনুভূতিগুলো " +
    "ভীষণ ভারী, কিন্তু আপনি একা নন, আর আপনি সত্যিই মূল্যবান।\n\n" +
    "দয়া করে এখনই এমন কারো সাহায্য নিন যিনি পাশে দাঁড়াতে পারেন:\n" +
    "• কান পেতে রই (বিনামূল্যে মানসিক সহায়তা): ০৯৬১২-১১৯৯১১ / ০৯৬০৪-১১৯৯১১\n" +
    "• জাতীয় জরুরি সেবা: ৯৯৯\n\n" +
    "সম্ভব হলে কাছের বিশ্বস্ত কাউকেও বলুন। সহায়তা পেলে এই কষ্ট হালকা হতে পারে — দয়া করে একা এর মধ্য দিয়ে " +
    "যাবেন না। 🤍"
  );
}
