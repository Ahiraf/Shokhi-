import type {
  MessageResponse,
  GuideCard,
  GuideResponse,
  GuideFull,
  KnowledgeResponse,
  CycleLog,
  CycleAnalysis,
} from "./types";

const BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

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
  history: string[]
): Promise<MessageResponse> {
  return post<MessageResponse>("/api/message", { message, profile, history });
}

export async function getGuides(): Promise<GuideCard[]> {
  const res = await fetch(`${BASE}/api/guides`);
  if (!res.ok) throw new Error("guides failed");
  const data = (await res.json()) as { guides: GuideCard[] };
  return data.guides;
}

export function explainGuide(topic: string): Promise<GuideResponse> {
  return post<GuideResponse>("/api/guide", { topic });
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

export async function bustMyth(belief: string): Promise<string> {
  const data = await post<{ reply: string }>("/api/myth", { belief });
  return data.reply;
}

export function analyzeCycle(logs: CycleLog[]): Promise<CycleAnalysis> {
  return post<CycleAnalysis>("/api/cycle/analyze", { logs });
}

export async function transcribe(audio: Blob): Promise<string> {
  const form = new FormData();
  form.append("audio", audio, "voice.webm");
  const res = await fetch(`${BASE}/api/transcribe`, { method: "POST", body: form });
  if (!res.ok) throw new Error("transcribe failed");
  const data = (await res.json()) as { transcript: string };
  return data.transcript;
}

export async function health(): Promise<{ status: string; backend: string }> {
  const res = await fetch(`${BASE}/api/health`);
  return res.json();
}
