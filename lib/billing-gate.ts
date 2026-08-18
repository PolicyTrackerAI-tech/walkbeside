import "server-only";
import { NextResponse } from "next/server";
import { FEATURES } from "@/lib/env";
import { requirePartnerApi, type PortalContext } from "@/lib/partner/auth";
import { rateLimit, type RateLimitRule } from "@/lib/rate-limit";
import { billingEligible } from "@/lib/billing";

/**
 * The shared gate ladder for the /api/stripe money routes (checkout,
 * portal-link — NOT the webhook, whose auth is the Stripe signature). The
 * ORDER is pin-relevant (lib/__tests__/billing-guardrails.test.ts) and lives
 * here exactly once so the two routes can never drift apart:
 *
 *   1. owner session          → 401/403 from requirePartnerApi
 *   2. eligibility allowlist  → 403 (guardrail #1 — BEFORE the flag, so no
 *                               flag state ever opens billing to an insurer
 *                               or a funeral home)
 *   3. BILLING_LIVE           → 409 (read at request time, never a module
 *                               const — the flag pin stubs it)
 *   4. FEATURES.billing()     → 503
 *   5. per-partner rate limit → 429
 *
 * This module never imports the Stripe factory — that stays confined to
 * app/api/stripe/ (guardrail #2's structural scan).
 */
export async function requireBillingOwner(
  rlKeyPrefix: string,
  rlRule: RateLimitRule,
): Promise<PortalContext | NextResponse> {
  const gate = await requirePartnerApi("owner");
  if (gate instanceof NextResponse) return gate;
  const { partner } = gate;

  if (!billingEligible(partner.partner_type)) {
    return NextResponse.json({ error: "unavailable" }, { status: 403 });
  }
  if (process.env.BILLING_LIVE !== "true") {
    return NextResponse.json({ error: "billing_not_live" }, { status: 409 });
  }
  if (!FEATURES.billing()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const rl = rateLimit(`${rlKeyPrefix}:${partner.id}`, rlRule);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  return gate;
}
