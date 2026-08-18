import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, hasServer, requireServer } from "@/lib/env";
import { readLimitedText } from "@/lib/http-guards";
import { stripe } from "@/lib/stripe";
import { billingEligible } from "@/lib/billing";

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
 * - Ordering guard: subscription events carry a SNAPSHOT that can arrive out
 *   of order (Stripe does not order event types, and 500-retries reorder
 *   further) — so for created/updated the handler re-fetches the
 *   subscription's CURRENT state from Stripe and writes that, making stale
 *   or replayed events harmless. `deleted` is terminal and written directly.
 * - Eligibility (guardrail #1 defense-in-depth): even a hand-made
 *   subscription whose metadata points at an insurer/funeral-home partner
 *   row is ignored — only hospice/employer rows can ever hold billing state.
 * - Error discipline: a failed DB read/write returns 500 so Stripe retries
 *   with backoff (supabase-js reports failures as {error}, not throws);
 *   "row not found" / not-ours events return 200 so they are never retried.
 * - This route writes ONLY the billing columns on partners
 *   (billing_status / billing_plan / billing_started_at /
 *   stripe_customer_id) — never family data, never any other table, and
 *   never partners.active/status: dunning is Stripe's, and a past_due
 *   partner keeps full service (families are never leverage).
 */

/**
 * Explicit lifecycle map. `incomplete` / `incomplete_expired` mean the FIRST
 * payment never succeeded — that is "never started", not "past due": mapping
 * them to null leaves billing_status at 'none' so the partner can simply try
 * checkout again (past_due would render the subscribed UI and hide the start
 * button forever). Anything else unmapped (e.g. "paused", or a future Stripe
 * status) also returns null → NO WRITE: the DB check constraint accepts only
 * none/active/past_due/canceled, and an unmapped write would 500 and churn
 * Stripe's retries forever.
 */
function mapSubscriptionStatus(
  s: string,
): "active" | "past_due" | "canceled" | null {
  if (s === "active" || s === "trialing") return "active";
  if (s === "past_due" || s === "unpaid") return "past_due";
  if (s === "canceled") return "canceled";
  return null;
}

function svc() {
  return createServiceClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );
}

type PartnerRef = { id: string; partner_type: string };
/** ok:false = the lookup itself failed (→ 500, Stripe retries); ok:true with
 *  partner:null = resolvable to nothing of ours (→ 200 ignore). */
type Resolution = { ok: true; partner: PartnerRef | null } | { ok: false };

/** Resolve the partner a subscription belongs to: metadata first (stamped by
 *  checkout's subscription_data), else the stored customer id. */
async function resolvePartnerForSubscription(
  admin: ReturnType<typeof svc>,
  sub: Stripe.Subscription,
): Promise<Resolution> {
  const metaId = sub.metadata?.partner_id;
  if (metaId) {
    const { data, error } = await admin
      .from("partners")
      .select("id, partner_type")
      .eq("id", metaId)
      .limit(1);
    if (error) return { ok: false };
    return { ok: true, partner: (data?.[0] as PartnerRef | undefined) ?? null };
  }
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  if (!customerId) return { ok: true, partner: null };
  const { data, error } = await admin
    .from("partners")
    .select("id, partner_type")
    .eq("stripe_customer_id", customerId)
    .limit(1);
  if (error) return { ok: false };
  return { ok: true, partner: (data?.[0] as PartnerRef | undefined) ?? null };
}

// Fresh Response per call — a Response body is one-shot, so these can never
// be shared module-level instances.
const retry = () => NextResponse.json({ error: "retry" }, { status: 500 });
const received = () => NextResponse.json({ received: true });

/** Write a billing patch; false = DB failure (caller returns 500 → retry). */
async function writeBilling(
  admin: ReturnType<typeof svc>,
  partnerId: string,
  patch: Record<string, string | null>,
): Promise<boolean> {
  const { error } = await admin
    .from("partners")
    .update(patch)
    .eq("id", partnerId);
  return !error;
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
      // async_payment_succeeded is the settle moment for delayed methods
      // (ACH debit — plausible for hospice AP); it carries the same session
      // shape with payment_status now "paid".
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;
        const partnerId =
          session.metadata?.partner_id ?? session.client_reference_id;
        if (!partnerId) break; // not ours → ignore
        const admin = svc();
        const { data, error } = await admin
          .from("partners")
          .select("partner_type, stripe_customer_id, billing_started_at")
          .eq("id", partnerId)
          .limit(1);
        if (error) return retry();
        const row = data?.[0] as
          | {
              partner_type: string;
              stripe_customer_id: string | null;
              billing_started_at: string | null;
            }
          | undefined;
        if (!row) break; // unresolvable → ignore
        if (!billingEligible(row.partner_type)) break; // guardrail #1
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;
        // "paid" (cards) or "no_payment_required" (trials) mean money/terms
        // are settled; "unpaid" means an async debit is still in flight —
        // record the customer id but do NOT mark active until it settles.
        const paid =
          session.payment_status === "paid" ||
          session.payment_status === "no_payment_required";
        const update: Record<string, string> = {};
        if (!row.stripe_customer_id && customerId) {
          update.stripe_customer_id = customerId;
        }
        if (paid) {
          update.billing_status = "active";
          // Set-once: a resubscribe after cancel never rewrites the original
          // start date.
          if (!row.billing_started_at) {
            update.billing_started_at = new Date().toISOString();
          }
        }
        if (Object.keys(update).length === 0) break;
        if (!(await writeBilling(admin, partnerId, update))) return retry();
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subEvent = event.data.object as Stripe.Subscription;
        const admin = svc();
        const resolution = await resolvePartnerForSubscription(admin, subEvent);
        if (!resolution.ok) return retry();
        const partner = resolution.partner;
        if (!partner || !billingEligible(partner.partner_type)) break;
        // Ordering guard: write the subscription's CURRENT state, not the
        // event's snapshot (a stale `active` delivered after `deleted` must
        // not resurrect a canceled partner). 404 = the subscription no
        // longer exists at all → treat as canceled.
        let current: Stripe.Subscription;
        try {
          current = await stripe().subscriptions.retrieve(subEvent.id);
        } catch (err) {
          if ((err as { statusCode?: number })?.statusCode === 404) {
            if (!(await writeBilling(admin, partner.id, { billing_status: "canceled" }))) {
              return retry();
            }
            break;
          }
          return retry(); // transient Stripe failure → retry
        }
        const mapped = mapSubscriptionStatus(current.status);
        if (!mapped) break; // never-started / unmapped → no write (see map)
        const ok = await writeBilling(admin, partner.id, {
          billing_status: mapped,
          billing_plan: current.items?.data?.[0]?.price?.id ?? null,
        });
        if (!ok) return retry();
        if (mapped === "active") {
          // Belt-and-braces stamp (set-once) in case the checkout.session
          // event was the one delivery that got lost. Idempotent, so a 500
          // retry of this whole event is safe.
          const { error } = await admin
            .from("partners")
            .update({ billing_started_at: new Date().toISOString() })
            .eq("id", partner.id)
            .is("billing_started_at", null);
          if (error) return retry();
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subEvent = event.data.object as Stripe.Subscription;
        const admin = svc();
        const resolution = await resolvePartnerForSubscription(admin, subEvent);
        if (!resolution.ok) return retry();
        const partner = resolution.partner;
        if (!partner || !billingEligible(partner.partner_type)) break;
        // Deletion is terminal for this subscription object — safe to write
        // directly. billing_plan is left in place as history of what they had.
        if (!(await writeBilling(admin, partner.id, { billing_status: "canceled" }))) {
          return retry();
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

  return received();
}
