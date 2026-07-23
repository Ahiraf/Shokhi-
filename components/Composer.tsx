"use client";

import { useRef, useState } from "react";
import { transcribe } from "@/lib/api";
import { useLang } from "./LanguageProvider";

export default function Composer({
  onSend,
  busy,
}: {
  onSend: (text: string) => void;
  busy: boolean;
}) {
  const { t } = useLang();
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [voiceBusy, setVoiceBusy] = useState(false);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  function submit() {
    const t = text.trim();
    if (!t || busy) return;
    onSend(t);
    setText("");
  }

  async function toggleVoice() {
    if (recording) {
      recRef.current?.stop();
      setRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunks.current = [];
      rec.ondataavailable = (e) => chunks.current.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((tr) => tr.stop());
        setVoiceBusy(true);
        try {
          const blob = new Blob(chunks.current, { type: "audio/webm" });
          const transcript = await transcribe(blob);
          if (transcript) onSend(transcript);
        } catch {
          alert(t("composer.voiceUnavailable"));
        } finally {
          setVoiceBusy(false);
        }
      };
      rec.start();
      recRef.current = rec;
      setRecording(true);
    } catch {
      alert(t("composer.micFailed"));
    }
  }

  return (
    <div className="flex items-end gap-2">
      <button
        onClick={toggleVoice}
        disabled={voiceBusy}
        title={t("composer.voiceTitle")}
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl shadow-soft transition
          ${recording ? "animate-pulse bg-red-500 text-white" : "bg-surface text-rose ring-1 ring-rose-soft hover:bg-rose-mist"}`}
      >
        {voiceBusy ? "…" : recording ? "⏹️" : "🎙️"}
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
  );
}
