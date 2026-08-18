import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";
import { requireBillingOwner } from "@/lib/billing-gate";
import { stripe } from "@/lib/stripe";

/**
 * POST /api/stripe/portal-link — a Stripe customer-portal session for an
 * INSTITUTIONAL subscriber (invoices, card on file, cancel). Shares the
 * pin-relevant gate ladder with checkout via lib/billing-gate.ts
 * (owner → eligibility 403 → BILLING_LIVE 409 → configured 503 → rate
 * limit). No body is read.
 */
export async function POST() {
  const gate = await requireBillingOwner("stripe-portal-link", {
    limit: 20,
    windowMs: 60 * 60_000,
  });
  if (gate instanceof NextResponse) return gate;
  const { partner } = gate;

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
