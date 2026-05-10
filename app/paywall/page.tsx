import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { HelpFooter } from "@/components/HelpFooter";
import { createClient } from "@/lib/supabase/server";
import { isPaidUser } from "@/lib/auth-paid";
import { FEATURES } from "@/lib/env";
import { fmtCents, FLAT_FEE_CENTS } from "@/lib/stripe";
import { SavingsPreview } from "@/components/paywall/SavingsPreview";

export const metadata: Metadata = {
  title: "Unlock the full toolkit",
  description:
    "$49 once. Funeral home outreach, side-by-side comparison, the 30-day checklist, the obituary helper, and the rest of the toolkit. Money-back if we don't save you anything in 14 days.",
  robots: { index: false, follow: false },
};

export default async function PaywallPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; canceled?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next ?? "/dashboard";
  const canceled = sp.canceled === "1";

  // If Supabase isn't configured at all, this page is unreachable in
  // practice — but degrade gracefully to a no-account message.
  if (!FEATURES.supabase()) {
    return <UnavailableShell />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Already paid → bounce them.
  if (user && (await isPaidUser(supabase, user))) {
    redirect(next);
  }

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader backHref="/decide" backLabel="← Back to /decide" />
      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-10 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              Unlock the full toolkit
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              {fmtCents(FLAT_FEE_CENTS)} once. Then everything works.
            </h1>
            <p className="text-lg text-ink-soft">
              No subscriptions. No upsells. No commissions from funeral
              homes. The fee covers the whole arc — from the first call
              through the last account closed.
            </p>
          </div>

          {canceled && (
            <Card tone="warn">
              <p className="text-sm text-ink">
                Checkout was cancelled — no charge. You can try again
                whenever you&rsquo;re ready.
              </p>
            </Card>
          )}

          <Card tone="primary">
            <CardEyebrow>What unlocks</CardEyebrow>
            <ul className="space-y-2.5 text-ink mt-3">
              <Bullet>
                <strong>Have us call funeral homes for you.</strong> We
                contact 3&ndash;5 as your advocate, request itemized
                prices, and bring back side-by-side comparisons.
              </Bullet>
              <Bullet>
                <strong>The 30-day checklist.</strong> Death certificates,
                Social Security, banks, insurance, VA, accounts to close
                &mdash; in order, with help on every step.
              </Bullet>
              <Bullet>
                <strong>The pre-meeting worksheet.</strong> Walk into the
                funeral home with your family&rsquo;s decisions already
                made. The director sees you brought it and the meeting
                changes.
              </Bullet>
              <Bullet>
                <strong>The price-list analyzer.</strong> Paste a quote
                they gave you. We flag every line above fair range and
                show you what to push back on.
              </Bullet>
              <Bullet>
                <strong>The obituary helper, certificate calculator,
                veterans benefits checker.</strong> All unlocked.
              </Bullet>
            </ul>
          </Card>

          <SavingsPreview />

          <Card>
            <CardEyebrow>Why we charge upfront, not after</CardEyebrow>
            <CardTitle>So we stay on your side.</CardTitle>
            <p className="text-ink-soft mt-3">
              The funeral industry runs on commissions and kickbacks.
              Every funeral home pays referral fees to grief therapists,
              hospitals, and online directories &mdash; which is why most
              "free" services lead families to homes that paid for the
              placement. Charging the family directly is the only way to
              stay accountable to the family.
            </p>
            <p className="text-ink-soft mt-3">
              We don&rsquo;t take a cent from any funeral home, ever.
              Your {fmtCents(FLAT_FEE_CENTS)} is the only money we make
              on your case &mdash; which is why you&rsquo;ll always get
              the most honest read on whether a quote is fair.
            </p>
          </Card>

          <Card tone="soft">
            <CardEyebrow>Money-back guarantee</CardEyebrow>
            <CardTitle>14 days to try the toolkit.</CardTitle>
            <p className="text-ink-soft mt-3">
              If we don&rsquo;t save you any money you can document
              within the first 14 days &mdash; or if you change your
              mind for any other reason &mdash; email us and we refund
              the full {fmtCents(FLAT_FEE_CENTS)}. No questions, no form.
            </p>
            <p className="text-sm text-ink-muted mt-3">
              The savings are typically{" "}
              <strong className="text-ink">$1,500&ndash;$5,000</strong>{" "}
              on the funeral arrangement alone &mdash; about 30&ndash;100x
              the fee.
            </p>
          </Card>

          {!user ? (
            <Card tone="primary">
              <CardTitle>First, create your free account.</CardTitle>
              <p className="text-ink-soft mt-3 mb-5">
                We use email + a sign-in link &mdash; no password to
                remember. After you&rsquo;re signed in, you&rsquo;ll
                land back here to complete checkout.
              </p>
              <LinkButton
                href={`/login?next=${encodeURIComponent("/paywall?next=" + encodeURIComponent(next))}`}
                size="lg"
              >
                Create my account →
              </LinkButton>
            </Card>
          ) : (
            <Card tone="primary">
              <CardTitle>Ready when you are.</CardTitle>
              <p className="text-ink-soft mt-3 mb-5">
                Signed in as {user.email}. One click to Stripe checkout.
              </p>
              <form
                action="/api/stripe/checkout-account"
                method="post"
                className="space-y-3"
              >
                <input type="hidden" name="next" value={next} />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-colors transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 min-h-11 no-underline bg-primary-deep text-on-primary hover:bg-ink shadow-[0_1px_2px_rgba(20,35,28,0.08),0_8px_24px_rgba(47,93,79,0.18)] px-7 py-4 text-base"
                >
                  Pay {fmtCents(FLAT_FEE_CENTS)} → unlock everything
                </button>
                <p className="text-xs text-ink-muted">
                  Charged via Stripe. We never see your card. Refundable
                  for 14 days.
                </p>
              </form>
            </Card>
          )}

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="text-primary-deep mt-0.5" aria-hidden>
        •
      </span>
      <span>{children}</span>
    </li>
  );
}

function UnavailableShell() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader showBack={false} />
      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-12">
          <Card tone="warn">
            <CardTitle>Paid features aren&rsquo;t available yet.</CardTitle>
            <p className="text-ink-soft mt-3">
              Honest Funeral&rsquo;s account features (including the paid
              toolkit) require Supabase to be configured. The free tools
              still work.
            </p>
          </Card>
        </div>
      </section>
    </main>
  );
}
