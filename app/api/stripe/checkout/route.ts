import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { stripe, stripeAvailable, calcFeeCents } from "@/lib/stripe";
import { isPaidUser } from "@/lib/auth-paid";
import { PUBLIC, requireServer } from "@/lib/env";
import { sendOutreachForNegotiation } from "@/lib/negotiation/send";

/**
 * Upfront pay-to-send checkout. This is the ONLY charge under Model A: a flat
 * $49, paid BEFORE we contact any funeral home. On success we send the
 * prepared outreach (lib/negotiation/send.ts). Picking a home afterward costs
 * nothing more.
 *
 * Submitted as a form POST from /negotiate/[id]/preview so it works without JS.
 *
 * Free-email test/founder accounts (isPaidUser → isFreeEmail) skip Stripe so
 * we don't charge ourselves during testing — but the outreach still sends.
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
    .select("id, user_id, status")
    .eq("id", negotiationId)
    .eq("user_id", user.id)
    .single();
  if (!neg) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // Already paid / already sending → don't charge again; go to status.
  if (neg.status !== "pending_payment") {
    return NextResponse.redirect(
      new URL(`/negotiate/${negotiationId}/status`, req.url),
      { status: 303 },
    );
  }

  const admin = () =>
    createServiceClient(
      PUBLIC.supabaseUrl,
      requireServer("SUPABASE_SERVICE_ROLE_KEY"),
    );

  // Free-email test/founder account → send now, no charge.
  if (await isPaidUser(supabase, user)) {
    await sendOutreachForNegotiation(admin(), negotiationId);
    return NextResponse.redirect(
      new URL(`/negotiate/${negotiationId}/status?freebypass=1`, req.url),
      { status: 303 },
    );
  }

  // Stripe not configured (dev) → send now so the flow stays exercisable.
  if (!stripeAvailable()) {
    await sendOutreachForNegotiation(admin(), negotiationId);
    return NextResponse.redirect(
      new URL(`/negotiate/${negotiationId}/status?dryrun=1`, req.url),
      { status: 303 },
    );
  }

  const fee = calcFeeCents();
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
            name: "Honest Funeral — funeral-home outreach",
            description:
              "Flat fee to contact local funeral homes on your behalf, collect itemized quotes, and present them side by side. Refundable within 14 days if we don't save you anything.",
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/negotiate/${negotiationId}/status?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/negotiate/${negotiationId}/preview?canceled=1`,
    metadata: { negotiationId },
  });

  await supabase
    .from("negotiations")
    .update({ stripe_payment_intent_id: session.id, fee_cents: fee })
    .eq("id", negotiationId);

  return NextResponse.redirect(session.url!, { status: 303 });
}
