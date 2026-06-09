import { PUBLIC } from "@/lib/env";

/**
 * Shared guards for API route handlers: bounded body reads (DoS protection)
 * and an Origin/Referer CSRF check (defense-in-depth for state-changing POSTs).
 *
 * Web-API only (Request/URL) so these are safe in both the Node and Edge
 * runtimes.
 */

const KB = 1024;

export type LimitedText =
  | { ok: true; text: string }
  | { ok: false; status: number; error: string };

export type LimitedJson<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

/**
 * Read a request's body as text exactly once, rejecting anything larger than
 * `maxKB`. The body can only be read once, so callers that need the raw text
 * (e.g. webhook signature verification) use this and reuse the returned string.
 */
export async function readLimitedText(
  req: Request,
  maxKB: number,
): Promise<LimitedText> {
  const max = maxKB * KB;
  const cl = req.headers.get("content-length");
  if (cl) {
    const n = Number(cl);
    if (Number.isFinite(n) && n > max) {
      return { ok: false, status: 413, error: "payload_too_large" };
    }
  }
  let text: string;
  try {
    text = await req.text();
  } catch {
    return { ok: false, status: 400, error: "bad_body" };
  }
  // Content-Length can be spoofed/absent — enforce on the actual bytes too.
  if (text.length > max) {
    return { ok: false, status: 413, error: "payload_too_large" };
  }
  return { ok: true, text };
}

/** Read + JSON.parse a request body once, enforcing a max size (KB). */
export async function readLimitedJson<T = unknown>(
  req: Request,
  maxKB: number,
): Promise<LimitedJson<T>> {
  const res = await readLimitedText(req, maxKB);
  if (!res.ok) return res;
  try {
    return { ok: true, data: JSON.parse(res.text) as T };
  } catch {
    return { ok: false, status: 400, error: "bad_json" };
  }
}

/**
 * Defense-in-depth CSRF check for state-changing POSTs. Returns true when the
 * request's Origin (or Referer) matches our own origin or NEXT_PUBLIC_APP_URL.
 *
 * Missing BOTH headers → allowed: some legitimate same-origin clients omit
 * them, and the Supabase session + RLS remain the primary gate. This only
 * blocks a request that explicitly claims a *different* origin.
 */
export function validateOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  if (!origin && !referer) return true;

  const allowed = new Set<string>();
  try {
    allowed.add(new URL(req.url).origin);
  } catch {
    /* ignore */
  }
  try {
    if (PUBLIC.appUrl) allowed.add(new URL(PUBLIC.appUrl).origin);
  } catch {
    /* ignore */
  }

  const matches = (value: string | null): boolean => {
    if (!value) return false;
    try {
      return allowed.has(new URL(value).origin);
    } catch {
      return false;
    }
  };

  return matches(origin) || matches(referer);
}
