import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, stripeAvailable, calcFeeCents } from "@/lib/stripe";
import { PUBLIC } from "@/lib/env";
import { isPaidUser, isFreeEmail } from "@/lib/auth-paid";

/**
 * Account-level paywall checkout. One-time $49 to unlock the full toolkit
 * for this user. Replaces the per-negotiation success fee.
 *
 * Form-POST so it works without JS.
 */
export async function POST(req: Request) {
  const form = await req.formData();
  const next = String(form.get("next") ?? "/dashboard");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent("/paywall?next=" + encodeURIComponent(next))}`, req.url),
    );
  }

  // Already paid — bounce them to wherever they were going.
  if (await isPaidUser(supabase, user)) {
    return NextResponse.redirect(new URL(next, req.url));
  }

  // Free email — flip paid_at and skip Stripe.
  if (isFreeEmail(user.email)) {
    await supabase
      .from("profiles")
      .update({ paid_at: new Date().toISOString() })
      .eq("id", user.id);
    return NextResponse.redirect(
      new URL(`${next}${next.includes("?") ? "&" : "?"}freebypass=1`, req.url),
    );
  }

  const fee = calcFeeCents();
  const origin = PUBLIC.appUrl || new URL(req.url).origin;

  if (!stripeAvailable()) {
    // Dev fallback: no Stripe configured — flip paid_at directly.
    await supabase
      .from("profiles")
      .update({ paid_at: new Date().toISOString() })
      .eq("id", user.id);
    return NextResponse.redirect(
      new URL(`${next}${next.includes("?") ? "&" : "?"}dryrun=1`, req.url),
    );
  }

  // Reuse an existing Stripe customer when we have one.
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer: profile?.stripe_customer_id ?? undefined,
    customer_email: profile?.stripe_customer_id ? undefined : (user.email ?? undefined),
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: fee,
          product_data: {
            name: "Honest Funeral — full toolkit unlock",
            description:
              "One-time $49. Unlocks the full toolkit: outreach to local funeral homes, side-by-side comparisons, the 30-day post-funeral checklist, the pre-meeting worksheet, the obituary helper, and more. Money-back if we don't save you anything documentable in 14 days.",
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/paywall/success?session_id={CHECKOUT_SESSION_ID}&next=${encodeURIComponent(next)}`,
    cancel_url: `${origin}/paywall?next=${encodeURIComponent(next)}&canceled=1`,
    metadata: { kind: "account-paywall", userId: user.id, next },
  });

  return NextResponse.redirect(session.url!, { status: 303 });
}
