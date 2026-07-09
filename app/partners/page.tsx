import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { fmtUSD } from "@/lib/pricing-data";
import { aggregateCohort, sampleCohort } from "@/lib/partner-report";
import { Metric } from "@/components/partner/ProofSheet";
import { DemoRequestForm } from "./DemoRequestForm";

const HOW_IT_WORKS = [
  {
    n: 1,
    title: "You get a neutral link or card to hand out.",
    body: "One link, printable or digital — no setup beyond that.",
  },
  {
    n: 2,
    title: "Families self-enroll — no PHI ever changes hands.",
    body: "They activate it themselves, on their own time. Your systems transmit nothing to us.",
  },
  {
    n: 3,
    title: "They get a free, neutral funeral-price advocate.",
    body: "Fair prices for their area, a quote checker, and a real advocate who contacts homes on their behalf. The family chooses, always.",
  },
  {
    n: 4,
    title: "We run every case by hand and capture outcomes.",
    body: "Savings, satisfaction, time-to-resolution — recorded on every case that comes through.",
  },
  {
    n: 5,
    title: "At the agreed point, you get an aggregate report.",
    body: "Families helped, savings, satisfaction, time-to-resolution — for your compliance file and referral conversations. Never a single family's details.",
  },
];

export const metadata: Metadata = {
  title: "Partner with Honest Funeral — a free, neutral funeral-cost benefit for your families",
  description:
    "Honest Funeral is free to families, funded by the hospices and employers we partner with — never by funeral homes or insurers. See a live sample report, schedule a call, or apply to run a free pilot.",
  alternates: { canonical: "/partners" },
  robots: { index: true, follow: true },
};

export default function PartnersPage() {
  const stats = aggregateCohort(sampleCohort());

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader rightSlot={<BackLink defaultHref="/" defaultLabel="← Home" />} />

      <section className="flex-1">
        <article className="max-w-2xl mx-auto px-5 py-10 space-y-8 text-ink-soft">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              For hospices &amp; employers
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              A funeral-cost benefit you can hand a grieving family without
              worrying what it costs them.
            </h1>
            <p className="text-lg">
              Everyone who claims to help a grieving family with the funeral is
              paid by someone with a stake in the funeral price &mdash; the
              funeral home, an insurer, or the family&rsquo;s own wallet.{" "}
              <strong className="text-ink">
                We are the only one paid by none of them.
              </strong>{" "}
              Your organization pays us to give your families a neutral guide;
              we take no money from funeral homes or insurers, and we never
              charge the family &mdash; which is the only reason you can
              ethically put us in a grieving family&rsquo;s hands.
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
                adjusted by zip. National benchmark, not yet locally validated
                for your service area &mdash; excludes cemetery/plot,
                monument, and third-party fees.
              </p>
            </Card>
            <Card>
              <CardEyebrow>Bereavement mandate</CardEyebrow>
              <div className="font-serif text-4xl sm:text-5xl text-primary-deep mt-1 leading-none">
                ~13 months
              </div>
              <p className="text-sm text-ink-soft mt-2">
                of support Medicare requires per death (42 CFR 418.64) &mdash;
                unfunded.
              </p>
              <p className="text-xs text-ink-muted mt-2">
                Basis: federal Medicare hospice Conditions of Participation, 42
                CFR 418.64(d) &mdash; applies to every Medicare-certified
                hospice, not a survey estimate.
              </p>
            </Card>
          </div>

          <Card tone="primary">
            <CardEyebrow>See it live &mdash; not a mockup</CardEyebrow>
            <CardTitle>The exact report format your hospice would get.</CardTitle>
            <p className="mt-2 mb-4">
              This is the real proof-sheet component, computing real aggregate
              math on an illustrative sample cohort &mdash; the same code path
              that renders your hospice&rsquo;s real numbers once families
              start coming through.
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
              Illustrative sample cohort &mdash; no customer has generated this
              data yet.
            </p>
            <LinkButton href="/partner/sample-hospice" variant="secondary">
              See the full live report →
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

          <Card tone="primary">
            <CardEyebrow>The problem this solves</CardEyebrow>
            <ul className="mt-3 space-y-3 text-ink list-disc list-inside marker:text-primary-deep">
              <li>
                Medicare requires roughly 13 months of bereavement support
                after every death (42 CFR 418.64) &mdash; unfunded, and
                survey-able.
              </li>
              <li>
                Your CAHPS &ldquo;Emotional &amp; Spiritual Support&rdquo;
                composite feeds your Care Compare star rating; missing it
                risks your Medicare Annual Payment Update.
              </li>
              <li>
                The funeral-pricing and after-death questions your counselors
                field every week were never resourced for &mdash; we absorb
                that part, and complement your grief program instead of
                replacing it.
              </li>
            </ul>
          </Card>

          <div>
            <h2 className="font-serif text-2xl text-ink mb-3">What we do</h2>
            <ul className="space-y-3 list-disc list-outside ml-5">
              <li>
                <strong className="text-ink">Fair prices for their area</strong>{" "}
                &mdash; what a funeral should cost near them, by line item, so
                a quote can&rsquo;t blindside them.
              </li>
              <li>
                <strong className="text-ink">&ldquo;Is this quote fair?&rdquo;</strong>{" "}
                &mdash; they send us a price list; we flag the overcharges and
                the items they can legally decline.
              </li>
              <li>
                <strong className="text-ink">A real advocate</strong> &mdash;
                we contact funeral homes, gather itemized quotes, and lay the
                options side by side. The family chooses, always.
              </li>
              <li>
                <strong className="text-ink">
                  An aggregate outcomes report
                </strong>{" "}
                &mdash; families served, satisfaction, savings,
                time-to-resolution, for your compliance file and referral
                conversations. Never a single family&rsquo;s details.
              </li>
            </ul>
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
                  What families and funeral homes ever pay us &mdash; zero
                  commissions, zero fees, ever.
                </p>
              </Card>
              <Card tone="soft">
                <p className="font-serif text-ink">Anti-steering by design.</p>
                <p className="text-sm text-ink-soft mt-1">
                  We present options side by side; the family chooses, always.
                </p>
              </Card>
              <Card tone="soft">
                <p className="font-serif text-ink">No PHI ever reaches us.</p>
                <p className="text-sm text-ink-soft mt-1">
                  Families self-enroll with a code you hand out. The only API
                  call it triggers (<code className="text-xs">GET
                  /api/partner/resolve</code>) returns your organization&rsquo;s
                  display name &mdash; nothing else. We never receive a
                  patient name, MRN, diagnosis, or admission date, and your
                  systems never transmit one to us.
                </p>
              </Card>
            </div>
            <p className="text-sm mt-3">
              Read{" "}
              <Link href="/our-role" className="text-primary-deep underline-offset-2 hover:underline">
                what we are and aren&rsquo;t
              </Link>{" "}
              and{" "}
              <Link href="/methodology" className="text-primary-deep underline-offset-2 hover:underline">
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
              We&rsquo;re taking on our first pilot hospices now &mdash; a
              free 60-day trial, no cost to your families or to you while we
              prove it out. Every number on this page will be real, on your
              families, or we won&rsquo;t publish it.
            </p>
            <LinkButton href="/partners/apply">Apply to partner →</LinkButton>
          </div>
        </article>
      </section>
    </main>
  );
}
