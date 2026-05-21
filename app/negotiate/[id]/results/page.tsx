import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireSignedIn } from "@/lib/require-signed-in";
import { isPaidUser } from "@/lib/auth-paid";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { FLAT_FEE_CENTS, fmtCents } from "@/lib/stripe";

export default async function NegotiationResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireSignedIn(`/negotiate/${id}/results`);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/negotiate/${id}/results`);

  // Per V2 canonical model: anyone signed in can reach this page;
  // payment is charged only on home selection. Check paid_at so the UI
  // can hide the fee for already-paid users (rare under V2, but the
  // upfront /paywall onramp still exists for the legacy/edge case).
  const alreadyPaid = await isPaidUser(supabase, user);

  const { data: neg } = await supabase
    .from("negotiations")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!neg) redirect("/dashboard");

  const { data: outreach } = await supabase
    .from("negotiation_outreach")
    .select("*")
    .eq("negotiation_id", id)
    .order("quote_cents", { ascending: true, nullsFirst: false });

  const replies = (outreach ?? []).filter(
    (o) => o.quote_cents != null && o.quote_cents > 0,
  );
  const baseline = neg.target_home_estimate_cents as number | null;

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader
        backHref={`/negotiate/${id}/status`}
        backLabel="← Back to status"
      />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-10 space-y-6">
          <div>
            <CardEyebrow>Your options</CardEyebrow>
            <h1 className="font-serif text-3xl text-ink">
              Here&rsquo;s what came back.
            </h1>
            <p className="text-ink-soft mt-2">
              {replies.length === 0
                ? "No quotes recorded yet. Once homes reply, record what they sent on the previous screen."
                : alreadyPaid
                  ? "Pick the home you want. We’ll notify them and help schedule the arrangement meeting right away — no additional charge, it’s included in what you’ve already paid. You’ll meet with the home in person to make final selections and sign."
                  : `Pick the home you want. We’ll notify them, help schedule the arrangement meeting, and charge a flat ${fmtCents(FLAT_FEE_CENTS)} only when you confirm. You’ll meet with the home in person to make final selections and sign.`}
            </p>
            {replies.length >= 2 && (
              <div className="mt-3">
                <Link
                  href={`/negotiate/${id}/compare`}
                  className="inline-flex items-center gap-1 text-sm text-primary-deep underline-offset-2 hover:underline"
                >
                  See line-by-line comparison →
                </Link>
              </div>
            )}
          </div>

          {baseline !== null && (
            <Card tone="soft">
              <div className="text-sm text-ink-soft">
                Quote you originally received
              </div>
              <div className="font-serif text-2xl text-ink">
                {fmtCents(baseline)}
              </div>
              <p className="text-xs text-ink-muted mt-2">
                Shown for your reference only &mdash; this is what you were
                originally quoted.
              </p>
            </Card>
          )}

          <ul className="space-y-3">
            {replies.map((r, i) => {
              return (
                <li key={r.id}>
                  <Card tone={i === 0 ? "good" : "surface"}>
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="text-xs uppercase tracking-wider text-ink-muted mb-1">
                          {i === 0 ? "Lowest quote" : `Option ${i + 1}`}
                        </div>
                        <CardTitle>{r.home_name}</CardTitle>
                        <div className="font-serif text-2xl text-ink">
                          {fmtCents(r.quote_cents!)}
                        </div>
                      </div>
                      <div className="text-right">
                        {!alreadyPaid && (
                          <div className="text-xs text-ink-muted mb-2">
                            Our fee if you choose this home: {fmtCents(FLAT_FEE_CENTS)}
                          </div>
                        )}
                        <form action="/api/stripe/checkout" method="post">
                          <input type="hidden" name="negotiationId" value={id} />
                          <input type="hidden" name="outreachId" value={r.id} />
                          <button
                            type="submit"
                            className="inline-flex items-center justify-center gap-2 font-medium rounded-2xl px-5 py-3 text-sm bg-primary text-on-primary hover:bg-primary-deep"
                          >
                            Choose this home →
                          </button>
                        </form>
                      </div>
                    </div>
                    {r.notes && (
                      <details className="mt-4 text-sm text-ink-soft">
                        <summary className="cursor-pointer text-ink-muted">
                          Their notes
                        </summary>
                        <pre className="mt-2 whitespace-pre-wrap font-sans">
                          {r.notes}
                        </pre>
                      </details>
                    )}
                  </Card>
                </li>
              );
            })}
          </ul>

          {replies.length === 0 && (
            <Card tone="soft">
              <p className="text-ink-soft">
                As soon as a funeral home replies, head back to the{" "}
                <Link
                  href={`/negotiate/${id}/status`}
                  className="text-primary-deep underline"
                >
                  status page
                </Link>{" "}
                and click &ldquo;Record their quote&rdquo; on the relevant
                row.
              </p>
            </Card>
          )}

          <Card tone="primary">
            <CardTitle>Not seeing what you wanted?</CardTitle>
            <p className="text-ink-soft mb-3">
              We can keep going — reach out to more homes, or push back on the
              quotes you&rsquo;ve received.
            </p>
            <div className="flex flex-wrap gap-3">
              <LinkButton
                href={`/negotiate/start?zip=${neg.zip}&svc=${neg.service_type}`}
                variant="secondary"
              >
                Start another round
              </LinkButton>
              <LinkButton href="/dashboard" variant="ghost">
                Back to dashboard
              </LinkButton>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
