import { NextResponse } from "next/server";
import { Assistant } from "@/lib/server/assistant";
import { enforceRateLimit } from "@/lib/server/rate-limit";
import { errorJson, MAX_BELIEF_LENGTH, readJson, readLanguage, readText } from "@/lib/server/request";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const limited = enforceRateLimit(req);
  if (limited) return limited;
  const body = await readJson(req);
  if (!body) return errorJson("Request body must be a JSON object.", 400);
  const belief = readText(body, "belief", MAX_BELIEF_LENGTH, true);
  if (!belief) return errorJson("Belief is required.", 400);
  try {
    const a = new Assistant();
    return NextResponse.json({ reply: await a.bustMyth(belief, readLanguage(body.lang)) });
  } catch {
    return errorJson("Shokhi is temporarily unavailable. Please try again.", 503);
  }
}
