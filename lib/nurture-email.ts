/**
 * Nurture-email content. Two follow-ups after the welcome email:
 *   step 1 — about 7 days after signup ("just checking in")
 *   step 2 — about 21 days after step 1 ("if you ever need us")
 *
 * Source-aware opener for the most common signup pages; generic
 * fallback for the rest. Voice (per project memory):
 *   - No FD-credibility tagline in transactional
 *   - Short brand sign-off ("Honest Funeral — quiet help after a loss")
 *   - Tone: calm friend, no urgency, no marketing fluff
 */

import crypto from "node:crypto";
import { postalAddressLine } from "@/lib/postal-address";

const SITE = "https://honestfuneral.co";

interface SourceContext {
  guideTitle: string;
  guidePath: string;
  /** Per-source opener line for the day-7 email. */
  step1Opener: string;
}

const SOURCE: Record<string, SourceContext> = {
  grief: {
    guideTitle: "Grief, month by month",
    guidePath: "/grief",
    step1Opener:
      "It's been a week. Grief doesn't move on a schedule, so this is just a check-in — not a nudge.",
  },
  "how-to-pay": {
    guideTitle: "How to pay for a funeral",
    guidePath: "/how-to-pay",
    step1Opener:
      "It's been a week since you saved the paying-for-a-funeral guide. The programs we listed change occasionally — if anything in the guide became out of date, we'll fold it into a future update.",
  },
  "talking-to-kids": {
    guideTitle: "Talking to children about death",
    guidePath: "/talking-to-kids",
    step1Opener:
      "It's been a week. If you've had a hard conversation since, we hope it landed how you needed.",
  },
  "digital-legacy": {
    guideTitle: "Digital legacy",
    guidePath: "/digital-legacy",
    step1Opener:
      "It's been a week since you saved the digital-legacy checklist. Most families work through it across several weeks — no rush.",
  },
  "sudden-loss": {
    guideTitle: "Sudden death",
    guidePath: "/sudden-loss",
    step1Opener:
      "It's been a week. The first weeks after sudden loss are particularly disorienting. We're not going to push anything — just checking in.",
  },
  "after-hospice": {
    guideTitle: "When someone dies in hospice",
    guidePath: "/after-hospice",
    step1Opener:
      "It's been a week. The paperwork that follows a hospice death is real — if any of it is feeling overwhelming, there's a related guide below.",
  },
  "final-days": {
    guideTitle: "The final days",
    guidePath: "/final-days",
    step1Opener:
      "It's been a week. Whatever phase you're in, we hope the guide helped you know what to expect.",
  },
  "end-of-life": {
    guideTitle: "End of life",
    guidePath: "/end-of-life",
    step1Opener:
      "It's been a week since you saved the end-of-life guide. We hope it gave you what you needed for the decisions ahead.",
  },
  "funeral-etiquette": {
    guideTitle: "Funeral etiquette",
    guidePath: "/funeral-etiquette",
    step1Opener:
      "It's been a week. If you attended a funeral since, we hope you knew what to do and what to say.",
  },
  "pet-loss": {
    guideTitle: "When the animal you loved dies",
    guidePath: "/pet-loss",
    step1Opener:
      "It's been a week. Pet loss is real grief; we don't think of it as anything less.",
  },
  "disenfranchised-grief": {
    guideTitle: "When the world doesn't recognize your loss",
    guidePath: "/disenfranchised-grief",
    step1Opener:
      "It's been a week. The hardest part of disenfranchised grief is usually how alone it feels — finding even one other person who's been through the same kind of loss tends to help.",
  },
  "suicide-loss": {
    guideTitle: "Suicide loss",
    guidePath: "/suicide-loss",
    step1Opener:
      "It's been a week. We're not going to push anything — just want you to know the guide is still there when you can come back to it. If you're in crisis, call or text 988.",
  },
  "overdose-loss": {
    guideTitle: "Overdose loss",
    guidePath: "/overdose-loss",
    step1Opener:
      "It's been a week. Overdose loss carries a layer of stigma other losses don't — GRASP and similar peer communities help most. Link below.",
  },
  "death-of-a-child": {
    guideTitle: "Death of a child",
    guidePath: "/death-of-a-child",
    step1Opener:
      "It's been a week. There's no urgency to read more right now. We're not going to push anything.",
  },
  cheatsheet: {
    guideTitle: "Arrangement cheat sheet",
    guidePath: "/prep",
    step1Opener:
      "It's been a week since you grabbed the arrangement cheat sheet. If you're approaching an actual arrangement meeting, the rest of our free tools might be useful.",
  },
};

const FALLBACK: SourceContext = {
  guideTitle: "your Honest Funeral guide",
  guidePath: "/guides",
  step1Opener: "It's been a week since you signed up. Just checking in.",
};

function unsubscribeUrl(email: string): string {
  const secret = process.env.UNSUBSCRIBE_SECRET ?? "fallback-please-set";
  const token = crypto
    .createHmac("sha256", secret)
    .update(email.toLowerCase())
    .digest("hex")
    .slice(0, 32);
  const params = new URLSearchParams({ e: email, t: token });
  return `${SITE}/unsubscribe?${params.toString()}`;
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const secret = process.env.UNSUBSCRIBE_SECRET ?? "fallback-please-set";
  const expected = crypto
    .createHmac("sha256", secret)
    .update(email.toLowerCase())
    .digest("hex")
    .slice(0, 32);
  if (token.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

function brandFooter(email: string): string {
  return `<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0 16px 0;" />
  <p style="font-family: Georgia, 'Times New Roman', serif; font-size: 12px; color: #9ca3af; margin: 0 0 6px 0;">Honest Funeral — quiet help after a loss.</p>
  <p style="font-size: 11px; color: #9ca3af; margin: 0 0 6px 0;">Not interested in these check-ins? <a href="${unsubscribeUrl(email)}" style="color: #9ca3af; text-decoration: underline;">One-click unsubscribe</a>.</p>
  <p style="font-size: 11px; color: #9ca3af; margin: 0;">${postalAddressLine()}</p>`;
}

function brandFooterText(email: string): string {
  return `\nHonest Funeral — quiet help after a loss.\n\nNot interested in these check-ins? One click to unsubscribe: ${unsubscribeUrl(email)}\n\n${postalAddressLine()}\n`;
}

export function buildNurtureEmail(
  step: 1 | 2,
  source: string,
  email: string,
): { subject: string; html: string; text: string } {
  const ctx = SOURCE[source] ?? FALLBACK;
  const guideUrl = `${SITE}${ctx.guidePath}`;

  if (step === 1) {
    const subject = `How are you doing?`;

    const html = `<div style="background-color: #f9f7f3; padding: 32px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a;">
  <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 40px 32px;">
    <h1 style="font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: 400; color: #1a1a1a; margin: 0 0 20px 0; line-height: 1.35;">How are you doing?</h1>
    <p style="font-size: 16px; line-height: 1.65; color: #4a4a4a; margin: 0 0 20px 0;">${ctx.step1Opener}</p>
    <p style="font-size: 16px; line-height: 1.65; color: #4a4a4a; margin: 0 0 20px 0;">If you ever want to talk to a person, just reply to this email. Someone reads it.</p>
    <p style="font-size: 14px; line-height: 1.6; color: #4a4a4a; margin: 0 0 6px 0;">In case you need it again:</p>
    <a href="${guideUrl}" style="display: inline-block; background-color: #1f3d2c; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 500; font-size: 14px;">Open ${ctx.guideTitle} →</a>
    ${brandFooter(email)}
  </div>
</div>`;

    const text = `How are you doing?

${ctx.step1Opener}

If you ever want to talk to a person, just reply to this email. Someone reads it.

In case you need it again:
${guideUrl}
${brandFooterText(email)}`;

    return { subject, html, text };
  }

  // step 2
  const subject = `If you ever need help with funeral arrangement`;

  const html = `<div style="background-color: #f9f7f3; padding: 32px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a;">
  <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 40px 32px;">
    <h1 style="font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: 400; color: #1a1a1a; margin: 0 0 20px 0; line-height: 1.35;">If you ever need help with funeral arrangement.</h1>
    <p style="font-size: 16px; line-height: 1.65; color: #4a4a4a; margin: 0 0 16px 0;">Quick note in case it's useful. We help families compare funeral homes before they sign anything — typical savings on the arrangement run $2,000 to $5,000.</p>
    <p style="font-size: 16px; line-height: 1.65; color: #4a4a4a; margin: 0 0 16px 0;">A flat $49, paid upfront before we contact any home. Refundable in 14 days. We take no commissions or kickbacks from any funeral home — your $49 is our only revenue.</p>
    <a href="${SITE}/where" style="display: inline-block; background-color: #1f3d2c; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 500; font-size: 15px;">Start here when you need it →</a>
    <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin: 24px 0 0 0;">This is the last nurture email we'll send. If you want updates when we publish new guides, stay subscribed — otherwise the one-click link below stops everything.</p>
    ${brandFooter(email)}
  </div>
</div>`;

  const text = `If you ever need help with funeral arrangement.

Quick note in case it's useful. We help families compare funeral homes before they sign anything — typical savings on the arrangement run $2,000 to $5,000.

A flat $49, paid upfront before we contact any home. Refundable in 14 days. We take no commissions or kickbacks from any funeral home — your $49 is our only revenue.

Start here when you need it:
${SITE}/where

This is the last nurture email we'll send. If you want updates when we publish new guides, stay subscribed — otherwise the one-click link below stops everything.
${brandFooterText(email)}`;

  return { subject, html, text };
}
