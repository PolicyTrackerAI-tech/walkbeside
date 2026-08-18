import type { Metadata } from "next";
import * as React from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FEATURES } from "@/lib/env";
import { outreachFromAddress } from "@/lib/negotiation/email-body";
import { outreachIsLive } from "@/lib/negotiation/outreach-mode";

export const metadata: Metadata = {
  title: { absolute: "How Honest Funeral helps families" },
  description:
    "A consumer advocate, not a funeral home. Everything is free to families — the tools and the funeral-home outreach. We contact homes on your behalf at no charge. Families never pay; any revenue we earn comes from the institutions that serve families, never from funeral homes or insurers.",
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
  // Single source of truth for the sender we claim: the same function the
  // send path uses (default pinned by lib/negotiation/__tests__/email-body).
  const fromAddr =
    outreachFromAddress().match(/<([^>]+)>/)?.[1] ?? outreachFromAddress();
  return [
  {
    n: 1,
    title: "We find vetted funeral homes near you.",
    body:
      "You tell us your area and how far you'd travel; we line up the nearby homes we've personally vetted — only vetted homes are ever contacted. Nothing goes out until you've given written authorization, and you see every home on the list, by name, on your case page.",
  },
  {
    n: 2,
    title: "It's free to families — we contact homes on your behalf at no charge.",
    body:
      "There's nothing to pay. No commissions, no kickbacks, no referral fees from funeral homes. Families never pay either — any revenue we earn comes from the institutions that serve families, like hospices and employers.",
  },
  {
    n: 3,
    title: "Every email identifies us as your advocate — by name.",
    body: `Sent from ${fromAddr}. We don't pretend to be you. The family's surname is mentioned; no other identifying details unless you tell us to.`,
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
  const live = outreachIsLive();
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
              How the outreach actually works.
            </h1>
            <p className="text-lg text-ink-soft">
              Everything on this site is free to families &mdash; the price
              lookup, the prep kit, the obituary helper, the 30-day checklist,
              all of it. That includes contacting funeral homes for you and
              comparing their quotes side by side. We contact homes on your
              behalf at no charge. Here&rsquo;s every step.
            </p>
          </div>

          {!live && (
            <Card tone="soft">
              <CardEyebrow>Where this stands today</CardEyebrow>
              <p className="text-ink-soft">
                We vet funeral homes region by region, and our team
                isn&rsquo;t sending outreach emails yet. Start the flow and
                we&rsquo;ll prepare everything &mdash; the vetted homes near
                you and the exact request each would get &mdash; and your
                case page will always say plainly what has and hasn&rsquo;t
                been sent.
              </p>
            </Card>
          )}

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
            <CardTitle>Free to families. Always.</CardTitle>
            <p className="text-ink-soft mb-4">
              Everything on the site is free to families &mdash; the tools and
              the funeral-home outreach. There&rsquo;s nothing to pay and no
              subscription. No commissions from any funeral home. No referral
              fees. Any revenue we earn comes from the institutions that serve
              families &mdash; hospices and employers &mdash; never from
              funeral homes or insurers, and never from you.
            </p>
            <div className="flex flex-wrap gap-3">
              <LinkButton href="/decide">
                Start with the five questions
              </LinkButton>
              <LinkButton href="/prices" variant="secondary">
                Or look up fair prices first (free)
              </LinkButton>
            </div>
          </Card>

          <Card tone="soft">
            <CardTitle>Why it works</CardTitle>
            <p className="text-ink-soft">
              Funeral homes respond differently to a documented, comparing
              buyer than to a grieving family alone. Every email signals we
              know the FTC Funeral Rule and that the family is comparing
              &mdash; that&rsquo;s the leverage this flow is built on.
            </p>
          </Card>
        </div>
      </section>
    </main>
  );
}
