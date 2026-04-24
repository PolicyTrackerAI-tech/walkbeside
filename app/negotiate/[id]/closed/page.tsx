import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Brand } from "@/components/Brand";
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
      <header className="border-b border-border bg-surface/70">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Brand />
          <Link href="/dashboard" className="text-sm text-ink-muted">
            Dashboard
          </Link>
        </div>
      </header>
      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-12 space-y-6">
          <CardEyebrow>You did it</CardEyebrow>
          <h1 className="font-serif text-3xl text-ink">
            You just made one of the hardest decisions. That took strength.
          </h1>
          {neg.savings_cents ? (
            <p className="text-lg text-ink-soft">
              We saved you {fmtCents(neg.savings_cents)} on this arrangement.
              Our fee was{" "}
              {neg.fee_cents ? fmtCents(neg.fee_cents) : "$0"}.
            </p>
          ) : (
            <p className="text-lg text-ink-soft">
              The home you chose is committed at the price they quoted. You
              can pull up the prep kit before your arrangement meeting.
            </p>
          )}

          {sp.dryrun && (
            <Card tone="warn">
              <strong>Dev mode:</strong> Stripe isn&rsquo;t configured, so this
              completed without a real payment.
            </Card>
          )}
          {sp.free && (
            <Card tone="soft">
              <strong>Free deal:</strong> You didn&rsquo;t save money on this one,
              so we didn&rsquo;t charge anything. Worth pulling up the prep kit
              regardless.
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
