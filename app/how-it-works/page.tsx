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
    "A consumer advocate, not a funeral home. Every tool is free. The one thing we charge for is the funeral-home outreach — a flat $49, paid upfront before we contact any home. Refundable in 14 days.",
  alternates: { canonical: "/how-it-works" },
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
    title: "We find the funeral homes near you, and you approve the list.",
    body:
      "We line up to nine homes in your area. You approve the list before anything goes out — we only contact homes once you're in.",
  },
  {
    n: 2,
    title: "Flat $49, paid upfront — before we contact any home, via Stripe.",
    body:
      "You pay the flat $49 before we send a single email. No commissions, no kickbacks, no referral fees from funeral homes. Refundable in full within 14 days.",
  },
  {
    n: 3,
    title: "Every email identifies us as your advocate — by name.",
    body:
      "Sent from advocate@honestfuneral.co. We don't pretend to be you. The family's surname is mentioned; no other identifying details unless you tell us to.",
  },
  {
    n: 4,
    title: "We invoke your FTC Funeral Rule right to a General Price List.",
    body:
      "Homes that respond send their prices. Homes that refuse self-select out.",
  },
  {
    n: 5,
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
    n: 6,
    title: "You pick a home at no extra charge, or you pick none.",
    body:
      "Choosing a home costs nothing more. If you pick one, we help schedule the in-person arrangement meeting and stay on email for any pre-meeting questions or post-meeting disputes. You attend the meeting in person and sign all paperwork directly with the home — we never sign for you, and we don't take a cent from any funeral home.",
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
              How it works
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink mb-4">
              What the $49 actually pays for.
            </h1>
            <p className="text-lg text-ink-soft">
              Every tool on this site is free &mdash; the price lookup, the
              prep kit, the obituary helper, the 30-day checklist, all of it.
              The one thing we charge for is contacting funeral homes for you
              and comparing their quotes side by side. A flat $49, paid upfront
              before we contact any home. Here&rsquo;s every step.
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
            <CardTitle>Flat $49 once. Refundable in 14 days.</CardTitle>
            <p className="text-ink-soft mb-4">
              One flat $49, paid upfront before we contact any home. Every tool
              on the site is free. No subscriptions. No commissions from any
              funeral home. No referral fees. Email us within 14 days and we
              refund you in full &mdash; no questions, no form.
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
