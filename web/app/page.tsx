"use client";

import { useEffect, useRef, useState } from "react";
import { sendMessage, explainGuide } from "@/lib/api";
import type { ChatItem } from "@/lib/types";
import Message from "@/components/Message";
import Composer from "@/components/Composer";
import Examples from "@/components/Examples";
import Guides from "@/components/Guides";
import CycleTracker from "@/components/CycleTracker";
import PadReminder from "@/components/PadReminder";
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
    <main className="mx-auto flex min-h-screen max-w-xl flex-col px-5">
      {/* brand row */}
      <header className="flex items-center justify-between pt-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-blush ring-1 ring-rose-soft">
            <Mascot size={38} />
          </span>
          <div className="leading-none">
            <h1 className="font-display text-xl font-bold text-plum">সখী</h1>
            <p className="mt-1 text-[11px] text-plum/55">আপনার স্বাস্থ্য বন্ধু</p>
          </div>
        </div>
        <span className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-medium text-plum/50 ring-1 ring-rose-soft">
          Gemma 4
        </span>
      </header>

      {/* segmented tabs */}
      <div className="mt-5 flex gap-1 rounded-full bg-white/70 p-1 ring-1 ring-rose-soft">
        {([
          ["chat", "💬 পরামর্শ"],
          ["tracker", "🩸 ট্র্যাকার"],
        ] as const).map(([v, label]) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
              view === v
                ? "bg-rose text-white shadow-lift"
                : "text-plum/55 hover:text-plum"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === "tracker" && (
        <div className="pb-8">
          <CycleTracker />
          <PadReminder />
        </div>
      )}

      {/* landing — one calm column: greeting, the input front-and-centre, a few starters */}
      {view === "chat" && !started && (
        <section className="flex flex-1 flex-col items-center justify-center py-10 text-center">
          <div className="animate-float">
            <Mascot size={92} />
          </div>
          <h2 className="mt-5 font-display text-[26px] font-bold leading-tight text-plum">
            আপনার শরীরের কথা বলুন
          </h2>
          <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-plum/60">
            বাংলায় লিখুন বা কণ্ঠে বলুন — আমি বুঝব ও নিরাপদ পরামর্শ দেব।
            সব কথা গোপন থাকবে, লজ্জার কিছু নেই।
          </p>

          <div className="mt-7 w-full">
            <Composer onSend={handleSend} busy={busy} />
          </div>

          <div className="mt-8 w-full">
            <p className="mb-2.5 text-xs font-semibold text-plum/45">এভাবে শুরু করতে পারেন</p>
            <Examples onPick={handleSend} />
          </div>
          <div className="mt-5 w-full">
            <p className="mb-2.5 text-xs font-semibold text-plum/45">অথবা একটি বিষয়ে জানুন</p>
            <Guides onPick={handleGuide} />
          </div>

          <p className="mt-9 text-xs text-plum/40">
            🔒 গোপনীয় · ☎️ ১৬২৬৩ · 🚨 জরুরি ৯৯৯
          </p>
        </section>
      )}

      {/* conversation */}
      {view === "chat" && started && (
        <>
          <section className="flex-1 space-y-4 py-6">
            {chat.map((item, i) => (
              <Message key={i} item={item} />
            ))}
            {busy && (
              <div className="flex items-center gap-2.5 pl-1 text-plum/50">
                <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-blush ring-1 ring-rose-soft">
                  <Mascot size={34} />
                </span>
                <span className="animate-pulse">সখী ভাবছে…</span>
              </div>
            )}
            <div ref={endRef} />
          </section>

          <div className="sticky bottom-0 -mx-5 bg-gradient-to-t from-cream via-cream/95 to-transparent px-5 pb-5 pt-3">
            <div className="mb-3">
              <Examples onPick={handleSend} />
            </div>
            <Composer onSend={handleSend} busy={busy} />
            <p className="mt-2.5 text-center text-xs text-plum/45">
              🔒 বিনামূল্যে ও গোপনীয় · ☎️ ১৬২৬৩ · 🚨 জরুরি ৯৯৯
            </p>
          </div>
        </>
      )}
    </main>
  );
}
