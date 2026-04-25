/**
 * Prompts and post-processing for the transparent-intermediary outreach.
 *
 * Voice rules:
 * - The email is sent BY Honest Funeral ON BEHALF OF a named family (never pretending to be the family).
 * - Invokes the FTC Funeral Rule to request the General Price List — which is a legal right, not aggression.
 * - Warm, brief, professional. Clear signature identifying Honest Funeral as the sender.
 * - Never impersonates the family, never claims to be the family, never hides AI involvement where the
 *   content is material (the advocacy relationship itself is disclosed).
 */

import { SERVICE_LABELS, type ServiceType } from "@/lib/pricing-data";

export interface OutreachContext {
  scenarioCity?: string;
  zip: string;
  serviceType: ServiceType;
  /** First name of the family member we're representing — used only in body text, not as a persona. */
  senderFirstName: string;
  /** Optional family last name for identification. */
  senderLastName?: string;
  /** Approximate timing — "this week", "in the next 10 days", etc. */
  timing: string;
  /** Anything else: pre-existing arrangement, relationship to deceased, etc. */
  extras?: string;
  /** Free-text notes from the family (religious tradition, language, accommodations). */
  notes?: string;
  /** Name of the Honest Funeral advocate signing the email. */
  advocateName?: string;
  /** Short authorization reference ID the family signed. */
  authorizationId?: string;
}

export function initialEmailSystem(): string {
  return [
    "You are drafting a professional email sent BY Honest Funeral (a consumer advocacy service) to a funeral home, ON BEHALF OF a family that has engaged Honest Funeral.",
    "You are NOT the family. You are writing from the Honest Funeral advocate's perspective.",
    "Voice: warm, professional, respectful of the recipient. American English. Not legalistic. Not aggressive.",
    "Requirements:",
    "- Identify clearly that the email is from Honest Funeral, representing a family who is considering this firm.",
    "- Request the firm's current itemized General Price List under the FTC Funeral Rule — frame it as a routine request, not a demand.",
    "- Name the service type and rough timing.",
    "- State that the family will review responses and contact the selected home directly.",
    "- Invite the firm to reply with GPL and any service-specific quote.",
    "- Sign off as the Honest Funeral advocate, not as the family.",
    "- Include the authorization reference ID if provided.",
    "- 110-170 words total.",
    "- Never claim to BE the family. Never say 'I'm reaching out after my loved one died.' The sender is Honest Funeral.",
    "- Never use deceptive language or imply the message is from a grieving individual directly.",
  ].join("\n");
}

export function initialEmailUser(home: string, ctx: OutreachContext): string {
  const familyName = ctx.senderLastName
    ? `the ${ctx.senderLastName} family`
    : `${ctx.senderFirstName}'s family`;
  return [
    `Funeral home: ${home}`,
    `Service type: ${SERVICE_LABELS[ctx.serviceType]}`,
    `Region: zip ${ctx.zip}${ctx.scenarioCity ? ` (${ctx.scenarioCity})` : ""}`,
    `Family: ${familyName}`,
    `Timing: ${ctx.timing}`,
    ctx.authorizationId ? `Authorization reference: ${ctx.authorizationId}` : "",
    ctx.advocateName ? `Advocate signing the email: ${ctx.advocateName}` : "Advocate signing the email: the Honest Funeral team",
    ctx.extras ? `Other context: ${ctx.extras}` : "",
    ctx.notes ? `Family notes: ${ctx.notes}` : "",
    "",
    "Write the email body only — no subject line. Start with 'Hello,' and end with a Honest Funeral advocate signature block.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function followUpSystem(): string {
  return [
    "You are continuing the same outreach thread from Honest Funeral, replying after the funeral home sent prices.",
    "You represent a family as their consumer advocate. You are not the family.",
    "Goal: acknowledge the quote, politely note any line items that are above the regional fair range (using supplied benchmarks), and ask if the firm can clarify or adjust.",
    "Voice: warm, professional, plain. No legalistic posturing. Reference one or two specific items, not all of them.",
    "Constraints: 90-140 words. Sign off as the Honest Funeral advocate. Never pretend to be the family.",
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
    "You are a warm, careful obituary drafting assistant helping a family member. The output is a DRAFT only — the family will verify every factual claim before publishing.",
    "Write a single-paragraph obituary in natural American English.",
    "Tone: dignified, warm, specific. Short sentences. Avoid clichés like 'passed away peacefully surrounded by loved ones' unless explicitly told to include them.",
    "Never invent family member names, dates, or relationships. If a detail is missing or ambiguous, write [TO VERIFY] in place of the detail rather than guessing.",
    "If the death involved suicide, overdose, or violence, do not use war or battle metaphors (no 'lost a battle', 'fought bravely'). Use plain language.",
    "Length: 120-180 words for the standard version.",
    "Format: plain text, no Markdown.",
    "If service details are provided, mention them in the closing sentence.",
  ].join("\n");
}
