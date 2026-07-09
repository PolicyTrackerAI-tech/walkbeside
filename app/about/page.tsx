import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: { absolute: "About Honest Funeral" },
  description:
    "Why Honest Funeral exists: to put a grieving family on equal footing with the funeral industry. Independent and founder-built — free to families, funded by the institutions we partner with, and we take no money from funeral homes.",
  alternates: { canonical: "/about" },
};

const PRINCIPLES: { label: string; title: string; body: string }[] = [
  {
    label: "Whose side we're on",
    title: "Beholden to no one",
    body: "No commissions, kickbacks, or referral fees from any funeral home, cemetery, insurer, or vendor. Ever. That's the only way to stay on your side.",
  },
  {
    label: "What it costs",
    title: "Free to families",
    body: "There's nothing to pay. We keep families free and are funded by the institutions we partner with — never by funeral homes or insurers.",
  },
  {
    label: "What's free",
    title: "Everything",
    body: "Price lookup, prep kit, checklists, the obituary helper, and the funeral-home outreach — all free to families.",
  },
];

const NOT: string[] = [
  "Not a funeral home, law firm, or financial advisor.",
  "Not a marketplace paid by the homes it lists.",
  "Not a subscription — free to families, funded by our partners.",
  "Not a replacement for your own attorney on complex estates.",
];

export default function AboutPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader backLabel="Home" />

      {/* Hero — the asymmetry, in one breath */}
      <section className="flex-1 flex items-center">
        <div className="max-w-2xl mx-auto px-5 py-16 text-center">
          <p className="text-xs uppercase tracking-wider text-ink-muted font-medium mb-4">
            About
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl leading-tight text-ink mb-6">
            <span className="block">The industry has done this</span>
            <span className="block">a thousand times.</span>
            <span className="block text-primary-deep">You&rsquo;re doing it once.</span>
          </h1>
          <p className="text-lg text-ink-soft max-w-md mx-auto">
            That gap &mdash; between people who do this every day and a family in
            shock doing it for the first time &mdash; is why families overpay by
            thousands. Honest Funeral exists to close it.
          </p>
        </div>
      </section>

      {/* Why we can stay on your side — three scannable principles */}
      <section className="border-t border-border bg-surface-soft">
        <div className="max-w-4xl mx-auto px-5 py-14">
          <h2 className="font-serif text-2xl sm:text-3xl text-ink text-center mb-10">
            Why we can stay on your side
          </h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {PRINCIPLES.map((p) => (
              <div
                key={p.title}
                className="bg-surface border border-border rounded-2xl p-6"
              >
                <div className="text-xs uppercase tracking-wider text-primary-deep font-semibold mb-2">
                  {p.label}
                </div>
                <h3 className="font-serif text-xl text-ink mb-2">{p.title}</h3>
                <p className="text-sm text-ink-soft">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The promise */}
      <section className="border-t border-border">
        <div className="max-w-2xl mx-auto px-5 py-16 text-center">
          <p className="text-xs uppercase tracking-wider text-ink-muted font-medium mb-4">
            The promise
          </p>
          <p className="font-serif text-2xl sm:text-3xl text-ink leading-snug italic">
            &ldquo;When someone important dies, you shouldn&rsquo;t have to
            figure this out alone. We walk beside you &mdash; from the first
            phone call to the last account closed.&rdquo;
          </p>
        </div>
      </section>

      {/* Who's behind it + what we're not, side by side */}
      <section className="border-t border-border bg-surface-soft">
        <div className="max-w-4xl mx-auto px-5 py-14">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="bg-surface border border-border rounded-2xl p-6">
              <div className="text-xs uppercase tracking-wider text-ink-muted font-medium mb-3">
                Who&rsquo;s behind it
              </div>
              <p className="text-ink-soft">
                Built and run by one person &mdash; me. Not a funeral director,
                not a venture-backed startup. Just a builder who got tired of
                watching families get taken advantage of at the worst possible
                moment, and made the tool I&rsquo;d want for my own family.
              </p>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-6">
              <div className="text-xs uppercase tracking-wider text-ink-muted font-medium mb-3">
                What we&rsquo;re not
              </div>
              <ul className="space-y-2">
                {NOT.map((n) => (
                  <li key={n} className="flex gap-2 text-sm text-ink-soft">
                    <span className="text-ink-muted shrink-0">&mdash;</span>
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA + contact */}
      <section className="border-t border-border">
        <div className="max-w-2xl mx-auto px-5 py-14 text-center">
          <LinkButton href="/where" size="lg">
            Start here
          </LinkButton>
          <p className="mt-6 text-sm text-ink-soft">
            Questions, or something we missed? Email{" "}
            <a
              href="mailto:hello@honestfuneral.co"
              className="text-primary-deep underline-offset-2 hover:underline"
            >
              hello@honestfuneral.co
            </a>{" "}
            &middot; press:{" "}
            <a
              href="mailto:press@honestfuneral.co"
              className="text-primary-deep underline-offset-2 hover:underline"
            >
              press@honestfuneral.co
            </a>
          </p>
          <p className="mt-3 text-xs text-ink-muted">
            <Link
              href="/rights"
              className="underline-offset-2 hover:underline"
            >
              What you can decline →
            </Link>
          </p>
          <p className="mt-3 text-xs text-ink-muted">
            Hospice, employer, or benefits team?{" "}
            <Link
              href="/partners"
              className="underline-offset-2 hover:underline"
            >
              Partner with us →
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
