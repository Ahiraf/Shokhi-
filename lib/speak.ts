// Voice OUTPUT (text-to-speech) using the browser's built-in Speech Synthesis — free,
// on-device, offline-capable, and supports bn-BD + en-US. No server, no OpenAI (so it stays
// within the Gemma-only rule; TTS is not an LLM). Made for low-literacy users who prefer to
// LISTEN rather than read. Bangla voice quality depends on the device (good on Android/Chrome;
// desktop may lack a Bangla voice — the UI hides the button when speech isn't supported).

export function ttsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Strip markdown, links and emoji so the speech reads cleanly. */
function cleanForSpeech(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [label](url) → label
    .replace(/https?:\/\/\S+/g, "") // bare URLs
    .replace(/[*_#>`~]/g, "") // markdown syntax
    .replace(/[•▪◦·]/g, " ") // bullets
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{FE0F}\u{200D}]/gu, "") // emoji
    .replace(/\s+/g, " ")
    .trim();
}

function pickVoice(lang: "bn" | "en"): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const prefix = lang === "bn" ? "bn" : "en";
  return voices.find((v) => v.lang?.toLowerCase().startsWith(prefix)) ?? null;
}

/** Speak `text` in the given language. Returns false if speech isn't supported. */
export function speak(text: string, lang: "bn" | "en", onend?: () => void): boolean {
  if (!ttsSupported()) return false;
  const synth = window.speechSynthesis;
  synth.cancel(); // stop anything already speaking
  const u = new SpeechSynthesisUtterance(cleanForSpeech(text));
  u.lang = lang === "bn" ? "bn-BD" : "en-US";
  u.rate = 0.95;
  const v = pickVoice(lang);
  if (v) u.voice = v;
  if (onend) {
    u.onend = onend;
    u.onerror = onend;
  }
  synth.speak(u);
  return true;
}

export function stopSpeaking(): void {
  if (ttsSupported()) window.speechSynthesis.cancel();
}
