import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About Funerose — built by a licensed funeral director",
  description:
    "Funerose was built by a licensed funeral director and her brother. A consumer advocate, not a funeral home. We take no money from the industry.",
};

/*
 * TODO: Sarah / Ryan — replace placeholder lines marked below with:
 *   - Sarah's full name and state of licensure
 *   - Years in practice, firms worked at (or the level she's comfortable with)
 *   - Press / advisory board mentions once they land
 *   - Ryan's founder bio if desired
 */

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
              A funeral director and her brother built this.
            </h1>
            <p className="text-lg text-ink-soft">
              Every feature on Funerose comes from one specific observation: the
              average family walks into the worst day of their life with no
              information, and the industry is built around that. This is the
              tool she wishes every family walked in with.
            </p>
          </div>

          <Card>
            <div className="text-xs uppercase tracking-wider text-primary-deep font-medium mb-2">
              The funeral director
            </div>
            <CardTitle>Sarah &mdash; licensed funeral director</CardTitle>
            <p className="text-ink-soft mb-3">
              {/* TODO: replace with Sarah's short bio */}
              Licensed funeral director with years of hands-on experience in
              arrangement meetings. Sarah writes every piece of content on this
              site, validates every price in the database against what she
              actually sees on General Price Lists, and tests every feature
              against the question she asks before anything ships:{" "}
              <em>
                would this have helped the last family I sat across from?
              </em>
            </p>
            <p className="text-sm text-ink-muted">
              Sarah&rsquo;s full bio, state of licensure, and firm history will
              appear here as the business grows.
            </p>
          </Card>

          <Card>
            <div className="text-xs uppercase tracking-wider text-primary-deep font-medium mb-2">
              The builder
            </div>
            <CardTitle>Ryan &mdash; founder, product, engineering</CardTitle>
            <p className="text-ink-soft">
              {/* TODO: replace with Ryan's short bio */}
              Ryan builds the product and handles everything on the technical
              side. Funerose is the project of his sister&rsquo;s decade of
              domain knowledge and his job is to make sure that knowledge ends
              up in front of families at the exact moment they need it.
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
              own family. Our only revenue is the flat $249 advocate fee, paid
              by the family, only when we bring them a home they choose.
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
