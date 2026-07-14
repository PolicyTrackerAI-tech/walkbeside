"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import { sanitizeAnalyticsUrl } from "@/lib/analytics";

/**
 * Privacy guard for Vercel Web Analytics page views.
 *
 * Vercel Web Analytics is cookieless and stores city-level geography only
 * (full IPs discarded) — matching the /privacy promise. This wrapper adds the
 * belt-and-suspenders layer the bare <Analytics /> mount lacked: every
 * recorded URL passes through sanitizeAnalyticsUrl (query strings dropped,
 * UUID path segments → [id], bearer-token segments → [token]); an
 * unparsable URL drops the event entirely. See lib/analytics.ts for the
 * rules and docs/ANALYTICS.md for the operating notes.
 *
 * Mounted once in the root layout. No-ops in local dev and off-Vercel.
 */
function sanitize(event: BeforeSendEvent): BeforeSendEvent | null {
  const url = sanitizeAnalyticsUrl(event.url);
  if (url === null) return null; // never send what we couldn't sanitise
  return { ...event, url };
}

export function AnalyticsBeacon() {
  return <Analytics beforeSend={sanitize} />;
}
