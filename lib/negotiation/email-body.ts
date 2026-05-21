/**
 * Deterministic outreach email builder. Shared by the live send route
 * (/api/negotiate/start) and the admin preview route (/api/negotiate/preview)
 * so the preview is guaranteed to match what funeral homes actually receive.
 */

export interface OutreachEmailInput {
  familyLabel: string;
  authorizationId: string;
  advocateName: string;
  timing: string;
}

export interface OutreachEmail {
  subject: string;
  body: string;
}

export function buildFamilyLabel(
  senderFirstName: string,
  senderLastName?: string,
): string {
  return senderLastName
    ? `the ${senderLastName} family`
    : `${senderFirstName}'s family`;
}

export function buildOutreachEmail(input: OutreachEmailInput): OutreachEmail {
  const { familyLabel, authorizationId, advocateName, timing } = input;
  const subject = `GPL request on behalf of ${familyLabel} — ref ${authorizationId}`;
  const body = `Hello,

I'm writing from Honest Funeral on behalf of ${familyLabel}. They've engaged us as their consumer advocate to gather price information from funeral homes in your area before they choose where to make arrangements.

Could you reply with your current General Price List and any service-specific quote you can share? A PDF works fine. The family is planning arrangements ${timing}.

They'll review what comes back. If your firm is selected, we'll reach out to help schedule the in-person arrangement meeting — the family attends and signs directly with you.

Thank you for your time.

${advocateName}
Honest Funeral
honestfuneral.co
Authorization reference: ${authorizationId}

---
Honest Funeral is a consumer advocacy service, not a licensed funeral establishment. We help families gather pricing and prepare for the arrangement meeting; the family makes all arrangements directly with the funeral home they select.`;

  return { subject, body };
}

export interface SelectionEmailInput {
  familyLabel: string;
  homeName: string;
  serviceLabel: string;
  quoteCents: number;
  authorizationId: string;
  advocateName: string;
}

export function buildSelectionEmail(input: SelectionEmailInput): OutreachEmail {
  const { familyLabel, serviceLabel, quoteCents, authorizationId, advocateName } = input;
  const subject = `${capitalize(familyLabel)} selected your firm — ref ${authorizationId}`;
  const dollars = formatDollars(quoteCents);
  const body = `Hello,

Thank you for the General Price List you sent for ${familyLabel} (ref ${authorizationId}).

The family has selected your firm for ${serviceLabel} at the price you quoted: ${dollars}.

They'll come in for the in-person arrangement meeting to make selections and sign directly with your firm. We're helping with scheduling and any pre-meeting questions on their behalf. Please reply to this thread with:
- Your earliest available slot for an in-person meeting
- What they should bring (death certificate, ID, photos, etc.)
- Any questions you'd like answered ahead of time

We'll relay everything and keep the thread going until the meeting is on the calendar.

Thank you,

${advocateName}
Honest Funeral
honestfuneral.co
Authorization reference: ${authorizationId}

---
Honest Funeral is a consumer advocacy service, not a licensed funeral establishment. The family makes all funeral arrangements and signs all paperwork directly with you.`;

  return { subject, body };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatDollars(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function outreachFromAddress(): string {
  return (
    process.env.OUTREACH_FROM ?? "Honest Funeral <arrangements@honestfuneral.co>"
  );
}

export function outreachReplyTo(negotiationId: string): string {
  // reply.honestfuneral.co subdomain MX points at Postmark Inbound, which
  // webhooks /api/inbound/email when a funeral home replies. See migration
  // 2026-05-21-coordinator-messages.sql + app/api/inbound/email/route.ts.
  return `advocate+${negotiationId}@reply.honestfuneral.co`;
}

export function authorizationIdFor(negotiationId: string): string {
  return `WB-${negotiationId.slice(0, 8).toUpperCase()}`;
}

/**
 * Re-extract the family label from a previously-sent outreach body.
 * The body uses the pattern "...on behalf of {familyLabel}. They've engaged us..."
 * so a tight regex pulls it back out without needing a DB schema change.
 */
export function familyLabelFromOutreachBody(body: string): string | null {
  const m = body.match(/on behalf of (.+?)\. They've engaged us/);
  return m ? m[1] : null;
}

export const ADVOCATE_NAME = "The Honest Funeral Advocate Team";
