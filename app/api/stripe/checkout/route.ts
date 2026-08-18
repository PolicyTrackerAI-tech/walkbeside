import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";
import { requireBillingOwner } from "@/lib/billing-gate";
import { stripe } from "@/lib/stripe";
import {
  isBillingTier,
  BILLING_PRICE_ENV,
  bereavementInvoiceLine,
} from "@/lib/billing";

/**
 * POST /api/stripe/checkout — start an INSTITUTIONAL subscription (hospice or
 * employer partner, owner seat). Families are never charged (Operating Plan
 * guardrail #2); insurers and funeral homes can never pay (guardrail #1).
 * The pin-relevant gate ladder (owner → eligibility 403 → BILLING_LIVE 409 →
 * configured 503 → rate limit) lives in lib/billing-gate.ts, shared with
 * portal-link so the order can never drift between routes.
 *
 * No request body is read: the partner comes from the session gate and the
 * price comes from the founder-assigned billing_tier — the client supplies
 * nothing, so a partner can never self-select a cheaper tier.
 */
export async function POST() {
  const gate = await requireBillingOwner("stripe-checkout", {
    limit: 10,
    windowMs: 60 * 60_000,
  });
  if (gate instanceof NextResponse) return gate;
  const { partner } = gate;

  const svc = createServiceClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );

  // Billing columns are NOT part of the session gate's partner select (that
  // select must keep working against a pre-Migration-B database) — read them
  // here, where a missing column is a clean 503.
  let tierRaw: unknown = null;
  let customerId: string | null = null;
  let billingStatus: string | null = null;
  try {
    const { data, error } = await svc
      .from("partners")
      .select("billing_tier, stripe_customer_id, billing_status")
      .eq("id", partner.id)
      .single();
    if (error) throw error;
    tierRaw = data?.billing_tier ?? null;
    customerId = data?.stripe_customer_id ?? null;
    billingStatus = data?.billing_status ?? null;
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  // A live or lapsed-but-open subscription means Checkout would stack a
  // SECOND subscription on the same customer (Stripe allows it) — double
  // billing. Manage/retry goes through the customer portal instead.
  if (billingStatus === "active" || billingStatus === "past_due") {
    return NextResponse.json({ error: "already_subscribed" }, { status: 409 });
  }

  // The founder assigns the tier by census (/admin/partners) before the ask —
  // BUSINESS_PLAN §10's "tier pre-selected by census". Until then: quiet 409.
  if (!isBillingTier(tierRaw)) {
    return NextResponse.json({ error: "tier_not_assigned" }, { status: 409 });
  }
  const tier = tierRaw;
  // FEATURES.billing() (in the gate) is any-tier-loose; the SPECIFIC assigned
  // tier's price id may still be missing. That's founder config in progress,
  // not an outage — quiet 409, not a retry-me 5xx.
  const priceId = process.env[BILLING_PRICE_ENV[tier]];
  if (!priceId) {
    return NextResponse.json({ error: "tier_not_configured" }, { status: 409 });
  }

  try {
    if (!customerId) {
      const customer = await stripe().customers.create({
        email: partner.contact_email ?? undefined,
        name: partner.name,
        metadata: { partner_id: partner.id },
      });
      // Guarded persist (only onto a still-null row) so a concurrent checkout
      // can't fork the partner across two customers. Every outcome is
      // error-checked: proceeding with an id we failed to persist would
      // attach the subscription to a customer the product has no record of.
      const { data: claimed, error: claimErr } = await svc
        .from("partners")
        .update({ stripe_customer_id: customer.id })
        .eq("id", partner.id)
        .is("stripe_customer_id", null)
        .select("stripe_customer_id");
      if (claimErr) {
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
      }
      if (claimed && claimed.length > 0) {
        customerId = customer.id;
      } else {
        // Lost the race — a concurrent request persisted first. Use the
        // winner's id (ours stays orphaned in Stripe, harmless in test mode);
        // if the re-read can't produce one, abort rather than guess.
        const { data: existing, error: readErr } = await svc
          .from("partners")
          .select("stripe_customer_id")
          .eq("id", partner.id)
          .single();
        const winner =
          (existing as { stripe_customer_id: string | null } | null)
            ?.stripe_customer_id ?? null;
        if (readErr || !winner) {
          return NextResponse.json({ error: "unavailable" }, { status: 503 });
        }
        customerId = winner;
      }
    }

    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
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
