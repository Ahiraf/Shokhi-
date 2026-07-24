import type {
  MessageResponse,
  GuideCard,
  GuideResponse,
  GuideFull,
  KnowledgeResponse,
  CycleLog,
  CycleAnalysis,
  Wellness,
} from "./types";

// The backend now lives in this same Next.js app (app/api/*), so calls are same-origin
// (relative). NEXT_PUBLIC_API_URL is only needed if you point at an external backend.
const BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json();
}

export function sendMessage(
  message: string,
  profile: Record<string, unknown>,
  history: string[],
  lang: "bn" | "en" = "bn"
): Promise<MessageResponse> {
  return post<MessageResponse>("/api/message", { message, profile, history, lang });
}

/**
 * Streaming chat over Server-Sent Events. Calls `onMeta` once with the triage/profile
 * payload, then `onDelta` for each guidance chunk. Resolves with the assembled full text.
 * Throws on transport failure so the caller can fall back to sendMessage().
 */
export async function sendMessageStream(
  message: string,
  profile: Record<string, unknown>,
  history: string[],
  lang: "bn" | "en",
  handlers: { onMeta?: (m: Omit<MessageResponse, "guidance">) => void; onDelta?: (text: string) => void }
): Promise<string> {
  const res = await fetch(`${BASE}/api/message/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, profile, history, lang }),
  });
  if (!res.ok || !res.body) throw new Error(`stream failed: ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  const handleEvent = (block: string) => {
    const lines = block.split("\n");
    const event = lines.find((l) => l.startsWith("event:"))?.slice(6).trim();
    const dataLine = lines.find((l) => l.startsWith("data:"))?.slice(5).trim();
    if (!event || dataLine === undefined) return;
    const data = JSON.parse(dataLine);
    if (event === "meta") handlers.onMeta?.(data);
    else if (event === "delta") { full += data; handlers.onDelta?.(data as string); }
    else if (event === "error") throw new Error(data.detail || "stream error");
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let sep: number;
    while ((sep = buffer.indexOf("\n\n")) !== -1) {
      const block = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      if (block.trim()) handleEvent(block);
    }
  }
  return full;
}

export async function getGuides(): Promise<GuideCard[]> {
  const res = await fetch(`${BASE}/api/guides`);
  if (!res.ok) throw new Error("guides failed");
  const data = (await res.json()) as { guides: GuideCard[] };
  return data.guides;
}

export function explainGuide(topic: string, lang: "bn" | "en" = "bn"): Promise<GuideResponse> {
  return post<GuideResponse>("/api/guide", { topic, lang });
}

export async function getGuide(id: string): Promise<GuideFull> {
  const res = await fetch(`${BASE}/api/guides/${id}`);
  if (!res.ok) throw new Error("guide failed");
  return res.json();
}

export async function getKnowledge(): Promise<KnowledgeResponse> {
  const res = await fetch(`${BASE}/api/knowledge`);
  if (!res.ok) throw new Error("knowledge failed");
  return res.json();
}

export async function getWellness(): Promise<Wellness> {
  const res = await fetch(`${BASE}/api/wellness`);
  if (!res.ok) throw new Error("wellness failed");
  return res.json();
}

export async function bustMyth(belief: string, lang: "bn" | "en" = "bn"): Promise<string> {
  const data = await post<{ reply: string }>("/api/myth", { belief, lang });
  return data.reply;
}

export function analyzeCycle(logs: CycleLog[], lang: "bn" | "en" = "bn"): Promise<CycleAnalysis> {
  return post<CycleAnalysis>("/api/cycle/analyze", { logs, lang });
}

export async function health(): Promise<{ status: string; backend: string }> {
  const res = await fetch(`${BASE}/api/health`);
  return res.json();
}
