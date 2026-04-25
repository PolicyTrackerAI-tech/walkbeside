import { SiteHeader } from "@/components/SiteHeader";
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
      <SiteHeader backHref="/where" backLabel="← Back" />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-10 space-y-8">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink mb-3">
              See what you should expect to pay.
            </h1>
            <p className="text-lg text-ink-soft">
              Three minutes here can save thousands. No account, no email.
            </p>
          </div>

          <PriceCalculator />

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
          <strong className="text-ink">Regional, not national.</strong>{" "}
          Ranges are adjusted for your zip code. Funeral prices vary more
          than 3&times; between zips in the same metro — a national average
          would hide that.
        </li>
        <li>
          <strong className="text-ink">
            Sourced from real General Price Lists.
          </strong>{" "}
          The FTC Funeral Rule requires every funeral home to publish an
          itemized price list on request. Our regional ranges aggregate
          those lists alongside public pricing reports.
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
