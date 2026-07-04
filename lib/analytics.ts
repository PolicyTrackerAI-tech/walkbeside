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
  | "negotiate_started";

export function trackTool(
  event: ToolEvent,
  properties?: Record<string, string | number | boolean | null | undefined>,
): void {
  track(event, properties);
}
