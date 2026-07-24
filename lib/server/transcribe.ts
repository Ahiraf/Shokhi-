// Voice → text using GOOGLE's own models (the same GOOGLE_API_KEY / multi-key fallback the
// rest of Shokhi uses) — NO OpenAI, so we stay inside the Google/Gemma ecosystem for the
// hackathon. This is a speech-to-text INPUT step; Gemma still writes every answer.
//
// Gemma itself has NO audio modality (the API returns 400 "Audio input modality is not
// enabled"), so transcription uses a Gemini model. Not every key/project is granted every
// Gemini model (some return 403 PERMISSION_DENIED / 404), so we try a LIST of audio-capable
// models across ALL keys and use the first combination that works. Transcribes verbatim
// (Bangla/English) without translating.

import { geminiKeys } from "./gemma";

// Candidate audio-capable models, best first. SHOKHI_STT_MODEL (if set) is tried first.
function sttModels(): string[] {
  const preferred = process.env.SHOKHI_STT_MODEL;
  const defaults = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-flash-latest",
  ];
  return Array.from(new Set([preferred, ...defaults].filter(Boolean) as string[]));
}

const PROMPT =
  "Transcribe this audio verbatim in the SAME language actually spoken (Bangla or English). " +
  "Auto-detect the spoken language. Do NOT translate. Output ONLY the exact transcribed words " +
  "and nothing else. If the audio is silent or unintelligible, output an empty string.";

// Gemini accepts a limited set of audio mimes; normalise the browser's value.
function normalizeMime(mimeType: string): string {
  const base = (mimeType || "audio/webm").split(";")[0].trim();
  return ["audio/webm", "audio/mp4", "audio/mpeg", "audio/wav", "audio/ogg", "audio/flac"].includes(base)
    ? base
    : "audio/webm";
}

/**
 * Transcribe an audio buffer to text with Google. Tries every (model × key) combination and
 * returns the first that succeeds, so a key that lacks one Gemini model still works via another.
 * Returns "" for silent/empty audio. Throws only if EVERY combination fails.
 */
export async function transcribeAudio(bytes: ArrayBuffer, mimeType: string): Promise<string> {
  const keys = geminiKeys();
  if (!keys.length) throw new Error("No GOOGLE_API_KEY configured for transcription.");

  const data = Buffer.from(bytes).toString("base64");
  const mime = normalizeMime(mimeType);
  const { GoogleGenAI } = await import("@google/genai");
  const models = sttModels();

  let lastErr: unknown;
  for (const model of models) {
    for (let i = 0; i < keys.length; i++) {
      try {
        const ai = new GoogleGenAI({ apiKey: keys[i] });
        const resp: any = await ai.models.generateContent({
          model,
          contents: [{ text: PROMPT }, { inlineData: { mimeType: mime, data } }],
          config: { temperature: 0 },
        });
        return (resp.text ?? "").trim();
      } catch (err) {
        lastErr = err;
        // Any access / quota / availability error → just try the next key or model.
        continue;
      }
    }
  }
  throw new Error(`Transcription unavailable: ${lastErr}`);
}
