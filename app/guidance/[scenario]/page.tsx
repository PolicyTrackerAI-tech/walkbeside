import Link from "next/link";
import { notFound } from "next/navigation";
import { Brand } from "@/components/Brand";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import {
  SCENARIO_GUIDANCE,
  type Scenario,
  SCENARIO_LABELS,
} from "@/lib/scenarios";
import { SCENARIO_LANDING_TONE } from "@/lib/content";

const VALID: Scenario[] = ["hospital", "home-expected", "home-unexpected", "elsewhere"];

export default async function GuidancePage({
  params,
}: {
  params: Promise<{ scenario: string }>;
}) {
  const { scenario: raw } = await params;
  if (!VALID.includes(raw as Scenario)) notFound();
  const scenario = raw as Scenario;
  const g = SCENARIO_GUIDANCE[scenario];

  return (
    <main className="flex-1 flex flex-col">
      <div className="px-5 pt-6 flex items-center justify-between">
        <Brand />
        <Link
          href="/where"
          className="text-sm text-ink-muted hover:text-ink-soft"
        >
          ← Change answer
        </Link>
      </div>

      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-12">
          <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
            {SCENARIO_LABELS[scenario]}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-ink mb-4">
            {g.headline}
          </h1>
          <p className="text-lg text-ink-soft mb-2">{g.subhead}</p>
          <p className="text-sm text-ink-muted italic mb-10">
            {SCENARIO_LANDING_TONE[scenario]}
          </p>

          <ol className="space-y-4 mb-10">
            {g.steps.map((step, i) => (
              <li key={i}>
                <Card
                  tone={
                    step.tone === "urgent"
                      ? "warn"
                      : step.tone === "info"
                        ? "soft"
                        : "surface"
                  }
                >
                  <div className="flex gap-4">
                    <div className="font-serif text-primary-deep text-2xl leading-none pt-0.5">
                      {i + 1}
                    </div>
                    <div>
                      <h2 className="font-serif text-lg text-ink mb-1">
                        {step.title}
                      </h2>
                      <p className="text-ink-soft text-[15px] leading-relaxed">
                        {step.body}
                      </p>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ol>

          {g.showPriceCompareGate && (
            <Card tone="primary">
              <div className="text-sm uppercase tracking-wider text-primary-deep mb-2">
                Before you call a funeral home
              </div>
              <h2 className="font-serif text-2xl text-ink mb-2">
                See what funerals should cost in your area.
              </h2>
              <p className="text-ink-soft mb-5">{g.priceGateText}</p>
              <LinkButton href="/prices" size="lg">
                Look up fair prices →
              </LinkButton>
            </Card>
          )}

          {!g.showPriceCompareGate && (
            <Card tone="soft">
              <p className="text-ink-soft mb-4">
                When you&rsquo;re ready, the next step is comparing funeral homes.
                There&rsquo;s no rush.
              </p>
              <LinkButton href="/prices" variant="secondary">
                When you&rsquo;re ready →
              </LinkButton>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}
