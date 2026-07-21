import { NextResponse } from "next/server";
import { getBackend } from "@/lib/server/gemma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ status: "ok", backend: getBackend().name });
}
