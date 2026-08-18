/**
 * Family-safe labels for negotiation_outreach.status values.
 *
 * Internal enum strings must NEVER reach a family's screen (the 2026-08 A2
 * audit found the status page printing the literal string "dry_run" to a
 * grieving family). Every render site maps through this module; the fallback
 * guarantees an unknown or future enum degrades to calm English instead of
 * leaking jargon.
 *
 * Client-safe (no server imports) — used by the status page (client) and the
 * dashboard card (server).
 */

/** Row statuses that mean an email really left our system. */
const SENT_STATUSES = new Set(["sent", "replied", "no-reply"]);

const LABELS: Record<string, string> = {
  // Rows created but not yet processed by the send path.
  pending: "Preparing",
  // Live sends.
  sent: "Sent — waiting on their reply",
  replied: "Replied",
  "no-reply": "No reply yet",
  declined: "Declined",
  // OUTREACH_LIVE was off when the send ran: the request was prepared and
  // recorded, and no email went to the home. Say exactly that.
  dry_run: "Prepared — not sent",
};

export function outreachStatusLabel(status: string): string {
  return LABELS[status] ?? "In progress";
}

/**
 * True when at least one outreach email for this case actually went out —
 * the only condition under which a surface may say "we're contacting funeral
 * homes." Prepared/dry-run rows never count, no matter what OUTREACH_LIVE
 * says now: a dry_run row is terminal (the send path only processes
 * `pending` rows), so flipping the flag later does not retroactively send
 * these.
 */
export function anyOutreachSent(rows: { status: string }[]): boolean {
  return rows.some((r) => SENT_STATUSES.has(r.status));
}
