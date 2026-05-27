/**
 * Single source of truth for Honest Funeral's physical mailing address.
 *
 * CAN-SPAM requires a valid physical postal address in every commercial
 * email. Every outbound footer (funeral-home outreach, selection, family
 * relay, nurture, anniversary, welcome) renders this line.
 *
 * Default is Honest Funeral, LLC's registered-agent address (a public
 * business address, so safe to commit). Override with OUTREACH_POSTAL_ADDRESS
 * in Vercel if the mailing address ever changes — no code deploy needed.
 */
export const POSTAL_ADDRESS_DEFAULT =
  "Honest Funeral, LLC · 7533 S Center View Ct, Ste N, West Jordan, UT 84084";

export function postalAddressLine(): string {
  return process.env.OUTREACH_POSTAL_ADDRESS ?? POSTAL_ADDRESS_DEFAULT;
}
