import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { HelpFooter } from "@/components/HelpFooter";
import { ShareThisPage } from "@/components/ShareThisPage";
import { ogImage } from "@/lib/og";
import { ArticleSchema } from "@/components/seo/ArticleSchema";
import {
  SERVICE_TOTALS,
  SERVICE_LABELS,
  LINE_ITEMS,
  fmtUSD,
} from "@/lib/pricing-data";

export const metadata: Metadata = {
  title: "How much does a funeral cost? 2026 averages by service type",
  description:
    "What a funeral actually costs in 2026: direct cremation $1,000–$2,200, traditional burial $8,000–$12,000, and more. Fair-price ranges by service type, what drives the cost, and the line items you can legally decline.",
  openGraph: {
    images: [ogImage("How much does a funeral cost?", "2026 averages")],
  },
};

// Highest-markup line items — where families overpay most.
const OVERPAY = LINE_ITEMS.filter((i) => i.highMarkup);

function requiredLabel(r: (typeof LINE_ITEMS)[number]["required"]): string {
  if (r === "no") return "Optional";
  if (r === "yes") return "Required";
  return "Situational";
}

export default function AverageFuneralCostPage() {
  const burial = SERVICE_TOTALS.find((s) => s.type === "traditional-burial");
  const cremation = SERVICE_TOTALS.find((s) => s.type === "direct-cremation");
  // Data invariant — both service types always exist in SERVICE_TOTALS.
  if (!burial || !cremation) return null;

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader rightSlot={<BackLink defaultHref="/guides" />} />
      <ArticleSchema
        slug="average-funeral-cost"
        title="How much does a funeral cost?"
        description="2026 national fair-price ranges by service type, what drives the cost, and what you can legally decline."
        eyebrow="Funeral costs"
      />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-7">
          <div>
            <CardEyebrow>Funeral costs · 2026</CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              How much does a funeral cost?
            </h1>
            <p className="text-lg text-ink-soft">
              In 2026, a <strong className="text-ink">traditional burial</strong>{" "}
              runs about{" "}
              <strong className="text-ink">
                {fmtUSD(burial.fairLow)}&ndash;{fmtUSD(burial.fairHigh)}
              </strong>{" "}
              from an honest funeral home, and a{" "}
              <strong className="text-ink">direct cremation</strong> about{" "}
              <strong className="text-ink">
                {fmtUSD(cremation.fairLow)}&ndash;{fmtUSD(cremation.fairHigh)}
              </strong>
              . But the bill families are handed is often far higher &mdash;
              padded with items you can legally decline. Here&rsquo;s the full
              breakdown by service type, what drives the cost, and where
              families overpay.
            </p>
          </div>

          {/* Averages by service type */}
          <Card>
            <CardEyebrow>Average cost by service type</CardEyebrow>
            <CardTitle>National fair-price ranges (2026).</CardTitle>
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
                      Overpriced at
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
                        {fmtUSD(s.fairLow)}&ndash;{fmtUSD(s.fairHigh)}
                      </td>
                      <td className="py-3 pl-3 text-right text-ink-soft hidden sm:table-cell">
                        {fmtUSD(s.predatoryLow)}+
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-ink-muted mt-4">
              National fair-price benchmarks, adjusted for regional cost of living.
              Prices run higher in expensive metros and lower in rural areas
              &mdash; see{" "}
              <Link
                href="/funeral-costs"
                className="text-primary-deep underline"
              >
                funeral costs by city
              </Link>{" "}
              for your area, or the{" "}
              <Link href="/prices" className="text-primary-deep underline">
                price calculator
              </Link>{" "}
              for your exact zip.
            </p>
          </Card>

          {/* What drives the cost */}
          <Card>
            <CardEyebrow>What drives the cost</CardEyebrow>
            <CardTitle>One required fee, and a lot of optional add-ons.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Every funeral home charges one non-declinable{" "}
                <strong className="text-ink">basic services fee</strong>{" "}
                (typically {fmtUSD(1500)}&ndash;{fmtUSD(2500)}) covering the
                funeral director, permits, and paperwork. Almost everything
                else is optional &mdash; and that&rsquo;s where the bill grows.
              </p>
              <p>
                The items below carry the heaviest markup. Under the FTC
                Funeral Rule you can decline most of them, buy them from a
                third party, or choose a cheaper alternative.
              </p>
            </div>
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
                    <th className="text-right font-medium text-ink-muted py-2 pl-3 hidden sm:table-cell">
                      Required?
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {OVERPAY.map((i) => (
                    <tr
                      key={i.id}
                      className="border-b border-border last:border-b-0"
                    >
                      <td className="py-3 pr-3 text-ink">{i.name}</td>
                      <td className="py-3 px-3 text-right text-ink font-medium">
                        {fmtUSD(i.fairLow)}&ndash;{fmtUSD(i.fairHigh)}
                      </td>
                      <td className="py-3 pl-3 text-right text-ink-soft hidden sm:table-cell">
                        {requiredLabel(i.required)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* How to pay less */}
          <Card tone="primary">
            <CardEyebrow>How to pay less</CardEyebrow>
            <CardTitle>The five biggest savings, in order.</CardTitle>
            <ol className="mt-3 space-y-3 text-ink-soft list-decimal pl-5">
              <li>
                <strong className="text-ink">Buy the casket third-party.</strong>{" "}
                Costco and Amazon caskets run 50&ndash;80% less, and the
                funeral home must accept one with no handling fee (FTC Funeral
                Rule).
              </li>
              <li>
                <strong className="text-ink">Decline embalming.</strong> Not
                required by law in any state; refrigeration is always a legal
                alternative. Saves roughly {fmtUSD(800)}.
              </li>
              <li>
                <strong className="text-ink">
                  For cremation, refuse the casket.
                </strong>{" "}
                A simple alternative container (often under {fmtUSD(200)}) is
                all that&rsquo;s required.
              </li>
              <li>
                <strong className="text-ink">
                  Skip the &ldquo;protective&rdquo; casket and vault upgrades.
                </strong>{" "}
                The sealing claims aren&rsquo;t supported by science; the
                premium is {fmtUSD(1000)}&ndash;{fmtUSD(3000)}.
              </li>
              <li>
                <strong className="text-ink">
                  Comparison-shop at least two homes.
                </strong>{" "}
                Prices for the identical service vary by thousands in the same
                town.
              </li>
            </ol>
            <div className="mt-5">
              <LinkButton href="/rights" variant="secondary">
                See everything you can decline →
              </LinkButton>
            </div>
          </Card>

          {/* Tools */}
          <Card tone="soft">
            <CardEyebrow>Check your own numbers</CardEyebrow>
            <ul className="space-y-2 list-disc pl-5 text-ink-soft mt-3">
              <li>
                <Link
                  href="/funeral-costs"
                  className="text-primary-deep underline"
                >
                  Funeral costs by city
                </Link>{" "}
                — fair ranges adjusted for your metro.
              </li>
              <li>
                <Link href="/analyzer" className="text-primary-deep underline">
                  Price-list analyzer
                </Link>{" "}
                — photograph a funeral home&rsquo;s quote and we flag the
                overcharges and FTC violations.
              </li>
              <li>
                <Link href="/decide" className="text-primary-deep underline">
                  What service type fits us?
                </Link>{" "}
                — five short questions, no account.
              </li>
            </ul>
          </Card>

          {/* Advocate CTA */}
          <Card tone="primary">
            <CardTitle>Or have us contact funeral homes for you.</CardTitle>
            <p className="text-ink-soft mt-3 mb-5">
              We contact funeral homes in your area as your authorized
              advocate, pull written itemized quotes, and put the options side
              by side. Free to families &mdash; we contact homes on your behalf
              at no charge. No commissions, no kickbacks.
            </p>
            <LinkButton href="/where" size="lg">
              Start here →
            </LinkButton>
          </Card>

          <p className="text-xs text-ink-muted">
            Figures are 2026 national fair-price benchmarks. Actual prices vary
            by funeral home, service type, date, and what&rsquo;s included.
            Confirm specific prices directly with the funeral home before
            relying on anything here for a financial decision.
          </p>

          <ShareThisPage surface="guide" />

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
