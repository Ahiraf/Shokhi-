import { NextResponse } from "next/server";
import { Assistant } from "@/lib/server/assistant";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { topic, lang } = await req.json();
  const a = new Assistant();
  const result = await a.explainGuide(topic ?? "", lang ?? "bn");
  if (!result) {
    return NextResponse.json({ detail: "No guide matched that topic." }, { status: 404 });
  }
  return NextResponse.json(result);
}
