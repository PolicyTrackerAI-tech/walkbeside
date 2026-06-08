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
              The full toolkit
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              Save $2,000 to $5,000. Or your {fmtCents(FLAT_FEE_CENTS)} back.
            </h1>
            <p className="text-lg text-ink-soft">
              Families typically save thousands on funeral arrangement
              when they compare two or three homes with our help. We
              charge a flat {fmtCents(FLAT_FEE_CENTS)} for the toolkit
              &mdash; refundable in 14 days if you didn&rsquo;t save
              anything. We never take a cent from any funeral home.
            </p>
          </div>

          {canceled && (
            <Card tone="warn">
              <p className="text-sm text-ink">
                Checkout was cancelled &mdash; no charge. You can try
                again whenever you&rsquo;re ready.
              </p>
            </Card>
          )}

          {/* Value evidence first — real cases, real savings. */}
          <SavingsPreview />

          {/* The reassurance line. */}
          <Card tone="soft">
            <CardEyebrow>14-day money-back guarantee</CardEyebrow>
            <CardTitle>If we don&rsquo;t save you money, you don&rsquo;t pay.</CardTitle>
            <p className="text-ink-soft mt-3">
              Email{" "}
              <a
                href="mailto:support@honestfuneral.co"
                className="text-primary-deep underline-offset-2 hover:underline"
              >
                support@honestfuneral.co
              </a>{" "}
              within 14 days and we refund the full{" "}
              {fmtCents(FLAT_FEE_CENTS)}. No form, no questions. That
              is the entire deal.
            </p>
          </Card>

          {/* The trust line. */}
          <Card>
            <CardEyebrow>Why we&rsquo;re different</CardEyebrow>
            <CardTitle>Your {fmtCents(FLAT_FEE_CENTS)} is our only revenue.</CardTitle>
            <p className="text-ink-soft mt-3">
              The funeral industry runs on commissions and kickbacks.
              Every &ldquo;free&rdquo; service that lists homes is
              taking referral fees from those homes &mdash; which is
              why their recommendations follow the money, not your
              best interest.
            </p>
            <p className="text-ink-soft mt-3">
              We take zero. No commissions, no referral fees, no
              kickbacks from any funeral home, cemetery, monument
              company, or vendor. That&rsquo;s why we can tell you
              honestly whether the quote you got is fair &mdash; and
              push back when it isn&rsquo;t.
            </p>
          </Card>

          {/* What unlocks — condensed, secondary. */}
          <Card tone="primary">
            <CardEyebrow>What the toolkit does</CardEyebrow>
            <ul className="space-y-2.5 text-ink mt-3">
              <Bullet>
                <strong>We call funeral homes for you.</strong> Three
                to five in your area, as your named advocate. They
                send written itemized prices. We bring them back to
                you side by side.
              </Bullet>
              <Bullet>
                <strong>The 30-day checklist after the funeral.</strong>{" "}
                Death certificates, Social Security, banks, life
                insurance, the works &mdash; in order, with help on
                every step.
              </Bullet>
              <Bullet>
                <strong>Plus everything else.</strong> Obituary helper,
                eulogy helper, price-list analyzer, pre-meeting
                worksheet, veterans benefits checker, certificate
                calculator. All unlocked.
              </Bullet>
            </ul>
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
