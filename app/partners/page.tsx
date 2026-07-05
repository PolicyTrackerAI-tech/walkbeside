import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { DemoRequestForm } from "./DemoRequestForm";

export const metadata: Metadata = {
  title: "Partner with Honest Funeral — a free, neutral funeral-cost benefit for your families",
  description:
    "Honest Funeral is free to families, funded by the hospices and employers we partner with — never by funeral homes or insurers. See a live sample report, schedule a call, or apply to run a free pilot.",
  alternates: { canonical: "/partners" },
  robots: { index: true, follow: true },
};

export default function PartnersPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader rightSlot={<BackLink defaultHref="/" defaultLabel="← Home" />} />

      <section className="flex-1">
        <article className="max-w-2xl mx-auto px-5 py-10 space-y-8 text-ink-soft">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              For hospices &amp; employers
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              A funeral-cost benefit you can hand a grieving family without
              worrying what it costs them.
            </h1>
            <p className="text-lg">
              Everyone who claims to help a grieving family with the funeral is
              paid by someone with a stake in the funeral price &mdash; the
              funeral home, an insurer, or the family&rsquo;s own wallet.{" "}
              <strong className="text-ink">
                We are the only one paid by none of them.
              </strong>{" "}
              Your organization pays us to give your families a neutral guide;
              we take no money from funeral homes or insurers, and we never
              charge the family &mdash; which is the only reason you can
              ethically put us in a grieving family&rsquo;s hands.
            </p>
          </div>

          <Card tone="primary">
            <CardEyebrow>The problem this solves</CardEyebrow>
            <ul className="mt-3 space-y-3 text-ink list-disc list-inside marker:text-primary-deep">
              <li>
                Medicare requires roughly 13 months of bereavement support
                after every death (42 CFR 418.64) &mdash; unfunded, and
                survey-able.
              </li>
              <li>
                Your CAHPS &ldquo;Emotional &amp; Spiritual Support&rdquo;
                composite feeds your Care Compare star rating; missing it
                risks your Medicare Annual Payment Update.
              </li>
              <li>
                The funeral-pricing and after-death questions your counselors
                field every week were never resourced for &mdash; we absorb
                that part, and complement your grief program instead of
                replacing it.
              </li>
            </ul>
          </Card>

          <div>
            <h2 className="font-serif text-2xl text-ink mb-3">What we do</h2>
            <ul className="space-y-3 list-disc list-outside ml-5">
              <li>
                <strong className="text-ink">Fair prices for their area</strong>{" "}
                &mdash; what a funeral should cost near them, by line item, so
                a quote can&rsquo;t blindside them.
              </li>
              <li>
                <strong className="text-ink">&ldquo;Is this quote fair?&rdquo;</strong>{" "}
                &mdash; they send us a price list; we flag the overcharges and
                the items they can legally decline.
              </li>
              <li>
                <strong className="text-ink">A real advocate</strong> &mdash;
                we contact funeral homes, gather itemized quotes, and lay the
                options side by side. The family chooses, always.
              </li>
              <li>
                <strong className="text-ink">
                  An aggregate outcomes report
                </strong>{" "}
                &mdash; families served, satisfaction, savings,
                time-to-resolution, for your compliance file and referral
                conversations. Never a single family&rsquo;s details.
              </li>
            </ul>
          </div>

          <Card tone="soft">
            <p className="text-ink">
              Families often overpay by{" "}
              <strong className="text-ink">$2,000 to $5,000</strong> on the
              funeral arrangement alone. This reflects national benchmarks
              adjusted for cost of living, not a promise about any one
              family &mdash; see{" "}
              <Link href="/methodology" className="text-primary-deep underline-offset-2 hover:underline">
                our methodology
              </Link>
              .
            </p>
          </Card>

          <Card>
            <CardEyebrow>See it before you talk to us</CardEyebrow>
            <CardTitle>A live, illustrative sample report.</CardTitle>
            <p className="mt-2 mb-4">
              The same aggregate proof-sheet format your own report would use
              once families start coming through &mdash; families helped,
              overcharges caught, satisfaction, time-to-resolution.
            </p>
            <LinkButton href="/partner/sample-hospice" variant="secondary">
              See a sample report →
            </LinkButton>
          </Card>

          <div>
            <h2 className="font-serif text-2xl text-ink mb-3">
              Why you can trust this
            </h2>
            <p>
              We take no money from funeral homes, cemeteries, or insurers
              &mdash; ever &mdash; and we never recommend a specific provider.
              Read{" "}
              <Link href="/our-role" className="text-primary-deep underline-offset-2 hover:underline">
                what we are and aren&rsquo;t
              </Link>{" "}
              and{" "}
              <Link href="/methodology" className="text-primary-deep underline-offset-2 hover:underline">
                how we price things
              </Link>
              .
            </p>
          </div>

          <div id="schedule-a-call">
            <h2 className="font-serif text-2xl text-ink mb-3">
              Schedule a call
            </h2>
            <DemoRequestForm />
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink mb-3">
              Ready to move now?
            </h2>
            <p className="mb-4">
              Apply for a free pilot &mdash; no cost to your families or to
              you while we prove it out.
            </p>
            <LinkButton href="/partners/apply">Apply to partner →</LinkButton>
          </div>
        </article>
      </section>
    </main>
  );
}
