import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import Mascot from "@/components/Mascot";

const STEPS = [
  { icon: "📞", title: "ফোন করুন", desc: "সখীর হটলাইন নম্বরে সাধারণ ফোন থেকে কল করুন — স্মার্টফোন লাগবে না।" },
  { icon: "🗣️", title: "বাংলায় বলুন", desc: "বিপ শব্দের পর আপনার সমস্যাটি বাংলায় বলুন, ঠিক যেমন কাউকে বলতেন।" },
  { icon: "👂", title: "পরামর্শ শুনুন", desc: "সখী আপনার কথা বুঝে বাংলায় নিরাপদ পরামর্শ শোনাবে — পড়তে হবে না।" },
];

export default function HotlinePage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <PageHeader
        icon="☎️"
        title="ভয়েস হটলাইন"
        sub="যাঁরা পড়তে পারেন না বা যাঁদের স্মার্টফোন নেই — তাঁদের জন্য। ফোন করে বাংলায় বলুন, পরামর্শ শুনুন।"
      />

      <div className="mt-8 flex flex-col items-center gap-5 rounded-3xl bg-gradient-to-br from-plum to-plum-deep px-6 py-8 text-center text-white sm:flex-row sm:text-left">
        <div className="shrink-0 rounded-full bg-white/10 p-3">
          <Mascot size={84} />
        </div>
        <div>
          <p className="text-sm text-white/70">যেকোনো সাধারণ ফোন থেকে</p>
          <p className="font-display text-2xl font-bold">সখী হটলাইন</p>
          <p className="mt-1 text-sm text-white/80">
            একই সখী, একই নিরাপদ পরামর্শ — এবার শুধু কণ্ঠে। কোনো অ্যাপ নেই, পড়া নেই।
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.title} className="rounded-2xl bg-white/80 p-5 text-center ring-1 ring-rose-soft">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blush text-2xl">
              {s.icon}
            </div>
            <h3 className="mt-3 font-display text-base font-bold text-plum">{s.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-plum/60">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-apricot-soft px-5 py-4">
        <p className="text-sm leading-relaxed text-plum/75">
          🛠️ হটলাইনটি একই ব্যাকএন্ডে তৈরি (Twilio/Exotel সমর্থিত): কল রেকর্ড করে Gemma 4-এর
          নিজস্ব অডিও দিয়ে বাংলা বোঝা হয়, একই নিয়ম-ভিত্তিক যাচাই চলে, তারপর বাংলায় উত্তর
          শোনানো হয়। প্রতিটি ধাপে নিরাপদ ফলব্যাক আছে — কল কখনো আটকে যায় না।
        </p>
      </div>

      <div className="mt-8 rounded-2xl bg-white/80 px-5 py-4 text-center ring-1 ring-rose-soft">
        <p className="text-sm font-semibold text-rose-deep">🚨 এখনই জরুরি প্রয়োজন?</p>
        <p className="mt-1 text-sm text-plum/70">
          জাতীয় জরুরি সেবা <b>৯৯৯</b> · স্বাস্থ্য বাতায়ন <b>১৬২৬৩</b>
        </p>
      </div>

      <div className="mt-8 text-center">
        <Link href="/chat" className="text-sm font-semibold text-rose hover:underline">
          এখন লিখে পরামর্শ নিতে চান? → পরামর্শে যান
        </Link>
      </div>
    </main>
  );
}
