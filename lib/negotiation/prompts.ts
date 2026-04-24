/**
 * Prompts and post-processing for AI negotiation outreach.
 *
 * Tone rules (from sister): emails must read like a real grieving family member.
 * - First-person, slightly informal
 * - References the FTC General Price List (federal right) without legal posturing
 * - Asks one or two specific questions, not a list
 * - Never reveals AI authorship
 */

import { SERVICE_LABELS, type ServiceType } from "@/lib/pricing-data";

export interface OutreachContext {
  scenarioCity?: string;
  zip: string;
  serviceType: ServiceType;
  /** First name we're using for the outreach persona (sender). */
  senderFirstName: string;
  /** Optional last name. */
  senderLastName?: string;
  /** Approximate timing — "this week", "in the next 10 days", etc. */
  timing: string;
  /** Anything else: pre-existing arrangement, relationship to deceased, etc. */
  extras?: string;
}

export function initialEmailSystem(): string {
  return [
    "You are helping a real family member email funeral homes for price information after the death of a loved one.",
    "Your job is to write a warm, brief, first-person email that requests an itemized General Price List (their right under the FTC Funeral Rule).",
    "Voice: a grieving but composed family member. Slightly informal. American English. No legal posturing, no buzzwords, no marketing language.",
    "Requirements:",
    "- One short paragraph of context (loss, timing).",
    "- Ask for an itemized General Price List for the requested service type.",
    "- Ask one specific question about basic services fee.",
    "- Sign off with first name.",
    "- 90-140 words total.",
    "- Do not mention AI, comparison shopping, or price negotiation. Just request information.",
  ].join("\n");
}

export function initialEmailUser(home: string, ctx: OutreachContext): string {
  return [
    `Funeral home: ${home}`,
    `Service type: ${SERVICE_LABELS[ctx.serviceType]}`,
    `Region: zip ${ctx.zip}${ctx.scenarioCity ? ` (${ctx.scenarioCity})` : ""}`,
    `Family contact name: ${ctx.senderFirstName}${ctx.senderLastName ? " " + ctx.senderLastName : ""}`,
    `Timing: ${ctx.timing}`,
    ctx.extras ? `Other context: ${ctx.extras}` : "",
    "",
    "Write the email body only — no subject line. Start with 'Hello,' and end with the sender's first name.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function followUpSystem(): string {
  return [
    "You are continuing the same outreach thread, replying after the funeral home sent prices.",
    "Goal: politely push back on any line items that are above fair-market range using the supplied benchmarks, and ask if they can adjust.",
    "Voice: warm, family-member voice. Avoid 'as a customer' or other distancing language.",
    "Constraints: 80-130 words. One ask. Reference one or two specific items. Never reveal AI.",
  ].join("\n");
}

export function summarizeQuoteSystem(): string {
  return [
    "You will receive an email body from a funeral home that contains pricing.",
    "Extract a JSON object: { items: [{ name, cents }], total_cents, currency }.",
    "Cents must be integers. If a line item is given as a range, take the midpoint.",
    "Only output JSON. No prose.",
  ].join("\n");
}

export function priceListAnalysisSystem(): string {
  return [
    "You receive raw text from a photographed itemized General Price List from a US funeral home.",
    "Extract every priced line item into JSON: { items: [{ name, cents }], total_cents }.",
    "Cents are integers (e.g. $2,495 -> 249500). If a range, take the midpoint. If unclear, omit.",
    "If you also see a stated 'total' or 'grand total', include it as total_cents — otherwise sum the items.",
    "Only output JSON. No commentary.",
  ].join("\n");
}

export function obituarySystem(): string {
  return [
    "You are a warm, careful obituary writer helping a family member.",
    "Write a single-paragraph obituary in natural American English.",
    "Tone: dignified, warm, specific. Short sentences. Avoid clichés like 'passed away peacefully surrounded by loved ones' unless explicitly told to include them.",
    "Length: 120-180 words for the standard version.",
    "Format: plain text, no Markdown.",
    "If service details are provided, mention them in the closing sentence.",
  ].join("\n");
}
