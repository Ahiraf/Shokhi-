import { NextResponse } from "next/server";
import { analyze } from "@/lib/server/cycle";
import { errorJson, MAX_CYCLE_LOGS, readJson, readLanguage } from "@/lib/server/request";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return errorJson("Request body must be a JSON object.", 400);
  if (body.logs !== undefined && !Array.isArray(body.logs)) {
    return errorJson("Logs must be an array.", 400);
  }
  const logs = Array.isArray(body.logs) ? body.logs.slice(-MAX_CYCLE_LOGS) : [];
  return NextResponse.json(analyze(logs, readLanguage(body.lang)));
}
