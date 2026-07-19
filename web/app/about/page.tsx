import Link from "next/link";
import PageHeader from "@/components/PageHeader";

const DANGER_SIGNS = [
  "তীব্র তলপেটে ব্যথা, বিশেষত গর্ভাবস্থার সম্ভাবনা থাকলে",
  "এত রক্ত যাচ্ছে যে প্রতি ঘণ্টায় প্যাড/কাপড় ভিজে যাচ্ছে",
  "মাথা ঘোরা, অজ্ঞান হওয়া বা প্রচণ্ড দুর্বলতা",
  "গর্ভাবস্থায় রক্তক্ষরণ, তীব্র মাথাব্যথা, খিঁচুনি বা শিশুর নড়াচড়া কমে যাওয়া",
  "প্রসবের পর অতিরিক্ত রক্তক্ষরণ বা জ্বর",
  "জ্বরের সাথে তীব্র তলপেটে ব্যথা",
];

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <PageHeader
        icon="🛡️"
        title="নিরাপত্তা ও সখী সম্পর্কে"
        sub="সখী কীভাবে কাজ করে, কীভাবে নিরাপদ রাখে, এবং কখন সরাসরি হাসপাতালে যেতে হবে।"
      />

      {/* emergency */}
      <section id="emergency" className="mt-8 rounded-2xl bg-red-50 px-5 py-5 ring-1 ring-red-100">
        <h2 className="font-display text-lg font-bold text-red-700">🚨 এখনই হাসপাতালে যান যদি</h2>
        <ul className="mt-3 space-y-2">
          {DANGER_SIGNS.map((d, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-plum/80">
              <span className="text-red-500">•</span>
              {d}
            </li>
          ))}
        </ul>
        <p className="mt-4 rounded-xl bg-white/70 px-3 py-2 text-sm font-semibold text-red-700">
          জাতীয় জরুরি সেবা — ৯৯৯ · স্বাস্থ্য বাতায়ন — ১৬২৬৩
        </p>
      </section>

      {/* how safe */}
      <section className="mt-8">
        <h2 className="font-display text-xl font-bold text-plum">সখী কীভাবে নিরাপদ থাকে</h2>
        <div className="mt-4 space-y-3">
          {[
            { t: "নিয়ম আগে, AI পরে", d: "জরুরি সিদ্ধান্ত (এটি কি বিপদ?) সবসময় নির্দিষ্ট চিকিৎসা-নিয়ম দিয়ে নেওয়া হয় — AI-এর অনুমানে নয়। তাই সখী কখনো ভুল করে কোনো জরুরি অবস্থাকে হালকা করে দেখে না।" },
            { t: "Gemma 4 ভাষা বোঝে", d: "সখীর 'মস্তিষ্ক' Gemma 4 — এটি আপনার এলোমেলো বাংলা কথা বোঝে এবং উষ্ণ, সহজ ভাষায় উত্তর দেয়।" },
            { t: "ডাক্তার নয়, বন্ধু", d: "সখী প্রাথমিক ধারণা ও নিরাপদ পরামর্শ দেয়; নিশ্চিত রোগ নির্ণয় সবসময় একজন ডাক্তারই করেন।" },
            { t: "গোপনীয়", d: "আপনার ট্র্যাকারের তথ্য শুধু আপনার ফোনেই থাকে, সার্ভারে জমা হয় না।" },
          ].map((x) => (
            <div key={x.t} className="rounded-2xl bg-white/80 px-4 py-3.5 ring-1 ring-rose-soft">
              <p className="text-sm font-bold text-plum">{x.t}</p>
              <p className="mt-1 text-sm leading-relaxed text-plum/65">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* mission */}
      <section className="mt-8 rounded-2xl bg-blush/60 px-5 py-5">
        <h2 className="font-display text-lg font-bold text-plum">সখী কার জন্য</h2>
        <p className="mt-2 text-sm leading-relaxed text-plum/70">
          শহরের কিশোরী থেকে গ্রামের নারী — যাঁরা হয়তো পড়তে পারেন না, তাঁদের জন্যও। লিখে,
          কণ্ঠে বা ফোনে — যেভাবে সহজ, সেভাবেই সখীর সাথে কথা বলা যায়।
        </p>
        <Link
          href="/chat"
          className="mt-4 inline-block rounded-full bg-rose px-5 py-2 text-sm font-semibold text-white"
        >
          সখীর সাথে কথা বলুন
        </Link>
      </section>
    </main>
  );
}
