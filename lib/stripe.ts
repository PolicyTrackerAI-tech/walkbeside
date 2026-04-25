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
 * Pricing model: flat success fee, charged only when the family signs with a
 * home we presented to them. No counterfactual baseline required.
 */
export const FLAT_FEE_CENTS = 49_00;

export function calcFeeCents(): number {
  return FLAT_FEE_CENTS;
}

export function fmtCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
