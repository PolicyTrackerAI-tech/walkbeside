"use client";

import { useState } from "react";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import { Card } from "@/components/ui/Card";
import { Button, LinkButton } from "@/components/ui/Button";
import type { GuidanceStep } from "@/lib/scenarios";

interface Props {
  label: string;
  headline: string;
  subhead: string;
  tone: string;
  steps: GuidanceStep[];
  showPriceCompareGate: boolean;
  priceGateText?: string;
}

export function GuidanceStepper({
  label,
  headline,
  subhead,
  tone,
  steps,
  showPriceCompareGate,
  priceGateText,
}: Props) {
  const [active, setActive] = useState(0);
  const [done, setDone] = useState<boolean[]>(() => steps.map(() => false));
  const allDone = done.every(Boolean);
  const step = steps[active];

  function go(idx: number) {
    if (idx < 0 || idx >= steps.length) return;
    setActive(idx);
  }

  function markDoneAndAdvance() {
    const next = done.slice();
    next[active] = true;
    setDone(next);
    if (active < steps.length - 1) setActive(active + 1);
  }

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
            {label}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-ink mb-4">
            {headline}
          </h1>
          <p className="text-lg text-ink-soft mb-2">{subhead}</p>
          <p className="text-sm text-ink-muted italic mb-8">{tone}</p>

          {/* Progress indicator */}
          <div
            role="tablist"
            aria-label="Steps"
            className="flex items-center gap-3 mb-6"
          >
            {steps.map((s, i) => {
              const isActive = i === active;
              const isDone = done[i];
              return (
                <button
                  key={i}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Step ${i + 1}: ${s.title}`}
                  onClick={() => go(i)}
                  className={`flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full ${
                    isActive ? "" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-full font-serif text-sm border-2 transition-colors ${
                      isActive
                        ? "bg-primary-deep text-white border-primary-deep"
                        : isDone
                          ? "bg-good text-white border-good"
                          : "bg-surface text-ink-soft border-border"
                    }`}
                  >
                    {isDone && !isActive ? "✓" : i + 1}
                  </span>
                  {i < steps.length - 1 && (
                    <span
                      aria-hidden
                      className={`h-0.5 w-6 sm:w-10 transition-colors ${
                        done[i] ? "bg-good" : "bg-border"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active step card */}
          <Card
            tone={
              step.tone === "urgent"
                ? "warn"
                : step.tone === "info"
                  ? "soft"
                  : "surface"
            }
          >
            <div className="text-xs uppercase tracking-wider text-ink-muted mb-2">
              Step {active + 1} of {steps.length}
            </div>
            <h2 className="font-serif text-2xl text-ink mb-3">{step.title}</h2>
            <p className="text-ink-soft leading-relaxed">{step.body}</p>

            <div className="flex items-center justify-between gap-3 mt-6 pt-5 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                onClick={() => go(active - 1)}
                disabled={active === 0}
              >
                ← Back
              </Button>
              <Button
                type="button"
                onClick={markDoneAndAdvance}
                disabled={done[active] && active === steps.length - 1}
              >
                {active < steps.length - 1
                  ? done[active]
                    ? "Next step →"
                    : "Got it, next →"
                  : done[active]
                    ? "Done"
                    : "Got it"}
              </Button>
            </div>
          </Card>

          {/* Price gate / next-step card appears after all steps acknowledged */}
          <div
            className={`mt-8 transition-opacity ${allDone ? "opacity-100" : "opacity-50"}`}
          >
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
          </div>
        </div>
      </section>
    </main>
  );
}
