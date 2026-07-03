import "server-only";
import crypto from "node:crypto";

/**
 * Redaction helpers — use these instead of logging raw PII. Email addresses,
 * full names, and message bodies must never land in plaintext logs/alerts.
 */
/** "+18015550142" → "+1•••0142" — enough to debug, never enough to dial. */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "(none)";
  const tail = phone.slice(-4);
  const head = phone.startsWith("+") ? phone.slice(0, 2) : phone.slice(0, 1);
  return `${head}\u2022\u2022\u2022${tail}`;
}

export function maskEmail(email: string | null | undefined): string {
  if (!email) return "(none)";
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***";
  return `${local[0]}***@${domain}`;
}

/** Stable short hash for correlation/dedup without storing the raw value. */
export function hashId(value: string | null | undefined): string {
  if (!value) return "(none)";
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 10);
}

/**
 * Vendor-agnostic observability seam for the launch-critical paths
 * (pay → send, payment reconciliation, bounce/complaint handling).
 *
 * Two jobs:
 *   1. Structured logs — one JSON line per event so Vercel logs (or any drain)
 *      are greppable/filterable. logEvent() for normal transitions,
 *      logWarn() for soft problems, captureError() for failures.
 *   2. Push alerts — for the few things a human must see fast (a PAID family's
 *      outreach failing to send; a funeral home bouncing/complaining).
 *      sendAlert() POSTs a Slack/Discord-style {text} payload to
 *      ALERT_WEBHOOK_URL when set; it's a no-op otherwise.
 *
 * Adding a hosted error monitor later is a one-line change, in ONE place:
 * every critical path already routes failures through captureError(), so to
 * turn on Sentry you `npm i @sentry/nextjs`, set SENTRY_DSN, and add
 * `Sentry.captureException(error, { tags: { event }, extra: data })` at the
 * marked seam below. Nothing else needs to change.
 */

type Json = Record<string, unknown>;

function emit(level: "info" | "warn" | "error", event: string, data?: Json) {
  const rec = { t: new Date().toISOString(), level, event, ...(data ?? {}) };
  const out = JSON.stringify(rec);
  if (level === "error") console.error(out);
  else if (level === "warn") console.warn(out);
  else console.info(out);
}

/** Normal transition / milestone on a critical path. */
export function logEvent(event: string, data?: Json): void {
  emit("info", event, data);
}

/** Soft problem — recoverable, no human needed, but worth a searchable line. */
export function logWarn(event: string, data?: Json): void {
  emit("warn", event, data);
}

function errInfo(error: unknown): Json {
  if (error instanceof Error) {
    return { error: error.message, stack: error.stack };
  }
  return { error: String(error) };
}

/**
 * Record a failure: structured error log + (by default) a push alert.
 * Never throws. Pass { alert: false } for failures that are expected/noisy
 * (e.g. an invalid webhook signature from a prober) — they still get logged.
 */
export async function captureError(
  event: string,
  error: unknown,
  data?: Json,
  opts: { alert?: boolean } = {},
): Promise<void> {
  const info = { ...errInfo(error), ...(data ?? {}) };
  emit("error", event, info);
  // ── Sentry drop-in seam ──────────────────────────────────────────────
  // import * as Sentry from "@sentry/nextjs";
  // Sentry.captureException(error, { tags: { event }, extra: data });
  // ─────────────────────────────────────────────────────────────────────
  if (opts.alert !== false) {
    await sendAlert("error", event, info);
  }
}

/**
 * Best-effort push alert to ALERT_WEBHOOK_URL (Slack/Discord-compatible
 * `{ text }`). No-op when the var is unset. Never throws, and times out fast
 * (2.5s) so it's safe to `await` inside a request/webhook handler without
 * risking a hang or losing the alert to serverless freeze-after-return.
 */
export async function sendAlert(
  severity: "info" | "warn" | "error",
  title: string,
  data?: Json,
): Promise<void> {
  const url = process.env.ALERT_WEBHOOK_URL;
  if (!url) return;
  const badge = severity === "error" ? "🔴" : severity === "warn" ? "🟠" : "🔵";
  const env =
    process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown";
  const detail = data
    ? "\n```" + JSON.stringify(data, null, 2).slice(0, 1500) + "```"
    : "";
  const text = `${badge} *Honest Funeral* [${env}] ${title}${detail}`;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2500);
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
      signal: ctrl.signal,
    }).catch(() => {});
    clearTimeout(timer);
  } catch {
    // Never let alerting break the request.
  }
}
