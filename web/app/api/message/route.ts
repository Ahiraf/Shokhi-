import { NextResponse } from "next/server";
import { Assistant } from "@/lib/server/assistant";

export const runtime = "nodejs";
export const maxDuration = 60; // Gemma replies can take a few seconds

export async function POST(req: Request) {
  const { message, profile, history, lang } = await req.json();
  const a = new Assistant(profile ?? {}, history ?? []);
  await a.addUserMessage(message ?? "");
  const result = a.triage();
  return NextResponse.json({
    profile: a.profile,
    triage: result,
    guidance: await a.explain(lang ?? "bn"),
    next_question: a.nextQuestion(),
    is_emergency: result.urgency === "emergency",
    backend: a.backend.name,
  });
}
