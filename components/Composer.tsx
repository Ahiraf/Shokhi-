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
  const [startingVoice, setStartingVoice] = useState(false);
  const [voiceError, setVoiceError] = useState("");

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

  async function requestMicrophone(): Promise<boolean> {
    if (!navigator.mediaDevices?.getUserMedia) return true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error: any) {
      const name = error?.name as string | undefined;
      setVoiceError(name === "NotAllowedError" || name === "SecurityError"
        ? t("composer.micDenied")
        : name === "NotFoundError" ? t("composer.micNotFound") : t("composer.micFailed"));
      return false;
    }
  }

  async function startSpeech(): Promise<boolean> {
    const rec = getSpeechRecognition();
    if (!rec) {
      setVoiceError(t("composer.voiceNoSupport"));
      return false;
    }
    setVoiceError("");
    setStartingVoice(true);
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
    rec.onerror = (e: any) => {
      setRecording(false);
      const err = e?.error as string | undefined;
      if (err === "not-allowed" || err === "service-not-allowed") {
        setVoiceError(t("composer.micDenied"));
      } else if (err === "audio-capture") {
        setVoiceError(t("composer.micNotFound"));
      } else if (err === "no-speech") {
        setVoiceError(t("composer.voiceNoSpeech"));
      } else if (err && err !== "aborted") {
        setVoiceError(t("composer.micFailed"));
      }
    };
    rec.onend = () => {
      setRecording(false);
      recognitionRef.current = null;
    };
    try {
      if (!(await requestMicrophone())) return false;
      rec.start();
    } catch {
      setVoiceError(t("composer.micFailed"));
      return false;
    } finally {
      setStartingVoice(false);
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
    if (!startingVoice && !busy) void startSpeech();
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-end gap-2">
      <button
        onClick={toggleVoice}
        disabled={busy || startingVoice}
        title={recording ? t("composer.listening") : t("composer.voiceTitle")}
        aria-label={recording ? t("composer.listening") : t("composer.voiceTitle")}
        aria-pressed={recording}
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl shadow-soft transition
          ${recording ? "animate-pulse bg-red-500 text-white" : "bg-surface text-rose ring-1 ring-rose-soft hover:bg-rose-mist"} disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {startingVoice ? "…" : recording ? "⏹" : "🎙"}
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

      {(recording || startingVoice || voiceError) && (
        <p className="px-1 text-xs leading-snug text-plum/50">
          {voiceError || t("composer.voicePrivacyNote")}
        </p>
      )}
    </div>
  );
}
