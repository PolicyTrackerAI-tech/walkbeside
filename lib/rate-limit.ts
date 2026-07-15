/**
 * Best-effort, dependency-free rate limiter for the hottest public endpoints.
 *
 * IMPORTANT: state is an in-process Map, so on Vercel's serverless/edge runtime
 * it is PER-INSTANCE — a burst spread across instances can exceed the limit by
 * a factor of the instance count. It's real defense-in-depth against a single
 * hammering client, not a hard global quota. For a hard quota, swap in a shared
 * store (Upstash Redis / Vercel KV) behind this same interface — see
 * docs/SECURITY.md.
 *
 * Web-API only (no Node built-ins) so it runs in the Edge middleware/proxy.
 */

export interface RateLimitRule {
  limit: number;
  windowMs: number;
}

/** Per-path rules, keyed by exact pathname. POST-only (enforced by the caller). */
export const RATE_LIMITS: Record<string, RateLimitRule> = {
  "/api/negotiate/start": { limit: 8, windowMs: 60_000 },
  "/api/share/create": { limit: 15, windowMs: 60_000 },
  "/api/planning/signup": { limit: 15, windowMs: 60_000 },
  "/api/analyze-price-list": { limit: 12, windowMs: 60_000 },
  "/api/analyze-price-list/draft-letter": { limit: 8, windowMs: 60_000 },
  "/api/analyze-price-list/explain": { limit: 10, windowMs: 60_000 },
  "/api/compare-bill": { limit: 12, windowMs: 60_000 },
  "/api/extract-price-list-image": { limit: 12, windowMs: 60_000 },
  "/api/subscription-finder": { limit: 8, windowMs: 60_000 },
  "/api/eulogy": { limit: 8, windowMs: 60_000 },
  "/api/obituary": { limit: 8, windowMs: 60_000 },
};

interface Bucket {
  tokens: number;
  last: number;
}

const buckets = new Map<string, Bucket>();
// Bound memory under a flood of unique keys (best-effort; instances are short-lived).
const MAX_BUCKETS = 10_000;

export interface RateLimitResult {
  ok: boolean;
  retryAfterMs: number;
}

/**
 * Token-bucket check. `now` is injectable for deterministic tests.
 * Consumes one token on success; returns retryAfterMs on failure.
 */
export function rateLimit(
  key: string,
  rule: RateLimitRule,
  now: number = Date.now(),
): RateLimitResult {
  const { limit, windowMs } = rule;
  if (buckets.size > MAX_BUCKETS) buckets.clear();

  let b = buckets.get(key);
  if (!b) {
    b = { tokens: limit, last: now };
    buckets.set(key, b);
  }
  // Refill proportionally to elapsed time.
  const elapsed = Math.max(0, now - b.last);
  b.tokens = Math.min(limit, b.tokens + (elapsed / windowMs) * limit);
  b.last = now;

  if (b.tokens >= 1) {
    b.tokens -= 1;
    return { ok: true, retryAfterMs: 0 };
  }
  const retryAfterMs = Math.ceil((1 - b.tokens) * (windowMs / limit));
  return { ok: false, retryAfterMs };
}

/** Extract a best-effort client IP from proxy headers (Vercel-set). */
export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}

/** Test-only: clear all buckets between cases. */
export function __resetRateLimit(): void {
  buckets.clear();
}
