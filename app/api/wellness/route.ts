import { NextResponse } from "next/server";
import { knowledge } from "@/lib/server/triage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(knowledge.wellness ?? {});
}
