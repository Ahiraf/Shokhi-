import { NextResponse } from "next/server";

export type JsonBody = Record<string, unknown>;

export const MAX_MESSAGE_LENGTH = 2_000;
export const MAX_HISTORY_ITEMS = 20;
export const MAX_HISTORY_ITEM_LENGTH = 2_000;
export const MAX_TOPIC_LENGTH = 200;
export const MAX_BELIEF_LENGTH = 1_000;
export const MAX_CYCLE_LOGS = 200;

export async function readJson(req: Request): Promise<JsonBody | null> {
  try {
    const value: unknown = await req.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    return value as JsonBody;
  } catch {
    return null;
  }
}

export function readText(body: JsonBody, key: string, maxLength: number, required = false): string | null {
  const value = body[key];
  if (typeof value !== "string") return required ? null : "";
  const text = value.trim();
  if (required && !text) return null;
  if (text.length > maxLength) return null;
  return text;
}

export function readLanguage(value: unknown): "bn" | "en" {
  return value === "en" ? "en" : "bn";
}

export function readHistory(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .slice(-MAX_HISTORY_ITEMS)
    .map((item) => item.trim().slice(0, MAX_HISTORY_ITEM_LENGTH))
    .filter(Boolean);
}

export function readProfile(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const profile: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value).slice(0, 100)) {
    if (typeof item === "boolean" || typeof item === "number" || typeof item === "string") {
      profile[key] = item;
    }
  }
  return profile;
}

export function errorJson(detail: string, status: number) {
  return NextResponse.json({ detail }, { status });
}
