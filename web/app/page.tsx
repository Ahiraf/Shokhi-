import Link from "next/link";
import Mascot from "@/components/Mascot";
import FeatureCard from "@/components/FeatureCard";
import { FEATURES } from "@/lib/features";

const CONDITIONS = [
  "মাসিক", "পিসিওএস", "পিএমএস", "এন্ডোমেট্রিওসিস", "গর্ভকাল",
  "প্রসব-পরবর্তী", "মেনোপজ", "ইউটিআই", "রক্তস্বল্পতা", "সংক্রমণ",
];

const STEPS = [
  { n: "১", icon: "🗣️", title: "আপনি বলুন", desc: "বাংলায় লিখুন বা কণ্ঠে বলুন কেমন লাগছে।" },
  { n: "২", icon: "🛡️", title: "নিরাপদে যাচাই", desc: "নিয়ম-ভিত্তিক ইঞ্জিন বিপদচিহ্ন যাচাই করে — কখনো ভুল করে না।" },
  { n: "৩", icon: "🌸", title: "উষ্ণ পরামর্শ", desc: "সহজ বাংলায় বোঝানো হয়, সবসময় ডাক্তারের পরামর্শসহ।" },
];

export default function Home() {
  return (
    <main>
      {/* hero */}
      <section className="mx-auto max-w-5xl px-5 pt-10 pb-4 sm:pt-16">
        <div className="grid items-center gap-8 sm:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-plum/60 ring-1 ring-rose-soft">
              🌸 Gemma 4 · বাংলা · গোপনীয়
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-plum sm:text-5xl">
              নারীর বিশ্বস্ত<br />স্বাস্থ্য বন্ধু
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-plum/65">
              মাসিক, পিসিওএস, গর্ভকাল থেকে মেনোপজ — শহরের কিশোরী থেকে গ্রামের নারী,
              সবার জন্য। বাংলায় বলুন, সখী বুঝবে ও নিরাপদ পরামর্শ দেবে।
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/chat"
                className="rounded-full bg-rose px-6 py-3 font-semibold text-white shadow-lift transition hover:brightness-105"
              >
                পরামর্শ শুরু করুন
              </Link>
              <Link
                href="/guides"
                className="rounded-full bg-white px-6 py-3 font-semibold text-plum ring-1 ring-rose-soft transition hover:bg-blush"
              >
                গাইড দেখুন
              </Link>
            </div>
          </div>

          <div className="order-first flex justify-center sm:order-none">
            <div className="animate-float rounded-full bg-white/60 p-4 ring-1 ring-rose-soft">
              <Mascot size={180} />
            </div>
          </div>
        </div>
      </section>

      {/* feature grid */}
      <section className="mx-auto max-w-5xl px-5 py-12">
        <h2 className="text-center font-display text-2xl font-bold text-plum">
          সখী যেভাবে পাশে থাকে
        </h2>
        <p className="mt-1.5 text-center text-sm text-plum/55">
          প্রতিটি সেবার আলাদা পাতা — যেটি দরকার সেটিতে যান
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} feature={f} />
          ))}
        </div>
      </section>

      {/* conditions covered */}
      <section className="mx-auto max-w-5xl px-5 py-8">
        <div className="rounded-3xl bg-gradient-to-br from-plum to-plum-deep px-6 py-10 text-center text-white">
          <h2 className="font-display text-2xl font-bold">কী কী নিয়ে সাহায্য করে</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/70">
            একজন নারীর পুরো প্রজনন-জীবন জুড়ে — প্রথম মাসিক থেকে মেনোপজ পর্যন্ত।
          </p>
          <div className="mx-auto mt-6 flex max-w-2xl flex-wrap justify-center gap-2">
            {CONDITIONS.map((c) => (
              <span
                key={c}
                className="rounded-full bg-white/12 px-3.5 py-1.5 text-sm font-medium text-white/90"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* how it works */}
      <section className="mx-auto max-w-5xl px-5 py-12">
        <h2 className="text-center font-display text-2xl font-bold text-plum">
          কীভাবে কাজ করে
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl bg-white/80 p-6 text-center ring-1 ring-rose-soft">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blush text-2xl">
                {s.icon}
              </div>
              <h3 className="mt-3 font-display text-lg font-bold text-plum">
                <span className="text-rose">{s.n}.</span> {s.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-plum/60">{s.desc}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-lg text-center text-xs text-plum/45">
          🛡️ জরুরি সিদ্ধান্ত সবসময় নির্দিষ্ট নিয়ম দিয়ে নেওয়া হয়, AI-এর অনুমানে নয় —
          তাই সখী কখনো কোনো জরুরি অবস্থাকে হালকা করে দেখে না।
        </p>
      </section>

      {/* hotline CTA */}
      <section className="mx-auto max-w-5xl px-5 pb-4">
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-sage-soft px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="font-display text-xl font-bold text-plum">
              ☎️ পড়তে পারেন না? ফোন করুন।
            </h2>
            <p className="mt-1 max-w-md text-sm text-plum/65">
              স্মার্টফোন বা লেখাপড়া ছাড়াই — ভয়েস হটলাইনে বাংলায় বলুন, পরামর্শ শুনুন।
            </p>
          </div>
          <Link
            href="/hotline"
            className="shrink-0 rounded-full bg-sage-deep px-6 py-3 font-semibold text-white transition hover:brightness-105"
          >
            হটলাইন সম্পর্কে
          </Link>
        </div>
      </section>
    </main>
  );
}
