import Link from "next/link";
import { isPaidUser } from "@/lib/auth-paid";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { SetupBanner } from "@/components/SetupBanner";
import { HelpFooter } from "@/components/HelpFooter";
import { createClient } from "@/lib/supabase/server";
import { FEATURES } from "@/lib/env";
import { deriveTasks } from "@/lib/dashboard";
import {
  FuneralHomeOutreachCard,
  type OutreachRow,
} from "@/components/dashboard/FuneralHomeOutreachCard";
import { DashboardActions } from "@/components/dashboard/DashboardActions";
import { ToolTile } from "@/components/dashboard/ToolTile";

/**
 * Screen 8 — The dashboard. Three tasks. Never more.
 */
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ started?: string }>;
}) {
  if (!FEATURES.supabase()) {
    return <UnconfiguredDashboard />;
  }

  const sp = await searchParams;
  const justStartedId = sp.started;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return <AnonymousDashboard />;

  // Everything is free to families. `isPaid` here is only the free-email
  // test/founder flag — used to tone the outreach CTA, not to gate a tool.
  const isPaid = await isPaidUser(supabase, user);

  const [
    { data: profile },
    { data: negs },
    { data: analyses },
    { data: cert },
    { data: obit },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("negotiations")
      .select("id, status, stripe_payment_intent_id, unlocked_at, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("price_list_analyses")
      .select("id")
      .eq("user_id", user.id)
      .limit(1),
    supabase
      .from("cert_trackers")
      .select("id, total_to_order")
      .eq("user_id", user.id)
      .limit(1),
    supabase
      .from("obituaries")
      .select("id")
      .eq("user_id", user.id)
      .limit(1),
  ]);

  const hasNegotiation = (negs?.length ?? 0) > 0;
  const hasClosedDeal = (negs ?? []).some((n) => n.status === "closed");
  const hasUploadedPriceList = (analyses?.length ?? 0) > 0;
  const hasCertCount = (cert?.length ?? 0) > 0;
  const hasObituary = (obit?.length ?? 0) > 0;

  // Pick the active negotiation to feature: just-started > most recent non-cancelled.
  const activeNeg =
    (negs ?? []).find((n) => n.id === justStartedId) ??
    (negs ?? []).find((n) => n.status !== "cancelled") ??
    null;
  let outreach: OutreachRow[] = [];
  if (activeNeg) {
    const { data } = await supabase
      .from("negotiation_outreach")
      .select("id, home_name, status, quote_cents")
      .eq("negotiation_id", activeNeg.id)
      .order("created_at", { ascending: true });
    outreach = (data ?? []) as OutreachRow[];
  }

  const { phase, tasks } = deriveTasks({
    hasNegotiation,
    hasClosedDeal,
    hasUploadedPriceList,
    hasCertCount,
    hasObituary,
  });

  const greeting = profile?.display_name
    ? `Hello, ${profile.display_name}.`
    : "Welcome back.";

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader
        rightSlot={
          <div className="flex items-center gap-4 text-sm text-ink-muted print:hidden">
            <Link href="/prep" className="hover:text-ink-soft">
              Prep kit
            </Link>
            <Link href="/analyzer" className="hover:text-ink-soft">
              Analyzer
            </Link>
            <form action="/auth/signout" method="post">
              <button className="hover:text-ink-soft" type="submit">
                Sign out
              </button>
            </form>
          </div>
        }
      />
      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-8 space-y-6">
          <div>
            <CardEyebrow>Dashboard</CardEyebrow>
            <h1 className="font-serif text-3xl text-ink">{greeting}</h1>
            <p className="text-ink-soft mt-2">
              Three tasks at a time. Finish one, the next will appear.
            </p>
            <p className="text-xs text-ink-muted mt-1 print:hidden">
              Saved on this device. We never email you unless you sign in.
            </p>
          </div>

          <DashboardActions />

          <SetupBanner />

          <ProgressBar phase={phase} />

          {activeNeg && outreach.length > 0 && (
            <FuneralHomeOutreachCard
              negotiationId={activeNeg.id}
              status={activeNeg.status}
              unlocked={
                activeNeg.status === "closed" ||
                Boolean(activeNeg.unlocked_at)
              }
              justStarted={activeNeg.id === justStartedId}
              outreach={outreach}
            />
          )}

          {!isPaid && (
            <Card tone="primary">
              <CardEyebrow>When you&rsquo;re ready</CardEyebrow>
              <CardTitle>
                Have us get you real quotes &mdash; the same service can cost
                2&ndash;3&times; more across town.
              </CardTitle>
              <p className="text-ink-soft mt-3 mb-4">
                Everything here is free to families. When you want it, we
                contact funeral homes on your behalf, collect itemized quotes,
                and put them side by side &mdash; at no charge.
                No commissions or kickbacks, ever.
              </p>
              <LinkButton href="/negotiate/start" size="lg">
                Have us contact funeral homes — free →
              </LinkButton>
            </Card>
          )}

          {tasks.length > 0 ? (
            <ol className="space-y-3">
              {tasks.map((t, i) => (
                <li key={t.id}>
                  <Card>
                    <div className="flex items-start gap-4">
                      <div className="font-serif text-primary-deep text-2xl leading-none pt-0.5">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <h2 className="font-serif text-lg text-ink mb-1">
                          {t.title}
                        </h2>
                        {t.detail && (
                          <p className="text-ink-soft text-sm">{t.detail}</p>
                        )}
                      </div>
                      {t.href && (
                        <LinkButton href={t.href} variant="secondary">
                          Open →
                        </LinkButton>
                      )}
                    </div>
                  </Card>
                </li>
              ))}
            </ol>
          ) : (
            <Card tone="good">
              <CardTitle>You&rsquo;re through the hardest week.</CardTitle>
              <p className="text-ink-soft mb-3">
                The active to-do list is empty. The post-funeral
                checklist and the rest of our tools stay open
                whenever you need them.
              </p>
              <Link
                href="/next-30-days"
                className="text-sm font-medium text-primary-deep underline-offset-2 hover:underline"
              >
                Open the 30-day checklist &rarr;
              </Link>
            </Card>
          )}

          <Card tone="soft">
            <CardEyebrow>After the funeral</CardEyebrow>
            <CardTitle>The next 30 days, one task at a time.</CardTitle>
            <p className="text-ink-soft text-sm mb-3">
              Death certificates, Social Security, banks, life insurance,
              estate basics. Check off as you go. Progress saves on this
              device.
            </p>
            <Link
              href="/next-30-days"
              className="text-sm font-medium text-primary-deep underline-offset-2 hover:underline"
            >
              Open the next-30-days checklist &rarr;
            </Link>
          </Card>

          {/* Named group: a bare `group` here would make every ToolTile's
              unnamed group-hover fire whenever the pointer is anywhere in the
              disclosure. */}
          <details className="group/tools">
            <summary className="cursor-pointer list-none mb-5">
              <CardEyebrow>Your tools</CardEyebrow>
              <h2 className="font-serif text-2xl text-ink leading-tight">
                Every tool here is free.
              </h2>
              <p className="text-ink-soft text-sm mt-1">
                Open any of these whenever you need them &mdash; no charge.
                Everything is free to families, including the funeral-home
                outreach. Picking a home is free too.
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-deep mt-3">
                <span
                  aria-hidden="true"
                  className="inline-block leading-none group-open/tools:rotate-90 transition-transform"
                >
                  ▸
                </span>
                All tools
              </span>
            </summary>

            <div className="grid sm:grid-cols-2 gap-3">
              <ToolTile
                href="/eulogy"
                eyebrow="Service"
                title="Eulogy helper"
                blurb="Eight short questions. We draft a ready-to-read eulogy in your voice."
              />
              <ToolTile
                href="/obituary"
                eyebrow="Service"
                title="Obituary helper"
                blurb="Twelve questions. We draft the obituary you can edit and hand to the home."
              />
              <ToolTile
                href="/memorial"
                eyebrow="Service"
                title="Memorial program"
                blurb="Build the print-ready service program — readings, music, processional, reception."
              />
              <ToolTile
                href="/timeline"
                eyebrow="Service"
                title="Service-day timeline"
                blurb="The day, hour by hour. Print it for the officiant, pallbearers, family."
              />
              <ToolTile
                href="/livestream"
                eyebrow="Service"
                title="Live-stream coordinator"
                blurb="One shareable card with platform, URL, dial-in, password, host contact."
              />
              <ToolTile
                href="/worksheet"
                eyebrow="Before the meeting"
                title="Pre-meeting worksheet"
                blurb="Walk in with decisions made. The director sees you brought it."
              />
              <ToolTile
                href="/analyzer"
                eyebrow="At the meeting"
                title="Price-list analyzer"
                blurb="Paste the quote. We flag every overcharge."
              />
              <ToolTile
                href="/certificates"
                eyebrow="After"
                title="Certificate calculator"
                blurb="Order the right number. Avoid rush fees later."
              />
              <ToolTile
                href="/veterans"
                eyebrow="After"
                title="Veterans benefits"
                blurb="What the family qualifies for. Most families miss at least one."
              />
              <ToolTile
                href="/notifications"
                eyebrow="After"
                title="Notifications hub"
                blurb="Track who&rsquo;s been told. Hand the list to a friend."
              />
              <ToolTile
                href="/subscriptions"
                eyebrow="After"
                title="Subscription finder"
                blurb="Paste a bank statement. We find recurring charges to cancel."
              />
              <ToolTile
                href="/vault"
                eyebrow="After"
                title="Document vault"
                blurb="Track every document. Where each one is, what&rsquo;s missing."
              />
              <ToolTile
                href="/family"
                eyebrow="Anytime"
                title="Family collaboration"
                blurb="Hand the work to a sibling or adult child. No account needed."
              />
              <ToolTile
                href="/estate"
                eyebrow="Long term"
                title="Estate settlement"
                blurb="Probate, inherited IRAs, unclaimed property, digital accounts."
              />
              <ToolTile
                href="/headstone-vendors"
                eyebrow="Long term"
                title="Monument company directory"
                blurb="Buy the headstone direct. Typically 30&ndash;60% less than funeral-home pricing."
              />
            </div>
          </details>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}

function AnonymousDashboard() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader
        rightSlot={
          <div className="flex items-center gap-4 text-sm text-ink-muted">
            <Link href="/prep" className="hover:text-ink-soft">
              Prep kit
            </Link>
            <Link href="/prices" className="hover:text-ink-soft">
              Prices
            </Link>
            <Link
              href="/login?next=/dashboard"
              className="hover:text-ink-soft"
            >
              Sign in
            </Link>
          </div>
        }
      />
      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-8 space-y-6">
          <div>
            <CardEyebrow>Dashboard</CardEyebrow>
            <h1 className="font-serif text-3xl text-ink">
              Welcome back.
            </h1>
            <p className="text-ink-soft mt-2">
              You&rsquo;re saved on this device. Sign in if you want to use this from somewhere else too.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <ToolTile
              href="/analyzer"
              title="Check a quote"
              blurb="Snap a photo of any price list. We flag every line above fair."
            />
            <ToolTile
              href="/prices"
              title="See fair prices"
              blurb="What a funeral should cost in your zip. No account, no email."
            />
            <ToolTile
              href="/negotiate/start"
              title="Have us contact funeral homes — free"
              blurb="We collect itemized quotes on your behalf and bring them back side by side."
            />
          </div>

          <Card tone="primary">
            <CardTitle>Start where it helps the most</CardTitle>
            <p className="text-ink-soft mb-4">
              No account needed to use any of these.
            </p>
            <div className="flex flex-wrap gap-3">
              <LinkButton href="/where">
                Tell us what happened &rarr;
              </LinkButton>
              <LinkButton href="/prices" variant="secondary">
                Fair price lookup
              </LinkButton>
              <LinkButton href="/how-it-works" variant="secondary">
                How we can help
              </LinkButton>
              <LinkButton href="/prep" variant="secondary">
                Arrangement prep kit
              </LinkButton>
              <LinkButton href="/certificates" variant="secondary">
                Certificate calculator
              </LinkButton>
              <LinkButton href="/obituary" variant="secondary">
                Obituary helper
              </LinkButton>
            </div>
          </Card>

          <Card tone="soft">
            <CardTitle>Save your place</CardTitle>
            <p className="text-ink-soft mb-4">
              When you&rsquo;re ready, save your progress to an account (email
              only, takes 30 seconds) so nothing gets lost.
            </p>
            <div className="flex flex-wrap gap-3">
              <LinkButton href="/login?next=/dashboard">
                Save progress to an account
              </LinkButton>
              <LinkButton href="/where" variant="ghost">
                Keep going without an account
              </LinkButton>
            </div>
          </Card>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}

function UnconfiguredDashboard() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader showBack={false} />
      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-10 space-y-6">
          <h1 className="font-serif text-3xl text-ink">Dashboard</h1>
          <SetupBanner />
          <Card tone="primary">
            <CardTitle>The free tier is fully usable right now.</CardTitle>
            <p className="text-ink-soft mb-4">
              Until Supabase is configured, accounts and saved progress are
              disabled. Everything else still works.
            </p>
            <div className="flex flex-wrap gap-3">
              <LinkButton href="/prices">Fair price lookup</LinkButton>
              <LinkButton href="/prep" variant="secondary">
                Arrangement prep kit
              </LinkButton>
              <LinkButton href="/certificates" variant="secondary">
                Death certificate calculator
              </LinkButton>
              <LinkButton href="/obituary" variant="secondary">
                Obituary helper
              </LinkButton>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}

