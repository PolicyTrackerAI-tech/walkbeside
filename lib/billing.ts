/**
 * Institutional billing constants + eligibility. Server pages, API routes,
 * and admin UI all read these; NOTHING family-facing ever imports this module
 * (nothing family-facing has a reason to — families are never charged,
 * Operating Plan guardrail #2).
 *
 * Pure constants and pure functions only — no env access, no Stripe import.
 * The Stripe client factory itself may be invoked only under app/api/stripe/
 * (pinned by lib/__tests__/billing-guardrails.test.ts).
 */

/**
 * Census tiers per BUSINESS_PLAN §10 — small (<50 ADC), mid (50–100),
 * large (100+). Each maps to a founder-created monthly recurring price in the
 * Stripe dashboard; code carries only the env var NAME, never an amount.
 */
export const BILLING_TIERS = ["small", "mid", "large"] as const;
export type BillingTier = (typeof BILLING_TIERS)[number];

/** Env var carrying each tier's Stripe price id (price_…). */
export const BILLING_PRICE_ENV: Record<BillingTier, string> = {
  small: "STRIPE_PRICE_SMALL",
  mid: "STRIPE_PRICE_MID",
  large: "STRIPE_PRICE_LARGE",
};

export function isBillingTier(v: unknown): v is BillingTier {
  return (
    typeof v === "string" && (BILLING_TIERS as readonly string[]).includes(v)
  );
}

/**
 * THE payer allowlist (Operating Plan guardrail #1): only hospices and
 * employers can ever reach a billing state. Written as an allowlist — not an
 * insurer denylist — so there is structurally no way to invoice an insurer, a
 * funeral home, or any future partner type without a deliberate edit here.
 * Every /api/stripe/ money route checks this BEFORE the BILLING_LIVE flag.
 */
export function billingEligible(partnerType: string): boolean {
  return partnerType === "hospice" || partnerType === "employer";
}

/**
 * THE invoice-line framing (BUSINESS_PLAN §10, verbatim law): what a hospice's
 * AP department and any auditor reads. Bereavement/psychosocial-support
 * procurement — matches the AKS analysis; never "referrals", never
 * "marketing". Rendered onto every subscription invoice via the Checkout
 * session's subscription description. Use the helper; never retype it.
 */
export const BEREAVEMENT_INVOICE_LINE = "bereavement support program";

export function bereavementInvoiceLine(tier: BillingTier): string {
  return `${BEREAVEMENT_INVOICE_LINE} — ${tier}`;
}
