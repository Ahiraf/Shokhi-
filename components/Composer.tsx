"use client";

import { useRef, useState } from "react";
import { useLang } from "./LanguageProvider";

// Minimal typing for the Web Speech API (not in the DOM lib types).
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
};

export default function Composer({
  onSend,
  busy,
}: {
  onSend: (text: string) => void;
  busy: boolean;
}) {
  const { t, lang } = useLang();
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);

  // Web Speech API (primary — runs in the browser, no backend/key needed)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const baseTextRef = useRef("");

  function submit() {
    const val = text.trim();
    if (!val || busy) return;
    onSend(val);
    setText("");
  }

  function getSpeechRecognition(): SpeechRecognitionLike | null {
    if (typeof window === "undefined") return null;
    const Ctor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    return Ctor ? (new Ctor() as SpeechRecognitionLike) : null;
  }

  // One-time privacy consent: browser speech recognition can send audio to a third
  // party (e.g. Google in Chrome). We disclose this and remember the choice locally.
  const CONSENT_KEY = "shokhi.voiceConsent";
  function hasVoiceConsent(): boolean {
    try {
      if (localStorage.getItem(CONSENT_KEY) === "yes") return true;
      const ok = window.confirm(t("composer.voicePrivacyConsent"));
      if (ok) localStorage.setItem(CONSENT_KEY, "yes");
      return ok;
    } catch {
      // no localStorage (private mode) — still ask each time via confirm
      return window.confirm(t("composer.voicePrivacyConsent"));
    }
  }

  function startSpeech(): boolean {
    const rec = getSpeechRecognition();
    if (!rec) return false;
    if (!hasVoiceConsent()) return true; // user declined; treat as handled, don't record
    rec.lang = lang === "bn" ? "bn-BD" : "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    baseTextRef.current = text.trim();
    rec.onresult = (e: any) => {
      let out = "";
      for (let i = 0; i < e.results.length; i++) out += e.results[i][0].transcript;
      const base = baseTextRef.current;
      setText((base ? base + " " : "") + out);
    };
    rec.onerror = () => {
      setRecording(false);
    };
    rec.onend = () => {
      setRecording(false);
      recognitionRef.current = null;
    };
    try {
      rec.start();
    } catch {
      return false;
    }
    recognitionRef.current = rec;
    setRecording(true);
    return true;
  }

  function toggleVoice() {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }
    if (!startSpeech()) alert(t("composer.voiceNoSupport"));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-end gap-2">
      <button
        onClick={toggleVoice}
        title={recording ? t("composer.listening") : t("composer.voiceTitle")}
        aria-label={recording ? t("composer.listening") : t("composer.voiceTitle")}
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl shadow-soft transition
          ${recording ? "animate-pulse bg-red-500 text-white" : "bg-surface text-rose ring-1 ring-rose-soft hover:bg-rose-mist"}`}
      >
        {recording ? "⏹" : "🎙"}
      </button>

      <div className="flex flex-1 items-end gap-2 rounded-3xl bg-surface p-1.5 shadow-soft ring-1 ring-rose-soft focus-within:ring-2 focus-within:ring-rose/40">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder={t("composer.placeholder")}
          className="max-h-32 flex-1 resize-none bg-transparent px-3 py-2.5 text-plum outline-none placeholder:text-plum/40"
        />
        <button
          onClick={submit}
          disabled={busy || !text.trim()}
          className="flex h-10 items-center gap-1 rounded-full bg-gradient-to-br from-rose to-rose-deep px-5 font-semibold text-accentink shadow-lift transition hover:brightness-105 disabled:opacity-40 disabled:shadow-none"
        >
          {busy ? "…" : t("composer.send")}
        </button>
      </div>
      </div>

      {recording && (
        <p className="px-1 text-xs leading-snug text-plum/50">
          {t("composer.voicePrivacyNote")}
        </p>
      )}
    </div>
  );
}
