import Stripe from "stripe";
import { FEATURES, requireServer } from "./env";

let _stripe: Stripe | null = null;
export function stripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(requireServer("STRIPE_SECRET_KEY"));
  }
  return _stripe;
}

export const stripeAvailable = FEATURES.stripe;

/**
 * Pricing model: 20% of savings, capped at $500 per closed deal.
 */
export function calcFeeCents(savingsCents: number): number {
  const raw = Math.round(savingsCents * 0.2);
  return Math.min(raw, 500_00);
}

export function fmtCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
