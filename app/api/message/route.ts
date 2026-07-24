import { NextResponse } from "next/server";
import { Assistant, applySafetyNet } from "@/lib/server/assistant";
import { enforceRateLimit } from "@/lib/server/rate-limit";
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
  const limited = enforceRateLimit(req);
  if (limited) return limited;
  const body = await readJson(req);
  if (!body) return errorJson("Request body must be a JSON object.", 400);
  const message = readText(body, "message", MAX_MESSAGE_LENGTH, true);
  if (!message) return errorJson("Message is required.", 400);
  try {
    const lang = readLanguage(body.lang);
    const a = new Assistant(readProfile(body.profile), readHistory(body.history));
    await a.addUserMessage(message);

    // Deterministic triage decides urgency; the LLM safety net can only ESCALATE it.
    const base = a.triage();
    const safety = await a.backend.safetyCheck(message).catch(() => ({ emergency: false, reason: null }));
    const { result } = applySafetyNet(base, safety);

    return NextResponse.json({
      profile: a.profile,
      triage: result,
      guidance: await a.backend.explainTriage(result, lang),
      next_question: a.nextQuestion(),
      is_emergency: result.urgency === "emergency",
      backend: a.backend.name,
    });
  } catch {
    return errorJson("Shokhi is temporarily unavailable. Please try again or call 16263.", 503);
  }
}
