import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { HelpFooter } from "@/components/HelpFooter";
import { createClient } from "@/lib/supabase/server";
import { isPaidUser } from "@/lib/auth-paid";
import { stripe, stripeAvailable } from "@/lib/stripe";
import { FEATURES, PUBLIC, requireServer } from "@/lib/env";

export const metadata: Metadata = {
  title: "You're in",
  robots: { index: false, follow: false },
};

/**
 * Stripe success redirect lands here. The webhook normally flips paid_at,
 * but webhooks can be delayed, fail, or be misconfigured — so this page
 * ALSO reconciles directly: it verifies the Stripe checkout session
 * (payment_status === "paid" and the session belongs to this user) and
 * flips paid_at itself via the service-role client. Belt-and-suspenders so
 * a family that actually paid is never left stuck paid-but-locked.
 */
export default async function PaywallSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; session_id?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next ?? "/dashboard";

  if (!FEATURES.supabase()) redirect(next);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let paid = await isPaidUser(supabase, user);

  // Reconcile against Stripe if the webhook hasn't marked us paid yet.
  if (!paid && sp.session_id && stripeAvailable()) {
    try {
      const session = await stripe().checkout.sessions.retrieve(sp.session_id);
      if (
        session.payment_status === "paid" &&
        session.metadata?.userId === user.id
      ) {
        const admin = createAdminClient(
          PUBLIC.supabaseUrl,
          requireServer("SUPABASE_SERVICE_ROLE_KEY"),
        );
        const update: Record<string, unknown> = {
          paid_at: new Date().toISOString(),
        };
        if (typeof session.customer === "string") {
          update.stripe_customer_id = session.customer;
        }
        await admin.from("profiles").update(update).eq("id", user.id);
        paid = true;
      }
    } catch {
      // Retrieval failed — fall back to the webhook + refresh messaging below.
    }
  }

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader showBack={false} />
      <section className="flex-1">
        <div className="max-w-xl mx-auto px-5 py-14 space-y-6">
          <Card tone="primary">
            <CardEyebrow>Thank you</CardEyebrow>
            <CardTitle>You&rsquo;re in. Payment confirmed.</CardTitle>
            <p className="text-ink-soft mt-3 mb-5">
              {paid
                ? "Stripe confirmed your payment. You're all set."
                : "Stripe is still confirming your payment with us. It usually takes a few seconds — if anything looks off in a minute, refresh the page."}
            </p>
            <LinkButton href={next} size="lg">
              Continue to {next === "/dashboard" ? "dashboard" : "where you were"} →
            </LinkButton>
          </Card>

          <Card tone="soft">
            <CardEyebrow>What we charge for, and what we don&rsquo;t</CardEyebrow>
            <ul className="space-y-2 text-sm text-ink-soft mt-3">
              <li>
                ✓ One {""}
                <strong className="text-ink">$49</strong> charge. No
                subscription. No renewal.
              </li>
              <li>✓ No commissions, ever, from any funeral home.</li>
              <li>✓ No upsells. Every tool on the site is free.</li>
              <li>
                ✓ 14-day money-back. Email us if we didn&rsquo;t save
                you anything.
              </li>
            </ul>
          </Card>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
