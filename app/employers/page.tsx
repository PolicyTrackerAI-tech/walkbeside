import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { fmtUSD } from "@/lib/pricing-data";
import { aggregateCohort, sampleCohort } from "@/lib/partner-report";
import { Metric } from "@/components/partner/ProofSheet";
import { DemoRequestForm } from "../partners/DemoRequestForm";

const HOW_IT_WORKS = [
  {
    n: 1,
    title: "You add one link to your benefits page, EAP, or manager toolkit.",
    body: "A link or a printable card — shared where people already look when something happens. Nothing to install, no integration work, no engineer needed.",
  },
  {
    n: 2,
    title: "When an employee loses someone, their family self-enrolls.",
    body: "They activate it themselves, on their own time. Your systems transmit nothing to us — no names, no rosters, no personal data.",
  },
  {
    n: 3,
    title: "They get a free, neutral funeral-price advocate.",
    body: "Fair prices for their area, a quote checker, and a real advocate who contacts funeral homes on their behalf. The family chooses, always.",
  },
  {
    n: 4,
    title: "We run every case by hand and capture outcomes.",
    body: "Savings, satisfaction, time-to-resolution — recorded on every case that comes through.",
  },
  {
    n: 5,
    title: "At the agreed point, you get an aggregate report.",
    body: "Employees supported, savings, satisfaction — de-identified totals for your benefits reviews. Never a single family's details.",
  },
];

export const metadata: Metadata = {
  title:
    "A funeral-cost benefit for your employees — free to them, neutral by design",
  description:
    "When an employee loses someone, their family arranges a funeral in days, mid-grief, with no price transparency. Honest Funeral gives them a free, neutral price advocate — paid by you, never by funeral homes or insurers, and never by the family.",
  alternates: { canonical: "/employers" },
  robots: { index: true, follow: true },
};

export default function EmployersPage() {
  const stats = aggregateCohort(sampleCohort());

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader rightSlot={<BackLink defaultHref="/" defaultLabel="← Home" />} />

      <section className="flex-1">
        <article className="max-w-2xl mx-auto px-5 py-10 space-y-8 text-ink-soft">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              For employers &amp; benefits teams
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              When an employee loses someone, give their family a neutral
              guide through the funeral.
            </h1>
            <p className="text-lg">
              Losing someone means arranging a funeral in days, mid-grief,
              with no price transparency &mdash; and everyone offering to
              help is paid by someone with a stake in the funeral price: the
              funeral home, an insurer, or the family&rsquo;s own wallet.{" "}
              <strong className="text-ink">
                We are the only one paid by none of them.
              </strong>{" "}
              Your organization pays us to give your employees&rsquo;
              families a neutral guide; we take no money from funeral homes
              or insurers, and we never charge the family &mdash; which is
              the only reason you can put this in a grieving employee&rsquo;s
              hands without a second thought.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardEyebrow>Typical overcharge</CardEyebrow>
              <div className="font-serif text-4xl sm:text-5xl text-primary-deep mt-1 leading-none">
                $2,000&ndash;$5,000
              </div>
              <p className="text-sm text-ink-soft mt-2">
                per family, on the funeral arrangement alone &mdash; national
                benchmark, see{" "}
                <Link
                  href="/methodology"
                  className="text-primary-deep underline-offset-2 hover:underline"
                >
                  methodology
                </Link>
                .
              </p>
              <p className="text-xs text-ink-muted mt-2">
                Basis: NFDA General Price List survey medians, cost-of-living
                adjusted by zip. National benchmark, not yet locally
                validated for your workforce&rsquo;s locations &mdash;
                excludes cemetery/plot, monument, and third-party fees.
              </p>
            </Card>
            <Card>
              <CardEyebrow>What your systems transmit to us</CardEyebrow>
              <div className="font-serif text-4xl sm:text-5xl text-primary-deep mt-1 leading-none">
                Nothing
              </div>
              <p className="text-sm text-ink-soft mt-2">
                Families self-enroll on their own. No employee names, no
                rosters, no personal data ever flows from you to us.
              </p>
              <p className="text-xs text-ink-muted mt-2">
                Basis: how the product is built, not a policy promise &mdash;
                there is no integration, upload, or data feed to configure.
              </p>
            </Card>
          </div>

          <Card tone="primary">
            <CardEyebrow>See it live &mdash; not a mockup</CardEyebrow>
            <CardTitle>
              The exact report format your benefits team would get.
            </CardTitle>
            <p className="mt-2 mb-4">
              This is the real report component, computing real aggregate
              math on an illustrative sample cohort &mdash; the same code
              path that renders your organization&rsquo;s real numbers once
              families start coming through.
            </p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <Metric label="Families helped" value={stats.familiesHelped} />
              <Metric
                label="Overcharge caught"
                value={
                  stats.totalOverchargeCaughtCents != null
                    ? fmtUSD(stats.totalOverchargeCaughtCents / 100)
                    : "—"
                }
              />
              <Metric
                label="Avg satisfaction"
                value={
                  stats.avgSatisfaction != null
                    ? `${stats.avgSatisfaction} / 5`
                    : "—"
                }
              />
            </div>
            <p className="text-xs text-ink-muted mb-4">
              Illustrative sample cohort &mdash; no customer has generated
              this data yet.
            </p>
            <LinkButton href="/partner/sample-employer" variant="secondary">
              See the live sample report →
            </LinkButton>
          </Card>

          <div>
            <h2 className="font-serif text-2xl text-ink mb-3">
              How it works for you
            </h2>
            <ol className="space-y-4">
              {HOW_IT_WORKS.map((s) => (
                <li
                  key={s.n}
                  className="rounded-2xl border border-border bg-surface p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-deep text-white font-serif text-sm shrink-0">
                      {s.n}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif text-lg text-ink mb-1">
                        {s.title}
                      </h3>
                      <p className="text-ink-soft">{s.body}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink mb-3">
              Why you can trust this
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card tone="soft">
                <div className="font-serif text-3xl text-primary-deep leading-none">
                  $0
                </div>
                <p className="text-sm text-ink-soft mt-2">
                  What your employees and funeral homes ever pay us &mdash;
                  zero commissions, zero fees, ever. Never funded by funeral
                  homes or insurers.
                </p>
              </Card>
              <Card tone="soft">
                <p className="font-serif text-ink">Anti-steering by design.</p>
                <p className="text-sm text-ink-soft mt-1">
                  We present options side by side; the family chooses, always.
                </p>
              </Card>
              <Card tone="soft">
                <p className="font-serif text-ink">
                  No personal data ever reaches us from you.
                </p>
                <p className="text-sm text-ink-soft mt-1">
                  Families self-enroll with a link you share. We never
                  receive an employee&rsquo;s name, role, or any record from
                  your systems &mdash; there is nothing to integrate and
                  nothing to secure.
                </p>
              </Card>
            </div>
            <p className="text-sm mt-3">
              Read{" "}
              <Link
                href="/our-role"
                className="text-primary-deep underline-offset-2 hover:underline"
              >
                what we are and aren&rsquo;t
              </Link>{" "}
              and{" "}
              <Link
                href="/methodology"
                className="text-primary-deep underline-offset-2 hover:underline"
              >
                how we price things
              </Link>
              .
            </p>
          </div>

          <div id="schedule-a-call">
            <h2 className="font-serif text-2xl text-ink mb-3">
              Schedule a call
            </h2>
            <DemoRequestForm />
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink mb-3">
              Ready to move now?
            </h2>
            <p className="mb-4">
              We&rsquo;re taking on our first employer pilots now &mdash; a
              free 60-day trial, no cost to your people or to you while we
              prove it out. Every number on this page will be real, on your
              workforce, or we won&rsquo;t publish it.
            </p>
            <LinkButton href="/partners/apply?type=employer">
              Apply to partner →
            </LinkButton>
          </div>

          <p className="text-sm text-ink-muted">
            Run a hospice or palliative program instead?{" "}
            <Link
              href="/partners"
              className="text-primary-deep underline-offset-2 hover:underline"
            >
              See our page for care partners
            </Link>
            .
          </p>
        </article>
      </section>
    </main>
  );
}
