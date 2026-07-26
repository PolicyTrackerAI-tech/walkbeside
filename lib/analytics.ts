import { track } from "@vercel/analytics";

/**
 * Reach-metric events for SCORECARD.md's "tool uses" / "email subs" rows.
 * Vercel Analytics is cookie-free and aggregate-only — no per-user identity,
 * no PII in properties. Call only from Client Components.
 */
export type ToolEvent =
  | "analyzer_completed"
  | "decide_recommended"
  | "obituary_generated"
  | "plan_now_completed"
  | "email_signup"
  | "negotiate_started"
  // Loop events (sprint Day 4): the four organic loops' seams. Aggregate
  // counts only, like everything above — no codes, no identities.
  | "nominate_submitted"
  | "hospice_intro_copied"
  | "share_clicked"
  | "partner_cta_clicked";

export function trackTool(
  event: ToolEvent,
  properties?: Record<string, string | number | boolean | null | undefined>,
): void {
  track(event, properties);
}

// --- URL sanitizer for the page-view beacon ---------------------------------

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
// Long hex path segments are bearer credentials (partners.report_token is 48
// hex chars) — never let one reach analytics. 24+ chars clears any real token
// while leaving ordinary words and short ids alone.
const LONG_HEX = /\b[0-9a-f]{24,}\b/gi;

/**
 * Strip everything person- or credential-shaped from a page-view URL before
 * it is recorded (the /privacy page promises "privacy-respecting analytics"):
 *
 *   1. Drop ALL query strings — `?ref=` referral codes, unsubscribe
 *      `?token=`, auth-callback `?code=`/`?next=` all ride in queries.
 *   2. Collapse UUID path segments → `[id]` (`/negotiate/<uuid>` becomes
 *      `/negotiate/[id]`) so per-case URLs group instead of identifying.
 *   3. Collapse long-hex path segments → `[token]` (`/partner/r/<token>`)
 *      so a bearer credential can never be read back out of analytics.
 *
 * Returns null when the URL can't be parsed — the caller drops the event
 * rather than risk sending an unsanitised value.
 */
export function sanitizeAnalyticsUrl(raw: string): string | null {
  try {
    const url = new URL(raw);
    url.search = "";
    url.hash = "";
    url.pathname = url.pathname.replace(UUID, "[id]").replace(LONG_HEX, "[token]");
    return url.toString();
  } catch {
    return null;
  }
}
