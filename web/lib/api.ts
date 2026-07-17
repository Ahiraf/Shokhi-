import type { MessageResponse } from "./types";

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
