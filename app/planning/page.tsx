import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { CheatSheetForm } from "@/components/planning/CheatSheetForm";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Planning a funeral in advance",
  description:
    "A few hours of research now saves your family thousands and hours of decisions at the worst moment of their lives. Free cheat sheet from a licensed funeral director.",
};

/**
 * /planning — the non-crisis entry. For people preparing for themselves or
 * helping aging parents. No crisis copy, no urgency framing.
 */
export default function PlanningPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-10">
          <div>
            <CardEyebrow>Planning ahead</CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              Planning ahead for a funeral &mdash; yours or a loved one&rsquo;s.
            </h1>
            <p className="text-lg text-ink-soft">
              Doing this now, when nothing is urgent, is one of the cheapest
              and kindest things you can do for the people you love. A few
              hours of research saves your family thousands and hours of
              decisions at the worst moment of their lives.
            </p>
          </div>

          <section className="grid gap-4 sm:grid-cols-3">
            <Stat
              number="$2,000–$5,000"
              label="Typical overpayment when a family shops under crisis, without a reference range."
            />
            <Stat
              number="3×"
              label="Price variation between funeral homes in the same zip code for the same services."
            />
            <Stat
              number="30 min"
              label="A conversation this weekend about preferences. It’s the highest-leverage thing you can do."
            />
          </section>

          <Card tone="primary">
            <CardEyebrow>The acquisition asset</CardEyebrow>
            <CardTitle>The Honest Funeral arrangement cheat sheet.</CardTitle>
            <p className="text-ink-soft mb-5">
              One page. The nine things to ask any funeral home. The five
              upsells to decline. The FTC rights most families don&rsquo;t
              know they have. Written by a licensed funeral director. Free.
            </p>
            <CheatSheetForm />
          </Card>

          <Card tone="soft">
            <CardTitle>See fair prices in your area.</CardTitle>
            <p className="text-ink-soft mb-4">
              Enter a zip code to see what funeral services should cost in
              your area, by line item. No account needed. No email collected.
              Nothing saved.
            </p>
            <LinkButton href="/prices" variant="secondary">
              Look up fair prices
            </LinkButton>
          </Card>

          <Card tone="soft">
            <CardTitle>Not sure what type of service fits?</CardTitle>
            <p className="text-ink-soft mb-4">
              Four short questions about faith, body, and budget. We&rsquo;ll
              recommend a service type so you can move on to comparing prices
              with confidence.
            </p>
            <LinkButton href="/decide" variant="secondary">
              Help me decide →
            </LinkButton>
          </Card>

          <Card>
            <CardEyebrow>A note from the funeral director</CardEyebrow>
            <CardTitle>On prepaid funeral plans.</CardTitle>
            <p className="text-ink-soft mb-3">
              Many families assume prepaying is the responsible move. It
              often isn&rsquo;t.
            </p>
            <ul className="space-y-2 text-[15px] text-ink-soft list-disc pl-5 mb-4">
              <li>
                Prepaid plans can lock in services your family won&rsquo;t
                want when the time comes.
              </li>
              <li>
                They often carry high cancellation fees, and the money
                doesn&rsquo;t always transfer cleanly across state lines.
              </li>
              <li>
                If the funeral home closes, is acquired, or changes
                ownership, honoring the original plan can get complicated.
              </li>
              <li>
                In some states, a portion of prepaid funds is not protected
                by trust or insurance. If the funeral home closes or is
                acquired before the death, recovery may be partial or zero.
                The Funeral Consumer Alliance maintains state-by-state
                guidance on prepaid plan protections.
              </li>
            </ul>
            <p className="text-ink-soft mb-3">
              For most families, a will, a recorded conversation about
              wishes, and a savings account earmarked for this purpose serve
              better than a prepaid plan. If you&rsquo;re considering one
              anyway, talk to an estate attorney in your state before you
              sign.
            </p>
            <p className="text-xs text-ink-muted">
              This is general guidance, not legal or financial advice.
            </p>
          </Card>

          <Card tone="primary">
            <CardEyebrow>When the time comes</CardEyebrow>
            <CardTitle>We can do the calling for you.</CardTitle>
            <p className="text-ink-soft mb-3">
              Planning ahead means your family won&rsquo;t be making cold
              calls in the worst week of their life. For a flat $49 &mdash;
              only if they choose a home we present &mdash; we contact
              funeral homes near them, pull written itemized quotes, and put
              the options side by side in their dashboard. They make the
              call. We make sure they don&rsquo;t miss anything.
            </p>
            <p className="text-sm text-ink-muted mb-4">
              Save this site to an account now. When the time comes, your
              family logs in and the process is already half-done.
            </p>
            <div className="flex flex-wrap gap-3">
              <LinkButton href="/login?next=/planning">
                Save to an account
              </LinkButton>
              <LinkButton href="/how-it-works" variant="secondary">
                How advocate outreach works
              </LinkButton>
            </div>
          </Card>

          <Card tone="soft">
            <CardTitle>If you&rsquo;re helping an aging parent.</CardTitle>
            <p className="text-ink-soft">
              Keep this URL. If things change, you&rsquo;ll want it in the
              first hour, not the fifth. A thirty-minute pre-need
              conversation now routinely saves families thousands later.
            </p>
          </Card>

          <Card tone="soft">
            <CardTitle>Want to come back to this?</CardTitle>
            <p className="text-ink-soft mb-4">
              Save it to an account so you don&rsquo;t lose your place.
            </p>
            <LinkButton href="/login?next=/planning" variant="secondary">
              Save to an account →
            </LinkButton>
          </Card>

          <p className="text-sm text-ink-muted">
            <Link
              href="/where"
              className="text-primary-deep underline-offset-2 hover:underline"
            >
              If something just happened, start here →
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="font-serif text-2xl text-primary-deep mb-1">
        {number}
      </div>
      <p className="text-sm text-ink-soft leading-relaxed">{label}</p>
    </div>
  );
}
