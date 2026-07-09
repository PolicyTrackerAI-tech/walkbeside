import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { ZipSearchForm } from "@/components/funeral-homes/ZipSearchForm";
import { HelpFooter } from "@/components/HelpFooter";
import {
  LINE_ITEMS,
  SERVICE_LABELS,
  fmtRange,
  adjustedRange,
  dataSourceForZip,
  DATA_SOURCE_LABEL,
  PRICING_LAST_UPDATED,
} from "@/lib/pricing-data";
import {
  totalsForService,
  FEATURED_SERVICES,
} from "@/lib/funeral-homes-pricing";
import { regionForZip } from "@/lib/zip-regions";
import { fmtCents } from "@/lib/stripe";
import { FIVE_QUESTIONS } from "@/lib/scenarios";

interface PageProps {
  params: Promise<{ zip: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { zip } = await params;
  const region = regionForZip(zip);
  const locationLabel = region
    ? `${region.metro}, ${region.state} (zip ${zip})`
    : `zip ${zip}`;
  return {
    title: `Funeral home prices in ${locationLabel} — fair-range data`,
    description: `Honest fair-price ranges for direct cremation, traditional burial, and cremation with memorial in ${locationLabel}. Consumer advocacy for families — no commissions, no kickbacks from any funeral home.`,
  };
}

/**
 * /funeral-homes/[zip] — the substantive directory page.
 *
 * Renders four sections:
 *
 * 1. Header with the zip and data-source quality
 * 2. Service-type quick cards (top 3) — typical totals + predatory ceiling
 * 3. Full line-item fair-price table for the zip
 * 4. The five questions to ask any funeral home (reused from /prep)
 * 5. CTA into /negotiate/start with zip prefilled
 *
 * Public, indexable, no auth required. SEO-targeted at "funeral home
 * prices [zip/city]" search intent.
 */
export default async function FuneralHomesByZipPage({ params }: PageProps) {
  const { zip } = await params;

  // Validate zip — must be 5 digits, all numeric.
  if (!/^\d{5}$/.test(zip)) notFound();

  const dataSource = dataSourceForZip(zip);
  const region = regionForZip(zip);

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-10">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              <Link
                href="/funeral-homes"
                className="hover:text-ink"
              >
                Funeral home pricing
              </Link>{" "}
              · zip {zip}
              {region && (
                <>
                  {" "}
                  · <span className="text-ink-soft">{region.metro}, {region.state}</span>
                </>
              )}
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              {region
                ? `Fair funeral pricing in ${region.metro}.`
                : `Fair funeral pricing in zip ${zip}.`}
            </h1>
            <p className="text-lg text-ink-soft">
              Below is what a fair quote looks like for the three most
              common service types in {region ? `${region.metro}, ${region.state}` : "your region"}.{" "}
              {DATA_SOURCE_LABEL[dataSource]}.
            </p>
            <p className="text-xs text-ink-muted mt-2">
              National benchmarks, last updated{" "}
              {PRICING_LAST_UPDATED}.
            </p>
          </div>

          {/* Quick service-type cards */}
          <div className="space-y-4">
            <h2 className="font-serif text-2xl text-ink">
              Three common scenarios
            </h2>
            {FEATURED_SERVICES.map((s) => {
              const t = totalsForService(s, zip);
              return (
                <Card key={s}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                    <CardTitle>{SERVICE_LABELS[s]}</CardTitle>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                    <Stat
                      label="Required minimum"
                      value={`${fmtCents(t.stripped.low)}–${fmtCents(t.stripped.high)}`}
                      hint="What a home must charge to handle it"
                    />
                    <Stat
                      label="Typical fair total"
                      value={`${fmtCents(t.typical.low)}–${fmtCents(t.typical.high)}`}
                      hint="With common optional items at fair prices"
                      tone="good"
                    />
                    <Stat
                      label="Predatory ceiling"
                      value={`up to ${fmtCents(t.predatory)}`}
                      hint="What aggressive bundlers will quote"
                      tone="warn"
                    />
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Full line-item table */}
          <Card>
            <CardEyebrow>Line by line</CardEyebrow>
            <CardTitle>What each charge should cost in zip {zip}</CardTitle>
            <p className="text-ink-soft mt-3 mb-5">
              The funeral home&rsquo;s General Price List will have rows
              like these. The fair range is what you&rsquo;d expect to
              pay at an honest home. Anything well above the fair range
              — especially on the items marked with a flag — is where
              bundling tricks live.
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-ink-muted border-b border-border">
                  <th className="pb-2 pr-3">Line item</th>
                  <th className="pb-2 pr-3">Required?</th>
                  <th className="pb-2 text-right">Fair range</th>
                </tr>
              </thead>
              <tbody>
                {LINE_ITEMS.map((it) => {
                  const [lo, hi] = adjustedRange(it.fairLow, it.fairHigh, zip);
                  const requiredLabel =
                    it.required === "yes"
                      ? "Yes"
                      : it.required === "no"
                        ? "No"
                        : it.required === "burial"
                          ? "If burial"
                          : it.required === "cremation"
                            ? "If cremation"
                            : it.required === "cemetery"
                              ? "Per cemetery"
                              : "—";
                  return (
                    <tr
                      key={it.id}
                      className="border-b border-border last:border-b-0 align-top"
                    >
                      <td className="py-2.5 pr-3">
                        <div className="font-medium text-ink">
                          {it.name}
                          {it.highMarkup && (
                            <span
                              className="ml-2 text-xs text-warn"
                              title="High-markup item — commonly padded"
                            >
                              ⚑ high markup
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-ink-soft mt-0.5">
                          {it.notes}
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 text-ink-soft">
                        {requiredLabel}
                      </td>
                      <td className="py-2.5 text-right text-ink font-mono tabular-nums whitespace-nowrap">
                        {fmtRange(lo, hi)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          {/* CTA */}
          <Card tone="primary">
            <CardTitle>Don&rsquo;t want to call homes yourself?</CardTitle>
            <p className="text-ink-soft mt-3 mb-5">
              We&rsquo;ll contact 3–5 funeral homes in zip {zip} on your
              behalf, request itemized prices under the FTC Funeral
              Rule, and bring you the responses side-by-side. Free to
              families — at no charge.
            </p>
            <LinkButton href={`/negotiate/start?zip=${zip}`} size="lg">
              Have us call homes near {zip} →
            </LinkButton>
          </Card>

          {/* Five questions */}
          <Card tone="soft">
            <CardEyebrow>If you do call yourself</CardEyebrow>
            <CardTitle>Five questions to ask any funeral home</CardTitle>
            <p className="text-ink-soft mt-3 mb-4">
              Read these aloud at the start of any phone call or
              meeting. The funeral director&rsquo;s answer to each one
              tells you what kind of home you&rsquo;re dealing with.
            </p>
            <ol className="space-y-4 list-decimal list-inside">
              {FIVE_QUESTIONS.map((q) => (
                <li key={q.q} className="text-ink">
                  <span className="font-medium">{q.q}</span>
                  <p className="text-sm text-ink-soft pl-6 mt-1">
                    {q.why}
                  </p>
                </li>
              ))}
            </ol>
          </Card>

          {/* Other zip search */}
          <Card>
            <CardTitle>Looking up a different area?</CardTitle>
            <p className="text-ink-soft mt-3 mb-5">
              Helping a parent in another state, or planning ahead for
              somewhere you don&rsquo;t live now? Search any 5-digit
              US zip.
            </p>
            <ZipSearchForm cta="Look up that zip →" />
          </Card>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "good" | "warn";
}) {
  const valueClass =
    tone === "good"
      ? "text-good"
      : tone === "warn"
        ? "text-warn"
        : "text-ink";
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-ink-muted mb-1">
        {label}
      </div>
      <div className={`font-serif text-lg leading-tight ${valueClass}`}>
        {value}
      </div>
      {hint && (
        <div className="text-xs text-ink-muted mt-1 leading-snug">{hint}</div>
      )}
    </div>
  );
}
