import { NextResponse } from "next/server";
import { knowledge } from "@/lib/server/triage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    symptom_schema: knowledge.symptom_schema,
    meta: knowledge.meta,
    conditions: knowledge.conditions ?? [],
    red_flags: knowledge.red_flags ?? [],
    myths: knowledge.myths ?? [],
  });
}
