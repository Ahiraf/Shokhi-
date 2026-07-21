import { NextResponse } from "next/server";
import { Assistant } from "@/lib/server/assistant";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { gid: string } }) {
  const a = new Assistant();
  const g = a.getGuide(params.gid);
  if (!g) return NextResponse.json({ detail: "Guide not found." }, { status: 404 });
  return NextResponse.json(g);
}
