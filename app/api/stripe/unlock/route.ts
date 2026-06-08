import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, stripeAvailable, calcFeeCents } from "@/lib/stripe";
import { PUBLIC } from "@/lib/env";

/**
 * Pure $49 unlock checkout. Pays to reveal home names + ratings + quotes
 * on the dashboard. Independent from picking a specific home.
 *
 * Form-POST so it works without JS: <form action="/api/stripe/unlock" method="post">
 */
export async function POST(req: Request) {
  const form = await req.formData();
  const negotiationId = String(form.get("negotiationId") ?? "");
  if (!negotiationId)
    return NextResponse.json({ error: "missing" }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  const { data: neg } = await supabase
    .from("negotiations")
    .select("id, user_id, unlocked_at")
    .eq("id", negotiationId)
    .eq("user_id", user.id)
    .single();
  if (!neg)
    return NextResponse.json({ error: "not_found" }, { status: 404 });

  // Already unlocked — just send them back to the dashboard.
  if (neg.unlocked_at) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  const fee = calcFeeCents();
  const origin = PUBLIC.appUrl || new URL(req.url).origin;

  if (!stripeAvailable()) {
    // Dev: no Stripe configured — flip the unlock immediately so the flow stays exercisable.
    await supabase
      .from("negotiations")
      .update({ unlocked_at: new Date().toISOString(), fee_cents: fee })
      .eq("id", negotiationId);
    return NextResponse.redirect(
      new URL(`/dashboard?unlocked=${negotiationId}&dryrun=1`, req.url),
    );
  }

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
            name: "Honest Funeral advocate fee",
            description:
              "Unlocks the funeral homes that responded to your authorized outreach. Refundable if no presented home honors their quote within 14 days.",
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/dashboard?unlocked=${negotiationId}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/dashboard?canceled=${negotiationId}`,
    metadata: { negotiationId, kind: "unlock" },
  });

  await supabase
    .from("negotiations")
    .update({ stripe_payment_intent_id: session.id, fee_cents: fee })
    .eq("id", negotiationId);

  return NextResponse.redirect(session.url!, { status: 303 });
}
