import { Assistant, applySafetyNet, safetyNetEnabled } from "@/lib/server/assistant";
import { enforceRateLimit } from "@/lib/server/rate-limit";
import {
  errorJson,
  MAX_MESSAGE_LENGTH,
  readHistory,
  readJson,
  readLanguage,
  readProfile,
  readText,
} from "@/lib/server/request";

export const runtime = "nodejs";
export const maxDuration = 60;

// Server-Sent-Events chat: the deterministic triage + safety verdict is sent up-front as a
// single `meta` event, then the warm guidance streams token-by-token as `delta` events, so the
// reply appears live (like Maya) instead of after a 2–30s wait. Falls back safely: the
// non-streaming /api/message route still exists for clients that don't consume the stream.
function sse(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: Request) {
  const limited = enforceRateLimit(req);
  if (limited) return limited;
  const body = await readJson(req);
  if (!body) return errorJson("Request body must be a JSON object.", 400);
  const message = readText(body, "message", MAX_MESSAGE_LENGTH, true);
  if (!message) return errorJson("Message is required.", 400);
  const lang = readLanguage(body.lang);

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: unknown) =>
        controller.enqueue(encoder.encode(sse(event, data)));
      // Open the stream immediately so the client shows a live reply and proxies don't buffer.
      controller.enqueue(encoder.encode(": open\n\n"));
      try {
        const a = new Assistant(readProfile(body.profile), readHistory(body.history));

        // Safety net runs CONCURRENTLY with extraction (both only need the raw message), so it
        // adds no latency before the first token. Deterministic triage still owns urgency.
        const safetyP = safetyNetEnabled()
          ? a.backend.safetyCheck(message).catch(() => ({ emergency: false, reason: null }))
          : Promise.resolve({ emergency: false, reason: null });
        await a.addUserMessage(message);
        const base = a.triage();
        const { result } = applySafetyNet(base, await safetyP);

        send("meta", {
          profile: a.profile,
          triage: result,
          next_question: a.nextQuestion(),
          is_emergency: result.urgency === "emergency",
          backend: a.backend.name,
        });

        for await (const chunk of a.backend.explainTriageStream(result, lang)) {
          send("delta", chunk);
        }
        send("done", {});
      } catch {
        send("error", {
          detail: "Shokhi is temporarily unavailable. Please try again or call 16263.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
