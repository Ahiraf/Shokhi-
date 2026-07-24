"use client";

import { useEffect, useRef, useState } from "react";
import { sendMessage, sendMessageStream, explainGuide } from "@/lib/api";
import type { ChatItem } from "@/lib/types";
import Message from "@/components/Message";
import Composer from "@/components/Composer";
import Examples from "@/components/Examples";
import Guides from "@/components/Guides";
import Mascot3D from "@/components/Mascot3D";
import LogoMark from "@/components/LogoMark";
import { useLang } from "@/components/LanguageProvider";
import { loadProfile, toChatProfile } from "@/lib/profile";

export default function ChatPage() {
  const { t, lang } = useLang();
  const [chat, setChat] = useState<ChatItem[]>([]);
  const [profile, setProfile] = useState<Record<string, unknown>>({});
  const [history, setHistory] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // seed the symptom profile + greeting from the saved local profile (if any)
  useEffect(() => {
    const saved = loadProfile();
    setProfile(toChatProfile(saved));
    if (saved.name) setName(saved.name);
  }, []);

  // Auto-scroll the MESSAGE PANEL only (not the whole window) so sending a message never
  // jumps the page down — the header + composer stay fixed like a normal chatbot.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [chat, busy]);

  async function handleSend(text: string) {
    setBusy(true);
    let streamStarted = false;
    setChat((c) => [...c, { role: "user", text }]);
    setHistory((h) => [...h, text]);
    try {
      // Stream the reply so it appears live. Append a placeholder assistant bubble, then
      // grow its text as tokens arrive and attach the triage payload from the meta event.
      setChat((c) => [...c, { role: "assistant", text: "" }]);
      await sendMessageStream(text, profile, history, lang, {
        onMeta: (m) => {
          streamStarted = true;
          setProfile(m.profile);
          setChat((c) => {
            const next = [...c];
            next[next.length - 1] = { ...next[next.length - 1], data: { ...m } as any };
            return next;
          });
        },
        onDelta: (chunk) => {
          streamStarted = true;
          setChat((c) => {
            const next = [...c];
            const last = next[next.length - 1];
            next[next.length - 1] = { ...last, text: last.text + chunk };
            return next;
          });
        },
      });
    } catch {
      // Streaming unavailable (proxy buffering, older client) — fall back to one-shot call.
      if (streamStarted) {
        setChat((c) => {
          const next = [...c];
          next[next.length - 1] = { role: "assistant", text: t("chat.errorConnect") };
          return next;
        });
        return;
      }
      try {
        const res = await sendMessage(text, profile, history, lang);
        setProfile(res.profile);
        setChat((c) => {
          const next = [...c];
          next[next.length - 1] = { role: "assistant", text: res.guidance, data: res };
          return next;
        });
      } catch {
        setChat((c) => {
          const next = [...c];
          next[next.length - 1] = { role: "assistant", text: t("chat.errorConnect") };
          return next;
        });
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleGuide(topic: string) {
    setBusy(true);
    try {
      const res = await explainGuide(topic, lang);
      const title = lang === "en" ? res.guide.title_en || res.guide.title_bn : res.guide.title_bn;
      setChat((c) => [
        ...c,
        { role: "user", text: `${res.guide.icon} ${title}` },
        { role: "assistant", text: res.guidance },
      ]);
    } catch {
      setChat((c) => [...c, { role: "assistant", text: t("chat.errorFetch") }]);
    } finally {
      setBusy(false);
    }
  }

  const started = chat.length > 0;

  return (
    <main className="mx-auto max-w-2xl px-5">
      {!started && (
        <section className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center py-10 text-center">
          {/* Sitting pose cropped to head→seat with a soft bottom fade, so she appears
              seated on the heading (the full figure's dangling legs looked awkward). */}
          <div
            className="animate-float overflow-hidden"
            style={{
              width: 200,
              height: 210,
              WebkitMaskImage: "linear-gradient(to bottom, #000 78%, transparent 98%)",
              maskImage: "linear-gradient(to bottom, #000 78%, transparent 98%)",
            }}
          >
            <Mascot3D variant="chat" size={200} />
          </div>
          {name && (
            <p className="-mt-1 text-sm font-semibold text-rose">
              {t("chat.greeting").replace("{name}", name)} 🌸
            </p>
          )}
          <h1 className="mt-1.5 font-display text-[26px] font-bold leading-tight text-plum">
            {t("chat.introTitle")}
          </h1>
          <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-plum/60">
            {t("chat.introDesc")}
          </p>

          <div className="mt-7 w-full">
            <Composer onSend={handleSend} busy={busy} />
          </div>

          <div className="mt-8 w-full">
            <p className="mb-2.5 text-xs font-semibold text-plum/45">{t("chat.startWith")}</p>
            <Examples onPick={handleSend} />
          </div>
          <div className="mt-5 w-full">
            <p className="mb-2.5 text-xs font-semibold text-plum/45">{t("chat.orLearn")}</p>
            <Guides onPick={handleGuide} />
          </div>
        </section>
      )}

      {started && (
        // Fixed-height chat panel: header + scrollable messages + composer. Nothing here
        // scrolls the window, so the view stays put on the conversation.
        <div className="flex h-[calc(100vh-6rem)] flex-col">
          {/* header — the Shokhi mascot stays visible the whole conversation */}
          <header className="flex items-center gap-3 border-b border-rose-soft/60 py-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-rose-mist ring-1 ring-rose-soft">
              {/* dedicated square face crop (mascot-3d-avatar.png) so the circle frames her face */}
              <Mascot3D variant="avatar" size={48} fit="cover" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-[15px] font-bold leading-tight text-plum">
                {t("chat.headerTitle")}
              </p>
              <p className="truncate text-xs text-plum/55">
                {name ? t("chat.greeting").replace("{name}", name) + " 🌸" : t("chat.headerSubtitle")}
              </p>
            </div>
            <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-rose/70">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> {t("chat.online")}
            </span>
          </header>

          {/* messages — this panel scrolls internally */}
          <section ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto py-5">
            {chat.map((item, i) =>
              // hide the empty assistant placeholder while streaming — the "thinking"
              // indicator below covers that wait; the bubble appears once the first token lands
              item.role === "assistant" && item.text === "" ? null : <Message key={i} item={item} />
            )}
            {busy && (
              <div className="flex items-center gap-2.5 pl-1 text-plum/50">
                <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full ring-1 ring-rose-soft">
                  <LogoMark size={36} />
                </span>
                <span className="animate-pulse">{t("chat.thinking")}</span>
              </div>
            )}
          </section>

          {/* composer pinned at the bottom of the panel */}
          <div className="border-t border-rose-soft/60 bg-cream/80 pb-4 pt-3">
            <div className="mb-3">
              <Examples onPick={handleSend} />
            </div>
            <Composer onSend={handleSend} busy={busy} />
            <p className="mt-2.5 text-center text-xs text-plum/45">{t("chat.privacyLine")}</p>
          </div>
        </div>
      )}
    </main>
  );
}
