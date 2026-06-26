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

// The consumer family fee is decommissioned — Honest Funeral is free to
// families (Operating Plan guardrail #2). Stripe stays as scaffolding for
// future INSTITUTIONAL billing (per-facility annual), never a family charge.

export function fmtCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
