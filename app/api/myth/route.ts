import { NextResponse } from "next/server";
import { Assistant } from "@/lib/server/assistant";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { belief, lang } = await req.json();
  const a = new Assistant();
  return NextResponse.json({ reply: await a.bustMyth(belief ?? "", lang ?? "bn") });
}
