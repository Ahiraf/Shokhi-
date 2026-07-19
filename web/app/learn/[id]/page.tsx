"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getKnowledge } from "@/lib/api";
import type { Condition } from "@/lib/types";

const URGENCY_TAG: Record<string, { label: string; cls: string }> = {
  emergency: { label: "🚨 জরুরি — এখনই হাসপাতালে যান", cls: "bg-red-100 text-red-700" },
  see_doctor_soon: { label: "🩺 শীঘ্রই ডাক্তার দেখান", cls: "bg-amber-100 text-amber-800" },
  self_care: { label: "🌿 ঘরোয়া যত্ন সাধারণত যথেষ্ট", cls: "bg-sage-soft text-sage-deep" },
  info: { label: "💬 সাধারণ তথ্য", cls: "bg-blush text-rose-deep" },
};

export default function ConditionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [cond, setCond] = useState<Condition | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    getKnowledge()
      .then((k) => {
        const c = k.conditions.find((x) => x.id === id) || null;
        setCond(c);
        setStatus(c ? "ok" : "error");
      })
      .catch(() => setStatus("error"));
  }, [id]);

  const tag = cond ? URGENCY_TAG[cond.urgency ?? "info"] ?? URGENCY_TAG.info : null;

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <Link href="/learn" className="text-sm font-semibold text-rose hover:underline">
        ← সব বিষয়
      </Link>

      {status === "loading" && <p className="mt-8 text-plum/50">লোড হচ্ছে…</p>}
      {status === "error" && <p className="mt-8 text-plum/50">এই বিষয়টি পাওয়া গেল না।</p>}

      {cond && (
        <article className="mt-4">
          <h1 className="font-display text-2xl font-bold leading-tight text-plum">
            {cond.name_bn}
          </h1>
          {cond.name_en && <p className="mt-1 text-sm text-plum/45">{cond.name_en}</p>}
          {tag && (
            <span className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-semibold ${tag.cls}`}>
              {tag.label}
            </span>
          )}

          <p className="mt-5 text-[15px] leading-relaxed text-plum/75">{cond.about_bn}</p>

          {cond.self_care_bn?.length > 0 && (
            <div className="mt-6">
              <h2 className="font-display text-lg font-bold text-plum">🌸 যা করতে পারেন</h2>
              <ul className="mt-3 space-y-2">
                {cond.self_care_bn.map((s, i) => (
                  <li
                    key={i}
                    className="flex gap-2.5 rounded-xl bg-white/80 px-4 py-2.5 text-sm text-plum/80 ring-1 ring-rose-soft"
                  >
                    <span className="text-rose">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {cond.see_doctor_bn && (
            <div className="mt-6 rounded-2xl bg-sage-soft px-4 py-3.5">
              <p className="text-sm font-semibold text-sage-deep">🩺 কখন ডাক্তার দেখাবেন</p>
              <p className="mt-1 text-sm leading-relaxed text-plum/75">{cond.see_doctor_bn}</p>
            </div>
          )}

          <div className="mt-8 rounded-2xl bg-blush/70 px-4 py-4 text-center">
            <p className="text-sm text-plum/70">আপনার এই উপসর্গ আছে বলে মনে হচ্ছে?</p>
            <Link
              href="/chat"
              className="mt-2 inline-block rounded-full bg-rose px-5 py-2 text-sm font-semibold text-white"
            >
              সখীর সাথে যাচাই করুন
            </Link>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-plum/45">
            ℹ️ এটি সাধারণ তথ্য, নিশ্চিত রোগ নির্ণয় নয় — একজন ডাক্তারের পরামর্শ নিন।
          </p>
        </article>
      )}
    </main>
  );
}
