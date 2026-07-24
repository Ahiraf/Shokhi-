import { NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/server/transcribe";
import { enforceRateLimit } from "@/lib/server/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

// Voice → text via Google (no OpenAI). The browser records audio and posts it here; we
// transcribe verbatim (Bangla/English) and return the text for the composer to send through
// the normal Gemma + deterministic-triage pipeline.
export async function POST(req: Request) {
  const limited = enforceRateLimit(req);
  if (limited) return limited;

  let audio: File | null = null;
  try {
    const form = await req.formData();
    audio = form.get("audio") as File | null;
  } catch {
    return NextResponse.json({ error: "Expected multipart form data with an 'audio' field." }, { status: 400 });
  }
  if (!audio || audio.size === 0) {
    return NextResponse.json({ error: "No audio provided." }, { status: 400 });
  }
  if (audio.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Audio too large (max 10 MB)." }, { status: 413 });
  }

  try {
    const bytes = await audio.arrayBuffer();
    const transcript = await transcribeAudio(bytes, audio.type || "audio/webm");
    if (!transcript) {
      return NextResponse.json({ error: "Couldn't understand the audio. Please try again." }, { status: 422 });
    }
    return NextResponse.json({ transcript });
  } catch (err) {
    // Log the technical detail server-side; show the user a clean message (the composer
    // falls back to its own localized string too).
    console.error("[voice-transcribe]", err instanceof Error ? err.message : String(err));
    return NextResponse.json(
      { error: "Voice transcription is unavailable right now. Please type your message." },
      { status: 503 },
    );
  }
}
