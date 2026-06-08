import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Our role — Honest Funeral is a consumer advocate, not a funeral home",
  description:
    "Honest Funeral is a consumer advocacy service that helps families gather prices, compare quotes, and prepare for the arrangement meeting. We are not a licensed funeral establishment in any state.",
  alternates: { canonical: "/our-role" },
};

export default function OurRolePage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader
        rightSlot={<BackLink defaultHref="/" defaultLabel="← Home" />}
      />

      <section className="flex-1">
        <article className="max-w-2xl mx-auto px-5 py-10 space-y-8 text-ink-soft">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              Our role
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              Honest Funeral is not a funeral home.
            </h1>
            <p className="text-lg">
              We are a consumer advocacy service. We help families gather
              prices from local funeral homes, compare quotes, and prepare
              for the arrangement meeting. The family makes all funeral
              arrangements and signs all paperwork directly with the funeral
              home they select.
            </p>
          </div>

          <Card tone="soft">
            <CardEyebrow>The short version</CardEyebrow>
            <p className="text-ink">
              We do not make funeral arrangements. We do not sign anything
              on the family&rsquo;s behalf. We do not take possession of
              remains, file death certificates, or process funeral payments.
              We are not licensed as a funeral establishment in any state,
              and we don&rsquo;t need to be, because we don&rsquo;t do the
              things that require a license.
            </p>
          </Card>

          <div>
            <h2 className="font-serif text-2xl text-ink mb-3">What we do</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>
                Gather General Price Lists from funeral homes on the
                family&rsquo;s behalf, exercising the family&rsquo;s right
                under the FTC Funeral Rule (16 CFR Part 453).
              </li>
              <li>
                Compare quotes side by side and flag line items that look
                out of line with regional benchmarks.
              </li>
              <li>
                Help schedule the in-person arrangement meeting between the
                family and the funeral home they select.
              </li>
              <li>
                Relay pre-meeting questions through an in-app messaging
                thread so the family&rsquo;s personal contact information
                stays private until they attend the meeting.
              </li>
              <li>
                Stay on email for post-meeting disputes &mdash; for example,
                when the funeral home&rsquo;s final invoice differs from
                the price they quoted.
              </li>
              <li>
                Provide information, scripts, and a prep kit the family can
                bring to the arrangement meeting.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink mb-3">
              What we do not do
            </h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>Make funeral arrangements on the family&rsquo;s behalf.</li>
              <li>
                Sign authorization forms (for disposition, cremation,
                embalming, or anything else) &mdash; only the legal next of
                kin can sign those, in writing, at the funeral home.
              </li>
              <li>
                Negotiate or sign the contract for funeral goods or services
                on the family&rsquo;s behalf.
              </li>
              <li>Take possession of remains.</li>
              <li>File death certificates or disposition permits.</li>
              <li>Take or process payments for funeral goods or services.</li>
              <li>
                Accept commissions, kickbacks, referral fees, or lead-sale
                revenue from funeral homes, cemeteries, monument companies,
                or any vendor.
              </li>
              <li>
                Act as the family&rsquo;s legal agent in any fiduciary
                sense.
              </li>
            </ul>
          </div>

          <Card>
            <CardTitle>The arrangement meeting is the family&rsquo;s</CardTitle>
            <p className="mb-3">
              When a family selects a funeral home through our service, they
              go to the funeral home in person, meet with a licensed funeral
              director, make all the selections (casket or container,
              service format, disposition, cemetery, obituary), and sign all
              paperwork directly with the funeral home. The contractual and
              service relationship for funeral goods and services is between
              the family and the funeral home they select &mdash; not us.
            </p>
            <p>
              Authorization for disposition (burial, cremation, embalming,
              body preparation) must be given by the legal next of kin in
              writing at the funeral home. We cannot provide that
              authorization, and we tell the family this clearly when they
              start using our service.
            </p>
          </Card>

          <div>
            <h2 className="font-serif text-2xl text-ink mb-3">
              For funeral homes
            </h2>
            <p className="mb-3">
              When you receive an email from us on a family&rsquo;s behalf,
              we are not a competitor and we are not a lead-sale service.
              We don&rsquo;t take money from you, ever. The family has
              authorized us to gather General Price Lists from homes in
              their area; we present what comes back and let them decide.
            </p>
            <p>
              If a family selects your firm, you will receive a
              &ldquo;selected&rdquo; email from us and we&rsquo;ll help
              schedule the arrangement meeting. The family attends in
              person and signs all paperwork directly with you. We stay on
              email for scheduling, pre-meeting questions, and any disputes
              if the final invoice differs from the quoted price.
            </p>
            <p>
              Questions, concerns, or you&rsquo;d like to talk:{" "}
              <a
                href="mailto:arrangements@honestfuneral.co"
                className="text-primary-deep underline-offset-2 hover:underline"
              >
                arrangements@honestfuneral.co
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink mb-3">
              For regulators and press
            </h2>
            <p className="mb-3">
              Honest Funeral is structured as a consumer-paid advocacy
              service. The family pays a flat $49 fee for the toolkit and
              advocacy work. No portion of any funeral home&rsquo;s revenue
              flows to us. We do not hold ourselves out as a funeral
              establishment under the laws of any state.
            </p>
            <p>
              Comparable consumer-advocacy precedents include the Funeral
              Consumers Alliance (national, non-profit), and online price
              comparison services like Parting.com and Funeralwise.
            </p>
            <p>
              Press, regulatory, or legal inquiries:{" "}
              <a
                href="mailto:legal@honestfuneral.co"
                className="text-primary-deep underline-offset-2 hover:underline"
              >
                legal@honestfuneral.co
              </a>
              .
            </p>
          </div>

          <Card tone="primary">
            <CardTitle>For families</CardTitle>
            <p className="text-ink-soft mb-4">
              You don&rsquo;t have to walk into the arrangement meeting cold.
              Look up fair prices, run a comparison, or start the toolkit.
            </p>
            <div className="flex flex-wrap gap-3">
              <LinkButton href="/decide">Start with the four questions</LinkButton>
              <LinkButton href="/prices" variant="secondary">
                Look up fair prices (free)
              </LinkButton>
            </div>
          </Card>

          <p className="text-sm pt-4">
            <Link
              href="/terms"
              className="text-primary-deep underline-offset-2 hover:underline"
            >
              Terms of Service →
            </Link>
            {" · "}
            <Link
              href="/privacy"
              className="text-primary-deep underline-offset-2 hover:underline"
            >
              Privacy Policy
            </Link>
            {" · "}
            <Link
              href="/about"
              className="text-primary-deep underline-offset-2 hover:underline"
            >
              About the team
            </Link>
          </p>
        </article>
      </section>
    </main>
  );
}
