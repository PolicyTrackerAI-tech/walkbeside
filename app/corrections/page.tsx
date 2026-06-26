import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { LINE_ITEMS } from "@/lib/pricing-data";
import { RULES } from "@/lib/bundling-detection/rules";

export const metadata: Metadata = {
  title: "Corrections & accuracy — how we stay honest | Honest Funeral",
  description:
    "How Honest Funeral keeps its funeral-price checker accurate: we'd rather under-claim than over-claim, we publish our corrections, and we take no money from funeral homes or insurers. Our standing accuracy commitment and correction log.",
  alternates: { canonical: "/corrections" },
};

const ITEM_COUNT = LINE_ITEMS.length;
const RULE_COUNT = RULES.length;

/**
 * Corrections written at the right altitude: honest and specific about what we
 * changed, framed as the continuous verification it is — never airing a scary
 * bug list. Each one is a real, defensible improvement to how the checker works.
 */
const CORRECTIONS: { date: string; title: string; body: string }[] = [
  {
    date: "June 2026",
    title: "Made the “above fair” total strictly conservative",
    body: "We rebuilt the headline figure so it only ever reflects line items priced above the fair range. Selection merchandise you can buy anywhere (caskets, urns, vaults), fixed government fees, and charges we don't yet benchmark never inflate it. The number on screen now always equals the sum of the per-item amounts you can see in the table.",
  },
  {
    date: "June 2026",
    title: "Tightened how we flag possible FTC issues",
    body: "We only call something a likely Funeral Rule violation when the price list itself shows it — for example, a funeral home's own text claiming an item is “required by law.” When we can't prove it from the page you shared, we say “worth confirming,” not “violation.” We would rather miss a real issue than accuse a funeral home of one we can't see.",
  },
  {
    date: "June 2026",
    title: "Documented every fair-price source",
    body: `We expanded our benchmarks to ${ITEM_COUNT} common charges using published industry survey medians and real funeral-home price lists, and we cite each source on our methodology page. Where the public data was thin, we left the item out rather than publish a number we couldn't defend.`,
  },
  {
    date: "June 2026",
    title: "Added a coverage check",
    body: "If we read a photo and couldn't make out every line, the result now tells you so — instead of presenting a total as complete when it was built from part of the bill. Anything we can't read or benchmark is left at face value and never counted against the funeral home.",
  },
];

export default function CorrectionsPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader rightSlot={<BackLink defaultHref="/analyzer" defaultLabel="← Back to the checker" />} />

      <section className="flex-1">
        <article className="max-w-2xl mx-auto px-5 py-10 space-y-8 text-ink-soft">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              Corrections &amp; accuracy
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              How we stay honest.
            </h1>
            <p className="text-lg">
              We help families at the worst moment of their lives, and the only
              thing we have is their trust. So we hold ourselves to a standard
              most price tools don&rsquo;t: we&rsquo;d rather under-claim than
              over-claim, we publish our corrections in the open, and we take no
              money from funeral homes or insurers &mdash; ever.
            </p>
          </div>

          <Card tone="soft">
            <CardEyebrow>Our standing commitment</CardEyebrow>
            <ul className="mt-3 space-y-3">
              <li>
                <strong className="text-ink">Conservative by design.</strong>{" "}
                The &ldquo;above fair&rdquo; figure only ever reflects charges
                priced above the fair range. Anything we can&rsquo;t benchmark is
                left at face value &mdash; it never inflates the number.
              </li>
              <li>
                <strong className="text-ink">We under-claim.</strong> We call
                something a likely FTC violation only when the price list itself
                proves it. Otherwise we say &ldquo;worth confirming.&rdquo; A
                false accusation is worse than a miss.
              </li>
              <li>
                <strong className="text-ink">We show our work.</strong> Every
                fair-price range and each of the {RULE_COUNT} FTC checks is
                documented, sourced, and dated on our{" "}
                <Link href="/methodology" className="text-primary-deep underline">
                  methodology page
                </Link>
                .
              </li>
              <li>
                <strong className="text-ink">We say when we&rsquo;re unsure.</strong>{" "}
                If we couldn&rsquo;t read your whole bill, or a charge isn&rsquo;t
                in our reference set, the result tells you &mdash; rather than
                presenting an estimate as the last word.
              </li>
            </ul>
          </Card>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl text-ink">What we&rsquo;ve corrected</h2>
            <p>
              We verify our own work continuously and fix it in the open. Recent
              changes:
            </p>
            <ul className="space-y-5 mt-2">
              {CORRECTIONS.map((c) => (
                <li key={c.title} className="border-l-2 border-border pl-4">
                  <div className="text-xs uppercase tracking-wider text-ink-muted">
                    {c.date}
                  </div>
                  <div className="font-medium text-ink mt-0.5">{c.title}</div>
                  <p className="text-sm mt-1 leading-relaxed">{c.body}</p>
                </li>
              ))}
            </ul>
          </div>

          <Card tone="warn">
            <CardTitle>The honest limits</CardTitle>
            <p className="mt-2">
              Our fair-price ranges are national benchmarks adjusted for your
              region &mdash; an informational estimate, not an appraisal of any
              specific funeral home, and not legal or financial advice. They
              aren&rsquo;t yet validated against local price lists in every metro,
              and where they aren&rsquo;t, the result says so. Use the checker to
              ask better questions, not as the final word. The full method and its
              limits are on the{" "}
              <Link href="/methodology" className="text-primary-deep underline">
                methodology page
              </Link>
              .
            </p>
          </Card>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl text-ink">Found something wrong?</h2>
            <p>
              If you think a fair-price range, an FTC flag, or anything else on
              the checker is off, tell us &mdash; we&rsquo;ll look into it and
              correct it here if you&rsquo;re right. Accuracy is the whole point,
              and you catching our mistakes makes the tool better for the next
              family. Email{" "}
              <a
                href="mailto:corrections@honestfuneral.co"
                className="text-primary-deep underline"
              >
                corrections@honestfuneral.co
              </a>
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
