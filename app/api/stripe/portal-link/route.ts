import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, FEATURES, requireServer } from "@/lib/env";
import { requirePartnerApi } from "@/lib/partner/auth";
import { rateLimit } from "@/lib/rate-limit";
import { stripe } from "@/lib/stripe";
import { billingEligible } from "@/lib/billing";

/**
 * POST /api/stripe/portal-link — a Stripe customer-portal session for an
 * INSTITUTIONAL subscriber (invoices, card on file, cancel). Same gate order
 * as checkout, and pin-relevant for the same reasons: owner session →
 * eligibility 403 (guardrail #1, BEFORE the flag) → BILLING_LIVE 409 →
 * configured 503. No body is read.
 */
export async function POST() {
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

  const rl = rateLimit(`stripe-portal-link:${partner.id}`, {
    limit: 20,
    windowMs: 60 * 60_000,
  });
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  // Separate read for the same pre-Migration-B reason as checkout.
  let customerId: string | null = null;
  try {
    const svc = createServiceClient(
      PUBLIC.supabaseUrl,
      requireServer("SUPABASE_SERVICE_ROLE_KEY"),
    );
    const { data, error } = await svc
      .from("partners")
      .select("stripe_customer_id")
      .eq("id", partner.id)
      .single();
    if (error) throw error;
    customerId = data?.stripe_customer_id ?? null;
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  // Nothing to manage until a checkout has created the customer.
  if (!customerId) {
    return NextResponse.json({ error: "no_subscription" }, { status: 409 });
  }

  try {
    const session = await stripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${PUBLIC.appUrl}/portal/settings`,
    });
    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
