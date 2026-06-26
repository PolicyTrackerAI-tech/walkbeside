import type { Metadata } from "next";
import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import { SiteHeader } from "@/components/SiteHeader";
import { JsonLd } from "@/components/seo/JsonLd";

const ORG_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Honest Funeral",
  url: "https://honestfuneral.co",
  description:
    "The neutral price truth for the American funeral. Snap a photo of any funeral price list and see the overcharges, the FTC-rule violations, and exactly how much you're above fair. Free to families — we take no money from funeral homes or insurers, ever.",
  foundingLocation: "United States",
  knowsAbout: [
    "funeral pricing",
    "FTC Funeral Rule",
    "General Price List",
    "cremation",
    "burial",
    "obituary writing",
    "death certificates",
  ],
};

export const metadata: Metadata = {
  title: "Honest Funeral — is this funeral price fair?",
  description:
    "Snap a photo of any funeral price list and see the overcharges and FTC-rule violations in seconds. Free, neutral funeral-price help — we're paid by no one with a stake in your bill: no funeral home, no insurer, ever.",
  alternates: { canonical: "/" },
};

/**
 * Screen 1 — Crisis entry.
 * One message. One button. Nothing else.
 */
const STEPS: { n: string; title: string; body: string }[] = [
  {
    n: "1",
    title: "Tell us where you are",
    body: "Hospital, home, hospice, somewhere else — the right next steps are different for each.",
  },
  {
    n: "2",
    title: "See fair prices for your zip code",
    body: "What a funeral should cost in your area, by line item. No account, no email.",
  },
  {
    n: "3",
    title: "Get a checklist for the next 30 days",
    body: "Death certificates, Social Security, accounts to close — in the right order, with scripts.",
  },
];

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col">
      <JsonLd data={ORG_SCHEMA} />
      <SiteHeader showBack={false} />

      <section className="flex-1 flex items-center">
        <div className="max-w-2xl mx-auto px-5 py-16 text-center">
          <h1 className="font-serif text-3xl sm:text-5xl leading-tight text-ink mb-6">
            <span className="block">Someone important just died.</span>{" "}
            <span className="block text-primary-deep">
              You&rsquo;re not alone.
            </span>
          </h1>
          <p className="text-lg text-ink-soft max-w-md mx-auto mb-10">
            Take a breath. We&rsquo;ll walk through this with you, one step at a
            time. The first one matters more than you think.
          </p>

          <LinkButton href="/where" size="lg" className="w-full sm:w-auto">
            Get started — it&rsquo;s free
          </LinkButton>

          <p className="mt-4 text-sm text-ink-soft">
            Already holding a price list?{" "}
            <Link
              href="/analyzer"
              className="font-medium text-primary-deep underline-offset-2 hover:underline"
            >
              Check if your quote is fair &rarr;
            </Link>
          </p>

          <p className="mt-6 text-sm text-ink-soft max-w-md mx-auto">
            Families often overpay by{" "}
            <span className="font-medium text-ink">$2,000 to $5,000</span> on
            the funeral arrangement alone. Knowing the fair range is usually
            the whole difference.
          </p>

          <p className="mt-10 text-sm text-ink-muted">
            The one guide paid by no one with a stake in your funeral bill.
          </p>
          <p className="mt-3 text-sm text-ink-soft max-w-md mx-auto">
            <strong className="text-ink">No commissions. No kickbacks. No referral fees.</strong>{" "}
            We take no money from any funeral home, cemetery, or vendor on
            this site. We keep families free and are funded by the
            institutions we partner with.
          </p>

          <p className="mt-2 text-xs text-ink-muted">
            <Link href="/login?next=/dashboard" className="underline-offset-2 hover:underline">
              Already have an account? Sign in
            </Link>
          </p>
        </div>
      </section>

      <section className="border-t border-border bg-surface-soft">
        <div className="max-w-3xl mx-auto px-5 py-12">
          <h2 className="font-serif text-xl text-ink text-center mb-8">
            Here&rsquo;s what happens when you click the button.
          </h2>
          <ol className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((s) => (
              <li
                key={s.n}
                className="bg-surface border border-border rounded-2xl p-5"
              >
                <div className="font-serif text-primary-deep text-lg mb-1">
                  Step {s.n}
                </div>
                <div className="font-medium text-ink mb-1">{s.title}</div>
                <div className="text-sm text-ink-soft">{s.body}</div>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-center text-sm text-ink-soft">
            Everything is free to families — the tools and the funeral-home
            outreach. We contact homes on your behalf at no charge.
          </p>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="max-w-3xl mx-auto px-5 py-14">
          <h2 className="font-serif text-2xl sm:text-3xl text-ink text-center mb-2">
            How we help
          </h2>
          <p className="text-center text-ink-soft mb-8 max-w-xl mx-auto">
            Everything here is free to families. Start with the fair-price
            check, or let us gather quotes for you &mdash; at no charge, ever.
          </p>

          {/* The tip of the spear — the "is this quote fair?" checker. */}
          <Link
            href="/analyzer"
            className="block group bg-primary-soft border-2 border-primary rounded-2xl p-6 sm:p-8 mb-6 no-underline hover:no-underline"
          >
            <div className="text-xs uppercase tracking-wider text-primary-deep font-semibold mb-2">
              Is this quote fair? &middot; free, no account
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl text-ink mb-2">
              Snap a photo of any funeral price list.
            </h3>
            <p className="text-ink-soft mb-4 max-w-xl">
              In seconds, see the overcharges line by line, the FTC-rule
              violations, and exactly how much you&rsquo;re paying{" "}
              <strong className="text-ink">above fair</strong>{" "}for your
              region.
              No one else can tell you that &mdash; every comparison site is
              paid by the funeral homes.
            </p>
            <span className="text-sm font-medium text-primary-deep group-hover:underline underline-offset-2">
              Check your quote now &rarr;
            </span>
          </Link>

          <div className="grid gap-5 sm:grid-cols-3">
            <article className="bg-surface border border-border rounded-2xl p-6 flex flex-col">
              <div className="text-xs uppercase tracking-wider text-primary-deep font-semibold mb-2">
                Free
              </div>
              <h3 className="font-serif text-xl text-ink mb-2">
                Fair price lookup
              </h3>
              <p className="text-sm text-ink-soft mb-5 flex-1">
                In three minutes, see what funeral services should cost in
                your zip code. Rate any home&rsquo;s quote against local
                data.
              </p>
              <Link
                href="/funeral-homes"
                className="text-sm font-medium text-primary-deep underline-offset-2 hover:underline"
              >
                See what funerals should cost in your zip →
              </Link>
            </article>

            <article className="bg-surface border border-border rounded-2xl p-6 flex flex-col">
              <div className="text-xs uppercase tracking-wider text-primary-deep font-semibold mb-2">
                Free
              </div>
              <h3 className="font-serif text-xl text-ink mb-2">Prep kit</h3>
              <p className="text-sm text-ink-soft mb-5 flex-1">
                The questions to ask. The upsells to decline. The rights
                families don&rsquo;t know they have. A one-page printable
                cheat sheet.
              </p>
              <Link
                href="/prep"
                className="text-sm font-medium text-primary-deep underline-offset-2 hover:underline"
              >
                See the prep kit →
              </Link>
            </article>

            <article className="bg-primary-soft border-2 border-primary rounded-2xl p-6 flex flex-col">
              <div className="text-xs uppercase tracking-wider text-primary-deep font-semibold mb-2">
                Free · funded by our partners
              </div>
              <h3 className="font-serif text-xl text-ink mb-2">
                Have us get you quotes
              </h3>
              <p className="text-sm text-ink-soft mb-5 flex-1">
                We contact funeral homes on your behalf, collect itemized
                quotes, and put them side by side so you can choose. Free to
                families &mdash; we contact homes for you at no charge, and
                choosing a home costs nothing. We&rsquo;re funded by the
                institutions we partner with, never by funeral homes.
              </p>
              <Link
                href="/how-it-works"
                className="text-sm font-medium text-primary-deep underline-offset-2 hover:underline"
              >
                How we work for you →
              </Link>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
