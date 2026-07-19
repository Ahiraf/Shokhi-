"use client";

import { useEffect, useRef, useState } from "react";
import { sendMessage, explainGuide } from "@/lib/api";
import type { ChatItem } from "@/lib/types";
import Message from "@/components/Message";
import Composer from "@/components/Composer";
import Examples from "@/components/Examples";
import Guides from "@/components/Guides";
import CycleTracker from "@/components/CycleTracker";

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
      {/* header */}
      <header className="pt-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-rose-deep">🌸 সখী</h1>
        <p className="mt-1 text-rose-deep/70">আপনার স্বাস্থ্য বন্ধু</p>
        <div className="mt-3 flex flex-wrap justify-center gap-1.5 text-xs">
          {["মাসিক", "পিসিওএস", "পিএমএস", "এন্ডোমেট্রিওসিস", "Powered by Gemma 4"].map(
            (t) => (
              <span
                key={t}
                className="rounded-full bg-rose-soft px-2.5 py-1 font-medium text-rose-deep"
              >
                {t}
              </span>
            )
          )}
        </div>
      </header>

      {/* view tabs */}
      <div className="mt-4 flex justify-center gap-2">
        {([
          ["chat", "💬 পরামর্শ"],
          ["tracker", "🩸 মাসিক ট্র্যাকার"],
        ] as const).map(([v, label]) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              view === v
                ? "bg-rose-deep text-white"
                : "bg-rose-soft text-rose-deep hover:bg-rose-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === "tracker" && <CycleTracker />}

      {/* hero (only before first message) */}
      {view === "chat" && !started && (
        <section className="mt-10 text-center">
          <p className="mx-auto max-w-md text-lg leading-relaxed text-rose-deep/80">
            শহরের কিশোরী থেকে গ্রামের নারী — সবার জন্য। বাংলায় লিখুন বা কণ্ঠে বলুন,
            সখী আপনাকে বুঝবে এবং নিরাপদ পরামর্শ দেবে।
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm text-rose-deep/50">
            সখী ডাক্তার নয়, একজন বন্ধু। জরুরি অবস্থায় সবসময় ৯৯৯।
          </p>
          <div className="mt-8">
            <p className="mb-3 text-sm font-medium text-rose-deep/60">
              একটি উদাহরণ দিয়ে শুরু করুন
            </p>
            <Examples onPick={handleSend} />
          </div>
          <div className="mt-6">
            <p className="mb-3 text-sm font-medium text-rose-deep/60">
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
          <div className="flex items-center gap-2.5 pl-1 text-rose-deep/50">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-soft">
              🌸
            </div>
            <span className="animate-pulse">সখী ভাবছে…</span>
          </div>
        )}
        <div ref={endRef} />
      </section>

      {/* composer */}
      <div className="sticky bottom-0 -mx-4 bg-gradient-to-t from-white via-white/95 to-transparent px-4 pb-5 pt-3">
        {started && (
          <div className="mb-3">
            <Examples onPick={handleSend} />
          </div>
        )}
        <Composer onSend={handleSend} busy={busy} />
        <p className="mt-2.5 text-center text-xs text-rose-deep/45">
          🔒 বিনামূল্যে ও গোপনীয় · ☎️ স্বাস্থ্য বাতায়ন ১৬২৬৩ · 🚨 জরুরি ৯৯৯
        </p>
      </div>
      </>
      )}
    </main>
  );
}
