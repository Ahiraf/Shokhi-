"use client";

import { useEffect, useState } from "react";
import { speak, stopSpeaking, ttsSupported } from "@/lib/speak";
import { useLang } from "./LanguageProvider";
import Icon from "./Icon";

/** A small "listen" button — reads the given text aloud in the current language (Bangla/English). */
export default function SpeakButton({
  text,
  size = "md",
  className = "",
}: {
  text: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const { t, lang } = useLang();
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(ttsSupported());
    return () => stopSpeaking();
  }, []);

  if (!supported || !text.trim()) return null;

  function toggle() {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    const ok = speak(text, lang, () => setSpeaking(false));
    if (ok) setSpeaking(true);
  }

  const dim = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  const label = speaking ? t("common.stopListen") : t("common.listen");

  return (
    <button
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`inline-flex ${dim} shrink-0 items-center justify-center rounded-full ring-1 ring-rose-soft transition
        ${speaking ? "animate-pulse bg-rose text-accentink" : "bg-surface text-rose-deep hover:bg-rose-mist"} ${className}`}
    >
      <Icon name={speaking ? "stop" : "volume"} size={size === "sm" ? 13 : 15} />
    </button>
  );
}
