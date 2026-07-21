import { NextResponse } from "next/server";
import { getBackend } from "@/lib/server/gemma";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const backend = getBackend();
  if (!backend.supportsAudio()) {
    return NextResponse.json(
      { detail: "Audio needs the live Gemma 4 backend (set GOOGLE_API_KEY)." },
      { status: 501 },
    );
  }
  const form = await req.formData();
  const file = form.get("audio");
  if (!(file instanceof File)) {
    return NextResponse.json({ detail: "No audio file provided." }, { status: 400 });
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  const transcript = await backend.transcribeAudio(bytes, file.type || "audio/webm");
  return NextResponse.json({ transcript });
}
