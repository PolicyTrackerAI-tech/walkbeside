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
    "Consumer advocacy for families navigating funeral arrangements. Compare prices, avoid common upsells, decide with confidence. Paid only by families, never by funeral homes. Free fair-price lookup and prep kit; full toolkit for one $49 charge.",
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
  title: "Honest Funeral — quiet help after a loss",
  description:
    "Compare funeral home prices, avoid common upsells, and decide with confidence. Consumer advocacy for families — paid only by you, never by funeral homes.",
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
            Get started — it&rsquo;s free to start
          </LinkButton>

          <p className="mt-6 text-sm text-ink-soft max-w-md mx-auto">
            Families routinely overpay by{" "}
            <span className="font-medium text-ink">$2,000 to $5,000</span> on
            the funeral arrangement alone. Knowing the fair range is usually
            the whole difference.
          </p>

          <p className="mt-10 text-sm text-ink-muted">
            Consumer advocacy for families. We take no money from funeral homes.
          </p>
          <p className="mt-3 text-sm text-ink-soft max-w-md mx-auto">
            <strong className="text-ink">No commissions. No kickbacks. No referral fees.</strong>{" "}
            We take no money from any funeral home, cemetery, or vendor on
            this site. The flat $49 from the family is our only revenue.
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
            Free price lookup and prep kit. The full toolkit unlocks for
            one $49 charge — money-back in 14 days if we don&rsquo;t save
            you anything.
          </p>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="max-w-3xl mx-auto px-5 py-14">
          <h2 className="font-serif text-2xl sm:text-3xl text-ink text-center mb-2">
            How we help
          </h2>
          <p className="text-center text-ink-soft mb-10 max-w-xl mx-auto">
            Two things stay free forever: the price lookup and the prep
            kit. The full toolkit (advocacy, comparison, 30-day checklist,
            obituary helper, more) unlocks for one $49 charge.
          </p>
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
                $49 once · full toolkit
              </div>
              <h3 className="font-serif text-xl text-ink mb-2">
                Unlock the full toolkit
              </h3>
              <p className="text-sm text-ink-soft mb-5 flex-1">
                We contact funeral homes for you, compare quotes, walk
                you through the 30-day checklist, draft the obituary,
                and more. One $49 charge, money-back in 14 days if we
                don&rsquo;t save you anything documentable.
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
