/**
 * Display-mode helper for the negotiate flow: is live outreach on?
 *
 * DISPLAY ONLY. The three send gates (lib/negotiation/send.ts,
 * notify-chosen-home.ts, app/api/negotiate/[id]/messages/route.ts) each check
 * `process.env.OUTREACH_LIVE === "true"` themselves at send time — this helper
 * exists so family-facing surfaces can tell the truth about what the flow will
 * do ("we're contacting homes" vs "your outreach is prepared, nothing sent"),
 * never so a send site can delegate its own gate. Do not import it from a send
 * path; do not weaken either side to "consolidate."
 *
 * Server-only: on the client `process.env.OUTREACH_LIVE` is undefined and the
 * helper would silently report false forever. Server pages read it and pass
 * the boolean down as a prop (or via the /api/negotiate/[id] payload).
 */

import "server-only";

export function outreachIsLive(): boolean {
  return process.env.OUTREACH_LIVE === "true";
}
