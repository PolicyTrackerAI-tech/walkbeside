import type { Metadata } from "next";
import * as React from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How Honest Funeral helps families",
  description:
    "A consumer advocate, not a funeral home. Here's what we do at every step — fair-price lookup, prep kit, and advocate outreach. Flat $249 only if you choose a home we present to you.",
};

const STEPS: { n: number; title: string; body: React.ReactNode }[] = [
  {
    n: 1,
    title: "You authorize us to contact funeral homes on your behalf.",
    body:
      "We'll email up to five homes in your zip. You approve the list before anything goes out.",
  },
  {
    n: 2,
    title: "Every email identifies us as your advocate — by name.",
    body:
      "We don't pretend to be you. The family's surname is mentioned; no other identifying details unless you tell us to.",
  },
  {
    n: 3,
    title: "We invoke your FTC Funeral Rule right to a General Price List.",
    body:
      "Homes that respond send their prices. Homes that refuse self-select out.",
  },
  {
    n: 4,
    title: "We summarize the responses for you — real prices, line by line.",
    body: (
      <>
        In your{" "}
        <Link
          href="/login?next=/dashboard"
          className="text-primary-deep underline-offset-2 hover:underline"
        >
          account dashboard
        </Link>{" "}
        (free to create &mdash; no credit card). Side-by-side comparison, with
        the outliers flagged. You read it when you have a quiet minute.
      </>
    ),
  },
  {
    n: 5,
    title: "You pick a home, or you pick none.",
    body:
      "Either way, you contact the chosen home directly. We step aside. No hand-off calls, no sales pressure.",
  },
  {
    n: 6,
    title: "Flat $249, via Stripe — only if you pick a home we presented.",
    body:
      "If the home won't honor its quote within 14 days, we refund you. If you don't pick any of them, you owe us nothing.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader rightSlot={<BackLink defaultHref="/" />} />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              Advocate outreach
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink mb-4">
              What advocate outreach actually does.
            </h1>
            <p className="text-lg text-ink-soft">
              If a home&rsquo;s quote is above the regional range &mdash; or you
              just want more options without making the calls yourself &mdash;
              we do the outreach for you. Here&rsquo;s every step, start to
              finish.
            </p>
          </div>

          <ol className="space-y-4">
            {STEPS.map((s) => (
              <li
                key={s.n}
                className="rounded-2xl border border-border bg-surface p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-deep text-white font-serif text-sm shrink-0">
                    {s.n}
                  </div>
                  <div className="flex-1">
                    <h2 className="font-serif text-lg text-ink mb-1">
                      {s.title}
                    </h2>
                    <p className="text-ink-soft">{s.body}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <Card tone="primary">
            <CardEyebrow>The money part</CardEyebrow>
            <CardTitle>Flat $249 &mdash; only on success.</CardTitle>
            <p className="text-ink-soft mb-4">
              We charge a flat $249 when you pick a home we presented. That&rsquo;s
              it. No commissions from funeral homes. No referral fees. If you
              never use advocate outreach, or you choose a home we didn&rsquo;t
              present, you pay nothing.
            </p>
            <div className="flex flex-wrap gap-3">
              <LinkButton href="/negotiate/start">
                Start advocate outreach
              </LinkButton>
              <LinkButton href="/prices" variant="secondary">
                Or look up fair prices first
              </LinkButton>
            </div>
          </Card>

          <Card tone="soft">
            <CardTitle>Why it works</CardTitle>
            <p className="text-ink-soft">
              Funeral homes respond to Honest Funeral differently than they respond
              to a grieving family. Every email signals we know the FTC
              Funeral Rule and we&rsquo;re comparing. The prices we get back
              tend to reflect that.
            </p>
          </Card>
        </div>
      </section>
    </main>
  );
}
