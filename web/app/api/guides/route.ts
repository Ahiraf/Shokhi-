import { NextResponse } from "next/server";
import { Assistant } from "@/lib/server/assistant";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const a = new Assistant();
  return NextResponse.json({ guides: a.listGuides() });
}
