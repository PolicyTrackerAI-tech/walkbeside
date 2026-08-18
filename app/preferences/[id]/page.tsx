import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { PUBLIC, FEATURES, requireServer } from "@/lib/env";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { HelpFooter } from "@/components/HelpFooter";
import { SmsOptIn } from "./SmsOptIn";

export const metadata: Metadata = {
  title: "Email preferences",
  robots: { index: false, follow: false },
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Flip the anniversary-email subscription. POST-only server action, NOT a GET:
 * a link that mutated on load would let email clients / security scanners
 * (which prefetch URLs) silently unsubscribe a grieving family — or, via the
 * same uuid-as-capability, be triggered by any prefetch of the page's links.
 */
async function setSubscription(formData: FormData): Promise<void> {
  "use server";
  const id = (formData.get("id")?.toString() ?? "").trim();
  const optIn = formData.get("optIn") === "true";
  if (!FEATURES.supabase() || !UUID_RE.test(id)) redirect("/");
  const admin = createClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );
  await admin
    .from("profiles")
    .update({ anniversary_emails_opt_in: optIn })
    .eq("id", id);
  redirect(`/preferences/${id}`);
}

/**
 * Email preferences / unsubscribe surface. Linked from anniversary check-in
 * emails as /preferences/[user-uuid]. Light auth: knowing the uuid is enough
 * to view and flip the toggle (acceptable for unsubscribe; worst case is
 * someone unsubscribing a stranger, recoverable via this same page). The flip
 * itself is a POST (see setSubscription) so it can't fire on link prefetch.
 */
export default async function PreferencesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!FEATURES.supabase()) redirect("/");

  // Validate UUID shape so we don't hit Supabase with garbage.
  if (!UUID_RE.test(id)) {
    return <NotFound />;
  }

  const admin = createClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );

  const { data: profile } = await admin
    .from("profiles")
    .select("anniversary_emails_opt_in")
    .eq("id", id)
    .maybeSingle();

  if (!profile) return <NotFound />;

  // SMS prefs — separate best-effort read so this page renders even before
  // the 2026-07-03-bereavement-sms migration is applied.
  let smsPhone = "";
  let smsOptIn = false;
  try {
    const { data: smsPrefs } = await admin
      .from("profiles")
      .select("bereavement_sms_phone, bereavement_sms_opt_in")
      .eq("id", id)
      .maybeSingle();
    smsPhone = (smsPrefs?.bereavement_sms_phone as string | null) ?? "";
    smsOptIn = !!smsPrefs?.bereavement_sms_opt_in;
  } catch {
    // pre-migration: card still renders; saving surfaces the error state
  }

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
              We send five light check-ins across the thirteen months
              after a loss &mdash; one month, three, six, the year mark,
              and a last note just past it. Practical help for the stage
              you&rsquo;re in; nothing promotional.
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
            <form action={setSubscription}>
              <input type="hidden" name="id" value={id} />
              <input
                type="hidden"
                name="optIn"
                value={subscribed ? "false" : "true"}
              />
              <Button type="submit">
                {subscribed ? "Unsubscribe" : "Resubscribe"}
              </Button>
            </form>
          </Card>

          <SmsOptIn id={id} initialPhone={smsPhone} initialOptIn={smsOptIn} />

          <Card tone="soft">
            <p className="text-sm text-ink-soft">
              Your account stays open whether you&rsquo;re subscribed to
              check-ins or not. These settings only control the
              time-based check-ins.
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
