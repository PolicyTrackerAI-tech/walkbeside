import Link from "next/link";
import { Brand } from "@/components/Brand";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { SetupBanner } from "@/components/SetupBanner";
import { createClient } from "@/lib/supabase/server";
import { FEATURES } from "@/lib/env";
import { deriveTasks } from "@/lib/dashboard";

/**
 * Screen 8 — The dashboard. Three tasks. Never more.
 */
export default async function DashboardPage() {
  if (!FEATURES.supabase()) {
    return <UnconfiguredDashboard />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return <AnonymousDashboard />;

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
      .select("id, status")
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
      <header className="border-b border-border bg-surface/70">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Brand />
          <div className="flex items-center gap-4 text-sm text-ink-muted">
            <Link href="/prep">Prep kit</Link>
            <Link href="/analyzer">Analyzer</Link>
            <form action="/auth/signout" method="post">
              <button className="hover:text-ink-soft" type="submit">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-8 space-y-6">
          <div>
            <CardEyebrow>Dashboard</CardEyebrow>
            <h1 className="font-serif text-3xl text-ink">{greeting}</h1>
            <p className="text-ink-soft mt-2">
              Three tasks at a time. Finish one, the next will appear.
            </p>
          </div>

          <SetupBanner />

          <ProgressBar phase={phase} />

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
              <p className="text-ink-soft">
                Estate settlement and benefits are coming soon — we&rsquo;ll email
                you when those open up. Meanwhile, keep this tab handy for the
                document vault and prep kit.
              </p>
            </Card>
          )}

          <Card tone="soft">
            <CardEyebrow>After the funeral</CardEyebrow>
            <CardTitle>Death certificates, accounts, and estate basics.</CardTitle>
            <p className="text-ink-soft text-sm mb-3">
              Paperwork for the next thirty days, in the order that makes
              the most sense. Certificates first, accounts second,
              estate work third.
            </p>
            <Link
              href="/after"
              className="text-sm font-medium text-primary-deep underline-offset-2 hover:underline"
            >
              Open the after-funeral checklist &rarr;
            </Link>
          </Card>

          <Card tone="soft">
            <CardEyebrow>Coming soon (Phase 2)</CardEyebrow>
            <p className="text-ink-soft text-sm">
              Notifications hub · Benefits checker · Document vault · Family
              collaboration · Estate settlement guide
            </p>
          </Card>
        </div>
      </section>
    </main>
  );
}

function AnonymousDashboard() {
  return (
    <main className="flex-1 flex flex-col">
      <header className="border-b border-border bg-surface/70">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Brand />
          <div className="flex items-center gap-4 text-sm text-ink-muted">
            <Link href="/prep">Prep kit</Link>
            <Link href="/prices">Prices</Link>
            <Link href="/login?next=/dashboard">Sign in</Link>
          </div>
        </div>
      </header>
      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-8 space-y-6">
          <div>
            <CardEyebrow>Dashboard</CardEyebrow>
            <h1 className="font-serif text-3xl text-ink">
              Your plan &mdash; saved in this browser
            </h1>
            <p className="text-ink-soft mt-2">
              We&rsquo;re holding your progress so you don&rsquo;t lose it if
              you close this tab. To keep it safe across devices, save it to an
              account (email only &mdash; takes 30 seconds).
            </p>
          </div>

          <Card tone="primary">
            <CardTitle>Start where it helps the most</CardTitle>
            <p className="text-ink-soft mb-4">
              No account needed to use any of these.
            </p>
            <div className="flex flex-wrap gap-3">
              <LinkButton href="/where">What&rsquo;s happening now</LinkButton>
              <LinkButton href="/prices" variant="secondary">
                Fair price lookup
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
              An account lets us hold your work between devices and remember
              where you were. Email only. No password. Takes 30 seconds.
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
        </div>
      </section>
    </main>
  );
}

function UnconfiguredDashboard() {
  return (
    <main className="flex-1 flex flex-col">
      <header className="border-b border-border bg-surface/70">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Brand />
        </div>
      </header>
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
