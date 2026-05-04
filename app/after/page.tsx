import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "After the funeral — what happens in the next 30 days",
  description:
    "The hardest part is done. What's left is paperwork, phone calls, and notifications. Here's what to tackle in the coming weeks, in the order that makes the most sense.",
};

const TOPICS: {
  href: string;
  eyebrow: string;
  title: string;
  body: string;
  when: string;
}[] = [
  {
    href: "/after/death-certificates",
    eyebrow: "Week 1",
    title: "Death certificates — how many, where from, what they cost",
    body:
      "Order them through the funeral home at the time of death — it's faster than ordering later, and most homes pass through the state's base fee. Most families need 5–10 to start. You can always order more from your state vital records office later if needed.",
    when: "Order within the first week.",
  },
  {
    href: "/after/accounts-to-close",
    eyebrow: "Weeks 1–4",
    title: "Accounts to close and notify",
    body:
      "Social Security, credit cards, subscriptions, email, social media, utilities, DMV. A full checklist in the order that makes the most sense — with scripts for the calls that are hard to make.",
    when: "Start in week one; most families finish by week four.",
  },
  {
    href: "/after/estate-basics",
    eyebrow: "Month 1+",
    title: "Estate basics — wills, probate, when to call an attorney",
    body:
      "What a will actually does, when probate applies and when it doesn't, what \"executor\" means in practice, and the specific situations where calling an estate attorney saves you money instead of costing it.",
    when: "Start once the certificates are in hand.",
  },
  {
    href: "/veterans",
    eyebrow: "If they served",
    title: "Veterans burial benefits — what your family can claim",
    body:
      "VA burial allowance, plot allowance, free national cemetery burial, government headstone, burial flag. Most families miss at least one. A 5-question checker and links to the right VA forms.",
    when: "File within 2 years of burial — most families do it in the first month.",
  },
];

export default function AfterIndexPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader backHref="/dashboard" backLabel="Dashboard" />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              After the funeral
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              The hardest part is done.
            </h1>
            <p className="text-lg text-ink-soft">
              What&rsquo;s left is paperwork, phone calls, and a thousand
              small notifications. Here&rsquo;s what you can tackle in the
              coming weeks &mdash; in the order that makes the most sense,
              so you&rsquo;re not doing any of it twice.
            </p>
          </div>

          <div className="space-y-4">
            {TOPICS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="block rounded-2xl border border-border bg-surface p-6 hover:border-primary-deep/40 transition-colors group"
              >
                <CardEyebrow>{t.eyebrow}</CardEyebrow>
                <CardTitle>{t.title}</CardTitle>
                <p className="text-ink-soft mb-3">{t.body}</p>
                <p className="text-sm text-ink-muted">
                  <span className="font-medium text-ink">When:</span> {t.when}
                </p>
                <p className="mt-3 text-sm font-medium text-primary-deep group-hover:underline">
                  Read this section &rarr;
                </p>
              </Link>
            ))}
          </div>

          <Card tone="soft">
            <CardTitle>A note on grief and pacing.</CardTitle>
            <p className="text-ink-soft mb-3">
              There&rsquo;s no deadline on most of this. Social Security has
              a few time-sensitive items (within a month or two), but the
              rest &mdash; closing accounts, settling the estate,
              transferring titles &mdash; you can do as energy allows.
            </p>
            <p className="text-ink-soft">
              Set aside one afternoon a week for admin, and do nothing on
              the other six days if that&rsquo;s what you need. The people
              and institutions on the other end of these calls deal with
              this every day. They are not in a hurry.
            </p>
          </Card>

          <Card tone="soft">
            <CardTitle>Tools you might still need</CardTitle>
            <p className="text-ink-soft mb-4 text-sm">
              Free tools that pair well with the checklists above.
            </p>
            <div className="flex flex-wrap gap-3">
              <LinkButton href="/prep" variant="secondary">
                Arrangement prep kit
              </LinkButton>
              <LinkButton href="/analyzer" variant="secondary">
                Price list analyzer
              </LinkButton>
              <LinkButton href="/certificates" variant="secondary">
                Certificate calculator
              </LinkButton>
              <LinkButton href="/obituary" variant="secondary">
                Obituary helper
              </LinkButton>
              <LinkButton href="/veterans" variant="secondary">
                Veterans benefits checker
              </LinkButton>
            </div>
          </Card>

          <p className="text-xs text-ink-muted">
            This section is general consumer guidance, not legal, medical,
            or financial advice. Complicated estates, disputes, or
            questions about specific benefits should go to a licensed
            attorney in your state.
          </p>
        </div>
      </section>
    </main>
  );
}
