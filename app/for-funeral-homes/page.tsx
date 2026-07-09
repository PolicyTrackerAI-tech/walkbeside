import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "For funeral homes — what Honest Funeral is and how we work with you",
  description:
    "If you received an outreach email from Honest Funeral on behalf of a family — here's what we are, what we don't do, and how the flow works. We're not a competitor, we don't take commissions, and the family signs with you directly.",
  alternates: { canonical: "/for-funeral-homes" },
  robots: { index: true, follow: true },
};

export default function ForFuneralHomesPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader
        rightSlot={<BackLink defaultHref="/" defaultLabel="← Home" />}
      />

      <section className="flex-1">
        <article className="max-w-2xl mx-auto px-5 py-10 space-y-8 text-ink-soft">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              For funeral homes
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              You got an email from us. Here&rsquo;s what Honest Funeral is.
            </h1>
            <p className="text-lg">
              We&rsquo;re a consumer advocacy service for families navigating
              funeral arrangements. A family asked us to help them gather
              prices from local funeral homes &mdash; including yours.
              We&rsquo;re not a competitor, not a broker, and we don&rsquo;t
              take a cent from your firm.
            </p>
          </div>

          <Card tone="primary">
            <CardEyebrow>The two things that usually matter to you</CardEyebrow>
            <ol className="space-y-3 text-ink list-decimal list-inside marker:font-serif marker:text-primary-deep">
              <li>
                <strong>We take no money from funeral homes.</strong> No
                commissions, no referral fees, no kickbacks, no
                lead-sale revenue. We’re funded by the institutions we partner
                with, never by families. Your firm&rsquo;s revenue stays your firm&rsquo;s.
              </li>
              <li>
                <strong>The family contracts with you directly.</strong> If
                they select your firm, they walk into your arrangement
                meeting, make all selections, and sign all paperwork with
                you &mdash; just like any other family. We never sign for
                them, never authorize disposition, never take possession of
                remains.
              </li>
            </ol>
          </Card>

          <div>
            <h2 className="font-serif text-2xl text-ink mb-3">
              How the flow works from your side
            </h2>
            <ol className="space-y-3 list-decimal list-outside ml-5">
              <li>
                <strong className="text-ink">You receive a price
                request.</strong> From{" "}
                <code className="bg-surface-soft px-1.5 py-0.5 rounded text-sm">
                  arrangements@honestfuneral.co
                </code>{" "}
                on behalf of a named family. Subject line includes a
                reference ID (e.g., WB-A1B2C3D4) for your filing.
              </li>
              <li>
                <strong className="text-ink">You reply with your
                General Price List</strong> and any service-specific quote.
                A PDF attachment is fine. Reply directly to the thread &mdash;
                replies route to us via{" "}
                <code className="bg-surface-soft px-1.5 py-0.5 rounded text-sm">
                  advocate+&hellip;@reply.honestfuneral.co
                </code>
                .
              </li>
              <li>
                <strong className="text-ink">We present your quote to the
                family</strong> alongside what other local homes sent.
                Side-by-side comparison, no editorial bias.
              </li>
              <li>
                <strong className="text-ink">If they pick your firm</strong>,
                you get a &ldquo;you&rsquo;ve been selected&rdquo; email
                from us with the quoted price reconfirmed and a request for
                arrangement-meeting availability.
              </li>
              <li>
                <strong className="text-ink">The family attends the
                arrangement meeting in person</strong> at your funeral home,
                signs all your paperwork directly with you, and pays you
                directly at the quoted price.
              </li>
              <li>
                <strong className="text-ink">We stay on email</strong> if
                they have follow-up questions or if the final invoice
                doesn&rsquo;t match the quote. Otherwise we&rsquo;re out
                of the way.
              </li>
            </ol>
          </div>

          <Card tone="soft">
            <CardTitle>Common questions</CardTitle>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="font-semibold text-ink">Are you a broker or
                lead-sale service?</dt>
                <dd className="mt-1">
                  No. We don&rsquo;t take money from funeral homes in any
                  form. Families are never charged either &mdash; we&rsquo;re
                  funded by the institutions we partner with.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Do I have to
                respond?</dt>
                <dd className="mt-1">
                  No. The family is requesting your General Price List
                  under the FTC Funeral Rule (16 CFR Part 453), which they
                  have the right to do. We&rsquo;re sending the request on
                  their behalf. If you don&rsquo;t respond, the family
                  moves on to other firms that did.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Can I contact the
                family directly?</dt>
                <dd className="mt-1">
                  Yes, after they attend your arrangement meeting in
                  person &mdash; that&rsquo;s when you&rsquo;ll collect
                  their contact info as you would for any client. Before
                  the meeting, please route communication through us so
                  the family&rsquo;s personal contact info stays private
                  during the comparison phase.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">What if I don&rsquo;t
                want to receive these requests?</dt>
                <dd className="mt-1">
                  Every email we send to your firm includes a one-click
                  opt-out link in the footer. Click it and you won&rsquo;t
                  receive any more requests. Or email{" "}
                  <a
                    href="mailto:arrangements@honestfuneral.co"
                    className="text-primary-deep underline-offset-2 hover:underline"
                  >
                    arrangements@honestfuneral.co
                  </a>{" "}
                  and we&rsquo;ll remove your firm within one business day.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Who&rsquo;s behind
                Honest Funeral?</dt>
                <dd className="mt-1">
                  An independent consumer advocate building the tool we
                  wish every family had. We&rsquo;re not affiliated with any
                  funeral home or chain and take no money from the industry.
                  See{" "}
                  <Link
                    href="/about"
                    className="text-primary-deep underline-offset-2 hover:underline"
                  >
                    /about
                  </Link>
                  .
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Are you licensed as
                a funeral establishment?</dt>
                <dd className="mt-1">
                  No, and we don&rsquo;t need to be &mdash; we don&rsquo;t
                  make funeral arrangements, sign authorizations, take
                  possession of remains, or do any of the things a state
                  funeral license covers. We&rsquo;re a consumer advocacy
                  service. More:{" "}
                  <Link
                    href="/our-role"
                    className="text-primary-deep underline-offset-2 hover:underline"
                  >
                    /our-role
                  </Link>
                  .
                </dd>
              </div>
            </dl>
          </Card>

          <div>
            <h2 className="font-serif text-2xl text-ink mb-3">
              Get in touch
            </h2>
            <p>
              Questions, concerns, want to talk about how we work, or just
              want to opt out:{" "}
              <a
                href="mailto:arrangements@honestfuneral.co"
                className="text-primary-deep underline-offset-2 hover:underline"
              >
                arrangements@honestfuneral.co
              </a>
              . A real human reads every message.
            </p>
            <p className="mt-3">
              For legal, regulatory, or press inquiries:{" "}
              <a
                href="mailto:legal@honestfuneral.co"
                className="text-primary-deep underline-offset-2 hover:underline"
              >
                legal@honestfuneral.co
              </a>
              .
            </p>
          </div>
        </article>
      </section>
    </main>
  );
}
