// Best-effort rate limiting + a global LLM-call budget.
//
// WHY: every chat / guide / myth request can trigger a hosted Gemma 4 call, which
// costs Google API quota. Without a limit, one looping or abusive client can drain
// all our keys (even the _2/_3 fallbacks) and take Shokhi down for real users.
//
// SCOPE: this is an in-memory guard. On Vercel serverless each warm instance has its
// own memory, so it won't stop a distributed flood on its own — but it does protect a
// single warm instance (the common case) and, crucially, caps how fast we spend quota.
// For hard multi-instance limits, front this with a shared store (Upstash/Redis) later.

import { errorJson } from "./request";

const WINDOW_MS = 60_000; // 1-minute fixed window

// Per-IP: how many requests one client may make per window.
const MAX_PER_IP = 20;
// Global: total LLM-backed requests served per window across ALL callers, so a burst
// spread over many IPs still can't drain the API quota.
const GLOBAL_MAX = 120;

interface Bucket {
  count: number;
  resetAt: number;
}

const ipBuckets = new Map<string, Bucket>();
const globalBucket: Bucket = { count: 0, resetAt: 0 };

/** Register one hit against a bucket. Returns true if still within `max`. */
function withinLimit(bucket: Bucket, max: number, now: number): boolean {
  if (now >= bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + WINDOW_MS;
  }
  bucket.count += 1;
  return bucket.count <= max;
}

/** Drop expired per-IP buckets so the map can't grow without bound. */
function pruneIpBuckets(now: number) {
  if (ipBuckets.size < 10_000) return;
  for (const [ip, bucket] of ipBuckets) {
    if (now >= bucket.resetAt) ipBuckets.delete(ip);
  }
}

/** Best-effort client IP from the standard proxy headers Vercel sets. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Enforce the rate limit for a request. Returns a 429 `NextResponse` to send back,
 * or `null` when the request is allowed through. Call this first in every LLM-backed
 * API route.
 */
export function enforceRateLimit(req: Request) {
  const now = Date.now();

  // Global budget first: protect the shared API quota above everything else.
  if (!withinLimit(globalBucket, GLOBAL_MAX, now)) {
    return tooMany(globalBucket, now);
  }

  pruneIpBuckets(now);
  const ip = clientIp(req);
  let bucket = ipBuckets.get(ip);
  if (!bucket) {
    bucket = { count: 0, resetAt: 0 };
    ipBuckets.set(ip, bucket);
  }
  if (!withinLimit(bucket, MAX_PER_IP, now)) {
    return tooMany(bucket, now);
  }
  return null;
}

function tooMany(bucket: Bucket, now: number) {
  const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
  const res = errorJson(
    "অনুগ্রহ করে একটু ধীরে চেষ্টা করুন। কিছুক্ষণ পর আবার বার্তা পাঠান। " +
      "(Too many requests — please slow down and try again shortly.)",
    429,
  );
  res.headers.set("Retry-After", String(retryAfter));
  return res;
}
