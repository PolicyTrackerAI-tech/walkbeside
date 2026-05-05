"use client";

import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { CrisisResources } from "@/components/CrisisResources";
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

// TODO-FD: please redline the medical-examiner and coroner specifics
// in step 5 below before this ships.
const STEPS: Step[] = [
  {
    title: "Call 911 if you haven't.",
    body: (
      <p>
        A medical professional has to legally pronounce the death. Police
        and possibly a coroner will come. That is procedural in any
        unexpected death &mdash; it does not mean anything is wrong.
      </p>
    ),
  },
  {
    title: "While you wait for them to arrive.",
    body: (
      <ul className="list-disc pl-5 space-y-2">
        <li>
          Don&rsquo;t move the body. Until pronouncement, this is a death
          scene &mdash; not because anything is wrong, but because
          that&rsquo;s the procedure.
        </li>
        <li>
          Unlock the door if you can, so EMS doesn&rsquo;t have to break
          it.
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
        First responders will ask questions. Answering honestly is the
        fastest way through. You do not need to make any decisions about
        funeral homes, paperwork, or family notifications while they are
        there.
      </p>
    ),
  },
  {
    title: "There is nothing you have to do on the internet right now.",
    body: (
      <p>
        No calls. No forms. No funeral home decisions. Those can wait
        hours or days &mdash; not minutes.
      </p>
    ),
  },
  {
    title: "What happens when EMS, police, or the medical examiner arrive.",
    body: (
      <ul className="list-disc pl-5 space-y-2">
        <li>
          Police will arrive. They will ask questions. This is procedural
          for any unexpected at-home death &mdash; not accusatory.
        </li>
        <li>
          The medical examiner or coroner is called. They decide whether
          the death needs an investigation or can be released directly to
          a funeral home of your choosing.
        </li>
        <li>
          You do not have to choose a funeral home in the first hour. If
          asked &ldquo;which funeral home do you want?&rdquo; it is okay
          to say &ldquo;I need to make a call&rdquo; or &ldquo;I
          haven&rsquo;t decided yet.&rdquo;
        </li>
        <li>
          If you feel pressured to decide on the spot, you can request
          the body be transported to the medical examiner&rsquo;s office
          or the local hospital morgue while you decide. You do not have
          to commit on the spot.
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

          {/* Progress bar */}
          {hydrated && !allComplete && currentIndex !== -1 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wider text-ink-muted font-medium">
                  Step {currentIndex + 1} of {totalSteps}
                </span>
                {completedSteps > 0 && (
                  <span className="text-xs text-ink-muted">
                    {completedSteps} done
                  </span>
                )}
              </div>
              <div
                className="h-1.5 bg-surface-soft rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={completedSteps}
                aria-valuemin={0}
                aria-valuemax={totalSteps}
              >
                <div
                  className="h-full bg-primary-deep transition-all duration-500"
                  style={{
                    width: `${(completedSteps / totalSteps) * 100}%`,
                  }}
                />
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
                  <li key={i} ref={currentStepRef}>
                    <div className="rounded-2xl border-2 border-border bg-surface p-6 scroll-mt-4">
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
        </div>
      </section>
    </main>
  );
}
