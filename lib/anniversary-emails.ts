/**
 * Bereavement check-in email templates and milestone logic.
 *
 * Five milestones anchored on the DATE OF DEATH the family gave us at intake:
 * 1 month, 3 months, 6 months, 1 year, and 13 months — the span of the
 * bereavement window Medicare requires hospices to support (42 CFR 418.64).
 * Each is sent ONCE per user — tracked via profiles.anniversary_emails_sent.
 *
 * No date, no cadence: the anchor is only ever the family's own explicit
 * entry, never inferred from signup or activity (a mis-anchored condolence
 * email is the worst failure mode this system has).
 *
 * Tone: warm, light, useful. NOT marketing. Everything we offer is free; these
 * check-ins are us keeping the promise to walk the whole arc with the family.
 */

import { postalAddressLine } from "@/lib/postal-address";

export type Milestone = "1mo" | "3mo" | "6mo" | "1yr" | "13mo";

/** Ordered earliest → latest. Order is load-bearing for dueMilestone/markSent. */
export const MILESTONE_ORDER: Milestone[] = ["1mo", "3mo", "6mo", "1yr", "13mo"];

export const MILESTONE_DAYS: Record<Milestone, number> = {
  "1mo": 30,
  "3mo": 90,
  "6mo": 180,
  "1yr": 365,
  "13mo": 395,
};

const DAY_MS = 24 * 3600 * 1000;

/**
 * The single milestone to send now, or null. Picks the LATEST due, unsent
 * milestone — one email per cron run.
 *
 * A family that joins (or sets the date) late must get only the latest
 * applicable check-in — never a stale earlier one on a later day. The old
 * loop had exactly that bug: after sending "6mo" to a day-200 joiner, the
 * next day's run would send the "it's been about a month" email at day 201.
 * Callers must record the result with markSent(), which also marks every
 * earlier milestone as handled.
 */
export function dueMilestone(
  anchorMs: number,
  sent: string[],
  nowMs: number,
): Milestone | null {
  for (const m of [...MILESTONE_ORDER].reverse()) {
    if (sent.includes(m)) return null; // this and everything earlier is handled
    if (nowMs - anchorMs >= MILESTONE_DAYS[m] * DAY_MS) return m;
  }
  return null;
}

/**
 * Record a sent milestone AND every earlier one, so a skipped-past milestone
 * can never fire late and out of order.
 */
export function markSent(sent: string[], milestone: Milestone): string[] {
  const upTo = MILESTONE_ORDER.slice(
    0,
    MILESTONE_ORDER.indexOf(milestone) + 1,
  );
  return Array.from(new Set([...sent, ...upTo]));
}

export interface EmailContent {
  subject: string;
  text: string;
}


/**
 * The SMS version of each check-in — same arc, ~2 segments max, opt-in only.
 * "Txt STOP to opt out" rides every message (CTIA); Twilio also enforces
 * STOP automatically. No links except ours; no marketing, ever.
 */
export function smsFor(milestone: Milestone, prefsUrl: string): string {
  const stop = "Text STOP to opt out.";
  const map: Record<Milestone, string> = {
    "1mo": `Honest Funeral: it's been about a month. No task here — just checking in. When you're ready, the after-death checklist is at honestfuneral.co/next-30-days. ${stop}`,
    "3mo": `Honest Funeral: three months — often the quiet stretch. If they were on hospice, that hospice owes your family free grief support for ~13 months; one call starts it. More: honestfuneral.co/grief. ${stop}`,
    "6mo": `Honest Funeral: six months in. If grief still feels heavy most days, our quiet self-check gives an honest read + who to talk to: honestfuneral.co/grief#self-check. ${stop}`,
    "1yr": `Honest Funeral: one year. Anniversaries are their own thing — we hope you're taking it however you need. We're at honestfuneral.co if anything's undone. ${stop}`,
    "13mo": `Honest Funeral: our last automated note. If grief still feels like the early months, that's treatable, not a failing — honestfuneral.co/grief lists people who genuinely help. Take care. ${stop}`,
  };
  void prefsUrl; // email carries the preferences link; SMS relies on STOP.
  return map[milestone];
}

export function emailFor(
  milestone: Milestone,
  unsubscribeUrl: string,
): EmailContent {
  if (milestone === "1mo") {
    return {
      subject: "Checking in — one month later",
      text: `Hi,

It's been about a month. We hope you're holding up okay.

A few things that come up around the 30-day mark for most families:

— The death certificates have hopefully arrived. If banks or insurers are pushing back on copies, ${url("/next-30-days")} has scripts.

— Social Security might be clawing back the last payment. Normal. They notify; nothing for you to do unless you receive paperwork.

— Most life-insurance claims should be in motion. If a policy hasn't paid out yet, the NAIC Life Policy Locator is at ${url("/next-30-days")} (under "find every life insurance claim").

— If the funeral home's final bill didn't match the quote you were given, reply to this email — we'll help you push back. That help is free, like everything else we do.

We're not building toward anything more from you. This is just a check-in.

If you'd rather not hear from us at the later marks, ${unsubscribeLink(unsubscribeUrl)}

Take care,
The Honest Funeral team

${postalAddressLine()}`,
    };
  }

  if (milestone === "3mo") {
    return {
      subject: "Three months — the quiet stretch",
      text: `Hi,

Three months in. This is often when things go quiet — the calls slow down, the food stops arriving, and the paperwork is still there. If it feels harder now than it did at the start, that's common, not a step backward.

Two things worth knowing at this point:

— If your loved one was on hospice care, that hospice is required to offer your family bereavement support — check-ins, counseling, groups — for about thirteen months after the death, at no cost to you. It's a Medicare requirement, and most families never use it. You're entitled to it; one phone call to the hospice is enough to start.

— Grieving while you're still buried in estate work is heavy. Our grief page at ${url("/grief")} is short and practical — what's normal, what helps, and when it's worth talking to someone.

Nothing to do here. Just checking in.

If you'd rather not hear from us at the later marks, ${unsubscribeLink(unsubscribeUrl)}

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

— And a reminder from the three-month note: if they were on hospice, that hospice still owes your family free bereavement support — counseling, groups, check-ins — through about the thirteen-month mark. Fewer than half of families ever use it. One call to the hospice's bereavement line starts it.

— If you're wondering whether what you're feeling at six months is "normal," our grief page has a quiet self-check — not a test, nothing saved — at ${url("/grief#self-check")}.

If you'd rather not hear from us at the later marks, ${unsubscribeLink(unsubscribeUrl)}

Take care,
The Honest Funeral team

${postalAddressLine()}`,
    };
  }

  if (milestone === "1yr") {
    return {
      subject: "One year",
      text: `Hi,

It's been a year. We're not writing to ask for anything — just to say that the first anniversary of a death is its own thing, and we hope you're handling it the way you need to.

A few practical notes for year-mark housekeeping:

— If probate is still open, this is when most attorneys close it out. If yours hasn't moved in months, ask why.

— Recurring charges that slipped through the cracks early on tend to surface around now. ${url("/subscriptions")} catches them if you want a fresh scan.

— If you set up your own estate plan while you were thinking about it last year (a lot of families do), this is a good time to check that beneficiary designations are still right and your will is current.

— And an honest check-in on the grief itself: if it still feels as consuming as the early months, the quiet self-check at ${url("/grief#self-check")} gives you an honest read and the right people to talk to. Past a year, that pattern is treatable — not something to white-knuckle.

We'll send one last note in about a month, and then leave you in peace.

Take care,
The Honest Funeral team

P.S. ${unsubscribeLink(unsubscribeUrl)}

${postalAddressLine()}`,
    };
  }

  // 13mo — closes the arc, just past the anniversary.
  return {
    subject: "A last note from us",
    text: `Hi,

You've made it past the year mark — the anniversary, the paperwork, all of it. This is the last automated note we'll send.

Two honest things before we go quiet:

— If grief still feels as heavy now as it did in the early months, that's worth taking seriously — not as a failing, but as something a grief counselor genuinely helps with. If your loved one was on hospice, their bereavement line may still be open to you. Our grief page at ${url("/grief")} lists other ways to find someone good.

— Your account and everything in it stays open at ${url("/dashboard")} for as long as you want it. Nothing expires.

If something comes up — even years from now — reply to this email and a person responds.

It's been an honor to walk this with you.

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
