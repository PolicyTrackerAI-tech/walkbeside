import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, FEATURES, requireServer } from "@/lib/env";
import { requirePartnerApi } from "@/lib/partner/auth";
import { rateLimit } from "@/lib/rate-limit";
import { stripe } from "@/lib/stripe";
import {
  billingEligible,
  isBillingTier,
  BILLING_PRICE_ENV,
  bereavementInvoiceLine,
} from "@/lib/billing";

/**
 * POST /api/stripe/checkout — start an INSTITUTIONAL subscription (hospice or
 * employer partner, owner seat). Families are never charged (Operating Plan
 * guardrail #2); insurers and funeral homes can never pay (guardrail #1 — the
 * eligibility allowlist below runs BEFORE every other gate so no flag state
 * can ever open checkout to them).
 *
 * Gate order is pin-relevant (lib/__tests__/billing-guardrails.test.ts):
 * owner session → eligibility 403 → BILLING_LIVE 409 → configured 503 →
 * rate limit → tier assigned 409.
 *
 * No request body is read: the partner comes from the session gate and the
 * price comes from the founder-assigned billing_tier — the client supplies
 * nothing, so a partner can never self-select a cheaper tier.
 */
export async function POST() {
  const gate = await requirePartnerApi("owner");
  if (gate instanceof NextResponse) return gate;
  const { partner } = gate;

  if (!billingEligible(partner.partner_type)) {
    return NextResponse.json({ error: "unavailable" }, { status: 403 });
  }

  // Read at request time, never a module const — the flag pin stubs it.
  if (process.env.BILLING_LIVE !== "true") {
    return NextResponse.json({ error: "billing_not_live" }, { status: 409 });
  }
  if (!FEATURES.billing()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const rl = rateLimit(`stripe-checkout:${partner.id}`, {
    limit: 10,
    windowMs: 60 * 60_000,
  });
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const svc = createServiceClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );

  // Billing columns are NOT part of the session gate's partner select (that
  // select must keep working against a pre-Migration-B database) — read them
  // here, where a missing column is a clean 503.
  let tierRaw: unknown = null;
  let customerId: string | null = null;
  try {
    const { data, error } = await svc
      .from("partners")
      .select("billing_tier, stripe_customer_id")
      .eq("id", partner.id)
      .single();
    if (error) throw error;
    tierRaw = data?.billing_tier ?? null;
    customerId = data?.stripe_customer_id ?? null;
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  // The founder assigns the tier by census (/admin/partners) before the ask —
  // BUSINESS_PLAN §10's "tier pre-selected by census". Until then: quiet 409.
  if (!isBillingTier(tierRaw)) {
    return NextResponse.json({ error: "tier_not_assigned" }, { status: 409 });
  }
  const tier = tierRaw;
  const priceEnv = BILLING_PRICE_ENV[tier];
  if (!process.env[priceEnv]) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  try {
    if (!customerId) {
      const customer = await stripe().customers.create({
        email: partner.contact_email ?? undefined,
        name: partner.name,
        metadata: { partner_id: partner.id },
      });
      // Guarded persist (only onto a still-null row) so a concurrent checkout
      // can't fork the partner across two customers; on a lost race the
      // winner's id is re-read and ours is left orphaned in Stripe (harmless,
      // test mode until BILLING_LIVE ever ships).
      const { data: claimed } = await svc
        .from("partners")
        .update({ stripe_customer_id: customer.id })
        .eq("id", partner.id)
        .is("stripe_customer_id", null)
        .select("stripe_customer_id");
      if (claimed && claimed.length > 0) {
        customerId = customer.id;
      } else {
        const { data: existing } = await svc
          .from("partners")
          .select("stripe_customer_id")
          .eq("id", partner.id)
          .single();
        customerId =
          (existing as { stripe_customer_id: string | null } | null)
            ?.stripe_customer_id ?? customer.id;
      }
    }

    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: requireServer(priceEnv), quantity: 1 }],
      success_url: `${PUBLIC.appUrl}/portal/settings?billing=success`,
      cancel_url: `${PUBLIC.appUrl}/portal/settings`,
      metadata: { partner_id: partner.id },
      client_reference_id: partner.id,
      subscription_data: {
        metadata: { partner_id: partner.id },
        // What the hospice's AP department reads on every invoice —
        // bereavement-support procurement framing, BUSINESS_PLAN §10 verbatim.
        description: bereavementInvoiceLine(tier),
      },
    });
    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
