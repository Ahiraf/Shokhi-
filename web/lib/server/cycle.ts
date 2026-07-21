// Menstrual cycle & symptom tracking analysis — ported from Python cycle.py.
// Pure, deterministic (no LLM): turns a logged period history into plain-language insight
// (Bangla or English) + suggested symptom flags. The insights_bn/disclaimer_bn fields
// carry the requested language (kept those names so the frontend needn't change).

type Lang = "bn" | "en";
interface Log { start?: string; end?: string; flow?: string; pain?: number; pads?: number }

const NORMAL_CYCLE_MIN = 21;
const NORMAL_CYCLE_MAX = 35;
const IRREGULAR_SPREAD = 9;
const LONG_GAP_MISSED = 90;
const HEAVY_PADS_PER_DAY = 6;

const MSG = {
  bn: {
    disclaimer: "এটি শুধু আপনার লেখা তথ্যের ভিত্তিতে একটি ধারণা — নিশ্চিত রোগ নির্ণয় নয়। কোনো দুশ্চিন্তা থাকলে ডাক্তার দেখান।",
    needTwo: "প্যাটার্ন বুঝতে অন্তত ২টি মাসিকের তারিখ লিখুন। প্রতিবার মাসিক শুরু হলে তারিখটি এখানে যোগ করুন — সখী আপনার চক্র বুঝতে সাহায্য করবে।",
    avg: (a: number) => `আপনার গড় মাসিক চক্র প্রায় ${a} দিন।`,
    duration: (d: number) => `মাসিক সাধারণত ${d} দিন স্থায়ী হয়।`,
    regular: "আপনার মাসিক মোটামুটি নিয়মিত — এটি ভালো লক্ষণ।",
    irregular: (lo: number, hi: number) => `আপনার চক্র কিছুটা অনিয়মিত (সবচেয়ে ছোট ${lo} দিন, বড় ${hi} দিন)। মাঝে মাঝে এমন হতে পারে, তবে ধারাবাহিক হলে ডাক্তার দেখান।`,
    long: "আপনার চক্র স্বাভাবিকের চেয়ে লম্বা। দীর্ঘ ও অনিয়মিত চক্র কখনো কখনো পিসিওএস-এর সাথে যুক্ত থাকে — একজন স্ত্রীরোগ বিশেষজ্ঞের সাথে আলোচনা করা ভালো।",
    short: "আপনার চক্র স্বাভাবিকের চেয়ে ছোট — একজন ডাক্তারের সাথে আলোচনা করা ভালো।",
    gap: (g: number) => `শেষ মাসিকের পর প্রায় ${g} দিন হয়ে গেছে। ৩ মাসের বেশি মাসিক বন্ধ থাকলে (গর্ভাবস্থা ছাড়া) ডাক্তার দেখানো উচিত।`,
    heavyPads: (p: number) => `আপনি দিনে প্রায় ${p}টি প্যাড ব্যবহার করছেন। দিনে ৬টির বেশি প্যাড ভিজে গেলে তা অতিরিক্ত রক্তক্ষরণ (মেনোরেজিয়া) হতে পারে — রক্তস্বল্পতা এড়াতে ডাক্তার দেখান এবং আয়রন-সমৃদ্ধ খাবার খান।`,
    heavyRepeat: "কয়েকবার ভারী রক্তক্ষরণ লিখেছেন। বারবার অতিরিক্ত রক্তক্ষরণে রক্তস্বল্পতা হতে পারে — ডাক্তার দেখান ও আয়রন-সমৃদ্ধ খাবার খান।",
    painRepeat: "কয়েকবার তীব্র ব্যথা লিখেছেন। মাসিকের তীব্র ব্যথা যা জীবন থামিয়ে দেয় তা 'স্বাভাবিক' নয় — এটি নিয়ে ডাক্তারের সাথে কথা বলুন।",
  },
  en: {
    disclaimer: "This is only an impression based on what you've logged — not a diagnosis. See a doctor if anything worries you.",
    needTwo: "Log at least 2 period dates to see a pattern. Add the date each time your period starts — Shokhi will help you understand your cycle.",
    avg: (a: number) => `Your average cycle is about ${a} days.`,
    duration: (d: number) => `Your period usually lasts about ${d} days.`,
    regular: "Your periods are fairly regular — that's a good sign.",
    irregular: (lo: number, hi: number) => `Your cycle is a bit irregular (shortest ${lo} days, longest ${hi} days). This can happen sometimes, but if it's consistent, see a doctor.`,
    long: "Your cycle is longer than usual. Long, irregular cycles are sometimes linked to PCOS — it's good to discuss this with a gynaecologist.",
    short: "Your cycle is shorter than usual — it's good to discuss this with a doctor.",
    gap: (g: number) => `About ${g} days have passed since your last period. If periods stop for more than 3 months (and you're not pregnant), you should see a doctor.`,
    heavyPads: (p: number) => `You're using about ${p} pads a day. Soaking more than 6 pads a day can mean heavy bleeding (menorrhagia) — to avoid anaemia, see a doctor and eat iron-rich foods.`,
    heavyRepeat: "You've logged heavy bleeding a few times. Repeated heavy bleeding can cause anaemia — see a doctor and eat iron-rich foods.",
    painRepeat: "You've logged severe pain a few times. Severe period pain that stops your daily life is not 'normal' — please talk to a doctor about it.",
  },
} as const;

function parseDate(s?: string): number | null {
  if (!s) return null;
  const d = new Date(s.trim().slice(0, 10));
  return Number.isNaN(d.getTime()) ? null : Math.floor(d.getTime() / 86_400_000);
}
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

export function analyze(logs: Log[], lang: Lang = "bn", todayDays?: number): any {
  const m = MSG[lang] ?? MSG.bn;
  const today = todayDays ?? Math.floor(Date.now() / 86_400_000);
  const starts = logs.map((l) => parseDate(l.start)).filter((d): d is number => d != null).sort((a, b) => a - b);

  const result: any = {
    logged_count: starts.length,
    cycle_lengths: [],
    avg_cycle_length: null,
    shortest_cycle: null,
    longest_cycle: null,
    avg_period_length: null,
    regular: null,
    predicted_next_start: null,
    days_until_next: null,
    insights_bn: [] as string[],
    suggested_symptoms: {} as Record<string, boolean>,
    disclaimer_bn: m.disclaimer,
  };

  if (starts.length < 2) {
    result.insights_bn.push(m.needTwo);
    return result;
  }

  const lengths: number[] = [];
  for (let i = 1; i < starts.length; i++) {
    const d = starts[i] - starts[i - 1];
    if (d > 0) lengths.push(d);
  }
  if (!lengths.length) return result;

  const avg = Math.round(mean(lengths));
  result.cycle_lengths = lengths;
  result.avg_cycle_length = avg;
  result.shortest_cycle = Math.min(...lengths);
  result.longest_cycle = Math.max(...lengths);

  const durations: number[] = [];
  for (const l of logs) {
    const s = parseDate(l.start);
    const e = parseDate(l.end);
    if (s != null && e != null && e >= s) durations.push(e - s + 1);
  }
  if (durations.length) result.avg_period_length = Math.round(mean(durations));

  const spread = Math.max(...lengths) - Math.min(...lengths);
  const regular = spread <= IRREGULAR_SPREAD && avg >= NORMAL_CYCLE_MIN && avg <= NORMAL_CYCLE_MAX;
  result.regular = regular;

  const predicted = starts[starts.length - 1] + avg;
  result.predicted_next_start = new Date(predicted * 86_400_000).toISOString().slice(0, 10);
  result.days_until_next = predicted - today;

  const ins: string[] = result.insights_bn;
  ins.push(m.avg(avg));
  if (result.avg_period_length) ins.push(m.duration(result.avg_period_length));

  if (regular) {
    ins.push(m.regular);
  } else {
    ins.push(m.irregular(Math.min(...lengths), Math.max(...lengths)));
    result.suggested_symptoms.cycles_irregular = true;
  }

  if (avg > NORMAL_CYCLE_MAX) {
    ins.push(m.long);
    result.suggested_symptoms.cycles_irregular = true;
  } else if (avg < NORMAL_CYCLE_MIN) {
    ins.push(m.short);
    result.suggested_symptoms.cycles_irregular = true;
  }

  const gapSinceLast = today - starts[starts.length - 1];
  if (gapSinceLast >= LONG_GAP_MISSED) {
    ins.push(m.gap(gapSinceLast));
    result.suggested_symptoms.missed_periods_3plus = true;
  }

  const pads = (l: Log) => (typeof l.pads === "number" ? l.pads : 0);
  const isHeavy = (l: Log) => String(l.flow ?? "").toLowerCase() === "heavy" || pads(l) >= HEAVY_PADS_PER_DAY;
  const maxPads = Math.floor(Math.max(0, ...logs.map(pads)));
  const heavy = logs.filter(isHeavy).length;
  const severePain = logs.filter((l) => typeof l.pain === "number" && l.pain >= 3).length;

  if (maxPads >= HEAVY_PADS_PER_DAY) {
    ins.push(m.heavyPads(maxPads));
    result.suggested_symptoms.heavy_bleeding = true;
  } else if (heavy >= 2) {
    ins.push(m.heavyRepeat);
    result.suggested_symptoms.heavy_bleeding = true;
  }
  if (severePain >= 2) {
    ins.push(m.painRepeat);
    result.suggested_symptoms.periods_disrupt_daily_life = true;
  }

  return result;
}
