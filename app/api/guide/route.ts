import { NextResponse } from "next/server";
import { Assistant } from "@/lib/server/assistant";
import { errorJson, MAX_TOPIC_LENGTH, readJson, readLanguage, readText } from "@/lib/server/request";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return errorJson("Request body must be a JSON object.", 400);
  const topic = readText(body, "topic", MAX_TOPIC_LENGTH, true);
  if (!topic) return errorJson("Topic is required.", 400);
  try {
    const a = new Assistant();
    const result = await a.explainGuide(topic, readLanguage(body.lang));
    if (!result) {
      return NextResponse.json({ detail: "No guide matched that topic." }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch {
    return errorJson("Shokhi is temporarily unavailable. Please try again.", 503);
  }
}
