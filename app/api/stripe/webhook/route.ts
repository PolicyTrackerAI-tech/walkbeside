import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";

export const runtime = "nodejs";

/**
 * Stripe webhook — finalises a negotiation as 'closed' on successful payment.
 * Uses the service-role key for cross-user writes from server context.
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
    if (negotiationId) {
      const admin = createClient(
        PUBLIC.supabaseUrl,
        requireServer("SUPABASE_SERVICE_ROLE_KEY"),
      );
      await admin
        .from("negotiations")
        .update({
          status: "closed",
          stripe_payment_intent_id: session.payment_intent as string,
        })
        .eq("id", negotiationId);
    }
  }

  return NextResponse.json({ received: true });
}
