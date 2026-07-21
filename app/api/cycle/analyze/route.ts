import { NextResponse } from "next/server";
import { analyze } from "@/lib/server/cycle";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { logs, lang } = await req.json();
  return NextResponse.json(analyze(logs ?? [], lang ?? "bn"));
}
