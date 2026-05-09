"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { HelpFooter } from "@/components/HelpFooter";
import { DECIDE_STORAGE_KEYS, readDecide } from "@/lib/faith-storage";
import type { ServiceType } from "@/lib/pricing-data";
import {
  PHASES,
  type Phase,
  type Task,
  type UserContext,
  type HelpAction,
  type IsVeteran,
} from "./tasks";

const STORAGE_KEY = "honestfuneral.next30.v1";
const EXPANDED_KEY = "honestfuneral.next30.expanded.v1";

type Status = "todo" | "done" | "skipped";
type StatusMap = Record<string, Status>;
type ExpandedOverrides = Record<string, boolean>;
type HelpOpenMap = Record<string, boolean>;

function applicableTasks(phase: Phase, ctx: UserContext): Task[] {
  return phase.tasks.filter((t) => !t.applicableWhen || t.applicableWhen(ctx));
}

function phaseDoneCount(phase: Phase, statuses: StatusMap, ctx: UserContext): number {
  return applicableTasks(phase, ctx).filter(
    (t) => statuses[t.id] === "done" || statuses[t.id] === "skipped",
  ).length;
}

function phaseIsComplete(phase: Phase, statuses: StatusMap, ctx: UserContext): boolean {
  const apps = applicableTasks(phase, ctx);
  if (apps.length === 0) return true;
  return phaseDoneCount(phase, statuses, ctx) === apps.length;
}

function deriveCurrentPhaseId(statuses: StatusMap, ctx: UserContext): string {
  for (const p of PHASES) {
    if (!phaseIsComplete(p, statuses, ctx)) return p.id;
  }
  return PHASES[PHASES.length - 1].id;
}

function readUserContext(): UserContext {
  return {
    serviceType:
      (readDecide(DECIDE_STORAGE_KEYS.recommendedServiceType) as
        | ServiceType
        | null) ?? undefined,
    bodyAtService:
      (readDecide(DECIDE_STORAGE_KEYS.bodyAtService) as
        | "yes"
        | "no"
        | "unsure"
        | null) ?? undefined,
    isVeteran:
      (readDecide(DECIDE_STORAGE_KEYS.isVeteran) as IsVeteran | null) ??
      undefined,
  };
}

export function NextThirtyDays() {
  const [statuses, setStatuses] = useState<StatusMap>({});
  const [expandedOverrides, setExpandedOverrides] = useState<ExpandedOverrides>(
    {},
  );
  const [helpOpen, setHelpOpen] = useState<HelpOpenMap>({});
  const [ctx, setCtx] = useState<UserContext>({});
  const [hydrated, setHydrated] = useState(false);

  // Hydrate.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        // Migrate the old shape (Record<string, boolean>) to the new
        // Status enum so existing users don't lose progress.
        const parsed = JSON.parse(raw) as
          | Record<string, boolean>
          | Record<string, Status>;
        const migrated: StatusMap = {};
        for (const [k, v] of Object.entries(parsed)) {
          if (v === true) migrated[k] = "done";
          else if (v === "done" || v === "skipped" || v === "todo") {
            migrated[k] = v;
          }
        }
        setStatuses(migrated);
      }
    } catch {
      // ignore
    }
    try {
      const rawExp = localStorage.getItem(EXPANDED_KEY);
      if (rawExp) setExpandedOverrides(JSON.parse(rawExp));
    } catch {
      // ignore
    }
    setCtx(readUserContext());
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
    try {
      localStorage.setItem(EXPANDED_KEY, JSON.stringify(expandedOverrides));
    } catch {
      // ignore
    }
  }, [expandedOverrides, hydrated]);

  const totalApplicable = useMemo(
    () => PHASES.reduce((sum, p) => sum + applicableTasks(p, ctx).length, 0),
    [ctx],
  );
  const completedApplicable = useMemo(() => {
    let n = 0;
    for (const p of PHASES) {
      n += phaseDoneCount(p, statuses, ctx);
    }
    return n;
  }, [statuses, ctx]);
  const currentPhaseId = useMemo(
    () => deriveCurrentPhaseId(statuses, ctx),
    [statuses, ctx],
  );

  function setStatus(taskId: string, status: Status) {
    setStatuses((prev) => ({ ...prev, [taskId]: status }));
    // Closing help when user advances keeps the next task clean.
    setHelpOpen((prev) => ({ ...prev, [taskId]: false }));
  }

  function togglePhase(phaseId: string, currentlyExpanded: boolean) {
    setExpandedOverrides((prev) => ({
      ...prev,
      [phaseId]: !currentlyExpanded,
    }));
  }

  function isPhaseExpanded(phaseId: string): boolean {
    if (phaseId in expandedOverrides) return expandedOverrides[phaseId];
    return phaseId === currentPhaseId;
  }

  function toggleHelp(taskId: string) {
    setHelpOpen((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  }

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader backHref="/dashboard" backLabel="Dashboard" />

      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-10 space-y-7">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              The next 30 days
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              What actually needs to happen — in order.
            </h1>
            <p className="text-lg text-ink-soft">
              Four stretches. We&rsquo;ll show you the one you&rsquo;re on
              and keep the rest tucked away until you need them.
            </p>
            {hydrated && (
              <p className="mt-4 text-sm text-ink-muted">
                {completedApplicable} of {totalApplicable} done so far.
              </p>
            )}
          </div>

          <Timeline
            phases={PHASES}
            currentPhaseId={currentPhaseId}
            statuses={statuses}
            ctx={ctx}
            hydrated={hydrated}
          />

          <div className="space-y-3">
            {PHASES.map((phase) => {
              const apps = applicableTasks(phase, ctx);
              const phaseDone = phaseDoneCount(phase, statuses, ctx);
              const phaseTotal = apps.length;
              const isComplete = phaseTotal > 0 && phaseDone === phaseTotal;
              const isCurrent = phase.id === currentPhaseId;
              const expanded = isPhaseExpanded(phase.id);
              return (
                <PhaseCard
                  key={phase.id}
                  phase={phase}
                  applicableTasks={apps}
                  expanded={expanded}
                  isCurrent={isCurrent}
                  isComplete={isComplete}
                  doneCount={phaseDone}
                  totalCount={phaseTotal}
                  statuses={statuses}
                  helpOpen={helpOpen}
                  ctx={ctx}
                  onSetStatus={setStatus}
                  onTogglePhase={() => togglePhase(phase.id, expanded)}
                  onToggleHelp={toggleHelp}
                />
              );
            })}
          </div>

          <Card tone="soft">
            <CardTitle>When you&rsquo;re ready, the estate side.</CardTitle>
            <p className="text-ink-soft">
              The full estate-settlement workflow &mdash; probate by state,
              inherited IRA playbooks, unclaimed property searches &mdash; is
              on the near-term roadmap. For now, this checklist covers the
              first month cleanly.
            </p>
          </Card>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}

/* --- Timeline stepper ----------------------------------------------------- */

function Timeline({
  phases,
  currentPhaseId,
  statuses,
  ctx,
  hydrated,
}: {
  phases: Phase[];
  currentPhaseId: string;
  statuses: StatusMap;
  ctx: UserContext;
  hydrated: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-5 py-4">
      <div className="text-xs uppercase tracking-wider text-ink-muted mb-3">
        Where you are
      </div>
      <ol className="flex items-start gap-2">
        {phases.map((phase, i) => {
          const complete = phaseIsComplete(phase, statuses, ctx);
          const isCurrent = hydrated && phase.id === currentPhaseId;
          const isLast = i === phases.length - 1;
          return (
            <li key={phase.id} className="flex-1">
              <div className="flex items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                    complete
                      ? "bg-good text-white"
                      : isCurrent
                        ? "bg-primary-deep text-white ring-4 ring-primary/20"
                        : "bg-surface-soft text-ink-muted border border-border"
                  }`}
                >
                  {complete ? "✓" : i + 1}
                </div>
                {!isLast && (
                  <div
                    className={`flex-1 h-1 mx-1 rounded-full ${
                      complete ? "bg-good/40" : "bg-border"
                    }`}
                  />
                )}
              </div>
              <div
                className={`mt-2 text-[11px] uppercase tracking-wider ${
                  isCurrent
                    ? "text-primary-deep font-semibold"
                    : complete
                      ? "text-ink-soft"
                      : "text-ink-muted"
                }`}
              >
                {phase.label}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* --- Phase card (collapsible) -------------------------------------------- */

function PhaseCard({
  phase,
  applicableTasks,
  expanded,
  isCurrent,
  isComplete,
  doneCount,
  totalCount,
  statuses,
  helpOpen,
  ctx,
  onSetStatus,
  onTogglePhase,
  onToggleHelp,
}: {
  phase: Phase;
  applicableTasks: Task[];
  expanded: boolean;
  isCurrent: boolean;
  isComplete: boolean;
  doneCount: number;
  totalCount: number;
  statuses: StatusMap;
  helpOpen: HelpOpenMap;
  ctx: UserContext;
  onSetStatus: (taskId: string, status: Status) => void;
  onTogglePhase: () => void;
  onToggleHelp: (taskId: string) => void;
}) {
  const headerTone = isComplete
    ? "bg-good-soft border-good/30"
    : isCurrent
      ? "bg-primary-soft border-primary"
      : "bg-surface border-border";

  // Find the first task that's not done/skipped — that's the "current task" within this phase.
  const currentTaskIndex = applicableTasks.findIndex(
    (t) => statuses[t.id] !== "done" && statuses[t.id] !== "skipped",
  );

  return (
    <div className={`rounded-2xl border-2 overflow-hidden ${headerTone}`}>
      <button
        onClick={onTogglePhase}
        className="w-full px-5 py-4 text-left flex items-start gap-4"
        aria-expanded={expanded}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs uppercase tracking-wider text-ink-muted font-medium">
              {phase.label}
            </span>
            {isCurrent && !isComplete && (
              <span className="text-[10px] uppercase tracking-wider bg-primary-deep text-white px-2 py-0.5 rounded-full">
                You&rsquo;re here
              </span>
            )}
            {isComplete && (
              <span className="text-[10px] uppercase tracking-wider bg-good text-white px-2 py-0.5 rounded-full">
                ✓ Done
              </span>
            )}
          </div>
          <h2 className="font-serif text-xl text-ink mt-1">
            {phase.heading}
          </h2>
          <p className="text-sm text-ink-soft mt-1">
            {phase.whenLabel} &middot; {doneCount} of {totalCount} done
          </p>
        </div>
        <span
          className="text-ink-muted text-xl leading-none pt-1 shrink-0"
          aria-hidden
        >
          {expanded ? "−" : "+"}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-border bg-surface px-5 py-5 space-y-3">
          <p className="text-ink-soft">{phase.intro}</p>

          {applicableTasks.length === 0 ? (
            <p className="text-sm text-ink-muted italic">
              Based on your earlier answers, nothing in this phase applies
              to your situation.
            </p>
          ) : (
            <ol className="space-y-2.5">
              {applicableTasks.map((task, i) => {
                const status = statuses[task.id] ?? "todo";
                const isCurrentTask = i === currentTaskIndex && !isComplete;
                if (status === "done" || status === "skipped") {
                  return (
                    <li key={task.id}>
                      <CompletedTaskRow
                        task={task}
                        status={status}
                        onUndo={() => onSetStatus(task.id, "todo")}
                      />
                    </li>
                  );
                }
                if (isCurrentTask) {
                  return (
                    <li key={task.id}>
                      <CurrentTaskCard
                        task={task}
                        ctx={ctx}
                        helpOpen={!!helpOpen[task.id]}
                        onDone={() => onSetStatus(task.id, "done")}
                        onSkip={() => onSetStatus(task.id, "skipped")}
                        onToggleHelp={() => onToggleHelp(task.id)}
                      />
                    </li>
                  );
                }
                // Not-yet-current todo task within this phase: collapsed preview.
                return (
                  <li key={task.id}>
                    <UpcomingTaskRow task={task} />
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      )}

      {!expanded && !isCurrent && !isComplete && (
        <div className="border-t border-border px-5 py-3 bg-surface-soft/50">
          <p className="text-xs text-ink-muted italic">
            Don&rsquo;t worry about this yet — it&rsquo;s for later.
            We&rsquo;ll open it automatically when you&rsquo;re ready.
          </p>
        </div>
      )}
    </div>
  );
}

/* --- Per-task UI variants ------------------------------------------------- */

function CurrentTaskCard({
  task,
  ctx,
  helpOpen,
  onDone,
  onSkip,
  onToggleHelp,
}: {
  task: Task;
  ctx: UserContext;
  helpOpen: boolean;
  onDone: () => void;
  onSkip: () => void;
  onToggleHelp: () => void;
}) {
  const note = task.contextNote?.(ctx) ?? null;
  const help = task.help;

  return (
    <div className="rounded-2xl border-2 border-primary/40 bg-surface p-5">
      <h3 className="font-serif text-lg text-ink mb-2">{task.title}</h3>
      {note && (
        <p className="text-xs uppercase tracking-wider text-primary-deep font-medium mb-2">
          {note}
        </p>
      )}
      <p className="text-sm text-ink-soft leading-relaxed mb-4">{task.body}</p>

      {help && (
        <div className="mb-4">
          <button
            onClick={onToggleHelp}
            className="text-sm font-medium text-primary-deep underline-offset-2 hover:underline"
            aria-expanded={helpOpen}
          >
            {helpOpen ? "Hide help" : help.label}
          </button>
          {helpOpen && (
            <div className="mt-3 rounded-xl bg-primary-soft/40 border border-primary/20 px-4 py-3">
              <HelpActionRenderer help={help} />
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button onClick={onDone}>✓ Mark done</Button>
        <Button variant="ghost" onClick={onSkip}>
          Skip — doesn&rsquo;t apply to us
        </Button>
      </div>
    </div>
  );
}

function CompletedTaskRow({
  task,
  status,
  onUndo,
}: {
  task: Task;
  status: "done" | "skipped";
  onUndo: () => void;
}) {
  const isDone = status === "done";
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-3 ${
        isDone ? "bg-good-soft/60 border-good/30" : "bg-surface-soft border-border"
      }`}
    >
      <span
        className={`text-base font-bold ${
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
        {task.title}
      </span>
      {!isDone && (
        <span className="text-xs text-ink-muted">(skipped)</span>
      )}
      <button
        onClick={onUndo}
        className="text-xs text-ink-muted hover:text-ink-soft underline-offset-2 hover:underline"
      >
        Undo
      </button>
    </div>
  );
}

function UpcomingTaskRow({ task }: { task: Task }) {
  return (
    <div className="rounded-xl border border-border bg-surface-soft/50 px-4 py-3">
      <p className="text-sm text-ink-muted">
        <span className="font-medium text-ink-soft">Next up:</span>{" "}
        {task.title}
      </p>
    </div>
  );
}

/* --- Help action renderer ------------------------------------------------- */

function HelpActionRenderer({ help }: { help: HelpAction }) {
  if (help.kind === "internal-link") {
    return (
      <div className="space-y-2">
        <p className="text-sm text-ink leading-relaxed">{help.description}</p>
        <Link
          href={help.href}
          className="inline-block text-sm font-medium text-primary-deep underline-offset-2 hover:underline"
        >
          Open →
        </Link>
      </div>
    );
  }

  if (help.kind === "external-link") {
    return (
      <div className="space-y-2">
        <p className="text-sm text-ink leading-relaxed">{help.description}</p>
        <a
          href={help.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm font-medium text-primary-deep underline-offset-2 hover:underline"
        >
          Open →
        </a>
      </div>
    );
  }

  if (help.kind === "phone") {
    return (
      <div className="space-y-2">
        <a
          href={`tel:${help.number}`}
          className="block text-base font-semibold text-primary-deep underline-offset-2 hover:underline"
        >
          {help.label}
        </a>
        <p className="text-sm text-ink leading-relaxed whitespace-pre-line">
          {help.description}
        </p>
      </div>
    );
  }

  if (help.kind === "expander") {
    return (
      <div className="space-y-2">
        <p className="text-sm text-ink leading-relaxed">{help.description}</p>
        <pre className="text-sm text-ink leading-relaxed whitespace-pre-wrap font-sans bg-surface rounded-lg border border-border p-3">
          {help.details}
        </pre>
      </div>
    );
  }

  // coming-soon
  return (
    <p className="text-sm text-ink-soft italic leading-relaxed">
      {help.description}
    </p>
  );
}
