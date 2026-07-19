"use client";

import { useEffect, useRef, useState } from "react";
import { sendMessage, explainGuide } from "@/lib/api";
import type { ChatItem } from "@/lib/types";
import Message from "@/components/Message";
import Composer from "@/components/Composer";
import Examples from "@/components/Examples";
import Guides from "@/components/Guides";
import CycleTracker from "@/components/CycleTracker";
import Mascot from "@/components/Mascot";

export default function Home() {
  const [chat, setChat] = useState<ChatItem[]>([]);
  const [profile, setProfile] = useState<Record<string, unknown>>({});
  const [history, setHistory] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<"chat" | "tracker">("chat");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, busy]);

  async function handleSend(text: string) {
    setBusy(true);
    setChat((c) => [...c, { role: "user", text }]);
    try {
      const res = await sendMessage(text, profile, history);
      setProfile(res.profile);
      setHistory((h) => [...h, text]);
      setChat((c) => [...c, { role: "assistant", text: res.guidance, data: res }]);
    } catch {
      setChat((c) => [
        ...c,
        {
          role: "assistant",
          text: "দুঃখিত, সার্ভারের সাথে সংযোগ করা গেল না। ব্যাকএন্ড চালু আছে কিনা দেখুন।",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  async function handleGuide(topic: string) {
    setBusy(true);
    try {
      const res = await explainGuide(topic);
      setChat((c) => [
        ...c,
        { role: "user", text: `${res.guide.icon} ${res.guide.title_bn}` },
        { role: "assistant", text: res.guidance },
      ]);
    } catch {
      setChat((c) => [
        ...c,
        {
          role: "assistant",
          text: "দুঃখিত, এই মুহূর্তে তথ্যটি আনা গেল না। ব্যাকএন্ড চালু আছে কিনা দেখুন।",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  const started = chat.length > 0;

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-4">
      {/* brand row */}
      <header className="flex items-center justify-between pt-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-plum shadow-lift">
            <Mascot size={40} />
          </span>
          <div className="leading-none">
            <h1 className="font-display text-2xl font-bold text-plum">সখী</h1>
            <p className="mt-0.5 text-xs text-plum/60">আপনার বিশ্বস্ত স্বাস্থ্য বন্ধু</p>
          </div>
        </div>
        <span className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-medium text-plum/60 ring-1 ring-rose-100">
          Gemma 4
        </span>
      </header>

      {/* segmented tabs */}
      <div className="mt-5 grid grid-cols-2 gap-1 rounded-full bg-white p-1 shadow-soft ring-1 ring-rose-100">
        {([
          ["chat", "💬 পরামর্শ"],
          ["tracker", "🩸 মাসিক ট্র্যাকার"],
        ] as const).map(([v, label]) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`rounded-full py-2 text-sm font-semibold transition ${
              view === v
                ? "bg-gradient-to-br from-rose to-rose-deep text-white shadow-lift"
                : "text-plum/60 hover:text-plum"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === "tracker" && <CycleTracker />}

      {/* hero (only before first message) */}
      {view === "chat" && !started && (
        <section className="mt-6">
          {/* welcome card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-plum to-plum-deep p-6 text-white shadow-card">
            <div className="pointer-events-none absolute -right-6 -top-8 h-32 w-32 rounded-full bg-rose/20 blur-2xl" />
            <div className="relative flex items-center gap-4">
              <div className="shrink-0 animate-float">
                <Mascot size={104} wave />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold leading-tight">
                  নমস্কার! আমি সখী।
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-white/80">
                  আপনার শরীর কেমন লাগছে বাংলায় বলুন বা লিখুন — আমি বুঝব ও নিরাপদ
                  পরামর্শ দেব। লজ্জার কিছু নেই, সব কথা গোপন থাকবে।
                </p>
              </div>
            </div>
            <div className="relative mt-4 flex flex-wrap gap-1.5 text-[11px] font-medium">
              {["🔒 গোপনীয়", "☎️ স্বাস্থ্য বাতায়ন ১৬২৬৩", "🚨 জরুরি ৯৯৯"].map((t) => (
                <span key={t} className="rounded-full bg-white/12 px-2.5 py-1 text-white/85">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* what she can help with */}
          <div className="mt-5 flex flex-wrap justify-center gap-1.5">
            {["মাসিক", "পিসিওএস", "পিএমএস", "এন্ডোমেট্রিওসিস", "গর্ভকাল", "মেনোপজ"].map(
              (t) => (
                <span
                  key={t}
                  className="rounded-full bg-blush px-3 py-1 text-xs font-medium text-rose-deep ring-1 ring-rose-100"
                >
                  {t}
                </span>
              )
            )}
          </div>

          <div className="mt-7">
            <p className="mb-2.5 text-center text-sm font-semibold text-plum/60">
              একটি উদাহরণ দিয়ে শুরু করুন
            </p>
            <Examples onPick={handleSend} />
          </div>
          <div className="mt-6">
            <p className="mb-2.5 text-center text-sm font-semibold text-plum/60">
              অথবা একটি বিষয়ে জানুন
            </p>
            <Guides onPick={handleGuide} />
          </div>
        </section>
      )}

      {/* chat */}
      {view === "chat" && (
      <>
      <section className="flex-1 space-y-4 py-6">
        {chat.map((item, i) => (
          <Message key={i} item={item} />
        ))}
        {busy && (
          <div className="flex items-center gap-2.5 pl-1 text-plum/50">
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-plum">
              <Mascot size={34} />
            </span>
            <span className="animate-pulse">সখী ভাবছে…</span>
          </div>
        )}
        <div ref={endRef} />
      </section>

      {/* composer */}
      <div className="sticky bottom-0 -mx-4 bg-gradient-to-t from-cream via-cream/95 to-transparent px-4 pb-5 pt-3">
        {started && (
          <div className="mb-3">
            <Examples onPick={handleSend} />
          </div>
        )}
        <Composer onSend={handleSend} busy={busy} />
        <p className="mt-2.5 text-center text-xs text-plum/45">
          🔒 বিনামূল্যে ও গোপনীয় · ☎️ স্বাস্থ্য বাতায়ন ১৬২৬৩ · 🚨 জরুরি ৯৯৯
        </p>
      </div>
      </>
      )}
    </main>
  );
}
