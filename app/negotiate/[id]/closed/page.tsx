import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { fmtCents } from "@/lib/stripe";

export default async function NegotiationClosedPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ dryrun?: string; free?: string; session_id?: string }>;
}) {
  const { id } = await params;
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
            The home you chose has been released to you with the price they
            quoted in writing. Our flat fee was{" "}
            {neg.fee_cents ? fmtCents(neg.fee_cents) : "$0"}.
          </p>

          {sp.dryrun && (
            <Card tone="warn">
              <strong>Dev mode:</strong> Stripe isn&rsquo;t configured, so this
              completed without a real payment.
            </Card>
          )}

          <Card tone="primary">
            <CardTitle>Your next step</CardTitle>
            <p className="text-ink-soft mb-4">
              Bring the printable cheat sheet to your arrangement meeting.
              It&rsquo;s the single thing that turns the meeting from a sales
              pitch into a transaction.
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
