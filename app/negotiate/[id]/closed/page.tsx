import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { requireSignedIn } from "@/lib/require-signed-in";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { fmtCents, stripe, stripeAvailable } from "@/lib/stripe";
import { PUBLIC, requireServer } from "@/lib/env";
import { notifyChosenHome } from "@/lib/negotiation/notify-chosen-home";

export default async function NegotiationClosedPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    dryrun?: string;
    free?: string;
    included?: string;
    session_id?: string;
  }>;
}) {
  const { id } = await params;
  await requireSignedIn(`/negotiate/${id}/closed`);
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/negotiate/${id}/closed`);

  const { data: neg } = await supabase
    .from("negotiations")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!neg) redirect("/dashboard");

  // Reconcile against Stripe if the webhook hasn't closed this deal yet.
  // Critical: notifyChosenHome only fires on close. Without this, a delayed
  // or missed webhook means the chosen home is never actually notified while
  // this page tells the family it was. We verify the session, then close +
  // notify ourselves (mirroring the webhook) via the service-role client.
  if (neg.status !== "closed" && sp.session_id && stripeAvailable()) {
    try {
      const session = await stripe().checkout.sessions.retrieve(sp.session_id);
      if (
        session.payment_status === "paid" &&
        session.metadata?.negotiationId === id
      ) {
        const admin = createAdminClient(
          PUBLIC.supabaseUrl,
          requireServer("SUPABASE_SERVICE_ROLE_KEY"),
        );
        const { data: updated } = await admin
          .from("negotiations")
          .update({
            status: "closed",
            unlocked_at: new Date().toISOString(),
            stripe_payment_intent_id: session.payment_intent as string,
          })
          .eq("id", id)
          .neq("status", "closed")
          .select("id");
        if (updated && updated.length > 0) {
          const outreachId = session.metadata?.outreachId;
          if (outreachId) {
            await notifyChosenHome({ admin, negotiationId: id, outreachId });
          }
          neg.status = "closed";
        }
      }
    } catch {
      // Retrieval failed — fall back to the webhook.
    }
  }

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader backHref="/dashboard" backLabel="Dashboard" />
      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-12 space-y-6">
          <CardEyebrow>Confirmed</CardEyebrow>
          <h1 className="font-serif text-3xl text-ink">
            That decision is made. Take a breath.
          </h1>
          <p className="text-lg text-ink-soft">
            We&rsquo;ve let the home you chose know they were selected, with
            the price they quoted in writing. They&rsquo;ll be in touch with
            times for the arrangement meeting &mdash; we&rsquo;ll loop you in
            once a slot is set. <strong className="text-ink">You&rsquo;ll
            attend the meeting in person and sign all paperwork directly with
            the home;</strong> we don&rsquo;t sign for you. We stay on email
            for any pre-meeting questions or post-meeting disputes.{" "}
            {sp.included
              ? "No additional charge — it’s included in the flat $49 you’ve already paid."
              : `Our flat fee was ${neg.fee_cents ? fmtCents(neg.fee_cents) : "$0"}.`}
          </p>

          {process.env.NODE_ENV !== "production" && sp.dryrun && (
            <Card tone="warn">
              <strong>Dev mode:</strong> Stripe isn&rsquo;t configured, so this
              completed without a real payment.
            </Card>
          )}

          <Card tone="primary">
            <CardTitle>Prep for the meeting</CardTitle>
            <p className="text-ink-soft mb-4">
              Open the prep kit so you know what to bring, what to expect, and
              which line items deserve pushback. The arrangement meeting is
              where you make selections and sign &mdash; the printable cheat
              sheet turns it from a sales pitch into a transaction. We&rsquo;re
              on email for any questions before or disputes after.
            </p>
            <div className="flex flex-wrap gap-3">
              <LinkButton href="/prep">Open the prep kit →</LinkButton>
              <LinkButton href="/dashboard" variant="secondary">
                Dashboard
              </LinkButton>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
