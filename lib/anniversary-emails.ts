/**
 * Anniversary check-in email templates and milestone logic.
 *
 * Three milestones: 1 month, 6 months, 1 year after the user paid the
 * toolkit. Each is sent ONCE per user — tracked via
 * profiles.anniversary_emails_sent JSONB array.
 *
 * Tone: warm, light, useful. NOT marketing. The user paid us once and
 * we promised to walk with them through the arc; these check-ins are
 * us keeping that promise.
 */

import { postalAddressLine } from "@/lib/postal-address";

export type Milestone = "1mo" | "6mo" | "1yr";

export const MILESTONE_DAYS: Record<Milestone, number> = {
  "1mo": 30,
  "6mo": 180,
  "1yr": 365,
};

export interface EmailContent {
  subject: string;
  text: string;
}

export function emailFor(
  milestone: Milestone,
  unsubscribeUrl: string,
): EmailContent {
  if (milestone === "1mo") {
    return {
      subject: "Checking in — one month later",
      text: `Hi,

It's been about a month since we walked the arrangement-meeting and first-week paperwork together. We hope you're holding up okay.

A few things that come up around the 30-day mark for most families:

— The death certificates have hopefully arrived. If banks or insurers are pushing back on copies, ${url("/next-30-days")} has scripts.

— Social Security might be clawing back the last payment. Normal. They notify; nothing for you to do unless you receive paperwork.

— Most life-insurance claims should be in motion. If a policy hasn't paid out yet, the NAIC Life Policy Locator is at ${url("/next-30-days")} (under "find every life insurance claim").

— If we found you a funeral home through our outreach and the quote didn't match the bill, that's a refund situation. Reply to this email and we'll help.

We're not building toward anything more from you. Your $49 covered everything. This is just a check-in.

If you'd rather not hear from us at the 6-month and 1-year marks, ${unsubscribeLink(unsubscribeUrl)}

Take care,
The Honest Funeral team

${postalAddressLine()}`,
    };
  }

  if (milestone === "6mo") {
    return {
      subject: "Six months — the estate stretch",
      text: `Hi,

Six months in. The hardest weeks are behind you. The estate work — probate, retirement accounts, final tax return — is usually what's left.

A few specific things at this stage that families often miss:

— The final 1040 (last year of the deceased's life) is typically due April 15 of the following year. If we're inside that window, this is the time to find a CPA who handles estates.

— Inherited IRAs have a 10-year drain rule for most non-spouse beneficiaries. Getting this wrong is expensive. Our estate guide at ${url("/estate")} has the details.

— Unclaimed property: every state runs a database of dormant accounts. Search every state the deceased ever lived in. Most families turn up a few hundred to a few thousand dollars they didn't know existed. ${url("/estate")} links to the official multi-state search.

— If the deceased was a veteran and the family hasn't claimed VA burial benefits yet, you have until 2 years after burial. ${url("/veterans")} walks through it.

If you'd rather not hear from us at the 1-year mark, ${unsubscribeLink(unsubscribeUrl)}

Take care,
The Honest Funeral team

${postalAddressLine()}`,
    };
  }

  // 1yr
  return {
    subject: "One year",
    text: `Hi,

It's been a year. We're not writing to ask for anything — just to say that the first anniversary of a death is its own thing, and we hope you're handling it the way you need to.

A few practical notes for year-mark housekeeping:

— If probate is still open, this is when most attorneys close it out. If yours hasn't moved in months, ask why.

— Recurring charges that slipped through the cracks early on tend to surface around now. ${url("/subscriptions")} catches them if you want a fresh scan.

— If you set up your own estate while you were thinking about it last year (a lot of families do), this is a good time to check that beneficiary designations are still right and your will is current.

This is the last automated note from us. The toolkit at ${url("/dashboard")} stays open as long as you have an account. We're here whenever you need it.

If something comes up — even years from now — reply to this email and a person responds.

Take care,
The Honest Funeral team

P.S. ${unsubscribeLink(unsubscribeUrl)}

${postalAddressLine()}`,
  };
}

function url(path: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://honestfuneral.co";
  return `${base}${path}`;
}

function unsubscribeLink(unsubscribeUrl: string): string {
  return `you can unsubscribe here: ${unsubscribeUrl}`;
}
