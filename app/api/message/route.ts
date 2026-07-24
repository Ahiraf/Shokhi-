import { NextResponse } from "next/server";
import { Assistant } from "@/lib/server/assistant";
import {
  errorJson,
  MAX_MESSAGE_LENGTH,
  readHistory,
  readJson,
  readLanguage,
  readProfile,
  readText,
} from "@/lib/server/request";

export const runtime = "nodejs";
export const maxDuration = 60; // Gemma replies can take a few seconds

export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return errorJson("Request body must be a JSON object.", 400);
  const message = readText(body, "message", MAX_MESSAGE_LENGTH, true);
  if (!message) return errorJson("Message is required.", 400);
  try {
    const a = new Assistant(readProfile(body.profile), readHistory(body.history));
    await a.addUserMessage(message);
    const result = a.triage();
    return NextResponse.json({
      profile: a.profile,
      triage: result,
      guidance: await a.explain(readLanguage(body.lang)),
      next_question: a.nextQuestion(),
      is_emergency: result.urgency === "emergency",
      backend: a.backend.name,
    });
  } catch {
    return errorJson("Shokhi is temporarily unavailable. Please try again or call 16263.", 503);
  }
}
