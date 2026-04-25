import { SiteHeader } from "@/components/SiteHeader";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { CrisisResources } from "@/components/CrisisResources";
import type { GuidanceStep } from "@/lib/scenarios";

interface Props {
  label: string;
  headline: string;
  subhead: string;
  tone: string;
  steps: GuidanceStep[];
  pullQuote?: string;
  showPriceCompareGate: boolean;
  priceGateText?: string;
  /** null = suppress all commercial CTAs (used by home-unexpected variant). */
  showCta?: boolean;
  /** Show 988 block. True for scenarios with elevated survivor suicide risk. */
  showCrisisResources?: boolean;
}

const STEP_TONE_CLASS: Record<NonNullable<GuidanceStep["tone"]>, string> = {
  urgent: "border-warn/30 bg-warn-soft",
  info: "border-border bg-surface-soft",
  calm: "border-border bg-surface",
};

export function StepList({
  label,
  headline,
  subhead,
  tone,
  steps,
  pullQuote,
  showPriceCompareGate,
  priceGateText,
  showCta = true,
  showCrisisResources = false,
}: Props) {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader backHref="/where" backLabel="← Change answer" />

      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-12">
          <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
            {label}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-ink mb-4">
            {headline}
          </h1>
          <p className="text-lg text-ink-soft mb-2">{subhead}</p>
          <p className="text-sm text-ink-muted italic mb-8">{tone}</p>

          {showCrisisResources && (
            <div className="mb-8">
              <CrisisResources />
            </div>
          )}

          {pullQuote && (
            <blockquote className="my-8 border-l-4 border-primary-deep pl-5 py-1 text-ink font-serif text-xl leading-snug">
              &ldquo;{pullQuote}&rdquo;
            </blockquote>
          )}

          <ol className="space-y-4">
            {steps.map((step, i) => {
              const toneClass =
                STEP_TONE_CLASS[step.tone ?? "calm"] ?? STEP_TONE_CLASS.calm;
              return (
                <li
                  key={i}
                  className={`rounded-2xl border p-6 ${toneClass}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-deep text-white font-serif text-sm shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <h2 className="font-serif text-xl text-ink mb-2">
                        {step.title}
                      </h2>
                      <p className="text-ink-soft leading-relaxed">
                        {step.body}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          {showCta && (
            <div className="mt-8 space-y-4">
              <Card tone="soft">
                <p className="text-ink-soft mb-4">
                  Save your progress so nothing gets lost.
                </p>
                <LinkButton
                  variant="secondary"
                  href="/login?next=/dashboard"
                >
                  Save to an account →
                </LinkButton>
              </Card>
              {showPriceCompareGate ? (
                <Card tone="primary">
                  <div className="text-sm uppercase tracking-wider text-primary-deep mb-2">
                    When you&rsquo;re ready
                  </div>
                  <h2 className="font-serif text-2xl text-ink mb-2">
                    See what funerals should cost in your area.
                  </h2>
                  <p className="text-ink-soft mb-5">{priceGateText}</p>
                  <LinkButton href="/prices" size="lg">
                    Look up fair prices →
                  </LinkButton>
                </Card>
              ) : (
                <Card tone="soft">
                  <p className="text-ink-soft mb-4">
                    When you&rsquo;re ready, the next step is comparing funeral
                    homes. There&rsquo;s no rush.
                  </p>
                  <LinkButton href="/prices" variant="secondary">
                    When you&rsquo;re ready →
                  </LinkButton>
                </Card>
              )}

              <Card tone="primary">
                <h2 className="font-serif text-2xl text-ink mb-2">
                  Let us handle the heavy lifting.
                </h2>
                <p className="text-ink-soft mb-5">
                  You don&rsquo;t have to make these calls yourself. For a
                  flat $49 &mdash; only if you pick a home we bring you
                  &mdash; we contact funeral homes near you, request their
                  itemized prices under the FTC Funeral Rule, and put the
                  options side by side in your dashboard. You read it when
                  you have a quiet minute.
                </p>
                <div className="flex flex-wrap gap-3">
                  <LinkButton href="/negotiate/start" size="lg">
                    Start advocate outreach
                  </LinkButton>
                  <LinkButton href="/how-it-works" variant="secondary">
                    How it works
                  </LinkButton>
                </div>
              </Card>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
