"use client";

import { useRef, useState } from "react";
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
  const [transcribing, setTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState("");

  // Voice = record audio in the browser (MediaRecorder), then transcribe it on the server
  // with Google (see /api/voice-transcribe). This works reliably in Brave/Safari/Chrome,
  // unlike the browser's Web Speech API. No OpenAI — stays in the Google/Gemma ecosystem.
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function submit() {
    const val = text.trim();
    if (!val || busy) return;
    onSend(val);
    setText("");
  }

  function stopRecording() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
    setRecording(false);
  }

  async function startRecording() {
    if (mediaRecorderRef.current?.state === "recording") return;
    setVoiceError("");
    chunksRef.current = [];

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setVoiceError(t("composer.voiceNoSupport"));
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err: any) {
      const name = err?.name as string | undefined;
      setVoiceError(
        name === "NotAllowedError" || name === "SecurityError"
          ? t("composer.micDenied")
          : name === "NotFoundError"
          ? t("composer.micNotFound")
          : t("composer.micFailed"),
      );
      return;
    }

    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : MediaRecorder.isTypeSupported("audio/webm")
      ? "audio/webm"
      : "audio/mp4";

    const recorder = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      stream.getTracks().forEach((tr) => tr.stop());
      const blob = new Blob(chunksRef.current, { type: mimeType });
      if (blob.size < 1200) {
        setVoiceError(t("composer.voiceNoSpeech"));
        return;
      }
      setTranscribing(true);
      try {
        const form = new FormData();
        form.append("audio", blob, "voice.webm");
        const res = await fetch("/api/voice-transcribe", { method: "POST", body: form });
        const data = await res.json();
        if (res.ok && data.transcript) {
          setText((prev) => (prev.trim() ? prev.trim() + " " : "") + data.transcript.trim());
        } else {
          setVoiceError(data.error || t("composer.transcribeFailed"));
        }
      } catch {
        setVoiceError(t("composer.transcribeFailed"));
      } finally {
        setTranscribing(false);
      }
    };

    recorder.start(250); // gather chunks every 250ms
    setRecording(true);

    // safety cap: auto-stop after 60s so we never hold the mic open forever
    let secs = 0;
    timerRef.current = setInterval(() => {
      if (++secs >= 60) stopRecording();
    }, 1000);
  }

  function toggleVoice() {
    if (transcribing || busy) return;
    if (recording) stopRecording();
    else void startRecording();
  }

  const micIcon = transcribing ? "…" : recording ? "⏹" : "🎙";
  const micTitle = recording ? t("composer.listening") : t("composer.voiceTitle");

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-end gap-2">
        <button
          onClick={toggleVoice}
          disabled={busy || transcribing}
          title={micTitle}
          aria-label={micTitle}
          aria-pressed={recording}
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl shadow-soft transition
            ${recording ? "animate-pulse bg-red-500 text-white" : "bg-surface text-rose ring-1 ring-rose-soft hover:bg-rose-mist"}
            disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {micIcon}
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

      {(recording || transcribing || voiceError) && (
        <p className="px-1 text-xs leading-snug text-plum/55">
          {voiceError
            ? voiceError
            : transcribing
            ? t("composer.transcribing")
            : t("composer.listening")}
        </p>
      )}
    </div>
  );
}
