import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, hasServer, requireServer } from "@/lib/env";
import { readLimitedText } from "@/lib/http-guards";
import { stripe } from "@/lib/stripe";

/**
 * POST /api/stripe/webhook — Stripe subscription lifecycle → partners billing
 * columns. The signature is the auth:
 *
 * - RAW BODY law: the signature covers the exact bytes, so this route reads
 *   text once via readLimitedText and NEVER readLimitedJson (parsing destroys
 *   what the HMAC signs).
 * - NOT gated by BILLING_LIVE: a flag flip must never desync billing state
 *   from Stripe. No validateOrigin either — Stripe posts server-to-server
 *   with no Origin header.
 * - NO RATE_LIMITS entry for /api/stripe/webhook (lib/rate-limit.ts keys on
 *   exact pathname): throttling Stripe's own retries drops events. Do not
 *   "fix" this in a rate-limit sweep.
 * - This route writes ONLY the billing columns on partners
 *   (billing_status / billing_plan / billing_started_at /
 *   stripe_customer_id) — never family data, never any other table, and
 *   never partners.active/status: dunning is Stripe's, and a past_due
 *   partner keeps full service (families are never leverage).
 */

/**
 * Explicit lifecycle map. Anything unmapped (e.g. "paused", or a future
 * Stripe status) returns null → NO WRITE: the DB check constraint accepts
 * only none/active/past_due/canceled, and an unmapped write would 500 and
 * churn Stripe's retries forever.
 */
function mapSubscriptionStatus(
  s: string,
): "active" | "past_due" | "canceled" | null {
  if (s === "active" || s === "trialing") return "active";
  if (
    s === "past_due" ||
    s === "unpaid" ||
    s === "incomplete" ||
    s === "incomplete_expired"
  ) {
    return "past_due";
  }
  if (s === "canceled") return "canceled";
  return null;
}

function svc() {
  return createServiceClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );
}

/** Resolve the partner a subscription belongs to: metadata first (stamped by
 *  checkout's subscription_data), else the stored customer id. Null = not
 *  ours / pre-migration → the caller 200-ignores. */
async function partnerIdForSubscription(
  admin: ReturnType<typeof svc>,
  sub: Stripe.Subscription,
): Promise<string | null> {
  const fromMeta = sub.metadata?.partner_id;
  if (fromMeta) return fromMeta;
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  if (!customerId) return null;
  try {
    const { data } = await admin
      .from("partners")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .limit(1);
    return data && data.length > 0 ? (data[0] as { id: string }).id : null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  if (!hasServer("STRIPE_WEBHOOK_SECRET")) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const limited = await readLimitedText(req, 512);
  if (!limited.ok) {
    return NextResponse.json(
      { error: limited.error },
      { status: limited.status },
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(
      limited.text,
      req.headers.get("stripe-signature") ?? "",
      requireServer("STRIPE_WEBHOOK_SECRET"),
    );
  } catch {
    return NextResponse.json({ error: "bad_signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const partnerId =
          session.metadata?.partner_id ?? session.client_reference_id;
        if (!partnerId) break; // not ours → ignore
        const admin = svc();
        const { data: row } = await admin
          .from("partners")
          .select("stripe_customer_id, billing_started_at")
          .eq("id", partnerId)
          .single();
        if (!row) break; // unresolvable → ignore
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;
        const update: Record<string, string> = { billing_status: "active" };
        // Set-once: later checkouts (e.g. resubscribe after cancel) never
        // rewrite the original start date.
        if (!row.billing_started_at) {
          update.billing_started_at = new Date().toISOString();
        }
        if (!row.stripe_customer_id && customerId) {
          update.stripe_customer_id = customerId;
        }
        // supabase-js reports failures as {error}, not a throw — check it, so
        // a transient DB blip 500s and Stripe retries instead of the event
        // being silently dropped. (Pre-migration DBs never reach these
        // writes: the reads above already resolved to ignore.)
        const { error } = await admin
          .from("partners")
          .update(update)
          .eq("id", partnerId);
        if (error) {
          return NextResponse.json({ error: "retry" }, { status: 500 });
        }
        break;
      }

      // .created included alongside .updated: a fresh checkout emits
      // subscription.created (possibly before checkout.session.completed —
      // Stripe does not order event types), and it's what stamps
      // billing_plan without waiting for a later change. Same explicit map,
      // so an unknown initial status still writes nothing.
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const admin = svc();
        const partnerId = await partnerIdForSubscription(admin, sub);
        if (!partnerId) break;
        const mapped = mapSubscriptionStatus(sub.status);
        if (!mapped) break; // unmapped status → no write (see map above)
        const { error } = await admin
          .from("partners")
          .update({
            billing_status: mapped,
            billing_plan: sub.items?.data?.[0]?.price?.id ?? null,
          })
          .eq("id", partnerId);
        if (error) {
          return NextResponse.json({ error: "retry" }, { status: 500 });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const admin = svc();
        const partnerId = await partnerIdForSubscription(admin, sub);
        if (!partnerId) break;
        // billing_plan is left in place as history of what they had.
        const { error } = await admin
          .from("partners")
          .update({ billing_status: "canceled" })
          .eq("id", partnerId);
        if (error) {
          return NextResponse.json({ error: "retry" }, { status: 500 });
        }
        break;
      }

      default:
        // Unknown event types → acknowledged and ignored.
        break;
    }
  } catch {
    // Unexpected throw: 500 so Stripe retries with backoff.
    return NextResponse.json({ error: "retry" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
