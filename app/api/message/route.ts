import { NextResponse } from "next/server";
import { Assistant, applySafetyNet, safetyNetEnabled } from "@/lib/server/assistant";
import { detectCrisis, crisisResponse } from "@/lib/server/crisis";
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

    // Crisis safeguard runs FIRST and deterministically — a self-harm message must never be
    // brushed off or delayed by the normal triage/LLM path.
    if (detectCrisis(message)) {
      return NextResponse.json({
        profile: readProfile(body.profile),
        triage: null,
        guidance: crisisResponse(lang),
        next_question: null,
        is_emergency: true,
        backend: "crisis",
      });
    }

    const a = new Assistant(readProfile(body.profile), readHistory(body.history));

    // Run the (independent) LLM safety net CONCURRENTLY with symptom extraction so it adds
    // no extra latency — both only need the raw message. Deterministic triage still decides
    // urgency; the safety net can only ESCALATE it.
    const safetyP = safetyNetEnabled()
      ? a.backend.safetyCheck(message).catch(() => ({ emergency: false, reason: null }))
      : Promise.resolve({ emergency: false, reason: null });
    await a.addUserMessage(message);
    const base = a.triage();
    const { result } = applySafetyNet(base, await safetyP);

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
