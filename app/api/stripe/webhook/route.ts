import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";
import { notifyChosenHome } from "@/lib/negotiation/notify-chosen-home";

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
    const outreachId = session.metadata?.outreachId;

    // Model A: the only Stripe charge is the per-deal success fee, paid when
    // the family chooses a home. On payment, close the negotiation and notify
    // the chosen home. (The /negotiate/[id]/closed page performs the same
    // reconciliation if this webhook is delayed or missed.)
    if (negotiationId) {
      const admin = createClient(
        PUBLIC.supabaseUrl,
        requireServer("SUPABASE_SERVICE_ROLE_KEY"),
      );
      // Conditional update — only proceeds if not already closed. Prevents
      // duplicate home notifications on Stripe webhook retries.
      const { data: updated } = await admin
        .from("negotiations")
        .update({
          status: "closed",
          unlocked_at: new Date().toISOString(),
          stripe_payment_intent_id: session.payment_intent as string,
        })
        .eq("id", negotiationId)
        .neq("status", "closed")
        .select("id");
      if (updated && updated.length > 0 && outreachId) {
        const result = await notifyChosenHome({
          admin,
          negotiationId,
          outreachId,
        });
        console.info(
          `[webhook] notifyChosenHome neg=${negotiationId} reason=${result.reason} sent=${result.sent}`,
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}
