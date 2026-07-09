import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { LINE_ITEMS, PRICING_LAST_UPDATED } from "@/lib/pricing-data";
import { RULES } from "@/lib/bundling-detection/rules";

export const metadata: Metadata = {
  title: "How we check a funeral quote — our methodology",
  description:
    "Exactly how Honest Funeral decides whether a funeral price is fair: where our benchmark ranges come from, how we adjust for your region, the FTC Funeral Rule checks we run, and the limits of an estimate. No money from funeral homes or insurers.",
  alternates: { canonical: "/methodology" },
};

const ITEM_COUNT = LINE_ITEMS.length;
const RULE_COUNT = RULES.length;
const LAST_UPDATED = new Date(PRICING_LAST_UPDATED + "T00:00:00Z").toLocaleDateString(
  "en-US",
  { year: "numeric", month: "long", timeZone: "UTC" },
);

export default function MethodologyPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader rightSlot={<BackLink defaultHref="/analyzer" defaultLabel="← Back to the checker" />} />

      <section className="flex-1">
        <article className="max-w-2xl mx-auto px-5 py-10 space-y-8 text-ink-soft">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              Methodology
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              How we decide whether a funeral quote is fair.
            </h1>
            <p className="text-lg">
              When you check a price list, we do two separate things: compare each
              line to a fair-price range for your region, and scan the whole quote
              against the federal rule that governs how funeral homes must price.
              Here is exactly how both work &mdash; and where the limits are. We&rsquo;d
              rather you trust a careful estimate than a confident wrong one.
            </p>
          </div>

          <Card tone="soft">
            <CardEyebrow>The short version</CardEyebrow>
            <p className="mt-2">
              We benchmark each charge against national fair-price data, adjust for
              your local cost of living, and flag anything priced above the fair
              range. Separately, we check the quote against the FTC Funeral Rule
              (16 CFR Part 453) for the {RULE_COUNT} most common violations and
              upsells. We take no money from funeral homes or insurers, so the
              numbers have no thumb on the scale.
            </p>
          </Card>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl text-ink">
              1. Where the fair-price ranges come from
            </h2>
            <p>
              We maintain a reference set of fair-price ranges for the{" "}
              {ITEM_COUNT} charges that appear on nearly every funeral bill &mdash;
              the basic services fee, transfer of remains, embalming and body
              preparation, viewing and service facilities, hearse and limousine,
              graveside service, caskets, cremation containers, urns, and death
              certificates. Each has a <strong className="text-ink">fair low</strong>,
              a <strong className="text-ink">fair high</strong>, and a threshold
              above which we call the price <strong className="text-ink">overpriced</strong>.
            </p>
            <p>
              Those ranges are built from published national funeral-cost data and
              real General Price Lists. They are a benchmark, not a single &ldquo;right&rdquo;
              price &mdash; honest homes vary, and we treat anything inside the range as
              fair. Our reference data was last reviewed in{" "}
              <strong className="text-ink">{LAST_UPDATED}</strong>.
            </p>
            <p>
              As families check real quotes with us, those de-identified prices
              accumulate into an observed picture of what funeral homes actually
              charge. We use it to refine the ranges over time &mdash; carefully: a
              range only changes when enough independent samples agree (never a
              handful of outliers), every change is reviewed by a person before
              it ships, and every change is logged on our{" "}
              <Link href="/corrections" className="text-primary-deep underline">
                corrections page
              </Link>{" "}
              with the old range, the new range, and the sample size. Until an
              item crosses that bar, it stays on the published survey baseline.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl text-ink">
              2. How we adjust for your region
            </h2>
            <p>
              A funeral in San Francisco costs more than the same funeral in rural
              Mississippi, so a flat national number would mislabel both. When you
              give us a zip code, we apply a cost-of-living multiplier for that
              region to the fair range before we compare your price to it. A quote
              at the top of the range in a high-cost metro reads as fair, not high.
            </p>
            <p>
              One deliberate exception:{" "}
              <strong className="text-ink">fixed government fees</strong>, like the
              per-copy charge for a death certificate, are not cost-of-living
              adjusted &mdash; the state charges the same fee everywhere, so we judge
              those against a flat national amount and against the per-copy price,
              not the total.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl text-ink">
              3. How we classify each line
            </h2>
            <ul className="space-y-2">
              <li>
                <strong className="text-good">Good / Fair</strong> &mdash; at or
                within the adjusted fair range. We never show a price as &ldquo;above
                fair&rdquo; if it isn&rsquo;t.
              </li>
              <li>
                <strong className="text-warn">High</strong> &mdash; above the fair
                range but not extreme. Worth questioning.
              </li>
              <li>
                <strong className="text-bad">Overpriced</strong> &mdash; far above
                the fair range, in the territory where families routinely overpay.
              </li>
              <li>
                <strong className="text-ink">Selection items</strong> (caskets,
                vaults, urns) are shown as a price range, not graded &mdash; because
                you can buy them from any third party, which is usually the single
                largest saving available.
              </li>
            </ul>
            <p>
              The headline &ldquo;above fair&rdquo; figure is the sum of how far each
              overpriced line sits above the midpoint of its fair range &mdash; never
              an item that&rsquo;s within range, and for per-copy items it&rsquo;s scaled by
              quantity.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl text-ink">
              4. The FTC Funeral Rule checks
            </h2>
            <p>
              The FTC Funeral Rule (16 CFR Part 453) has governed funeral pricing
              since 1984. It requires itemized price lists, forbids requiring a
              casket for direct cremation, requires written authorization for
              embalming, and more. It is widely violated, and most families never
              learn their rights. We scan every quote against the {RULE_COUNT} most
              common patterns, including:
            </p>
            <ul className="space-y-2">
              <li>A casket required or pushed on a direct-cremation quote.</li>
              <li>Embalming charged as if required by law (it isn&rsquo;t, in any state).</li>
              <li>A burial vault on a cremation-only arrangement.</li>
              <li>Pass-through &ldquo;cash advance&rdquo; items not disclosed as such.</li>
              <li>Services bundled into a package instead of itemized.</li>
              <li>
                Your right to buy a casket, vault, or urn from a third party with
                no handling fee.
              </li>
            </ul>
            <p>
              Each finding cites the relevant section and gives you a short script
              to quote back. We grade them honestly:{" "}
              <strong className="text-ink">a likely violation</strong> only when the
              price list itself shows it, and{" "}
              <strong className="text-ink">worth confirming</strong> when we can&rsquo;t
              prove it from the page you shared. We would rather under-claim than
              accuse a funeral home of something we can&rsquo;t see.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl text-ink">
              5. When we&rsquo;re not sure, we tell you
            </h2>
            <p>
              If we read a photo and couldn&rsquo;t make out every line, or matched
              charges we don&rsquo;t yet have a benchmark for, we say so on the result
              rather than presenting a confident total built on a partial read.
              Charges we can&rsquo;t benchmark are left at face value &mdash; they never
              inflate the &ldquo;above fair&rdquo; figure. The estimate is deliberately
              conservative.
            </p>
          </div>

          <Card tone="warn">
            <CardTitle>What this is not</CardTitle>
            <p className="mt-2">
              This is an informational estimate, not legal or financial advice, and
              not an appraisal of any specific funeral home. Our regional ranges are
              national benchmarks adjusted for cost of living &mdash; they are not yet
              validated against local price lists in every metro, and where they
              aren&rsquo;t, the result says so. Actual fair prices vary by home and by
              what you choose. Use this to ask better questions, not as the last
              word.
            </p>
          </Card>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl text-ink">
              Why you can trust the number
            </h2>
            <p>
              Honest Funeral is free to families and takes{" "}
              <strong className="text-ink">no money from funeral homes or
              insurers</strong> &mdash; ever. Nobody with a stake in your funeral bill
              pays us, so nothing about a quote changes what we tell you. That
              independence is the whole point.{" "}
              <Link href="/our-role" className="text-primary-deep underline">
                More about our role &rarr;
              </Link>
            </p>
            <p>
              And when we get something wrong, we fix it in the open &mdash; see
              our{" "}
              <Link href="/corrections" className="text-primary-deep underline">
                corrections &amp; accuracy page
              </Link>
              .
            </p>
          </div>

          <div className="pt-2">
            <LinkButton href="/analyzer">Check a quote &rarr;</LinkButton>
          </div>
        </article>
      </section>
    </main>
  );
}
