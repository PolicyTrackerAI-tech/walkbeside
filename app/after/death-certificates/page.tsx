import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Death certificates — how many to order and what they cost",
  description:
    "Most families need eight to twelve certified copies. Order through the funeral home in the first week — ordering later is slower and costs more per copy. Here's the full breakdown.",
};

export default function DeathCertificatesPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader backHref="/after" backLabel="← After the funeral" />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              Week 1
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              Death certificates &mdash; how many, where from, what they cost.
            </h1>
            <p className="text-lg text-ink-soft">
              Certified death certificates are the single most-requested
              document in the weeks after a death. Most families need more
              than they expect. Order them through the funeral home in the
              first week &mdash; it&rsquo;s cheaper and faster than going
              back later.
            </p>
          </div>

          <Card tone="primary">
            <CardEyebrow>The short answer</CardEyebrow>
            <CardTitle>Order eight to twelve certified copies.</CardTitle>
            <p className="text-ink-soft">
              If the deceased owned a home, had retirement accounts, or
              held multiple insurance policies, aim for twelve. For a
              simpler estate, eight is usually enough. Extras are
              inexpensive when ordered with the funeral home; painful to
              order one at a time later.
            </p>
          </Card>

          <Card>
            <CardTitle>Who asks for a certified copy.</CardTitle>
            <p className="text-ink-soft mb-4 text-sm">
              Each of these typically wants an original certified copy,
              not a photocopy. Some will accept a scan; most won&rsquo;t.
            </p>
            <ul className="space-y-2 text-[15px] text-ink-soft list-disc pl-5">
              <li>Social Security Administration (to stop benefits and file survivor claims)</li>
              <li>Each life insurance policy (one per policy)</li>
              <li>Employer (for final paycheck, retirement, life insurance)</li>
              <li>Pension administrator (one per pension)</li>
              <li>IRS and your state tax authority (for the final return)</li>
              <li>Each bank and brokerage account (one per institution, not per account)</li>
              <li>Real estate title transfer (county recorder)</li>
              <li>DMV (to transfer or cancel vehicle titles)</li>
              <li>Veterans Affairs, if applicable</li>
              <li>Major credit cards (some accept scans; AmEx and issuers with balances owed usually want originals)</li>
            </ul>
          </Card>

          <Card>
            <CardTitle>What it costs.</CardTitle>
            <p className="text-ink-soft mb-3">
              Certified death certificate prices vary by state, but in
              most of the US the range is:
            </p>
            <ul className="space-y-1 text-[15px] text-ink-soft list-disc pl-5 mb-4">
              <li>
                <strong className="text-ink">$10&ndash;$30 per copy</strong>{" "}
                when ordered through the funeral home along with the
                initial order.
              </li>
              <li>
                <strong className="text-ink">$15&ndash;$50 per copy</strong>{" "}
                when ordered directly from the state vital records office
                later, plus processing delays of 2&ndash;8 weeks.
              </li>
            </ul>
            <p className="text-ink-soft text-sm">
              A few states cap the per-copy fee; a few allow same-day
              pickup at a county office. Search &ldquo;[your state] vital
              records death certificate&rdquo; for specifics.
            </p>
          </Card>

          <Card tone="soft">
            <CardTitle>How to order.</CardTitle>
            <ol className="space-y-3 list-decimal pl-6 text-[15px] text-ink-soft">
              <li>
                <strong className="text-ink">At the funeral home.</strong>{" "}
                The funeral director files the original death certificate
                with the state and orders certified copies on your behalf.
                This is the fast, cheap path. Ask for your target quantity
                during the arrangement conference.
              </li>
              <li>
                <strong className="text-ink">
                  Directly from the state later.
                </strong>{" "}
                If you run out, order more from the state vital records
                office. Requires photo ID and proof of relationship for
                most states. Processing times vary &mdash; typically two
                weeks, sometimes much longer.
              </li>
              <li>
                <strong className="text-ink">Through a third-party service.</strong>{" "}
                Sites like VitalChek charge a premium for convenience. Use
                only if the state&rsquo;s own ordering site is
                unavailable. Watch for upsells.
              </li>
            </ol>
          </Card>

          <Card tone="soft">
            <CardEyebrow>Insider note</CardEyebrow>
            <CardTitle>
              Don&rsquo;t give originals to institutions that don&rsquo;t
              need them.
            </CardTitle>
            <p className="text-ink-soft">
              Some creditors and services will ask for a certified copy
              when a plain photocopy or emailed scan is sufficient. If the
              institution is canceling an account with no payout involved,
              ask: &ldquo;Is a scan or photocopy enough?&rdquo; before you
              part with an original. Originals that aren&rsquo;t returned
              are gone &mdash; you&rsquo;ll have to reorder.
            </p>
          </Card>

          <p className="text-xs text-ink-muted">
            This is general consumer guidance, not legal advice. Fee
            amounts and procedures vary by state and change over time.
            Confirm specifics with your funeral home and your state vital
            records office.
          </p>

          <div className="flex flex-wrap gap-4 pt-4 border-t border-border text-sm">
            <Link
              href="/after/accounts-to-close"
              className="font-medium text-primary-deep hover:underline"
            >
              Next: Accounts to close &rarr;
            </Link>
            <Link
              href="/after"
              className="text-ink-muted hover:text-ink-soft"
            >
              Back to After the funeral
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
