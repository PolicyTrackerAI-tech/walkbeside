"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { HelpFooter } from "@/components/HelpFooter";

interface Task {
  id: string;
  title: string;
  body: string;
}

interface Phase {
  id: string;
  label: string;
  /** One-liner shown when the phase is collapsed — sets expectations without listing tasks. */
  whenLabel: string;
  heading: string;
  intro: string;
  tasks: Task[];
}

const PHASES: Phase[] = [
  {
    id: "phase-0",
    label: "Funeral week",
    whenLabel: "Right now, before the service",
    heading: "Between the death and the service",
    intro:
      "The funeral hasn't happened yet. You're holding it together. These are the only things that need to happen before the service — everything else can wait.",
    tasks: [
      {
        id: "p0-certs-count",
        title: "Tell the funeral home how many death certificates you'll need",
        body: "Most families need 10–15. Order through the home at the time of death — the home usually passes through the state's base fee, and ordering later is slower and pricier. Need help estimating? The certificate calculator at /certificates walks you through who'll ask for one.",
      },
      {
        id: "p0-bereavement",
        title: "Tell the deceased's employer (if applicable)",
        body: "Even one phone call to HR triggers final-paycheck rules, employer-provided life-insurance claims, and bereavement-leave coordination for surviving family members who work there. Ask HR for a written list of every benefit and how to claim it.",
      },
      {
        id: "p0-obit",
        title: "Draft the obituary",
        body: "Newspaper and online obituaries can take 24–72 hours to publish. The funeral home needs the final text to coordinate with the local paper. Our obituary helper at /obituary asks a few questions and writes a first draft you can edit.",
      },
      {
        id: "p0-clothes",
        title: "Pick out clothes and personal effects",
        body: "If there will be a viewing or open casket, the funeral home needs an outfit. If cremation, the body is usually dressed simply or wrapped. Glasses, jewelry, and dentures are family decisions — they can be returned or buried/cremated with the body. There is no wrong answer.",
      },
      {
        id: "p0-notification-list",
        title: "Make a list of who needs to be told",
        body: "Two people, three people, ten — start small. Give the list to a friend or family member who's not too close to the loss to help make calls. You don't have to be the one telling everyone.",
      },
      {
        id: "p0-officiant",
        title: "Confirm who will lead the service",
        body: "Clergy, celebrant, family member, or no one at all — pick early so they can prepare. If you don't have someone, the funeral home can usually recommend a non-denominational celebrant for $200–$500.",
      },
    ],
  },
  {
    id: "week-1",
    label: "Week 1",
    whenLabel: "After the service, the first seven days",
    heading: "The first seven days",
    intro:
      "The funeral is either imminent or just happened. Two goals this week: stop the financial bleeding, and order enough death certificates.",
    tasks: [
      {
        id: "w1-certs",
        title: "Order 10–15 certified death certificates",
        body: "Every bank, insurer, and government agency wants a certified copy. Ten to fifteen covers almost every family. Order through the funeral home or direct from your state's vital records office — vital records is usually cheaper.",
      },
      {
        id: "w1-ss",
        title: "Notify Social Security",
        body: "Call 1-800-772-1213 or have the funeral home report it. Social Security may need to claw back the last payment received after the date of death. Any dependents may be entitled to survivor benefits — we flag that again in week 2.",
      },
      {
        id: "w1-freeze",
        title: "Freeze credit at all three bureaus",
        body: "Experian, Equifax, TransUnion. This prevents identity theft, which spikes around publicly-posted obituaries. Free and takes about 20 minutes online.",
      },
      {
        id: "w1-employer",
        title: "Notify their employer (if applicable)",
        body: "Final paycheck, any unused PTO payout, life-insurance-through-work payout. Ask HR for a written list of all employer-provided benefits and how to claim each one.",
      },
      {
        id: "w1-will",
        title: "Find the will, trust documents, and advance directives",
        body: "Look in their filing cabinet, safe, safe deposit box, or with their attorney. If there's no will, the estate goes through probate under state intestate rules. Don't panic if you can't find it immediately — you have time.",
      },
    ],
  },
  {
    id: "weeks-2-4",
    label: "Weeks 2–4",
    whenLabel: "The quiet admin middle",
    heading: "The quiet admin middle",
    intro:
      "Most of the phone calls happen here. Pace yourself — nothing on this list is emergency-urgent, but it all adds up.",
    tasks: [
      {
        id: "w2-life-insurance",
        title: "File every life insurance claim you know about",
        body: "Each policy has its own claim form. You'll need a certified death certificate per policy. If you don't know which policies existed, use the free NAIC Life Insurance Policy Locator — most families have no idea it exists.",
      },
      {
        id: "w2-banks",
        title: "Notify banks and investment firms",
        body: "They will freeze accounts as soon as notified. Transfer anything you'll need for funeral expenses before you notify — then notify. For jointly-held accounts with a survivor, this is straightforward. For individually-held, probate rules apply.",
      },
      {
        id: "w2-va",
        title: "Claim VA burial benefits if they were a veteran",
        body: "Up to $2,000 for service-connected death, several hundred otherwise. Consistently unclaimed. File VA Form 21P-530 within two years of death.",
      },
      {
        id: "w2-medicare",
        title: "Cancel Medicare and Medicaid",
        body: "Reported to Medicare via Social Security automatically, but confirm. If they had Medicare Advantage or a Part D plan, cancel that separately — those plans keep billing otherwise.",
      },
      {
        id: "w2-subs",
        title: "Cancel recurring subscriptions",
        body: "Streaming services, gym memberships, subscription boxes, software subscriptions. Check their email and bank statements for anything charging monthly.",
      },
      {
        id: "w2-mail",
        title: "Forward their mail",
        body: "USPS mail forwarding prevents an empty-house signal and helps surface accounts you didn't know existed. Set up for six months.",
      },
      {
        id: "w2-dmv",
        title: "Notify the DMV and cancel auto insurance (if applicable)",
        body: "If they had a vehicle registered in their name, the DMV needs to be told. Auto insurance can be cancelled or transferred depending on who owned the car.",
      },
    ],
  },
  {
    id: "month-2-plus",
    label: "Month 2+",
    whenLabel: "Estate work and long-tail items",
    heading: "What comes after the paperwork",
    intro:
      "Estate work stretches out. This list is shorter but higher-stakes. Most families settle in 6–18 months.",
    tasks: [
      {
        id: "m2-probate",
        title: "Start probate, or confirm you don't need to",
        body: "If there's a revocable living trust holding the assets, probate is usually not required. If there's only a will or no will, probate is. Every state has different rules. An estate attorney consult is usually worth an hour of their time.",
      },
      {
        id: "m2-tax",
        title: "File their final income tax return",
        body: "A final 1040 is due for the portion of the year they were alive. If the estate earns income after death (investment dividends, for example), that's a separate 1041 estate return.",
      },
      {
        id: "m2-retirement",
        title: "Handle inherited retirement accounts carefully",
        body: "Inherited IRA rules changed in 2020. Most non-spouse beneficiaries must drain the account within 10 years. Getting this wrong is expensive. Talk to a CPA or the retirement plan administrator before moving the money.",
      },
      {
        id: "m2-unclaimed",
        title: "Check state unclaimed property databases",
        body: "Every state has a database of dormant accounts, uncashed checks, safe deposit box contents, and abandoned property. Search each state they lived in. Free — and commonly produces a few hundred to a few thousand dollars.",
      },
      {
        id: "m2-digital",
        title: "Close or memorialize digital accounts",
        body: "Email, social media, cloud storage, password managers. Facebook and Instagram can be memorialized. Apple and Google have legacy-contact options. Close anything that could be hijacked.",
      },
      {
        id: "m2-headstone",
        title: "Order the headstone directly, not through the funeral home",
        body: "Funeral home markup on stones is among the highest in the industry. Buy from a monument company that services your cemetery — same stone, typically half the price.",
      },
    ],
  },
];

const STORAGE_KEY = "honestfuneral.next30.v1";
const EXPANDED_KEY = "honestfuneral.next30.expanded.v1";

type DoneMap = Record<string, boolean>;
type ExpandedOverrides = Record<string, boolean>;

/** A phase counts as complete only if every task is done. (Skipping isn't a concept here — checkbox only.) */
function phaseCompletedCount(phase: Phase, done: DoneMap): number {
  return phase.tasks.filter((t) => done[t.id]).length;
}

function phaseIsComplete(phase: Phase, done: DoneMap): boolean {
  return phaseCompletedCount(phase, done) === phase.tasks.length;
}

/** Current phase = first phase that's not yet fully complete. */
function deriveCurrentPhaseId(done: DoneMap): string {
  for (const p of PHASES) {
    if (!phaseIsComplete(p, done)) return p.id;
  }
  return PHASES[PHASES.length - 1].id;
}

export function NextThirtyDays() {
  const [done, setDone] = useState<DoneMap>({});
  const [expandedOverrides, setExpandedOverrides] = useState<ExpandedOverrides>(
    {},
  );
  const [hydrated, setHydrated] = useState(false);
  const [saveError, setSaveError] = useState(false);

  // Hydrate from localStorage.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDone(JSON.parse(raw));
    } catch {
      // ignore
    }
    try {
      const rawExp = localStorage.getItem(EXPANDED_KEY);
      if (rawExp) setExpandedOverrides(JSON.parse(rawExp));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // Persist done state.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(done));
    } catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSaveError(true);
    }
  }, [done, hydrated]);

  // Persist expanded overrides.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(EXPANDED_KEY, JSON.stringify(expandedOverrides));
    } catch {
      // ignore
    }
  }, [expandedOverrides, hydrated]);

  const total = useMemo(
    () => PHASES.reduce((sum, p) => sum + p.tasks.length, 0),
    [],
  );
  const completed = Object.values(done).filter(Boolean).length;
  const currentPhaseId = useMemo(() => deriveCurrentPhaseId(done), [done]);

  function toggleTask(id: string) {
    setDone((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function togglePhase(phaseId: string, currentlyExpanded: boolean) {
    setExpandedOverrides((prev) => ({
      ...prev,
      [phaseId]: !currentlyExpanded,
    }));
  }

  function isExpanded(phaseId: string): boolean {
    if (phaseId in expandedOverrides) return expandedOverrides[phaseId];
    // Default: only the current phase is expanded.
    return phaseId === currentPhaseId;
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
                {completed} of {total} done so far.
              </p>
            )}
            {hydrated && saveError && (
              <Card tone="warn" className="!p-4 mt-3">
                <p className="text-sm text-ink">
                  Your browser blocked saving progress to this device. We
                  won&rsquo;t remember it next session.
                </p>
              </Card>
            )}
          </div>

          {/* Timeline stepper — visual orientation across the four phases. */}
          <Timeline
            phases={PHASES}
            currentPhaseId={currentPhaseId}
            done={done}
            hydrated={hydrated}
          />

          {/* Phase accordion. */}
          <div className="space-y-3">
            {PHASES.map((phase) => {
              const phaseDone = phaseCompletedCount(phase, done);
              const phaseTotal = phase.tasks.length;
              const isComplete = phaseDone === phaseTotal;
              const isCurrent = phase.id === currentPhaseId;
              const expanded = isExpanded(phase.id);
              return (
                <PhaseCard
                  key={phase.id}
                  phase={phase}
                  expanded={expanded}
                  isCurrent={isCurrent}
                  isComplete={isComplete}
                  doneCount={phaseDone}
                  totalCount={phaseTotal}
                  done={done}
                  onToggleTask={toggleTask}
                  onTogglePhase={() => togglePhase(phase.id, expanded)}
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
  done,
  hydrated,
}: {
  phases: Phase[];
  currentPhaseId: string;
  done: DoneMap;
  hydrated: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-5 py-4">
      <div className="text-xs uppercase tracking-wider text-ink-muted mb-3">
        Where you are
      </div>
      <ol className="flex items-start gap-2">
        {phases.map((phase, i) => {
          const complete = phaseIsComplete(phase, done);
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
  expanded,
  isCurrent,
  isComplete,
  doneCount,
  totalCount,
  done,
  onToggleTask,
  onTogglePhase,
}: {
  phase: Phase;
  expanded: boolean;
  isCurrent: boolean;
  isComplete: boolean;
  doneCount: number;
  totalCount: number;
  done: DoneMap;
  onToggleTask: (id: string) => void;
  onTogglePhase: () => void;
}) {
  const headerTone = isComplete
    ? "bg-good-soft border-good/30"
    : isCurrent
      ? "bg-primary-soft border-primary"
      : "bg-surface border-border";

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
        <div className="border-t border-border bg-surface px-5 py-5 space-y-4">
          <p className="text-ink-soft">{phase.intro}</p>
          <ul className="space-y-3">
            {phase.tasks.map((task) => {
              const checked = !!done[task.id];
              return (
                <li key={task.id}>
                  <label
                    className={`flex gap-4 items-start rounded-2xl border p-4 cursor-pointer transition-colors ${
                      checked
                        ? "bg-good-soft border-good/30"
                        : "bg-surface border-border hover:border-primary"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleTask(task.id)}
                      className="mt-1 w-5 h-5 accent-primary-deep shrink-0"
                    />
                    <div className="flex-1">
                      <div
                        className={`font-medium ${
                          checked
                            ? "text-ink-muted line-through"
                            : "text-ink"
                        }`}
                      >
                        {task.title}
                      </div>
                      <p
                        className={`text-sm mt-1 ${
                          checked ? "text-ink-muted" : "text-ink-soft"
                        }`}
                      >
                        {task.body}
                      </p>
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {!expanded && !isCurrent && !isComplete && (
        <div className="border-t border-border px-5 py-3 bg-surface-soft/50">
          <p className="text-xs text-ink-muted italic">
            Don&rsquo;t worry about this yet — it&rsquo;s for later. We&rsquo;ll
            open it automatically when you&rsquo;re ready.
          </p>
        </div>
      )}
    </div>
  );
}
