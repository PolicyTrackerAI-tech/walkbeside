import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { HelpFooter } from "@/components/HelpFooter";
import { ogImage } from "@/lib/og";
import { ArticleSchema } from "@/components/seo/ArticleSchema";
import { getCity, listCitySlugs, CITIES } from "@/lib/city-pages";
import { regionForZip } from "@/lib/zip-regions";
import { SERVICE_TOTALS, SERVICE_LABELS, LINE_ITEMS, fmtUSD } from "@/lib/pricing-data";
import { DataTierBadge } from "@/components/DataTierBadge";
import { listStateSlugs } from "@/lib/probate-by-state";
import { benchmarksForZip } from "@/lib/benchmarks-store";
import {
  verifiedLocalRows,
  localCountLine,
} from "@/lib/verified-local-prices";

export async function generateStaticParams() {
  return listCitySlugs().map((slug) => ({ city: slug }));
}

// ISR: statically generated, revalidated hourly — and purged immediately by
// the benchmark promote route (app/api/admin/benchmarks/promote), so a
// founder promotion surfaces here within the hour with no deploy.
export const revalidate = 3600;

function fmtRange(low: number, high: number, multiplier: number): string {
  const a = Math.round((low * multiplier) / 100) * 100;
  const b = Math.round((high * multiplier) / 100) * 100;
  return `$${a.toLocaleString()}–$${b.toLocaleString()}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: slug } = await params;
  const city = getCity(slug);
  if (!city) return {};
  return {
    title: `Funeral costs in ${city.name}, ${city.state} — fair-price ranges by service type`,
    description: `What a funeral actually costs in ${city.name}: direct cremation, traditional burial, green burial, and more. Regional fair-price ranges drawn from national pricing data adjusted for ${city.name} cost-of-living. No funeral home referrals; no commissions.`,
    openGraph: {
      images: [
        ogImage(
          `Funeral costs in ${city.name}, ${city.state}`,
          "Local pricing",
        ),
      ],
    },
  };
}

export default async function CityFuneralCostsPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: slug } = await params;
  const city = getCity(slug);
  if (!city) notFound();

  // Founder-promoted per-item overrides for this metro (empty Map when none
  // exist or the table/env is missing — the section below simply doesn't
  // render and the page is byte-identical to the modeled-only version).
  const overrides = await benchmarksForZip(city.zipExample);
  const local = verifiedLocalRows(overrides);

  // Verbatim law (guardrail #4) — the wording lives in localCountLine and
  // is pinned character-for-character by its unit tests.
  const countLine = localCountLine(
    local.verifiedCount,
    local.communityCount,
    LINE_ITEMS.length,
  );

  const region = regionForZip(city.zipExample);
  const multiplier = region?.multiplier ?? 1.0;
  const metroLabel = region?.metro ?? city.name;
  const hasStateGuide =
    city.stateSlug && listStateSlugs().includes(city.stateSlug);

  // Same-state metros — internal linking across the funeral-costs cluster.
  const sameStateCities = CITIES.filter(
    (c) => c.state === city.state && c.slug !== city.slug,
  ).sort((a, b) => a.name.localeCompare(b.name));

  // Friendly multiplier framing
  let multiplierDescription = "in line with national averages";
  if (multiplier > 1.15)
    multiplierDescription = "noticeably above the national average";
  else if (multiplier > 1.05)
    multiplierDescription = "slightly above the national average";
  else if (multiplier < 0.9)
    multiplierDescription = "noticeably below the national average";
  else if (multiplier < 0.97)
    multiplierDescription = "slightly below the national average";

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader rightSlot={<BackLink defaultHref="/guides" />} />
      <ArticleSchema
        slug={`funeral-costs/${city.slug}`}
        title={`Funeral costs in ${city.name}, ${city.state}`}
        description={`Regional fair-price ranges for ${city.name}, drawn from national pricing data adjusted for local cost-of-living. Cremation, burial, green burial, and more.`}
        eyebrow="Local pricing"
      />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-7">
          <div>
            <CardEyebrow>Funeral costs · {city.name}, {city.state}</CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              What a funeral actually costs in {city.name}.
            </h1>
            <p className="text-lg text-ink-soft">
              {city.blurb
                ? city.blurb + " "
                : `${city.name} funeral pricing runs ${multiplierDescription} ` +
                  `based on regional cost-of-living. `}
              Below are fair-price ranges for the most common service
              types, with the predatory line where prices start to
              feel exploitative. These are not quotes; they&rsquo;re
              what the service{" "}
              <em>should</em> cost from an honest funeral home in
              this market.
            </p>
          </div>

          {/* Service-type pricing table */}
          <Card>
            <CardEyebrow>By service type — {metroLabel}</CardEyebrow>
            <CardTitle>Fair-price ranges and predatory thresholds.</CardTitle>
            <div className="mt-4 overflow-x-auto -mx-2 px-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left font-medium text-ink-muted py-2 pr-3">
                      Service
                    </th>
                    <th className="text-right font-medium text-ink-muted py-2 px-3">
                      Fair range
                    </th>
                    <th className="text-right font-medium text-ink-muted py-2 pl-3 hidden sm:table-cell">
                      Predatory starts at
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {SERVICE_TOTALS.map((s) => (
                    <tr
                      key={s.type}
                      className="border-b border-border last:border-b-0"
                    >
                      <td className="py-3 pr-3 text-ink">
                        {SERVICE_LABELS[s.type]}
                      </td>
                      <td className="py-3 px-3 text-right text-ink font-medium">
                        {fmtRange(s.fairLow, s.fairHigh, multiplier)}
                      </td>
                      <td className="py-3 pl-3 text-right text-ink-soft hidden sm:table-cell">
                        $
                        {Math.round(
                          (s.predatoryLow * multiplier) / 100,
                        ) *
                          100}
                        +
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              {/* Always modeled: this table is whole-service bands × the
                  regional multiplier — per-item local overrides can't apply
                  to whole-service totals. The page ALSO reads per-item
                  overrides from regional_benchmarks, but those render only
                  in the separate "Verified local prices" section below. */}
              <DataTierBadge tier="modeled" />
            </div>
            <p className="text-xs text-ink-muted mt-2">
              Source: national pricing benchmarks, adjusted by an
              estimated regional cost index for the {metroLabel} market
              (modeled). Real quotes vary by funeral home and
              by what&rsquo;s included. Comparison-shopping at least
              two homes is the most reliable way to find a fair price.
            </p>
          </Card>

          {/* Verified local prices — renders ONLY when the store returned
              publishable rows (n≥5, catalog items). Zero overrides ⇒ this
              whole block is absent and the page renders byte-identical to
              the modeled-only version (pinned by lib tests + the gate). */}
          {local.rows.length > 0 && (
            <Card>
              <CardEyebrow>Verified local prices</CardEyebrow>
              <CardTitle>Where real local data replaces the model.</CardTitle>
              <p className="text-ink-soft mt-3">
                The whole-service table above stays modeled; for the specific
                items below, the range comes from real local data, and the
                badge on each row shows where it comes from.
              </p>
              <div className="mt-4 overflow-x-auto -mx-2 px-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-medium text-ink-muted py-2 pr-3">
                        Item
                      </th>
                      <th className="text-right font-medium text-ink-muted py-2 px-3">
                        Fair range
                      </th>
                      <th className="text-left font-medium text-ink-muted py-2 pl-3">
                        Source
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {local.rows.map((r) => (
                      <tr
                        key={r.lineItemId}
                        className="border-b border-border last:border-b-0"
                      >
                        <td className="py-3 pr-3 text-ink">{r.name}</td>
                        <td className="py-3 px-3 text-right text-ink font-medium whitespace-nowrap">
                          {fmtUSD(r.fairLowUsd)}&ndash;{fmtUSD(r.fairHighUsd)}
                        </td>
                        <td className="py-3 pl-3">
                          <DataTierBadge
                            tier={r.tier}
                            n={r.n}
                            lastUpdated={r.lastUpdated}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-ink-muted mt-3">{countLine}</p>
            </Card>
          )}

          {/* CTA: see local homes */}
          <Card tone="primary">
            <CardEyebrow>Local fair pricing</CardEyebrow>
            <CardTitle>See what&rsquo;s fair to pay in {city.name}.</CardTitle>
            <p className="text-ink-soft mt-3 mb-5">
              We&rsquo;ll show you what a fair quote looks like in {city.name}{" "}
              and the surrounding zip codes &mdash; benchmark ranges for the
              most common service types and every line item, adjusted for
              local cost of living. Free to browse, no account needed.
            </p>
            <LinkButton href={`/funeral-homes/${city.zipExample}`} size="lg">
              See fair prices near {city.name} →
            </LinkButton>
          </Card>

          {/* What you can decline */}
          <Card>
            <CardEyebrow>What to decline</CardEyebrow>
            <CardTitle>The same nine items, regardless of city.</CardTitle>
            <p className="text-ink-soft mt-3 mb-4">
              The line items most often padded onto a funeral bill
              are the same in {city.name} as everywhere else. Federal
              law (the FTC Funeral Rule) gives families the right to
              refuse them. The biggest savings: embalming
              (rarely required), a casket from the funeral home
              (you can buy elsewhere for 40&ndash;70% less), and the
              &ldquo;protective&rdquo; casket-and-vault upgrades.
            </p>
            <LinkButton href="/rights" variant="secondary">
              See the full list of nine →
            </LinkButton>
          </Card>

          {/* Estate / probate link */}
          {hasStateGuide && (
            <Card>
              <CardEyebrow>After the funeral</CardEyebrow>
              <CardTitle>
                Probate and estate settlement in {city.state}.
              </CardTitle>
              <p className="text-ink-soft mt-3 mb-4">
                State-specific guide to probate timelines, the
                small-estate threshold, when you need an attorney, and
                what forms to file.
              </p>
              <LinkButton href={`/estate/${city.stateSlug}`} variant="secondary">
                Open the {city.state} probate guide →
              </LinkButton>
            </Card>
          )}

          {/* Cross-link to broader content */}
          <Card tone="soft">
            <CardEyebrow>More guides for {city.name} families</CardEyebrow>
            <ul className="space-y-2 list-disc pl-5 text-ink-soft mt-3">
              <li>
                <Link
                  href="/decide"
                  className="text-primary-deep underline"
                >
                  What type of service fits us?
                </Link>{" "}
                — five short questions, no account, no email.
              </li>
              <li>
                <Link
                  href="/how-to-pay"
                  className="text-primary-deep underline"
                >
                  How to pay when you can&rsquo;t afford it
                </Link>{" "}
                — county indigent burial, FEMA, charitable aid.
              </li>
              <li>
                <Link
                  href="/funeral-home-tactics"
                  className="text-primary-deep underline"
                >
                  How the funeral industry&rsquo;s sales floor works
                </Link>{" "}
                — recognize the patterns before walking in.
              </li>
              <li>
                <Link
                  href="/guides"
                  className="text-primary-deep underline"
                >
                  All guides
                </Link>{" "}
                — the full library, by topic.
              </li>
            </ul>
          </Card>

          {/* Nearby metros — internal linking across the funeral-costs cluster */}
          <Card>
            <CardEyebrow>
              {sameStateCities.length > 0
                ? `Other ${city.state} metros`
                : "More cities"}
            </CardEyebrow>
            <CardTitle>Compare funeral costs in other metros.</CardTitle>
            {sameStateCities.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-ink-soft">
                {sameStateCities.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/funeral-costs/${c.slug}`}
                      className="text-primary-deep underline-offset-2 hover:underline"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-sm">
              <Link href="/funeral-costs" className="text-primary-deep underline">
                See fair-price ranges for all {CITIES.length} cities →
              </Link>
            </p>
          </Card>

          {/* Brand close */}
          <Card tone="primary">
            <CardTitle>If you want us to contact funeral homes for you.</CardTitle>
            <p className="text-ink-soft mt-3 mb-5">
              We contact funeral homes in {city.name} as your
              authorized advocate, pull written itemized quotes, and
              put the options side by side. Free to families — no charge
              to contact homes or to choose one. No commissions, no
              kickbacks — ever.
            </p>
            <LinkButton href="/where" size="lg">
              Start here →
            </LinkButton>
          </Card>

          <p className="text-xs text-ink-muted">
            This page is general consumer information based on
            regional pricing benchmarks. Actual funeral prices vary
            by home, by service type, by date, and by what&rsquo;s
            included. Confirm specific prices directly with the
            funeral home before relying on anything here for a
            financial decision. We are not affiliated with any
            funeral home in {city.name} and take no commissions or
            referral fees.
          </p>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
