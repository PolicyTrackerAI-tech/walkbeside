import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, stripeAvailable, calcFeeCents } from "@/lib/stripe";
import { PUBLIC } from "@/lib/env";

/**
 * Create a Stripe Checkout session for the negotiation fee on the chosen home.
 * Submitted as a regular form POST from the results page so it works even if JS is disabled.
 */
export async function POST(req: Request) {
  const form = await req.formData();
  const negotiationId = String(form.get("negotiationId") ?? "");
  const outreachId = String(form.get("outreachId") ?? "");
  if (!negotiationId || !outreachId)
    return NextResponse.json({ error: "missing" }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  const { data: neg } = await supabase
    .from("negotiations")
    .select("id, user_id")
    .eq("id", negotiationId)
    .eq("user_id", user.id)
    .single();
  if (!neg)
    return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { data: pick } = await supabase
    .from("negotiation_outreach")
    .select("id, home_name, home_email")
    .eq("id", outreachId)
    .eq("negotiation_id", negotiationId)
    .single();
  if (!pick)
    return NextResponse.json({ error: "not_found" }, { status: 404 });

  const fee = calcFeeCents();

  if (!stripeAvailable()) {
    // Stripe not configured — mark closed in dev so the flow stays exercisable.
    await supabase
      .from("negotiations")
      .update({
        status: "closed",
        fee_cents: fee,
      })
      .eq("id", negotiationId);
    return NextResponse.redirect(
      new URL(
        `/negotiate/${negotiationId}/closed?dryrun=1&fee=${fee}`,
        req.url,
      ),
    );
  }

  const origin = PUBLIC.appUrl || new URL(req.url).origin;
  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: user.email ?? undefined,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: fee,
          product_data: {
            name: `Funerose advocacy fee — ${pick.home_name}`,
            description:
              "Flat success fee for presenting funeral homes that responded to your authorized outreach. Refundable if the selected home refuses to honor their quote within 14 days.",
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/negotiate/${negotiationId}/closed?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/negotiate/${negotiationId}/results`,
    metadata: { negotiationId, outreachId },
  });

  await supabase
    .from("negotiations")
    .update({
      stripe_payment_intent_id: session.id,
      fee_cents: fee,
    })
    .eq("id", negotiationId);

  return NextResponse.redirect(session.url!, { status: 303 });
}
