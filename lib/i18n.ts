// Bilingual (Bangla / English) string table for Shokhi's UI chrome.
//
// Shokhi is Bangla-first, so `bn` is the default and every key must have it. English
// is offered through the header toggle (see components/LanguageProvider.tsx). Health
// *content* (guides, conditions, myths, chat replies) is translated at the data layer
// (knowledge.json `_en` fields + a `lang` param to the backend); this file is only the
// static interface text.

export type Lang = "bn" | "en";

export const LANGS: Lang[] = ["bn", "en"];

type Entry = { bn: string; en: string };

export const STRINGS = {
  // --- navigation ----------------------------------------------------------
  "nav.home": { bn: "হোম", en: "Home" },
  "nav.chat": { bn: "পরামর্শ", en: "Advice" },
  "nav.tracker": { bn: "ট্র্যাকার", en: "Tracker" },
  "nav.guides": { bn: "গাইড", en: "Guides" },
  "nav.learn": { bn: "রোগ-জ্ঞান", en: "Learn" },
  "nav.myths": { bn: "ভুল ধারণা", en: "Myths" },
  "nav.wellness": { bn: "সুস্থতা", en: "Wellness" },
  "nav.hotline": { bn: "হটলাইন", en: "Hotline" },
  "nav.faq": { bn: "প্রশ্নোত্তর", en: "FAQ" },
  "nav.about": { bn: "সম্পর্কে", en: "About" },
  "nav.profile": { bn: "আমার প্রোফাইল", en: "My Profile" },
  "nav.menu": { bn: "মেনু", en: "Menu" },
  "nav.langLabel": { bn: "English", en: "বাংলা" }, // shows the language you can switch TO
  "nav.darkMode": { bn: "ডার্ক মোড", en: "Dark mode" },
  "nav.lightMode": { bn: "লাইট মোড", en: "Light mode" },

  // --- footer --------------------------------------------------------------
  "footer.tagline": {
    bn: "বাংলায় নারীর স্বাস্থ্য বন্ধু — মাসিক, পিসিওএস, গর্ভকাল থেকে মেনোপজ। Gemma 4 দ্বারা চালিত।",
    en: "A women's health companion in Bangla — from periods, PCOS and pregnancy to menopause. Powered by Gemma 4.",
  },
  "footer.pages": { bn: "পাতা", en: "Pages" },
  "footer.emergencyNumbers": { bn: "🚨 জরুরি নম্বর", en: "🚨 Emergency numbers" },
  "footer.nationalEmergency": { bn: "জাতীয় জরুরি সেবা", en: "National emergency" },
  "footer.healthHotline": { bn: "স্বাস্থ্য বাতায়ন", en: "Health hotline" },
  "footer.disclaimer": {
    bn: "ℹ️ সখী একজন স্বাস্থ্য-সহায়ক, ডাক্তার নয়। এটি প্রাথমিক ধারণা ও নিরাপদ পরামর্শ দেয়; নিশ্চিত রোগ নির্ণয় ও চিকিৎসার জন্য অবশ্যই একজন চিকিৎসকের পরামর্শ নিন।",
    en: "ℹ️ Shokhi is a health companion, not a doctor. It gives an initial sense and safe guidance; always see a qualified doctor for diagnosis and treatment.",
  },

  // --- common --------------------------------------------------------------
  "common.read": { bn: "পড়ুন →", en: "Read →" },
  "common.open": { bn: "খুলুন →", en: "Open →" },
  "common.details": { bn: "বিস্তারিত →", en: "Details →" },
  "common.loading": { bn: "লোড হচ্ছে…", en: "Loading…" },
  "common.askShokhi": { bn: "সখীকে জিজ্ঞাসা করুন", en: "Ask Shokhi" },
  "common.seeDoctorHeading": { bn: "🩺 কখন ডাক্তার দেখাবেন", en: "🩺 When to see a doctor" },
  "common.generalInfoNote": {
    bn: "ℹ️ এটি সাধারণ তথ্য, নিশ্চিত চিকিৎসা নয় — প্রয়োজনে ডাক্তার বা স্বাস্থ্যকর্মীর পরামর্শ নিন।",
    en: "ℹ️ This is general information, not a diagnosis — see a doctor or health worker if needed.",
  },

  // --- home ----------------------------------------------------------------
  "home.badge": { bn: "🌸 Gemma 4 · বাংলা · গোপনীয়", en: "🌸 Gemma 4 · Bangla · Private" },
  "home.heroTitle": { bn: "নারীর বিশ্বস্ত\nস্বাস্থ্য বন্ধু", en: "A trusted health\nfriend for women" },
  "home.heroDesc": {
    bn: "মাসিক, পিসিওএস, গর্ভকাল থেকে মেনোপজ — শহরের কিশোরী থেকে গ্রামের নারী, সবার জন্য। বাংলায় বলুন, সখী বুঝবে ও নিরাপদ পরামর্শ দেবে।",
    en: "From periods, PCOS and pregnancy to menopause — for everyone, from urban teens to rural women. Speak in Bangla; Shokhi understands and gives safe guidance.",
  },
  "home.ctaStart": { bn: "পরামর্শ শুরু করুন", en: "Start a consultation" },
  "home.ctaGuides": { bn: "গাইড দেখুন", en: "Browse guides" },
  "home.featuresTitle": { bn: "সখী যেভাবে পাশে থাকে", en: "How Shokhi helps you" },
  "home.featuresSub": {
    bn: "প্রতিটি সেবার আলাদা পাতা — যেটি দরকার সেটিতে যান",
    en: "Each service has its own page — go to the one you need",
  },
  "home.conditionsTitle": { bn: "কী কী নিয়ে সাহায্য করে", en: "What it helps with" },
  "home.conditionsSub": {
    bn: "একজন নারীর পুরো প্রজনন-জীবন জুড়ে — প্রথম মাসিক থেকে মেনোপজ পর্যন্ত।",
    en: "Across a woman's whole reproductive life — from her first period to menopause.",
  },
  "home.howTitle": { bn: "কীভাবে কাজ করে", en: "How it works" },
  "home.safetyNote": {
    bn: "🛡️ জরুরি সিদ্ধান্ত সবসময় নির্দিষ্ট নিয়ম দিয়ে নেওয়া হয়, AI-এর অনুমানে নয় — তাই সখী কখনো কোনো জরুরি অবস্থাকে হালকা করে দেখে না।",
    en: "🛡️ Urgent decisions are always made by fixed rules, never by AI guesswork — so Shokhi never under-plays an emergency.",
  },
  "home.hotlineTitle": { bn: "☎️ পড়তে পারেন না? ফোন করুন।", en: "☎️ Can't read? Just call." },
  "home.hotlineDesc": {
    bn: "স্মার্টফোন বা লেখাপড়া ছাড়াই — ভয়েস হটলাইনে বাংলায় বলুন, পরামর্শ শুনুন।",
    en: "No smartphone or reading needed — speak in Bangla on the voice hotline and listen to the advice.",
  },
  "home.hotlineCta": { bn: "হটলাইন সম্পর্কে", en: "About the hotline" },

  // --- chat ----------------------------------------------------------------
  "chat.introTitle": { bn: "আপনার শরীরের কথা বলুন", en: "Tell me about your body" },
  "chat.introDesc": {
    bn: "বাংলায় লিখুন বা কণ্ঠে বলুন — আমি বুঝব ও নিরাপদ পরামর্শ দেব। সব কথা গোপন থাকবে, লজ্জার কিছু নেই।",
    en: "Type or speak in Bangla — I'll understand and give safe guidance. Everything stays private; there's nothing to be shy about.",
  },
  "chat.startWith": { bn: "এভাবে শুরু করতে পারেন", en: "You could start like this" },
  "chat.orLearn": { bn: "অথবা একটি বিষয়ে জানুন", en: "Or learn about a topic" },
  "chat.thinking": { bn: "সখী ভাবছে…", en: "Shokhi is thinking…" },
  "chat.privacyLine": {
    bn: "🔒 বিনামূল্যে ও গোপনীয় · ☎️ ১৬২৬৩ · 🚨 জরুরি ৯৯৯",
    en: "🔒 Free & private · ☎️ 16263 · 🚨 Emergency 999",
  },
  "chat.errorConnect": {
    bn: "দুঃখিত, সার্ভারের সাথে সংযোগ করা গেল না। ব্যাকএন্ড চালু আছে কিনা দেখুন।",
    en: "Sorry, couldn't reach the server. Please check that the backend is running.",
  },
  "chat.errorFetch": {
    bn: "দুঃখিত, এই মুহূর্তে তথ্যটি আনা গেল না।",
    en: "Sorry, couldn't fetch that information right now.",
  },

  // --- composer ------------------------------------------------------------
  "composer.placeholder": {
    bn: "এখানে বাংলায় লিখুন বা কণ্ঠে বলুন...",
    en: "Type here in Bangla or English, or speak...",
  },
  "composer.send": { bn: "পাঠান", en: "Send" },
  "composer.voiceTitle": { bn: "কণ্ঠে বলুন", en: "Speak" },
  "composer.listening": { bn: "শুনছি… বলুন", en: "Listening… speak now" },
  "composer.voiceUnavailable": {
    bn: "লাইভ Gemma 4 (SHOKHI_BACKEND=gemini) ছাড়া কণ্ঠ বোঝা যাবে না। এখন লিখে দেখুন।",
    en: "Voice needs the live Gemma 4 backend (SHOKHI_BACKEND=gemini). Please type for now.",
  },
  "composer.voiceNoSupport": {
    bn: "এই ব্রাউজারে কণ্ঠ শনাক্ত করা যাচ্ছে না — অনুগ্রহ করে Chrome ব্যবহার করুন বা লিখে জানান।",
    en: "Voice input isn't supported in this browser — please use Chrome, or type your message.",
  },
  "composer.micFailed": { bn: "মাইক্রোফোন চালু করা গেল না।", en: "Couldn't start the microphone." },

  // --- message / triage ----------------------------------------------------
  "message.riskHint": { bn: "📊 সহায়ক ইঙ্গিত", en: "📊 Supporting signal" },
  "message.riskFooter": {
    bn: "নিশ্চিত রোগ নয়, ডাক্তার দেখান।",
    en: "Not a diagnosis — please see a doctor.",
  },

  // --- guides list ---------------------------------------------------------
  "guides.title": { bn: "স্বাস্থ্য গাইড", en: "Health guides" },
  "guides.sub": {
    bn: "নারীস্বাস্থ্যের নানা বিষয়ে সহজ, নির্ভরযোগ্য বাংলা পরামর্শ — যেকোনোটিতে চাপ দিন।",
    en: "Simple, reliable guidance on many women's-health topics — tap any one.",
  },
  "guides.error": {
    bn: "গাইড আনা গেল না। ব্যাকএন্ড চালু আছে কিনা দেখুন।",
    en: "Couldn't load guides. Check that the backend is running.",
  },
  "guides.backAll": { bn: "← সব গাইড", en: "← All guides" },
  "guides.notFound": { bn: "এই গাইডটি পাওয়া গেল না।", en: "This guide wasn't found." },
  "guides.moreQuestion": {
    bn: "এই বিষয়ে আরও কিছু জানতে চান?",
    en: "Want to know more on this topic?",
  },

  // --- learn ---------------------------------------------------------------
  "learn.title": { bn: "রোগ সম্পর্কে জানুন", en: "Learn about conditions" },
  "learn.sub": {
    bn: "নারীস্বাস্থ্যের সাধারণ অবস্থাগুলো সহজ বাংলায় — লক্ষণ, ঘরোয়া যত্ন ও কখন ডাক্তার দেখাবেন।",
    en: "Common women's-health conditions in plain language — signs, home care, and when to see a doctor.",
  },
  "learn.error": { bn: "তথ্য আনা গেল না।", en: "Couldn't load the information." },
  "learn.backAll": { bn: "← সব বিষয়", en: "← All topics" },
  "learn.notFound": { bn: "এই বিষয়টি পাওয়া গেল না।", en: "This topic wasn't found." },
  "learn.whatYouCanDo": { bn: "🌸 যা করতে পারেন", en: "🌸 What you can do" },
  "learn.haveThis": {
    bn: "আপনার এই উপসর্গ আছে বলে মনে হচ্ছে?",
    en: "Think you might have these symptoms?",
  },
  "learn.checkWithShokhi": { bn: "সখীর সাথে যাচাই করুন", en: "Check with Shokhi" },
  "learn.diagnosisNote": {
    bn: "ℹ️ এটি সাধারণ তথ্য, নিশ্চিত রোগ নির্ণয় নয় — একজন ডাক্তারের পরামর্শ নিন।",
    en: "ℹ️ This is general information, not a diagnosis — please consult a doctor.",
  },
  // urgency tags on learn cards
  "urgency.emergency.short": { bn: "জরুরি", en: "Emergency" },
  "urgency.see_doctor_soon.short": { bn: "ডাক্তার দেখান", en: "See a doctor" },
  "urgency.self_care.short": { bn: "ঘরোয়া যত্ন", en: "Home care" },
  "urgency.info.short": { bn: "তথ্য", en: "Info" },
  "urgency.emergency.long": {
    bn: "🚨 জরুরি — এখনই হাসপাতালে যান",
    en: "🚨 Emergency — go to a hospital now",
  },
  "urgency.see_doctor_soon.long": { bn: "🩺 শীঘ্রই ডাক্তার দেখান", en: "🩺 See a doctor soon" },
  "urgency.self_care.long": {
    bn: "🌿 ঘরোয়া যত্ন সাধারণত যথেষ্ট",
    en: "🌿 Home care is usually enough",
  },
  "urgency.info.long": { bn: "💬 সাধারণ তথ্য", en: "💬 General information" },

  // --- myths ---------------------------------------------------------------
  "myths.title": { bn: "ভুল ধারণা ভাঙুন", en: "Bust the myths" },
  "myths.sub": {
    bn: "মাসিক ও নারীস্বাস্থ্য নিয়ে অনেক প্রচলিত ভুল বিশ্বাস আছে — এখানে সঠিক তথ্য জানুন।",
    en: "There are many common myths about periods and women's health — here's the truth.",
  },
  "myths.askPrompt": { bn: "শুনেছেন এমন কিছু যাচাই করতে চান?", en: "Heard something you want to check?" },
  "myths.placeholder": {
    bn: "যেমন: মাসিকের সময় গোসল করা যায় না…",
    en: "e.g. You can't bathe during your period…",
  },
  "myths.check": { bn: "যাচাই", en: "Check" },
  "myths.errorReply": { bn: "দুঃখিত, এখন উত্তর আনা গেল না।", en: "Sorry, couldn't get an answer right now." },
  "myths.truth": { bn: "✅ সত্যি:", en: "✅ Truth:" },

  // --- tracker -------------------------------------------------------------
  "tracker.title": { bn: "মাসিক ট্র্যাকার", en: "Period tracker" },
  "tracker.sub": {
    bn: "প্রতিবার মাসিক শুরু হলে তারিখ, রক্তক্ষরণ, ব্যথা ও প্যাডের সংখ্যা লিখুন। কয়েক মাসের তথ্য থেকে সখী বুঝবে চক্র নিয়মিত কিনা এবং কিছু নিয়ে ভাবার আছে কিনা।",
    en: "Each time your period starts, log the date, flow, pain and pad count. From a few months of data, Shokhi can tell whether your cycle is regular and whether anything is worth a second look.",
  },
  "tracker.cardTitle": { bn: "🩸 মাসিক ট্র্যাকার", en: "🩸 Period tracker" },
  "tracker.cardIntro": {
    bn: "প্রতিবার মাসিক শুরু হলে তারিখটি লিখুন। সখী আপনার চক্র বুঝে জানাবে এটি নিয়মিত কিনা এবং কিছু নিয়ে ভাবার আছে কিনা।",
    en: "Log the date each time your period starts. Shokhi will read your cycle and tell you if it's regular and if anything is worth thinking about.",
  },
  "tracker.privacy": {
    bn: "🔒 আপনার তথ্য শুধু এই ফোনেই থাকে, সার্ভারে জমা হয় না।",
    en: "🔒 Your data stays on this phone only; nothing is stored on a server.",
  },
  "tracker.startDate": { bn: "মাসিক শুরুর তারিখ", en: "Period start date" },
  "tracker.dateHint": {
    bn: "মাসিকের প্রতিটি দিন আলাদা করে লিখতে পারেন, বা শুধু প্রথম দিনটি — সখী একই মাসিকের দিনগুলো একসাথে ধরে নেয়।",
    en: "Log each day of your period, or just the first day — Shokhi groups the days of one period together.",
  },
  "tracker.flow": { bn: "রক্তক্ষরণ", en: "Flow" },
  "tracker.pain": { bn: "ব্যথা", en: "Pain" },
  "tracker.padsPerDay": { bn: "দিনে প্যাড", en: "Pads/day" },
  "tracker.add": { bn: "+ যোগ করুন", en: "+ Add" },
  "tracker.save": { bn: "✔ সংরক্ষণ করুন", en: "✔ Save changes" },
  "tracker.editingHint": { bn: "এই মাসিকটি সম্পাদনা করছেন", en: "Editing this entry" },
  "tracker.cancel": { bn: "বাতিল", en: "Cancel" },
  "tracker.logged": { bn: "লেখা মাসিক", en: "Logged periods" },
  "tracker.flowShort": { bn: "রক্ত", en: "flow" },
  "tracker.padShort": { bn: "প্যাড", en: "pads" },
  "tracker.edit": { bn: "সম্পাদনা", en: "Edit" },
  "tracker.delete": { bn: "মুছুন", en: "Delete" },
  "tracker.analyzing": { bn: "দেখা হচ্ছে…", en: "Analysing…" },
  "tracker.needTwo": {
    bn: "প্যাটার্ন দেখতে অন্তত ২টি তারিখ লিখুন",
    en: "Add at least 2 dates to see a pattern",
  },
  "tracker.analyze": { bn: "🔍 আমার চক্র বিশ্লেষণ করুন", en: "🔍 Analyse my cycle" },
  "tracker.avgCycle": { bn: "গড় চক্র", en: "Avg cycle" },
  "tracker.days": { bn: "দিন", en: "days" },
  "tracker.regular": { bn: "নিয়মিত ✅", en: "Regular ✅" },
  "tracker.irregular": { bn: "অনিয়মিত ⚠️", en: "Irregular ⚠️" },
  "tracker.nextEst": { bn: "পরবর্তী আনুমানিক", en: "Next (est.)" },
  // flow labels
  "flow.light": { bn: "কম", en: "Light" },
  "flow.normal": { bn: "স্বাভাবিক", en: "Normal" },
  "flow.heavy": { bn: "বেশি", en: "Heavy" },
  // pain labels
  "pain.0": { bn: "ব্যথা নেই", en: "No pain" },
  "pain.1": { bn: "হালকা", en: "Mild" },
  "pain.2": { bn: "মাঝারি", en: "Moderate" },
  "pain.3": { bn: "তীব্র", en: "Severe" },

  // --- pad reminder --------------------------------------------------------
  "pad.title": { bn: "⏰ প্যাড বদলানোর রিমাইন্ডার", en: "⏰ Pad-change reminder" },
  "pad.intro": {
    bn: "প্রতি ৪–৬ ঘণ্টায় প্যাড বদলানো ভালো — এতে র‍্যাশ ও সংক্রমণ এড়ানো যায়।",
    en: "Changing your pad every 4–6 hours is best — it helps avoid rash and infection.",
  },
  "pad.remindIn": { bn: "ঘণ্টা পর মনে করাও", en: "hours — remind me" },
  "pad.left": { bn: "বাকি", en: "left" },
  "pad.hours": { bn: "ঘণ্টা", en: "h" },
  "pad.minutes": { bn: "মিনিট", en: "min" },
  "pad.cancel": { bn: "বাতিল", en: "Cancel" },
  "pad.timeUp": { bn: "🌸 প্যাড বদলানোর সময় হয়েছে।", en: "🌸 Time to change your pad." },
  "pad.again": { bn: "আবার", en: "Again" },
  "pad.againHours": { bn: "ঘণ্টা", en: "h" },
  "pad.notifTitle": { bn: "সখী", en: "Shokhi" },
  "pad.notifBody": {
    bn: "প্যাড বদলানোর সময় হয়েছে 🌸 পরিষ্কার থাকুন, ভালো থাকুন।",
    en: "Time to change your pad 🌸 Stay clean, stay well.",
  },
  "pad.footer": {
    bn: "🔒 রিমাইন্ডার এই ফোনেই থাকে। অ্যাপ খোলা থাকলে সময় গুনবে; অনুমতি দিলে নোটিফিকেশনও পাবেন।",
    en: "🔒 The reminder stays on this phone. It counts down while the app is open; allow notifications and you'll be pinged too.",
  },

  // --- hotline -------------------------------------------------------------
  "hotline.title": { bn: "ভয়েস হটলাইন", en: "Voice hotline" },
  "hotline.sub": {
    bn: "যাঁরা পড়তে পারেন না বা যাঁদের স্মার্টফোন নেই — তাঁদের জন্য। ফোন করে বাংলায় বলুন, পরামর্শ শুনুন।",
    en: "For those who can't read or don't have a smartphone. Call, speak in Bangla, and listen to the advice.",
  },
  "hotline.anyPhone": { bn: "যেকোনো সাধারণ ফোন থেকে", en: "From any ordinary phone" },
  "hotline.brand": { bn: "সখী হটলাইন", en: "Shokhi Hotline" },
  "hotline.brandDesc": {
    bn: "একই সখী, একই নিরাপদ পরামর্শ — এবার শুধু কণ্ঠে। কোনো অ্যাপ নেই, পড়া নেই।",
    en: "The same Shokhi, the same safe guidance — now just by voice. No app, no reading.",
  },
  "hotline.techNote": {
    bn: "🛠️ হটলাইনটি একই ব্যাকএন্ডে তৈরি (Twilio/Exotel সমর্থিত): কল রেকর্ড করে Gemma 4-এর নিজস্ব অডিও দিয়ে বাংলা বোঝা হয়, একই নিয়ম-ভিত্তিক যাচাই চলে, তারপর বাংলায় উত্তর শোনানো হয়। প্রতিটি ধাপে নিরাপদ ফলব্যাক আছে — কল কখনো আটকে যায় না।",
    en: "🛠️ The hotline runs on the same backend (Twilio/Exotel-ready): the call is recorded, Gemma 4's native audio understands the Bangla, the same rule-based triage runs, then the reply is spoken back in Bangla. Every step has a safe fallback — the call never gets stuck.",
  },
  "hotline.needEmergency": { bn: "🚨 এখনই জরুরি প্রয়োজন?", en: "🚨 Need help right now?" },
  "hotline.emergencyLine": {
    bn: "জাতীয় জরুরি সেবা ৯৯৯ · স্বাস্থ্য বাতায়ন ১৬২৬৩",
    en: "National emergency 999 · Health hotline 16263",
  },
  "hotline.preferText": {
    bn: "এখন লিখে পরামর্শ নিতে চান? → পরামর্শে যান",
    en: "Prefer to type? → Go to the chat",
  },

  // --- about ---------------------------------------------------------------
  "about.title": { bn: "নিরাপত্তা ও সখী সম্পর্কে", en: "Safety & about Shokhi" },
  "about.sub": {
    bn: "সখী কীভাবে কাজ করে, কীভাবে নিরাপদ রাখে, এবং কখন সরাসরি হাসপাতালে যেতে হবে।",
    en: "How Shokhi works, how it keeps you safe, and when to go straight to a hospital.",
  },
  "about.emergencyTitle": { bn: "🚨 এখনই হাসপাতালে যান যদি", en: "🚨 Go to a hospital now if" },
  "about.emergencyLine": {
    bn: "জাতীয় জরুরি সেবা — ৯৯৯ · স্বাস্থ্য বাতায়ন — ১৬২৬৩",
    en: "National emergency — 999 · Health hotline — 16263",
  },
  "about.safeTitle": { bn: "সখী কীভাবে নিরাপদ থাকে", en: "How Shokhi stays safe" },
  "about.missionTitle": { bn: "সখী কার জন্য", en: "Who Shokhi is for" },
  "about.missionBody": {
    bn: "শহরের কিশোরী থেকে গ্রামের নারী — যাঁরা হয়তো পড়তে পারেন না, তাঁদের জন্যও। লিখে, কণ্ঠে বা ফোনে — যেভাবে সহজ, সেভাবেই সখীর সাথে কথা বলা যায়।",
    en: "From urban teenagers to rural women — including those who may not read. By text, by voice, or by phone — talk to Shokhi whichever way is easiest.",
  },
  "about.talkToShokhi": { bn: "সখীর সাথে কথা বলুন", en: "Talk to Shokhi" },

  // --- profile -------------------------------------------------------------
  "profile.title": { bn: "আমার প্রোফাইল", en: "My Profile" },
  "profile.sub": {
    bn: "কয়েকটি তথ্য দিলে সখী আপনাকে আরও ভালোভাবে বুঝতে পারে। সব কিছু শুধু এই ফোনেই থাকে — কোনো অ্যাকাউন্ট বা সার্ভার নেই।",
    en: "A few details help Shokhi understand you better. Everything stays on this phone only — no account, no server.",
  },
  "profile.name": { bn: "নাম (ঐচ্ছিক)", en: "Name (optional)" },
  "profile.namePlaceholder": { bn: "যেমন: রিমা", en: "e.g. Rima" },
  "profile.age": { bn: "বয়স", en: "Age" },
  "profile.agePlaceholder": { bn: "যেমন: ২৪", en: "e.g. 24" },
  "profile.stage": { bn: "জীবনের ধাপ", en: "Life stage" },
  "profile.stageNone": { bn: "বলতে চাই না", en: "Prefer not to say" },
  "profile.conditions": {
    bn: "পরিচিত স্বাস্থ্য অবস্থা (যদি থাকে)",
    en: "Known health conditions (if any)",
  },
  "profile.cycleTitle": { bn: "আপনার চক্র", en: "Your cycle" },
  "profile.cycleNone": {
    bn: "ট্র্যাকারে অন্তত ২টি মাসিক লিখলে এখানে গড় চক্র দেখা যাবে।",
    en: "Log at least 2 periods in the tracker to see your average cycle here.",
  },
  "profile.goTracker": { bn: "ট্র্যাকারে যান →", en: "Go to tracker →" },
  "profile.save": { bn: "সংরক্ষণ করুন", en: "Save" },
  "profile.saved": { bn: "✓ সংরক্ষিত হয়েছে", en: "✓ Saved" },
  "profile.clear": { bn: "প্রোফাইল মুছুন", en: "Clear profile" },
  "profile.privacy": {
    bn: "🔒 আপনার প্রোফাইল শুধু এই ফোনেই থাকে, সার্ভারে জমা হয় না। যেকোনো সময় মুছে ফেলতে পারেন।",
    en: "🔒 Your profile stays on this phone only; nothing is stored on a server. You can clear it anytime.",
  },
  "profile.usedInChat": {
    bn: "এই তথ্য পরামর্শের সময় সখীকে দেওয়া হবে, যাতে সে বারবার একই প্রশ্ন না করে।",
    en: "This is shared with Shokhi during a consultation so it doesn't have to ask the same things again.",
  },

  // chat greeting when a name is saved ({name} is replaced)
  "chat.greeting": { bn: "স্বাগতম, {name}", en: "Welcome, {name}" },

  // --- wellness ------------------------------------------------------------
  "wellness.title": { bn: "সুস্থতা — চলাফেরা ও খাবার", en: "Wellness — Movement & Food" },
  "wellness.sub": {
    bn: "হরমোনের ভারসাম্যে সহায়ক হালকা ব্যায়াম ও সহজ বাংলাদেশি খাবার — আপনার মাসিক চক্র ও অবস্থা অনুযায়ী।",
    en: "Gentle movement and simple Bangladeshi food that support hormonal balance — tuned to your cycle and conditions.",
  },
  "wellness.error": { bn: "তথ্য আনা গেল না।", en: "Couldn't load this." },
  "wellness.byPhase": { bn: "🩸 মাসিক চক্র অনুযায়ী", en: "🩸 By cycle phase" },
  "wellness.forConditions": { bn: "🌼 আপনার অবস্থা অনুযায়ী", en: "🌼 For your conditions" },
  "wellness.movesTitle": { bn: "🤸 সহজ ব্যায়াম (ঘরেই করা যায়)", en: "🤸 Simple moves (do them at home)" },
  "wellness.move": { bn: "🏃 চলাফেরা", en: "🏃 Movement" },
  "wellness.food": { bn: "🥗 খাবার", en: "🥗 Food" },
  // personalized "today's tip" card (on the tracker)
  "wellness.tipTitle": { bn: "🌿 আজকের পরামর্শ", en: "🌿 Today's tip" },
  "wellness.tipPhase": {
    bn: "আপনি সম্ভবত এই পর্যায়ে আছেন:",
    en: "You're likely in this phase:",
  },
  "wellness.tipNoData": {
    bn: "মাসিক ট্র্যাকারে তারিখ লিখলে এখানে চক্র অনুযায়ী চলাফেরা ও খাবারের পরামর্শ পাবেন।",
    en: "Log a period in the tracker to get movement & food tips tailored to your cycle here.",
  },
  "wellness.seeAll": { bn: "সব পরামর্শ দেখুন →", en: "See all tips →" },
  "wellness.weekTitle": { bn: "📅 এই সপ্তাহে আপনার জন্য", en: "📅 This week for you" },
  "wellness.weekSub": {
    bn: "আপনার চক্র অনুযায়ী প্রতিদিনের হালকা চলাফেরা ও খাবারের দিকনির্দেশ।",
    en: "A gentle day-by-day movement + food focus, tuned to your cycle.",
  },
  "wellness.today": { bn: "আজ", en: "Today" },

  // --- faq -----------------------------------------------------------------
  "faq.title": { bn: "সচরাচর জিজ্ঞাসা", en: "Frequently asked questions" },
  "faq.sub": {
    bn: "সখী কী, কীভাবে কাজ করে, কতটা নিরাপদ ও গোপনীয় — সবচেয়ে বেশি জিজ্ঞাসিত প্রশ্নের সহজ উত্তর।",
    en: "What Shokhi is, how it works, and how safe and private it is — simple answers to the most common questions.",
  },
  "faq.stillTitle": { bn: "উত্তর খুঁজে পাননি?", en: "Didn't find your answer?" },
  "faq.stillBody": {
    bn: "আপনার প্রশ্নটি সরাসরি সখীকে বাংলায় জিজ্ঞাসা করুন — লিখে বা কণ্ঠে।",
    en: "Ask Shokhi your question directly in Bangla — by text or by voice.",
  },
} as const;

export type StringKey = keyof typeof STRINGS;

/** Translate one UI-chrome key into the given language. */
export function translate(lang: Lang, key: StringKey): string {
  const entry = STRINGS[key] as Entry | undefined;
  if (!entry) return key;
  return entry[lang] ?? entry.bn;
}

/**
 * Pick the right-language value from a bilingual data object (knowledge-base content
 * that carries `_bn`/`_en` fields). Falls back to the Bangla field so the UI is never
 * blank if an English translation is missing.
 */
export function pickField<T>(
  lang: Lang,
  obj: Record<string, unknown> | null | undefined,
  base: string,
): T | undefined {
  if (!obj) return undefined;
  const en = obj[`${base}_en`];
  if (lang === "en" && en != null && !(typeof en === "string" && en === "")) {
    return en as T;
  }
  return obj[`${base}_bn`] as T;
}
