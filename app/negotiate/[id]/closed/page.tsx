import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireSignedIn } from "@/lib/require-signed-in";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { CaseSatisfaction } from "@/components/negotiate/CaseSatisfaction";
import { CaseStepper } from "@/components/negotiate/CaseStepper";

export default async function NegotiationClosedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireSignedIn(`/negotiate/${id}/closed`);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/negotiate/${id}/closed`);

  // The /api/negotiate/choose action already closed the negotiation and
  // notified the chosen home, so this page is purely confirmation.
  const { data: neg } = await supabase
    .from("negotiations")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!neg) redirect("/dashboard");

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader backHref="/dashboard" backLabel="Dashboard" />
      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-12 space-y-6">
          <CaseStepper stage="closed" />
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
            Choosing your home was free, and so was the outreach &mdash; Honest
            Funeral is free to families.
          </p>
          <p className="text-xs text-ink-muted">
            We never took a cut of what you were quoted, and this choice was
            entirely yours &mdash; we don&rsquo;t get paid differently based
            on which home you picked.
          </p>

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

          <CaseSatisfaction
            negotiationId={id}
            initialScore={neg.satisfaction_score ?? null}
          />
        </div>
      </section>
    </main>
  );
}
