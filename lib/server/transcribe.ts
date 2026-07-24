// Voice → text using GOOGLE's own models (the same GOOGLE_API_KEY / multi-key fallback the
// rest of Shokhi uses) — NO OpenAI, so we stay inside the Google/Gemma ecosystem for the
// hackathon. This is a speech-to-text INPUT step; Gemma still writes every answer.
//
// The transcription model is configurable via SHOKHI_STT_MODEL (default gemini-2.5-flash,
// which reliably transcribes Bangla + English audio). It transcribes verbatim and never
// translates, so a woman speaking Bangla is captured in Bangla.

import { geminiKeys } from "./gemma";

const STT_MODEL = process.env.SHOKHI_STT_MODEL || "gemini-2.5-flash";

const PROMPT =
  "Transcribe this audio verbatim in the SAME language actually spoken (Bangla or English). " +
  "Auto-detect the spoken language. Do NOT translate. Output ONLY the exact transcribed words " +
  "and nothing else. If the audio is silent or unintelligible, output an empty string.";

// Whisper/Gemini accept a limited set of audio mimes; normalise the browser's value.
function normalizeMime(mimeType: string): string {
  const base = (mimeType || "audio/webm").split(";")[0].trim();
  return ["audio/webm", "audio/mp4", "audio/mpeg", "audio/wav", "audio/ogg", "audio/flac"].includes(base)
    ? base
    : "audio/webm";
}

/**
 * Transcribe an audio buffer to text with Google, rotating through the available API keys on
 * quota/rate errors (same behaviour as the chat backend). Returns "" for silent/empty audio.
 */
export async function transcribeAudio(bytes: ArrayBuffer, mimeType: string): Promise<string> {
  const keys = geminiKeys();
  if (!keys.length) throw new Error("No GOOGLE_API_KEY configured for transcription.");

  const data = Buffer.from(bytes).toString("base64");
  const mime = normalizeMime(mimeType);
  const { GoogleGenAI } = await import("@google/genai");

  let lastErr: unknown;
  for (let i = 0; i < keys.length; i++) {
    try {
      const ai = new GoogleGenAI({ apiKey: keys[i] });
      const resp: any = await ai.models.generateContent({
        model: STT_MODEL,
        contents: [{ text: PROMPT }, { inlineData: { mimeType: mime, data } }],
        config: { temperature: 0 },
      });
      return (resp.text ?? "").trim();
    } catch (err) {
      lastErr = err;
      const msg = String((err as any)?.message ?? err).toLowerCase();
      const retryable = ["429", "quota", "resource_exhausted", "rate limit", "503", "overloaded", "500"].some((m) =>
        msg.includes(m),
      );
      if (retryable && i < keys.length - 1) continue;
      throw err;
    }
  }
  throw new Error(`Transcription failed: ${lastErr}`);
}
