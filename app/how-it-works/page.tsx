import type { Metadata } from "next";
import * as React from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FEATURES } from "@/lib/env";

export const metadata: Metadata = {
  title: "How Honest Funeral helps families",
  description:
    "A consumer advocate, not a funeral home. Here's what we do at every step — fair-price lookup, prep kit, and the full toolkit. One flat $199 charge unlocks everything; money-back in 14 days.",
};

async function getSignedIn(): Promise<boolean> {
  if (!FEATURES.supabase()) return false;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return !!user;
}

function buildSteps(signedIn: boolean): { n: number; title: string; body: React.ReactNode }[] {
  const dashHref = signedIn ? "/dashboard" : "/login?next=/dashboard";
  const dashLabel = signedIn ? "your dashboard" : "your account dashboard";
  return [
  {
    n: 1,
    title: "You authorize us to contact funeral homes on your behalf.",
    body:
      "We'll email up to nine homes near you. You approve the list before anything goes out.",
  },
  {
    n: 2,
    title: "Every email identifies us as your advocate — by name.",
    body:
      "Sent from advocate@honestfuneral.co. We don't pretend to be you. The family's surname is mentioned; no other identifying details unless you tell us to.",
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
        In{" "}
        <Link
          href={dashHref}
          className="text-primary-deep underline-offset-2 hover:underline"
        >
          {dashLabel}
        </Link>
        {signedIn ? "" : " (free to create — no credit card)"}.
        Side-by-side comparison, with the outliers flagged. You read it
        when you have a quiet minute.
      </>
    ),
  },
  {
    n: 5,
    title: "You pick a home, or you pick none.",
    body:
      "If you pick one, we help schedule the in-person arrangement meeting and stay on email for any pre-meeting questions or post-meeting disputes. You attend the meeting in person and sign all paperwork directly with the home — we never sign for you, and we don't take a cent from any funeral home.",
  },
  {
    n: 6,
    title: "Flat $199 upfront, via Stripe.",
    body:
      "Charged when you start the toolkit. No commissions, no kickbacks, no referral fees from funeral homes. Money-back in 14 days if we don't save you anything documentable.",
  },
  ];
}

export default async function HowItWorksPage() {
  const signedIn = await getSignedIn();
  const STEPS = buildSteps(signedIn);
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader rightSlot={<BackLink defaultHref="/" />} />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              How the toolkit works
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink mb-4">
              What the $199 toolkit actually does.
            </h1>
            <p className="text-lg text-ink-soft">
              One charge, the whole arc. We contact funeral homes for
              you, compare quotes side by side, walk you through the
              30-day post-funeral checklist, draft the obituary, file
              VA benefits — everything unlocks at once. Here&rsquo;s
              every step, start to finish.
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
            <CardTitle>Flat $199 once. Money-back in 14 days.</CardTitle>
            <p className="text-ink-soft mb-4">
              One $199 charge unlocks the full toolkit for your account.
              No subscriptions. No commissions from any funeral home.
              No referral fees. If we don&rsquo;t save you anything
              documentable in 14 days, email us and we refund you in
              full &mdash; no questions, no form.
            </p>
            <div className="flex flex-wrap gap-3">
              <LinkButton href="/decide">
                Start with the four questions
              </LinkButton>
              <LinkButton href="/prices" variant="secondary">
                Or look up fair prices first (free)
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
