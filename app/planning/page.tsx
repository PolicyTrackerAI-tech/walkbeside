import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import { Card, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Planning a funeral in advance",
  description:
    "Most families meet funeral costs for the first time on the worst day of their life. Learn fair prices, what to ask, and what to skip — before you need to know.",
};

/**
 * Planning-ahead escape hatch. For researchers, journalists, adult children
 * helping aging parents, and people preparing for themselves. No crisis copy.
 */
export default function PlanningPage() {
  return (
    <main className="flex-1 flex flex-col">
      <header className="border-b border-border bg-surface/70">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Brand />
          <Link href="/where" className="text-sm text-ink-muted hover:text-ink-soft">
            ← Back
          </Link>
        </div>
      </header>

      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-12 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              Planning ahead
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              Good. This is the right time to learn this.
            </h1>
            <p className="text-lg text-ink-soft">
              Most families meet funeral costs for the first time on the worst
              day of their life. You&rsquo;re ahead. Here&rsquo;s what&rsquo;s worth
              knowing now.
            </p>
          </div>

          <Card tone="primary">
            <CardTitle>The arrangement meeting cheat sheet</CardTitle>
            <p className="text-ink-soft mb-4">
              One printable page. What to ask, what&rsquo;s optional, what&rsquo;s
              required, and fair price ranges. Written by a licensed funeral
              director.
            </p>
            <LinkButton href="/prep">Open the cheat sheet</LinkButton>
          </Card>

          <Card tone="soft">
            <CardTitle>Fair prices in your area</CardTitle>
            <p className="text-ink-soft mb-4">
              Enter a zip code to see what funerals should cost. No account
              needed.
            </p>
            <LinkButton href="/prices" variant="secondary">
              Look up fair prices
            </LinkButton>
          </Card>

          <Card>
            <CardTitle>If you&rsquo;re helping an aging parent</CardTitle>
            <p className="text-ink-soft">
              Keep this URL. If things change, you&rsquo;ll want it in the first
              hour, not the fifth. A pre-need conversation that takes thirty
              minutes now routinely saves families thousands later.
            </p>
          </Card>

          <p className="text-sm text-ink-muted pt-4 border-t border-border">
            Full pre-need planning tools are on our near-term roadmap. If you
            want to be notified when they&rsquo;re live,{" "}
            <Link href="/login" className="underline underline-offset-2">
              create an account
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
