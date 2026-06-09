import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";
import { sendOutreachForNegotiation } from "@/lib/negotiation/send";
import { logEvent, logWarn, captureError } from "@/lib/observability";

export const runtime = "nodejs";

/**
 * Stripe webhook — on successful upfront payment, SENDS the prepared outreach
 * for the negotiation. This is the gate: no funeral home is emailed until this
 * fires (or the status page reconciles the same payment). Uses the service-role
 * key for cross-user writes from server context.
 */
export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig)
    return NextResponse.json({ error: "no_signature" }, { status: 400 });

  let event;
  try {
    const raw = await req.text();
    event = stripe().webhooks.constructEvent(
      raw,
      sig,
      requireServer("STRIPE_WEBHOOK_SECRET"),
    );
  } catch (e) {
    // Invalid signature is usually a prober or a misconfigured secret — log,
    // don't page.
    logWarn("stripe.webhook.bad_signature", {
      error: e instanceof Error ? e.message : "bad_sig",
    });
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "bad_sig" },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const negotiationId = session.metadata?.negotiationId;

    // Upfront pay-to-send: payment confirmed → send the prepared outreach.
    // Idempotent (only `pending` rows send; the negotiation moves out of
    // pending_payment), so webhook retries and the status-page reconciliation
    // are both safe.
    if (negotiationId) {
      const admin = createClient(
        PUBLIC.supabaseUrl,
        requireServer("SUPABASE_SERVICE_ROLE_KEY"),
      );
      try {
        const result = await sendOutreachForNegotiation(admin, negotiationId);
        logEvent("stripe.webhook.outreach_sent", {
          negotiationId,
          ...result,
        });
      } catch (e) {
        // Payment succeeded but sending threw — a paid family with no outreach.
        // Alert; Stripe will retry the webhook, and the status-page
        // reconciliation is a second backstop.
        await captureError("stripe.webhook.send_failed", e, { negotiationId });
        return NextResponse.json({ error: "send_failed" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
