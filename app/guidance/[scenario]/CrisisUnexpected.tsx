"use client";

import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { CrisisResources } from "@/components/CrisisResources";
import { HelpFooter } from "@/components/HelpFooter";
import { TimeCriticalBanner } from "@/components/guidance/TimeCriticalBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card } from "@/components/ui/Card";
import { Button, LinkButton } from "@/components/ui/Button";

const schema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "What to do after an unexpected death at home",
  description:
    "You're not in trouble. Here's what happens when 911 comes, and what you can and can't do while you wait.",
  datePublished: "2026-01-01",
  author: {
    "@type": "Organization",
    name: "Honest Funeral",
    url: "https://honestfuneral.co",
  },
  publisher: {
    "@type": "Organization",
    name: "Honest Funeral",
    url: "https://honestfuneral.co",
  },
};

type StepStatus = "hidden" | "current" | "done" | "skipped";

interface Step {
  title: string;
  body: React.ReactNode;
}

const STEPS: Step[] = [
  {
    title: "Call 911 if you haven't.",
    body: (
      <p>
        A medical professional has to officially confirm the death.
        Paramedics will come first; police will too, and sometimes a
        medical examiner. That&rsquo;s procedure for any unexpected
        death &mdash; it doesn&rsquo;t mean anything is wrong.
      </p>
    ),
  },
  {
    title: "While you wait for them to arrive.",
    body: (
      <ul className="list-disc pl-5 space-y-2">
        <li>
          Don&rsquo;t move them. Until the death is officially confirmed,
          this is procedurally a death scene &mdash; not because anything
          is wrong, but because that&rsquo;s how every unexpected death
          is handled.
        </li>
        <li>
          Unlock the door if you can, so paramedics don&rsquo;t have to
          break it.
        </li>
        <li>
          You don&rsquo;t have to stay in the room. Step outside, sit on
          the porch, call someone. None of it changes anything.
        </li>
      </ul>
    ),
  },
  {
    title: "You are not in trouble.",
    body: (
      <p>
        First responders will ask questions about the last day, recent
        health, medications. Answering plainly is the fastest way
        through. You do not need to make any decisions about funeral
        homes, paperwork, or family notifications while they&rsquo;re
        there.
      </p>
    ),
  },
  {
    title: "There is nothing you have to figure out on the internet right now.",
    body: (
      <p>
        No calls. No forms. No funeral home decisions. Those can wait
        hours or days &mdash; not minutes. The site will still be here.
      </p>
    ),
  },
  {
    title: "Who shows up, and what they're doing.",
    body: (
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <strong>Paramedics</strong> arrive first and confirm the
          death. They cannot move your loved one without official
          confirmation.
        </li>
        <li>
          <strong>Police</strong> come along to rule out anything
          suspicious. This is routine for any unexpected at-home death
          &mdash; not accusatory.
        </li>
        <li>
          <strong>Medical examiner or coroner</strong> is called next.
          They decide whether the death needs further investigation or
          can be released directly to a funeral home of your choosing.
        </li>
        <li>
          You do not have to choose a funeral home in the first hour.
          If asked &ldquo;which funeral home do you want?&rdquo; it is
          completely fine to say &ldquo;I need a few hours&rdquo; or
          &ldquo;I haven&rsquo;t decided yet.&rdquo;
        </li>
        <li>
          If you feel pressured to decide on the spot, ask that your
          loved one be transported to the medical examiner&rsquo;s
          office or the local hospital morgue while you take time to
          compare. You do not have to commit at the door.
        </li>
      </ul>
    ),
  },
];

const STORAGE_KEY = "honestfuneral.guidance.home-unexpected.v1";

/**
 * Unexpected-death-at-home crisis screen. Full commercial suppression:
 * no pricing, no funeral home listings. 988 above the fold. The step
 * list uses the same one-step-at-a-time pattern as StepList — easier
 * cognitive load for someone in shock.
 */
export function CrisisUnexpected() {
  const [statuses, setStatuses] = useState<StepStatus[]>(() =>
    STEPS.map((_, i) => (i === 0 ? "current" : "hidden")),
  );
  const [hydrated, setHydrated] = useState(false);
  const [confusedSteps, setConfusedSteps] = useState<Record<number, boolean>>({});
  const currentStepRef = useRef<HTMLLIElement>(null);
  // Same scroll-on-hydration fix as StepList: suppress scrollIntoView
  // on initial mount so the page lands at the headline, not partway
  // down at step 1.
  const userInitiatedAdvanceRef = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StepStatus[];
        if (Array.isArray(parsed) && parsed.length === STEPS.length) {
          setStatuses(parsed);
        }
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
    } catch {
      // ignore
    }
  }, [statuses, hydrated]);

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

  const totalSteps = STEPS.length;
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
      const nextIdx = next.findIndex((s) => s === "hidden");
      if (nextIdx !== -1) next[nextIdx] = "current";
      return next;
    });
    setConfusedSteps((prev) => ({ ...prev, [index]: false }));
  }

  function toggleConfused(index: number) {
    setConfusedSteps((prev) => ({ ...prev, [index]: !prev[index] }));
  }

  return (
    <main className="flex-1 flex flex-col bg-bg">
      <JsonLd data={schema} />
      <SiteHeader showBack={false} />
      <section className="flex-1">
        <div className="max-w-xl mx-auto px-5 py-10 space-y-7">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              You&rsquo;re not alone in this.
            </h1>
            <p className="text-lg text-ink-soft">
              The first responders will take one to four hours. While
              they&rsquo;re there, you don&rsquo;t have to do anything
              except answer their questions. We&rsquo;re here when
              you&rsquo;re ready &mdash; we&rsquo;ve saved your place.
            </p>
          </div>

          <CrisisResources />

          <TimeCriticalBanner />

          {/* Sticky stepper — keeps every step's state visible. */}
          {hydrated && !allComplete && currentIndex !== -1 && (
            <div
              className="sticky top-0 z-20 -mx-5 px-5 py-3 bg-bg/95 backdrop-blur-md border-b border-border"
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
                  return (
                    <div
                      key={i}
                      className="flex-1 flex items-center min-w-0"
                    >
                      <div
                        className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold ${
                          isDone
                            ? "bg-good text-white"
                            : isSkipped
                              ? "bg-ink-muted/40 text-white"
                              : isCurrent
                                ? "bg-primary-deep text-white ring-2 ring-primary/30"
                                : "bg-surface-soft text-ink-muted border border-border"
                        }`}
                        title={`Step ${i + 1}: ${STEPS[i]?.title ?? ""}`}
                      >
                        {isDone || isSkipped ? "✓" : i + 1}
                      </div>
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

          <ol className="space-y-3">
            {STEPS.map((step, i) => {
              const status = statuses[i];
              if (status === "hidden") return null;

              const isCurrent = status === "current";
              const isDone = status === "done";
              const isSkipped = status === "skipped";

              if (isCurrent) {
                const isConfused = !!confusedSteps[i];
                return (
                  <li key={i} ref={currentStepRef} className="scroll-mt-32">
                    <div className="rounded-2xl border-2 border-border bg-surface p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-deep text-white font-serif text-base shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <h2 className="font-serif text-xl sm:text-2xl text-ink mb-3 leading-tight">
                            {step.title}
                          </h2>
                          <div className="text-ink-soft leading-relaxed text-base">
                            {step.body}
                          </div>
                        </div>
                      </div>

                      {isConfused && (
                        <div className="mt-4 mb-4 rounded-xl bg-surface-soft border border-border px-4 py-3">
                          <p className="text-sm text-ink-soft">
                            Take a breath. There&rsquo;s no deadline on
                            this. Read it again whenever you&rsquo;re
                            ready, or tap &ldquo;Skip&rdquo; to come back
                            later. None of this has to happen right now.
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3 mt-5">
                        <Button
                          size="lg"
                          onClick={() => advance(i, "done")}
                        >
                          ✓ Got it — next
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => advance(i, "skipped")}
                        >
                          Skip
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

              return (
                <li key={i}>
                  <div
                    className={`rounded-2xl border p-4 flex items-center gap-3 ${
                      isDone
                        ? "bg-good-soft border-good/30"
                        : "bg-surface-soft border-border"
                    }`}
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
                  </div>
                </li>
              );
            })}
          </ol>

          {allComplete && (
            <Card tone="primary">
              <div className="text-sm uppercase tracking-wider text-primary-deep mb-2">
                When you&rsquo;re ready
              </div>
              <h2 className="font-serif text-2xl text-ink mb-2">
                Let&rsquo;s figure out what kind of service fits.
              </h2>
              <p className="text-ink-soft mb-5">
                Four short questions. We&rsquo;ll recommend a service
                type that fits your faith, your family, and your budget.
                No account, nothing saved.
              </p>
              <LinkButton href="/decide" size="lg">
                Continue →
              </LinkButton>
            </Card>
          )}

          {!allComplete && (
            <div className="rounded-2xl border border-border bg-surface-soft p-6 space-y-3">
              <h2 className="font-serif text-xl text-ink">
                We&rsquo;ll be here when you&rsquo;re ready.
              </h2>
              <p className="text-ink-soft">
                First responders will take one to four hours. During that
                time, you don&rsquo;t have to do anything on this site.
                We&rsquo;ve saved your place &mdash; everything you see
                here will be here when you come back.
              </p>
            </div>
          )}

          <div className="text-center">
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
