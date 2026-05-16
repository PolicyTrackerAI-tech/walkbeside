"use client";

import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Card } from "@/components/ui/Card";
import { Button, LinkButton } from "@/components/ui/Button";
import { CrisisResources } from "@/components/CrisisResources";
import { HelpFooter } from "@/components/HelpFooter";
import { TimeCriticalBanner } from "@/components/guidance/TimeCriticalBanner";
import type { GuidanceStep, Scenario } from "@/lib/scenarios";

type StepStatus = "hidden" | "current" | "done" | "skipped";

interface Props {
  scenario: Scenario;
  label: string;
  headline: string;
  subhead: string;
  tone: string;
  steps: GuidanceStep[];
  pullQuote?: string;
  /** false = suppress the final commercial CTA card (used by home-unexpected). */
  showCta?: boolean;
  /** Show 988 block. True for scenarios with elevated survivor suicide risk. */
  showCrisisResources?: boolean;
}

const STEP_TONE_CLASS: Record<NonNullable<GuidanceStep["tone"]>, string> = {
  urgent: "border-warn/30 bg-warn-soft",
  info: "border-border bg-surface-soft",
  calm: "border-border bg-surface",
};

function ShareAffordance({
  copyUrl,
  copyLabel,
  helperText,
}: {
  copyUrl: string;
  copyLabel: string;
  helperText: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      // Web Share API is the right pattern on phones — opens the
      // native share sheet (iMessage, WhatsApp, etc.). Falls back to
      // clipboard everywhere else.
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: "Honest Funeral",
          text: "I think this will help — they walk you through funeral planning step by step.",
          url: copyUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(copyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // User cancelled the share sheet, or clipboard refused. Either way
      // there's nothing useful to surface.
    }
  }

  return (
    <div className="mt-5 rounded-xl bg-surface border border-border px-4 py-3">
      <p className="text-sm text-ink-soft mb-3 leading-relaxed">{helperText}</p>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-deep text-white text-sm font-medium hover:bg-primary-deep/90"
        >
          {copied ? "Link copied ✓" : copyLabel}
        </button>
        <code className="text-xs text-ink-muted break-all">{copyUrl}</code>
      </div>
    </div>
  );
}

function storageKey(scenario: Scenario): string {
  return `honestfuneral.guidance.${scenario}.v1`;
}

/**
 * Step-by-step guidance flow. Only the current step is fully expanded.
 * Previous steps collapse to a one-line checkmark. Future steps are hidden.
 *
 * State machine: each step is hidden | current | done | skipped.
 * State persists in localStorage per scenario, so refreshing or coming
 * back later doesn't lose progress.
 *
 * Margaret-first design: one decision per screen, low cognitive load,
 * permission to skip, permission to slow down.
 */
export function StepList({
  scenario,
  label,
  headline,
  subhead,
  tone,
  steps,
  pullQuote,
  showCta = true,
  showCrisisResources = false,
}: Props) {
  const [statuses, setStatuses] = useState<StepStatus[]>(() =>
    steps.map((_, i) => (i === 0 ? "current" : "hidden")),
  );
  const [hydrated, setHydrated] = useState(false);
  const [confusedSteps, setConfusedSteps] = useState<Record<number, boolean>>({});
  const currentStepRef = useRef<HTMLLIElement>(null);
  // Suppress the scroll-into-view on initial mount / hydration so the
  // page lands at the top (where the headline is) instead of jumping
  // down to step 1. After the user actually advances or reverts a
  // step, this flag lets the scroll run.
  const userInitiatedAdvanceRef = useRef(false);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(scenario));
      if (raw) {
        const parsed = JSON.parse(raw) as StepStatus[];
        if (Array.isArray(parsed) && parsed.length === steps.length) {
          setStatuses(parsed);
        }
      }
    } catch {
      // localStorage may be blocked; fall back to in-memory state.
    }
    setHydrated(true);
  }, [scenario, steps.length]);

  // Persist on change.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey(scenario), JSON.stringify(statuses));
    } catch {
      // Best-effort; ignore failures.
    }
  }, [statuses, scenario, hydrated]);

  // When the user advances or reverts a step, scroll the new current
  // step into view. Skipped on initial mount / hydration so the page
  // lands at its headline, not partway down at step 1.
  useEffect(() => {
    if (!hydrated) return;
    if (!userInitiatedAdvanceRef.current) return;
    userInitiatedAdvanceRef.current = false;
    if (currentStepRef.current) {
      currentStepRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [statuses, hydrated]);

  const totalSteps = steps.length;
  const completedSteps = statuses.filter(
    (s) => s === "done" || s === "skipped",
  ).length;
  const allComplete = completedSteps === totalSteps;
  const currentIndex = statuses.findIndex((s) => s === "current");

  function advance(index: number, mark: "done" | "skipped") {
    userInitiatedAdvanceRef.current = true;
    setStatuses((prev) => {
      const next = [...prev];
      next[index] = mark;
      // Reveal the next hidden step as current.
      const nextIdx = next.findIndex((s) => s === "hidden");
      if (nextIdx !== -1) {
        next[nextIdx] = "current";
      }
      return next;
    });
    // Clear the "I don't understand" expander on advance.
    setConfusedSteps((prev) => ({ ...prev, [index]: false }));
  }

  // Click a completed step in the stepper or in the collapsed row to
  // jump back to it. Re-marks it "current" and pushes the previously
  // current step (and any future-revealed ones) back to hidden.
  function jumpTo(index: number) {
    userInitiatedAdvanceRef.current = true;
    setStatuses((prev) => {
      const next = prev.map((s, i) => {
        if (i < index) return s; // keep prior steps as-is
        if (i === index) return "current" as StepStatus;
        return "hidden" as StepStatus; // hide everything past target
      });
      return next;
    });
    setConfusedSteps({});
  }

  function toggleConfused(index: number) {
    setConfusedSteps((prev) => ({ ...prev, [index]: !prev[index] }));
  }

  function reset() {
    setStatuses(steps.map((_, i) => (i === 0 ? "current" : "hidden")));
    setConfusedSteps({});
  }

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
          <p className="text-sm text-ink-muted italic mb-6">{tone}</p>

          {/* Skip the tradition banner on /elsewhere — that scenario is for
              chaotic situations (workplace, public, transit) where adding
              a "is your tradition time-sensitive?" prompt is noise. */}
          {scenario !== "elsewhere" && <TimeCriticalBanner />}

          {/* Sticky stepper — every step's state at a glance, visible as
              the user scrolls or advances. Replaces the simple percentage
              bar so the user never loses sight of what they've answered. */}
          {hydrated && !allComplete && currentIndex !== -1 && (
            <div
              className="sticky top-0 z-20 -mx-5 px-5 py-3 bg-bg/95 backdrop-blur-md border-b border-border mb-6"
              role="progressbar"
              aria-valuenow={completedSteps}
              aria-valuemin={0}
              aria-valuemax={totalSteps}
            >
              <div className="flex items-center gap-1">
                {statuses.map((status, i) => {
                  const isDone = status === "done";
                  const isSkipped = status === "skipped";
                  const isCurrent = status === "current";
                  const isLast = i === statuses.length - 1;
                  const isClickable = isDone || isSkipped;
                  const dot = (
                    <div
                      className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold transition-transform ${
                        isDone
                          ? "bg-good text-white"
                          : isSkipped
                            ? "bg-ink-muted/40 text-white"
                            : isCurrent
                              ? "bg-primary-deep text-white ring-2 ring-primary/30"
                              : "bg-surface-soft text-ink-muted border border-border"
                      } ${isClickable ? "cursor-pointer hover:scale-110" : ""}`}
                      title={
                        isClickable
                          ? `Go back to step ${i + 1}: ${steps[i]?.title ?? ""}`
                          : `Step ${i + 1}: ${steps[i]?.title ?? ""}`
                      }
                    >
                      {isDone || isSkipped ? "✓" : i + 1}
                    </div>
                  );
                  return (
                    <div
                      key={i}
                      className="flex-1 flex items-center min-w-0"
                    >
                      {isClickable ? (
                        <button
                          type="button"
                          onClick={() => jumpTo(i)}
                          aria-label={`Go back to step ${i + 1}`}
                          className="contents"
                        >
                          {dot}
                        </button>
                      ) : (
                        dot
                      )}
                      {!isLast && (
                        <div
                          className={`flex-1 h-0.5 mx-1 ${
                            isDone || isSkipped
                              ? "bg-good/40"
                              : "bg-border"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-ink-muted">
                <span className="font-medium">
                  Step {currentIndex + 1} of {totalSteps}
                </span>
                {completedSteps > 0 && (
                  <span>{completedSteps} answered</span>
                )}
              </div>
            </div>
          )}

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

          {/* Step list. Only the current step renders fully; others collapse. */}
          <ol className="space-y-3">
            {steps.map((step, i) => {
              const status = statuses[i];
              if (status === "hidden") return null;

              const isCurrent = status === "current";
              const isDone = status === "done";
              const isSkipped = status === "skipped";

              if (isCurrent) {
                const toneClass =
                  STEP_TONE_CLASS[step.tone ?? "calm"] ??
                  STEP_TONE_CLASS.calm;
                const isConfused = !!confusedSteps[i];

                return (
                  <li key={i} ref={currentStepRef}>
                    <div
                      className={`rounded-2xl border-2 p-6 scroll-mt-28 ${toneClass}`}
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-deep text-white font-serif text-base shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <h2 className="font-serif text-xl sm:text-2xl text-ink mb-3 leading-tight">
                            {step.title}
                          </h2>
                          <div className="text-ink-soft leading-relaxed text-base space-y-3">
                            {step.body.split("\n\n").map((para, idx) => (
                              <p key={idx}>{para}</p>
                            ))}
                          </div>
                          {step.inlineCta && (
                            <div className="mt-5 rounded-xl bg-primary-soft border border-primary/30 px-4 py-4">
                              {step.inlineCta.helperText && (
                                <p className="text-sm text-ink-soft mb-3 leading-relaxed">
                                  {step.inlineCta.helperText}
                                </p>
                              )}
                              <LinkButton href={step.inlineCta.href} size="lg">
                                {step.inlineCta.label}
                              </LinkButton>
                            </div>
                          )}
                          {step.shareAffordance && (
                            <ShareAffordance
                              copyUrl={step.shareAffordance.copyUrl}
                              copyLabel={step.shareAffordance.copyLabel}
                              helperText={step.shareAffordance.helperText}
                            />
                          )}
                        </div>
                      </div>

                      {isConfused && (
                        <div className="mt-4 mb-4 rounded-xl bg-surface-soft border border-border px-4 py-3">
                          <p className="text-sm text-ink-soft">
                            Take a breath. There&rsquo;s no deadline on this.
                            Read it again whenever you&rsquo;re ready, or tap
                            &ldquo;Skip&rdquo; to come back later. None of
                            this has to happen right now.
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3 mt-5">
                        <Button
                          size="lg"
                          onClick={() => advance(i, "done")}
                        >
                          Next step →
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => advance(i, "skipped")}
                        >
                          Skip — not relevant
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => toggleConfused(i)}
                        >
                          {isConfused ? "Got it" : "I don't understand"}
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              }

              // Collapsed (done or skipped) — one-line clickable row that
              // jumps back to this step when clicked.
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => jumpTo(i)}
                    className={`w-full text-left rounded-2xl border p-4 flex items-center gap-3 transition-colors hover:border-primary ${
                      isDone
                        ? "bg-good-soft border-good/30"
                        : "bg-surface-soft border-border"
                    }`}
                    aria-label={`Go back to step ${i + 1}: ${step.title}`}
                  >
                    <span
                      className={`text-lg font-bold ${
                        isDone ? "text-good" : "text-ink-muted"
                      }`}
                      aria-hidden
                    >
                      ✓
                    </span>
                    <span
                      className={`text-sm flex-1 ${
                        isDone ? "text-ink" : "text-ink-muted"
                      }`}
                    >
                      Step {i + 1}: {step.title}
                    </span>
                    {isSkipped && (
                      <span className="text-xs text-ink-muted">
                        (skipped)
                      </span>
                    )}
                    <span className="text-xs text-ink-muted hidden sm:inline">
                      Back to this step ↺
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          {/* Final CTA — replaces the step list when everything's complete. */}
          {allComplete && showCta && (
            <div className="mt-8">
              <Card tone="primary">
                <div className="text-sm uppercase tracking-wider text-primary-deep mb-2">
                  You&rsquo;ve handled the next two hours
                </div>
                <h2 className="font-serif text-2xl text-ink mb-2">
                  Now we&rsquo;ll figure out what kind of service fits.
                </h2>
                <p className="text-ink-soft mb-5">
                  Four short questions. We&rsquo;ll recommend a service type
                  that fits your faith, your family, and your budget &mdash;
                  so you know exactly what to compare.
                </p>
                <LinkButton href="/decide" size="lg">
                  Continue →
                </LinkButton>
              </Card>
            </div>
          )}

          {/* Allow user to start over if they want. */}
          {hydrated && completedSteps > 0 && !allComplete && (
            <div className="mt-6 text-center">
              <button
                onClick={reset}
                className="text-xs text-ink-muted hover:text-ink-soft underline-offset-2 hover:underline"
              >
                Start over from step 1
              </button>
            </div>
          )}

          {/* Permission to slow down. */}
          <div className="mt-12 mb-6 text-center">
            <p className="text-sm text-ink-soft">
              You have time. You can close this and come back later.
            </p>
          </div>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
