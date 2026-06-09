import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About Honest Funeral",
  description:
    "Why Honest Funeral exists: to put a grieving family on equal footing with the funeral industry. Independent and founder-built — we take no money from funeral homes, only a flat fee from the family.",
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
              The family is the only one in the room without help.
            </h1>
            <p className="text-lg text-ink-soft">
              When someone dies, everyone else in the arrangement has done this
              hundreds of times &mdash; the funeral home, the cemetery, the
              vendors. The family has done it once, in shock, at the worst
              moment of their life, with a $10,000 decision in front of them and
              no reference for what anything should cost. That asymmetry is why
              families overpay by thousands. Honest Funeral exists to close it
              &mdash; to put the same information a professional has into the
              family&rsquo;s hands, at the moment they need it.
            </p>
          </div>

          <Card>
            <CardTitle>Why we take no money from the industry</CardTitle>
            <p className="text-ink-soft mt-3 mb-3">
              Most &ldquo;free&rdquo; funeral services are paid by the funeral
              homes they list &mdash; so their recommendations follow the money,
              not your interest. We refuse all of it.
            </p>
            <p className="text-sm text-ink-soft">
              <strong className="text-ink">
                No commissions, no kickbacks, no referral or lead-sale revenue
                from any funeral home, cemetery, monument company, or vendor.
              </strong>{" "}
              Our only revenue is a flat $49 from the family, paid upfront and
              refundable in 14 days if we don&rsquo;t save you anything. Charging
              the family &mdash; and no one else &mdash; is the only way to stay
              accountable to the family.
            </p>
          </Card>

          <Card tone="primary">
            <CardTitle>The promise</CardTitle>
            <p className="text-ink font-serif text-lg italic">
              &ldquo;When someone important dies, you should not have to figure
              this out alone. We walk beside you from the first phone call to
              the last account closed.&rdquo;
            </p>
          </Card>

          <Card tone="soft">
            <CardTitle>Who&rsquo;s behind it</CardTitle>
            <p className="text-ink-soft">
              Honest Funeral is built and run by one person &mdash; me. Not a
              funeral director, not an investor-backed startup: a builder who
              kept watching families get taken advantage of at the worst
              possible time and decided to make the tool I&rsquo;d want my own
              family to have. Keeping it small and independent is the point
              &mdash; no board, no funeral home to answer to. Just the family.
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
                Not a subscription. Every tool is free; the only charge is a
                flat $49, paid upfront before we contact any home, refundable
                in 14 days.
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
