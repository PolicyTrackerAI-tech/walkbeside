import type { Metadata } from "next";
import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import { Brand } from "@/components/Brand";
import { JsonLd } from "@/components/seo/JsonLd";

const ORG_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Funerose",
  url: "https://funerose.com",
  description:
    "A consumer advocate for families making funeral decisions under pressure. Built by a licensed funeral director. Free fair-price lookup, $19 prep kit, and flat $249 advocate outreach — only on success.",
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
  title: "Funerose — quiet help after a loss",
  description:
    "Built by a licensed funeral director. Free help with the first 72 hours: fair prices, what to decline, and the checklist for the next 30 days.",
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
      <div className="px-5 pt-6">
        <Brand />
      </div>

      <section className="flex-1 flex items-center">
        <div className="max-w-2xl mx-auto px-5 py-16 text-center">
          <h1 className="font-serif text-3xl sm:text-5xl leading-tight text-ink mb-6">
            <span className="block whitespace-nowrap">
              Someone important just died.
            </span>
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

          <p className="mt-6 text-sm text-ink-soft max-w-md mx-auto">
            Families routinely overpay by{" "}
            <span className="font-medium text-ink">$2,000 to $5,000</span> on
            the funeral arrangement alone. Knowing the fair range is usually
            the whole difference.
          </p>

          <p className="mt-10 text-sm text-ink-muted">
            Built by a licensed funeral director to protect families like yours.
          </p>

          <p className="mt-2 text-xs text-ink-muted">
            <Link href="/dashboard" className="underline-offset-2 hover:underline">
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
            Free to look. Free to compare. Our flat $249 fee only applies if
            you choose a funeral home we bring you.
          </p>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="max-w-3xl mx-auto px-5 py-14">
          <h2 className="font-serif text-2xl sm:text-3xl text-ink text-center mb-2">
            How we help
          </h2>
          <p className="text-center text-ink-soft mb-10 max-w-xl mx-auto">
            Most of what we do is free. The flat $249 advocate fee only
            applies if you choose a home we present to you.
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
                href="/prices"
                className="text-sm font-medium text-primary-deep underline-offset-2 hover:underline"
              >
                Look up fair prices →
              </Link>
            </article>

            <article className="bg-surface border border-border rounded-2xl p-6 flex flex-col">
              <div className="text-xs uppercase tracking-wider text-ink-muted font-semibold mb-2">
                $19 &middot; one-time
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
                $249 &middot; only if you pick a home we found
              </div>
              <h3 className="font-serif text-xl text-ink mb-2">
                Advocate outreach
              </h3>
              <p className="text-sm text-ink-soft mb-5 flex-1">
                We contact funeral homes on your behalf &mdash; transparently,
                as your advocate &mdash; and collect comparison quotes. You
                make the final call. Pay only if you choose a home we
                presented.
              </p>
              <Link
                href="/how-it-works"
                className="text-sm font-medium text-primary-deep underline-offset-2 hover:underline"
              >
                How advocate outreach works →
              </Link>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
