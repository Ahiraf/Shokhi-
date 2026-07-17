"use client";

import { useRef, useState } from "react";
import { transcribe } from "@/lib/api";

export default function Composer({
  onSend,
  busy,
}: {
  onSend: (text: string) => void;
  busy: boolean;
}) {
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
          alert("লাইভ Gemma 4 (SHOKHI_BACKEND=gemini) ছাড়া কণ্ঠ বোঝা যাবে না। এখন লিখে দেখুন।");
        } finally {
          setVoiceBusy(false);
        }
      };
      rec.start();
      recRef.current = rec;
      setRecording(true);
    } catch {
      alert("মাইক্রোফোন চালু করা গেল না।");
    }
  }

  return (
    <div className="flex items-end gap-2">
      <button
        onClick={toggleVoice}
        disabled={voiceBusy}
        title="কণ্ঠে বলুন"
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl shadow-soft transition
          ${recording ? "animate-pulse bg-red-500 text-white" : "bg-white text-rose ring-1 ring-rose-100 hover:bg-rose-mist"}`}
      >
        {voiceBusy ? "…" : recording ? "⏹️" : "🎙️"}
      </button>

      <div className="flex flex-1 items-end gap-2 rounded-2xl bg-white p-1.5 shadow-soft ring-1 ring-rose-100">
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
          placeholder="এখানে বাংলায় লিখুন বা কণ্ঠে বলুন..."
          className="max-h-32 flex-1 resize-none bg-transparent px-3 py-2.5 text-[#3a2230] outline-none placeholder:text-rose-deep/40"
        />
        <button
          onClick={submit}
          disabled={busy || !text.trim()}
          className="flex h-10 items-center gap-1 rounded-xl bg-gradient-to-br from-rose to-rose-deep px-4 font-medium text-white transition disabled:opacity-40"
        >
          {busy ? "…" : "পাঠান"}
        </button>
      </div>
    </div>
  );
}
