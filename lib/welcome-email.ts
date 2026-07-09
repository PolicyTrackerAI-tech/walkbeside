/**
 * Welcome email sent to new signups via the EmailCapture component.
 * Maps the per-page `source` to the right guide title + URL, then
 * builds branded HTML and plaintext.
 *
 * Voice rules (per project memory):
 *  - No FD-credibility tagline ("built by a licensed funeral director")
 *    in transactional content.
 *  - Short brand sign-off ("Honest Funeral — quiet help after a loss")
 *    IS welcome at the bottom.
 *  - Tone: calm friend, no marketing fluff, no urgency.
 */

import { postalAddressLine } from "@/lib/postal-address";

const SITE = "https://honestfuneral.co";

interface SourceInfo {
  /** Human-readable title of the guide. */
  title: string;
  /** Path on the site (no protocol/domain). */
  path: string;
}

const SOURCE_CONTENT: Record<string, SourceInfo> = {
  grief: { title: "Grief, month by month", path: "/grief" },
  "how-to-pay": {
    title: "How to pay for a funeral when you can't afford it",
    path: "/how-to-pay",
  },
  "talking-to-kids": {
    title: "Talking to children about death",
    path: "/talking-to-kids",
  },
  "digital-legacy": {
    title: "Digital legacy — handling online accounts after death",
    path: "/digital-legacy",
  },
  "sudden-loss": { title: "Sudden death — the first 72 hours", path: "/sudden-loss" },
  "after-hospice": {
    title: "When someone dies in hospice",
    path: "/after-hospice",
  },
  "final-days": {
    title: "The final days — caring for someone who is dying",
    path: "/final-days",
  },
  "end-of-life": {
    title: "End of life — when you're the one dying",
    path: "/end-of-life",
  },
  "funeral-etiquette": {
    title: "Funeral etiquette — what to say, what to wear",
    path: "/funeral-etiquette",
  },
  "pet-loss": { title: "When the animal you loved dies", path: "/pet-loss" },
  "disenfranchised-grief": {
    title: "When the world doesn't recognize your loss",
    path: "/disenfranchised-grief",
  },
  "suicide-loss": { title: "Suicide loss — for survivors", path: "/suicide-loss" },
  "overdose-loss": { title: "Overdose loss", path: "/overdose-loss" },
  "death-of-a-child": { title: "Death of a child", path: "/death-of-a-child" },
  cheatsheet: {
    title: "The Honest Funeral arrangement cheat sheet",
    path: "/prep",
  },
};

const FALLBACK: SourceInfo = {
  title: "Your Honest Funeral guide",
  path: "/guides",
};

export function buildWelcomeEmail(source: string): {
  subject: string;
  html: string;
  text: string;
} {
  const info = SOURCE_CONTENT[source] ?? FALLBACK;
  const url = `${SITE}${info.path}`;

  const subject = `Your guide is here: ${info.title}`;

  const html = `<div style="background-color: #f9f7f3; padding: 32px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a;">
  <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 40px 32px;">
    <h1 style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 400; color: #1a1a1a; margin: 0 0 20px 0; line-height: 1.3;">Welcome to Honest Funeral.</h1>
    <p style="font-size: 16px; line-height: 1.6; color: #4a4a4a; margin: 0 0 12px 0;">Here's the guide you saved:</p>
    <p style="font-family: Georgia, 'Times New Roman', serif; font-size: 18px; color: #1a1a1a; margin: 0 0 24px 0;">${info.title}</p>
    <a href="${url}" style="display: inline-block; background-color: #1f3d2c; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 500; font-size: 15px;">Read the guide</a>
    <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin: 28px 0 0 0;">It'll be here whenever you need it. We'll send one calm email a month with new resources we've built. Never marketing, never shared.</p>
    <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin: 12px 0 0 0;">If this wasn't you, ignore this email and we'll remove the address.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0 16px 0;" />
    <p style="font-family: Georgia, 'Times New Roman', serif; font-size: 12px; color: #9ca3af; margin: 0 0 6px 0;">Honest Funeral — quiet help after a loss.</p>
    <p style="font-size: 11px; color: #9ca3af; margin: 0;">${postalAddressLine()}</p>
  </div>
</div>`;

  const text = `Welcome to Honest Funeral.

Here's the guide you saved: ${info.title}

${url}

It'll be here whenever you need it. We'll send one calm email a month with new resources we've built. Never marketing, never shared.

If this wasn't you, reply to this email and we'll remove the address.

Honest Funeral — quiet help after a loss.

${postalAddressLine()}
`;

  return { subject, html, text };
}
