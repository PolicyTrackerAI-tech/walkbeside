import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { HelpFooter } from "@/components/HelpFooter";
import { requirePaid } from "@/lib/require-paid";
import {
  getStateGuide,
  listStateSlugs,
  STATE_GUIDES,
} from "@/lib/probate-by-state";

export async function generateStaticParams() {
  return listStateSlugs().map((slug) => ({ state: slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>;
}): Promise<Metadata> {
  const { state } = await params;
  const guide = getStateGuide(state);
  if (!guide) return {};
  return {
    title: `Probate in ${guide.name} — what the family needs to know`,
    description: `Probate basics for ${guide.name}: small-estate threshold, typical timeline, key forms, where to file. ${guide.smallEstateThresholdUSD ? `Estates under $${guide.smallEstateThresholdUSD.toLocaleString()} qualify for the small-estate process.` : ""}`,
  };
}

export default async function StateProbatePage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state } = await params;
  await requirePaid(`/estate/${state}`);
  const guide = getStateGuide(state);
  if (!guide) notFound();

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader rightSlot={<BackLink defaultHref="/estate" />} />
      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-12 space-y-7">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              Estate settlement · {guide.abbr}
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              Probate in {guide.name}.
            </h1>
            <p className="text-lg text-ink-soft">
              The basics most families need to know. Not legal advice
              — see the official sources at the bottom of this page,
              or call a {guide.name} estate attorney for the specifics
              of your situation.
            </p>
          </div>

          <Card tone="primary">
            <CardEyebrow>Small estate threshold</CardEyebrow>
            <CardTitle>
              {guide.smallEstateThresholdUSD
                ? `Estates under $${guide.smallEstateThresholdUSD.toLocaleString()}`
                : "No small-estate threshold available"}
            </CardTitle>
            <p className="text-ink-soft mt-3">
              {guide.smallEstateProcess}
            </p>
          </Card>

          <Card>
            <CardEyebrow>Typical timeline</CardEyebrow>
            <CardTitle>
              {guide.typicalTimelineMonths.low}&ndash;
              {guide.typicalTimelineMonths.high} months for full probate
            </CardTitle>
            <p className="text-ink-soft mt-3">
              {guide.informalProbateAvailable
                ? `${guide.name} offers informal/unsupervised probate, which is typically faster and less expensive when the will is clean and the heirs aren't in dispute.`
                : `${guide.name} does not have an informal probate option — full court-supervised probate is the standard path.`}
            </p>
            <p className="text-sm text-ink-muted mt-3">
              {guide.attorneyRequiredForProbate
                ? `${guide.name} requires an attorney for full probate. Plan for $1,500–$5,000+ in legal fees on top of court costs.`
                : `${guide.name} does not require an attorney for probate, though most families with non-trivial estates use one. Average legal fees: $1,500–$5,000.`}
            </p>
          </Card>

          {guide.notableQuirks.length > 0 && (
            <Card>
              <CardEyebrow>Notable quirks</CardEyebrow>
              <CardTitle>What makes {guide.name} different.</CardTitle>
              <ul className="space-y-3 mt-4">
                {guide.notableQuirks.map((q, i) => (
                  <li key={i} className="flex gap-3 text-ink-soft">
                    <span className="text-primary-deep mt-1" aria-hidden>
                      •
                    </span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {guide.isCommunityPropertyState && (
            <Card tone="warn">
              <CardEyebrow>Community property state</CardEyebrow>
              <p className="text-ink mt-2">
                {guide.name} is a community-property state. In general,
                property acquired during marriage is owned half by each
                spouse — meaning the surviving spouse already owns half,
                and only the deceased&rsquo;s half passes through the
                estate. This significantly affects what gets probated
                and what passes automatically to the spouse.
              </p>
            </Card>
          )}

          <Card>
            <CardEyebrow>Key forms</CardEyebrow>
            <CardTitle>What the executor will file.</CardTitle>
            <ul className="space-y-3 mt-4">
              {guide.keyForms.map((f, i) => (
                <li key={i}>
                  <div className="font-medium text-ink">{f.name}</div>
                  <div className="text-sm text-ink-soft mt-0.5">
                    {f.description}
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card tone="soft">
            <CardEyebrow>Authoritative sources</CardEyebrow>
            <CardTitle>For the actual current rules.</CardTitle>
            <p className="text-ink-soft mt-3 mb-4">
              State rules and thresholds change. These links go to the
              {" "}
              {guide.name} courts and bar association — the source of
              truth for current forms, fees, and procedures.
            </p>
            <ul className="space-y-2">
              {guide.authoritativeSources.map((s, i) => (
                <li key={i}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary-deep underline-offset-2 hover:underline"
                  >
                    {s.label} →
                  </a>
                </li>
              ))}
            </ul>
          </Card>

          <Card tone="soft">
            <CardEyebrow>Other states</CardEyebrow>
            <p className="text-ink-soft text-sm mb-3">
              We have probate guides for the 10 most populous states.
              Pick another:
            </p>
            <div className="flex flex-wrap gap-2">
              {STATE_GUIDES.filter((s) => s.slug !== guide.slug).map(
                (s) => (
                  <Link
                    key={s.slug}
                    href={`/estate/${s.slug}`}
                    className="text-sm px-3 py-1.5 rounded-full border border-border bg-surface hover:border-primary hover:bg-primary-soft transition-colors"
                  >
                    {s.name}
                  </Link>
                ),
              )}
            </div>
          </Card>

          <p className="text-xs text-ink-muted">
            This page is general consumer guidance, not legal advice.
            For complex estates, contested wills, or
            jurisdiction-specific questions, talk to a licensed{" "}
            {guide.name} estate attorney.
          </p>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
