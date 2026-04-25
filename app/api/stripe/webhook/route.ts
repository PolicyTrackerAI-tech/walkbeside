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
    const kind = session.metadata?.kind;
    if (negotiationId) {
      const admin = createClient(
        PUBLIC.supabaseUrl,
        requireServer("SUPABASE_SERVICE_ROLE_KEY"),
      );
      // 'unlock' = pure $49 to reveal homes (V2 flow). Sets unlocked_at, leaves status alone.
      // anything else = legacy per-home checkout that closes the deal.
      const update: Record<string, unknown> = {
        stripe_payment_intent_id: session.payment_intent as string,
      };
      if (kind === "unlock") {
        update.unlocked_at = new Date().toISOString();
      } else {
        update.status = "closed";
        update.unlocked_at = new Date().toISOString();
      }
      await admin
        .from("negotiations")
        .update(update)
        .eq("id", negotiationId);
    }
  }

  return NextResponse.json({ received: true });
}
