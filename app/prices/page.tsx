import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { PriceCalculator } from "./PriceCalculator";

/**
 * /prices — server-rendered shell around the client-side calculator.
 *
 * The hero, breadcrumb, and trust/how-pricing-works blocks all render
 * server-side so Google and curl see substantive crawlable content on
 * the initial request, not an empty form waiting on client hydration.
 * Interactive form + results live in <PriceCalculator /> (client island).
 */
export default function PricesPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader rightSlot={<BackLink defaultHref="/where" />} />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-10 space-y-8">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink mb-3">
              See what you should expect to pay.
            </h1>
            <p className="text-lg text-ink-soft">
              Most families who do this save more than a year of groceries. No account, no email.
            </p>
          </div>

          <PriceCalculator />

          <Card tone="primary">
            <CardEyebrow>When you&rsquo;re ready</CardEyebrow>
            <CardTitle>Want us to call homes for you?</CardTitle>
            <p className="text-ink-soft mb-4">
              A flat $49, paid upfront before we contact any home. Refundable
              in 14 days. Every other tool
              is free.
            </p>
            <LinkButton href="/negotiate/start">
              Have us call funeral homes for you
            </LinkButton>
          </Card>

          <HowFairRangesWork />
        </div>
      </section>
    </main>
  );
}

/**
 * Server-rendered SEO content below the calculator. Unambiguously in the
 * initial HTML for crawlers regardless of whether the calculator has
 * hydrated. Mirrors the trust claims on /faq and /how-it-works so the
 * page ranks independently for "funeral prices fair range" queries.
 */
function HowFairRangesWork() {
  return (
    <div className="rounded-2xl border border-border bg-surface-soft p-6 space-y-4">
      <h2 className="font-serif text-xl text-ink">
        How Honest Funeral fair-price ranges work.
      </h2>
      <ul className="space-y-3 text-[15px] text-ink-soft">
        <li>
          <strong className="text-ink">Adjusted for your area.</strong>{" "}
          We start from national pricing benchmarks and adjust for your
          region&rsquo;s cost of living, because funeral prices vary more
          than 3&times; between zips. As we collect real local price lists,
          the range for that metro gets sharper.
        </li>
        <li>
          <strong className="text-ink">
            Grounded in the FTC Funeral Rule.
          </strong>{" "}
          Every funeral home must provide an itemized General Price List on
          request. Today our ranges are built from national benchmarks and
          public pricing reports; as advocate outreach collects real local
          GPLs, those numbers tighten the ranges for your area over time.
        </li>
        <li>
          <strong className="text-ink">A range, not a single number.</strong>{" "}
          The range tells you whether a quote is reasonable for your area,
          not whether it&rsquo;s the lowest possible price. Inside the
          range is fair. Above it is a negotiation signal.
        </li>
        <li>
          <strong className="text-ink">Nothing is saved.</strong> Your zip,
          your quote, the home&rsquo;s name — none of it leaves your
          browser unless you choose to save it. No account, no email, no
          tracking the results page.
        </li>
      </ul>
      <p className="text-xs text-ink-muted pt-2">
        If you see a price estimate here that you think is wrong for your
        area, email us. We update the data as families and funeral homes
        share better information.
      </p>
    </div>
  );
}
