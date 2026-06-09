import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";
import { sendOutreachForNegotiation } from "@/lib/negotiation/send";

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
      const result = await sendOutreachForNegotiation(admin, negotiationId);
      console.info(
        `[webhook] sendOutreach neg=${negotiationId} sent=${result.sent} dryRun=${result.dryRun} skipped=${result.skipped}`,
      );
    }
  }

  return NextResponse.json({ received: true });
}
