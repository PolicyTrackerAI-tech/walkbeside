import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { PUBLIC, FEATURES, requireServer } from "@/lib/env";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { HelpFooter } from "@/components/HelpFooter";

export const metadata: Metadata = {
  title: "Email preferences",
  robots: { index: false, follow: false },
};

/**
 * Email preferences / unsubscribe surface.
 *
 * Linked from anniversary check-in emails as
 * /preferences/[user-uuid]?action=unsubscribe. Light auth: knowing the
 * uuid is sufficient to flip the toggle (acceptable for unsubscribe;
 * worst case is someone unsubscribing a stranger, which is recoverable
 * via this same page).
 */
export default async function PreferencesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ action?: "unsubscribe" | "resubscribe" }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  if (!FEATURES.supabase()) redirect("/");

  // Validate UUID shape so we don't hit Supabase with garbage.
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      id,
    )
  ) {
    return <NotFound />;
  }

  const admin = createClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );

  // Apply action if present.
  if (sp.action === "unsubscribe" || sp.action === "resubscribe") {
    const optIn = sp.action === "resubscribe";
    await admin
      .from("profiles")
      .update({ anniversary_emails_opt_in: optIn })
      .eq("id", id);
    redirect(`/preferences/${id}`);
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("anniversary_emails_opt_in")
    .eq("id", id)
    .maybeSingle();

  if (!profile) return <NotFound />;

  const subscribed = !!profile.anniversary_emails_opt_in;

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader showBack={false} />
      <section className="flex-1">
        <div className="max-w-xl mx-auto px-5 py-12 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              Email preferences
            </p>
            <h1 className="font-serif text-3xl text-ink leading-tight mb-3">
              {subscribed
                ? "You'll get our check-in emails."
                : "You won't get our check-in emails."}
            </h1>
            <p className="text-lg text-ink-soft">
              We send three light check-ins over the year after a loss:
              at one month, six months, and one year. Practical tips for
              the stage you&rsquo;re in &mdash; nothing promotional.
            </p>
          </div>

          <Card tone="primary">
            <CardEyebrow>Current setting</CardEyebrow>
            <CardTitle>
              {subscribed ? "Subscribed" : "Unsubscribed"}
            </CardTitle>
            <p className="text-ink-soft mt-3 mb-5">
              {subscribed
                ? "Click below if you'd rather not receive these. We won't send anything else from this address."
                : "Click below if you'd like to start receiving them again. Each one is shorter than this page."}
            </p>
            <LinkButton
              href={`/preferences/${id}?action=${subscribed ? "unsubscribe" : "resubscribe"}`}
            >
              {subscribed ? "Unsubscribe" : "Resubscribe"}
            </LinkButton>
          </Card>

          <Card tone="soft">
            <p className="text-sm text-ink-soft">
              Your account stays open whether you&rsquo;re subscribed to
              check-ins or not. This setting only controls the three
              time-based emails.
            </p>
          </Card>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}

function NotFound() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader showBack={false} />
      <section className="flex-1">
        <div className="max-w-xl mx-auto px-5 py-14">
          <Card tone="warn">
            <CardTitle>Couldn&rsquo;t find that preference link.</CardTitle>
            <p className="text-ink-soft mt-3">
              The link may have been mistyped, or the account may have
              been deleted. If you&rsquo;re trying to unsubscribe and
              this isn&rsquo;t working, reply to the email and a person
              will handle it.
            </p>
          </Card>
        </div>
      </section>
    </main>
  );
}
