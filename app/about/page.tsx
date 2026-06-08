import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About Honest Funeral — on the family's side",
  description:
    "Honest Funeral is a consumer advocate for families facing funeral decisions under pressure. Not a funeral home, not a broker. We take no money from the industry.",
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
              We built the tool we wish every family had.
            </h1>
            <p className="text-lg text-ink-soft">
              Every feature on Honest Funeral comes from one observation: the
              average family walks into the worst day of their life with no
              information, and the funeral industry is built around that. No one
              should have to make a $10,000 decision in shock, exhausted, and
              alone. So we built the thing that sits on the family&rsquo;s side
              of the table.
            </p>
          </div>

          <Card>
            <div className="text-xs uppercase tracking-wider text-primary-deep font-medium mb-2">
              Why we built this
            </div>
            <CardTitle>The family is the only one without a guide.</CardTitle>
            <p className="text-ink-soft mb-3">
              Every other party in a funeral transaction does this every day.
              The funeral home has run the arrangement meeting hundreds of
              times. The family has done it once, under the worst conditions a
              person can be in. That asymmetry is the entire reason families
              overpay by $2,000 to $5,000 on the arrangement alone.
            </p>
            <p className="text-ink-soft">
              Honest Funeral closes that gap: fair prices for your area, the
              questions to ask, the upsells to decline, and &mdash; if you want
              it &mdash; advocate outreach where we contact homes on your behalf
              and bring back comparison quotes. The information a professional
              has, in the hands of the family, at the moment they need it.
            </p>
          </Card>

          <Card>
            <div className="text-xs uppercase tracking-wider text-primary-deep font-medium mb-2">
              How we stay on your side
            </div>
            <CardTitle>Our incentives point at the family.</CardTitle>
            <p className="text-ink-soft">
              We make money in exactly one way: a flat $49 from the family, only
              when they choose a home we present through advocate outreach. We
              take nothing from funeral homes &mdash; no commissions, no
              kickbacks, no listing fees. We don&rsquo;t sell your data. Because
              the only party that ever pays us is the family, the only interest
              we can serve is the family&rsquo;s.
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
              We will never earn money from funeral homes, never sell lead data,
              and never recommend a provider we wouldn&rsquo;t recommend to our
              own family.
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
              <li>Not a subscription. Free tools are free forever.</li>
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
        </div>
      </section>
    </main>
  );
}
