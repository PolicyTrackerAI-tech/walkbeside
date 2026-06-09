import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireSignedIn } from "@/lib/require-signed-in";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { HelpFooter } from "@/components/HelpFooter";
import { fmtCents, FLAT_FEE_CENTS } from "@/lib/stripe";

export const metadata = {
  title: "Your funeral-home outreach",
  robots: { index: false, follow: false },
};

/**
 * Teaser / pay-to-send page. We've already found the homes and prepared the
 * requests, but NOTHING has been sent. The family sees how many homes we
 * found (names blurred) and pays the flat fee; only then do we email them.
 */
export default async function NegotiationPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireSignedIn(`/negotiate/${id}/preview`);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/negotiate/${id}/preview`);

  const { data: neg } = await supabase
    .from("negotiations")
    .select("id, status, zip")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!neg) redirect("/dashboard");

  // Already paid / already sending → no teaser; send them to the status page.
  if (neg.status !== "pending_payment") {
    redirect(`/negotiate/${id}/status`);
  }

  const { data: homes } = await supabase
    .from("negotiation_outreach")
    .select("id, home_name")
    .eq("negotiation_id", id)
    .eq("status", "pending");

  const count = homes?.length ?? 0;

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader backHref="/dashboard" backLabel="Dashboard" />
      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-12 space-y-6">
          {count === 0 ? (
            <Card tone="warn">
              <CardEyebrow>Your outreach</CardEyebrow>
              <CardTitle>We couldn&rsquo;t find homes to contact here.</CardTitle>
              <p className="text-ink-soft mt-3 mb-4">
                We don&rsquo;t have enough contactable funeral homes in your area
                yet, so there&rsquo;s nothing to send &mdash; and nothing to pay
                for. You can still use the free fair-price lookup to check any
                quote you receive.
              </p>
              <div className="flex flex-wrap gap-3">
                <LinkButton href="/prices">Look up fair prices</LinkButton>
                <LinkButton href="/dashboard" variant="secondary">
                  Back to dashboard
                </LinkButton>
              </div>
            </Card>
          ) : (
            <>
              <div>
                <CardEyebrow>Your outreach</CardEyebrow>
                <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-3">
                  We found {count} funeral{" "}
                  {count === 1 ? "home" : "homes"} near you.
                </h1>
                <p className="text-lg text-ink-soft">
                  We&rsquo;ve prepared a request to each one. Pay once and
                  we&rsquo;ll send them &mdash; as your named advocate, invoking
                  your FTC Funeral Rule right to an itemized price list &mdash;
                  then bring every quote back here, side by side, so you can
                  choose. <strong className="text-ink">Nothing goes out until
                  you&rsquo;re in.</strong>
                </p>
              </div>

              <Card>
                <CardEyebrow>The homes we&rsquo;ll contact</CardEyebrow>
                <ul className="mt-3 space-y-2">
                  {homes!.map((h) => (
                    <li
                      key={h.id}
                      className="flex items-center gap-3 rounded-xl border border-border bg-surface-soft px-4 py-3"
                    >
                      <span
                        className="flex-1 text-ink select-none"
                        style={{ filter: "blur(6px)" }}
                        aria-hidden
                      >
                        {h.home_name}
                      </span>
                      <span className="text-xs uppercase tracking-wider text-ink-muted shrink-0">
                        ready to send
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-ink-muted mt-3">
                  {count} {count === 1 ? "home" : "homes"}, ready to go. Names
                  unlock the moment you pay &mdash; we email them only then.
                </p>
              </Card>

              <Card tone="primary">
                <CardTitle>
                  Send my requests &mdash; {fmtCents(FLAT_FEE_CENTS)}
                </CardTitle>
                <ul className="space-y-2 text-[15px] text-ink-soft mt-3 mb-5">
                  <li>
                    &bull; We contact all {count}{" "}
                    {count === 1 ? "home" : "homes"} as your named advocate
                    &mdash; transparently, never pretending to be you.
                  </li>
                  <li>
                    &bull; They send itemized prices; we lay them side by side
                    and flag anything above the fair range.
                  </li>
                  <li>
                    &bull; You choose a home, or none. Picking one costs nothing
                    extra &mdash; the {fmtCents(FLAT_FEE_CENTS)} is the whole
                    price.
                  </li>
                  <li>
                    &bull; Refundable in 14 days if we don&rsquo;t save you
                    anything. No commissions or kickbacks from any home.
                  </li>
                </ul>
                <form action="/api/stripe/checkout" method="post">
                  <input type="hidden" name="negotiationId" value={id} />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 font-semibold rounded-2xl bg-primary-deep text-on-primary hover:bg-ink px-7 py-4 text-base"
                  >
                    Get my quotes &mdash; {fmtCents(FLAT_FEE_CENTS)} →
                  </button>
                  <p className="text-xs text-ink-muted mt-3">
                    Charged once via Stripe. We never email these homes until
                    you pay &mdash; so you&rsquo;re never the family that
                    contacted them and vanished.
                  </p>
                </form>
              </Card>
            </>
          )}

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
