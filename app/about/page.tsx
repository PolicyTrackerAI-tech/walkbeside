import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About Honest Funeral",
  description:
    "Honest Funeral is a consumer advocate built by two siblings. Not a funeral home. We take no money from the industry — only a flat fee from the family.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader backLabel="Home" />

      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-10 space-y-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              About
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              Two siblings built this.
            </h1>
            <p className="text-lg text-ink-soft">
              Every feature on Honest Funeral comes from one specific
              observation: the average family walks into the worst day of
              their life with no information, and the industry is built
              around that. This is the tool we wish every family walked
              in with.
            </p>
          </div>

          <Card>
            <div className="text-xs uppercase tracking-wider text-primary-deep font-medium mb-2">
              The builder
            </div>
            <CardTitle>Ryan &mdash; founder, product, engineering</CardTitle>
            <p className="text-ink-soft">
              Ryan builds the product and handles everything on the
              technical side. His job is to make sure good information
              ends up in front of families at the exact moment they
              need it.
            </p>
          </Card>

          <Card tone="primary">
            <CardTitle>The founding promise</CardTitle>
            <p className="text-ink font-serif text-lg italic mb-3">
              &ldquo;When someone important dies, you should not have to figure
              this out alone. We walk beside you from the first phone call to
              the last account closed.&rdquo;
            </p>
            <p className="text-sm text-ink-soft">
              <strong className="text-ink">
                We take no commissions, no kickbacks, no referral fees, and
                no lead-sale revenue from funeral homes, cemeteries, monument
                companies, or any vendor mentioned anywhere on this site.
              </strong>{" "}
              The funeral industry runs on those kickbacks &mdash; which is
              why almost every &ldquo;free&rdquo; service quietly steers
              families to the home that paid for the placement. We won&rsquo;t
              do that. Our only revenue is the flat $199 paid by the family up
              front to unlock the full toolkit &mdash; refundable in 14 days
              if we didn&rsquo;t save you anything.
            </p>
          </Card>

          <Card tone="soft">
            <CardTitle>What this product is not</CardTitle>
            <ul className="text-ink-soft space-y-2 list-disc list-inside text-sm">
              <li>Not a law firm, not a funeral home, not a financial advisor.</li>
              <li>
                Not a marketplace funded by the funeral homes it lists. (Ours
                isn&rsquo;t.)
              </li>
              <li>
                Not a subscription. Two tools stay free forever (price
                lookup and prep kit); the rest unlock for one $199
                charge.
              </li>
              <li>
                Not a substitute for a conversation with your own attorney or
                financial professional for complex estate decisions.
              </li>
            </ul>
          </Card>

          <div className="pt-4 flex flex-wrap gap-3">
            <LinkButton href="/where">Start here</LinkButton>
            <Link
              href="/rights"
              className="inline-flex items-center text-sm text-ink-soft hover:text-ink underline-offset-2 hover:underline self-center"
            >
              What you can decline →
            </Link>
          </div>

          <p className="text-sm text-ink-soft pt-2">
            Want to say hi, ask a question, or tell us what we missed?
            Email{" "}
            <a
              href="mailto:hello@honestfuneral.co"
              className="text-primary-deep underline-offset-2 hover:underline"
            >
              hello@honestfuneral.co
            </a>
            . We read every one.
          </p>

          <p className="text-sm text-ink-soft">
            <strong className="text-ink">Press inquiries:</strong>{" "}
            <a
              href="mailto:press@honestfuneral.co"
              className="text-primary-deep underline-offset-2 hover:underline"
            >
              press@honestfuneral.co
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
