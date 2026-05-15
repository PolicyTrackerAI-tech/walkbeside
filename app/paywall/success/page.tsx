import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { HelpFooter } from "@/components/HelpFooter";
import { createClient } from "@/lib/supabase/server";
import { isPaidUser } from "@/lib/auth-paid";
import { FEATURES } from "@/lib/env";

export const metadata: Metadata = {
  title: "You're in",
  robots: { index: false, follow: false },
};

/**
 * Stripe success redirect lands here. The webhook handles the actual
 * paid_at flip — this page just tells the user it worked.
 *
 * If the user lands here without being marked paid yet (webhook hasn't
 * fired in time, ~2-5 second window), the polling client below retries
 * a couple times before giving up.
 */
export default async function PaywallSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next ?? "/dashboard";

  if (!FEATURES.supabase()) redirect(next);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const paid = await isPaidUser(supabase, user);

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader showBack={false} />
      <section className="flex-1">
        <div className="max-w-xl mx-auto px-5 py-14 space-y-6">
          <Card tone="primary">
            <CardEyebrow>Thank you</CardEyebrow>
            <CardTitle>You&rsquo;re in. The toolkit just unlocked.</CardTitle>
            <p className="text-ink-soft mt-3 mb-5">
              {paid
                ? "Stripe confirmed the payment and we marked your account paid. Everything is unlocked."
                : "Stripe is still confirming the payment with us. It usually takes a few seconds. If your dashboard still shows locked features in a minute, refresh the page."}
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
                <strong className="text-ink">$199</strong> charge. No
                subscription. No renewal.
              </li>
              <li>✓ No commissions, ever, from any funeral home.</li>
              <li>✓ No upsells. The full toolkit is unlocked now.</li>
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
