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
  const endRef = useRef<HTMLDivElement>(null);

  // seed the symptom profile + greeting from the saved local profile (if any)
  useEffect(() => {
    const saved = loadProfile();
    setProfile(toChatProfile(saved));
    if (saved.name) setName(saved.name);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, busy]);

  async function handleSend(text: string) {
    setBusy(true);
    setChat((c) => [...c, { role: "user", text }]);
    setHistory((h) => [...h, text]);
    try {
      // Stream the reply so it appears live. Append a placeholder assistant bubble, then
      // grow its text as tokens arrive and attach the triage payload from the meta event.
      setChat((c) => [...c, { role: "assistant", text: "" }]);
      await sendMessageStream(text, profile, history, lang, {
        onMeta: (m) => {
          setProfile(m.profile);
          setChat((c) => {
            const next = [...c];
            next[next.length - 1] = { ...next[next.length - 1], data: { ...m } as any };
            return next;
          });
        },
        onDelta: (chunk) => {
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
    <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-2xl flex-col px-5">
      {!started && (
        <section className="flex flex-1 flex-col items-center justify-center py-10 text-center">
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
        <>
          <section className="flex-1 space-y-4 py-6">
            {chat.map((item, i) => (
              <Message key={i} item={item} />
            ))}
            {busy && (
              <div className="flex items-center gap-2.5 pl-1 text-plum/50">
                <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full ring-1 ring-rose-soft">
                  <LogoMark size={36} />
                </span>
                <span className="animate-pulse">{t("chat.thinking")}</span>
              </div>
            )}
            <div ref={endRef} />
          </section>

          <div className="sticky bottom-0 -mx-5 bg-gradient-to-t from-cream via-cream/95 to-transparent px-5 pb-5 pt-3">
            <div className="mb-3">
              <Examples onPick={handleSend} />
            </div>
            <Composer onSend={handleSend} busy={busy} />
            <p className="mt-2.5 text-center text-xs text-plum/45">{t("chat.privacyLine")}</p>
          </div>
        </>
      )}
    </main>
  );
}
