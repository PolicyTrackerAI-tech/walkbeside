"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardTitle } from "@/components/ui/Card";

interface Task {
  id: string;
  title: string;
  body: string;
}

interface Phase {
  id: string;
  label: string;
  heading: string;
  intro: string;
  tasks: Task[];
}

const PHASES: Phase[] = [
  {
    id: "week-1",
    label: "Week 1",
    heading: "The first seven days",
    intro:
      "The funeral is either imminent or just happened. Two goals this week: stop the financial bleeding, and order enough death certificates.",
    tasks: [
      {
        id: "w1-certs",
        title: "Order 10–15 certified death certificates",
        body: "Every bank, insurer, and government agency wants a certified copy. Ten to fifteen covers almost every family. Order through the funeral home or direct from your state’s vital records office — vital records is usually cheaper.",
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
        body: "Look in their filing cabinet, safe, safe deposit box, or with their attorney. If there’s no will, the estate goes through probate under state intestate rules. Don’t panic if you can’t find it immediately — you have time.",
      },
    ],
  },
  {
    id: "weeks-2-4",
    label: "Weeks 2–4",
    heading: "The quiet admin middle",
    intro:
      "Most of the phone calls happen here. Pace yourself — nothing on this list is emergency-urgent, but it all adds up.",
    tasks: [
      {
        id: "w2-life-insurance",
        title: "File every life insurance claim you know about",
        body: "Each policy has its own claim form. You’ll need a certified death certificate per policy. If you don’t know which policies existed, use the free NAIC Life Insurance Policy Locator — most families have no idea it exists.",
      },
      {
        id: "w2-banks",
        title: "Notify banks and investment firms",
        body: "They will freeze accounts as soon as notified. Transfer anything you’ll need for funeral expenses before you notify — then notify. For jointly-held accounts with a survivor, this is straightforward. For individually-held, probate rules apply.",
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
        body: "USPS mail forwarding prevents an empty-house signal and helps surface accounts you didn’t know existed. Set up for six months.",
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
    heading: "What comes after the paperwork",
    intro:
      "Estate work stretches out. This list is shorter but higher-stakes. Most families settle in 6–18 months.",
    tasks: [
      {
        id: "m2-probate",
        title: "Start probate, or confirm you don’t need to",
        body: "If there’s a revocable living trust holding the assets, probate is usually not required. If there’s only a will or no will, probate is. Every state has different rules. An estate attorney consult is usually worth an hour of their time.",
      },
      {
        id: "m2-tax",
        title: "File their final income tax return",
        body: "A final 1040 is due for the portion of the year they were alive. If the estate earns income after death (investment dividends, for example), that’s a separate 1041 estate return.",
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

const STORAGE_KEY = "funerose.next30.v1";

export function NextThirtyDays() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDone(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(done));
    } catch {}
  }, [done, hydrated]);

  const total = useMemo(
    () => PHASES.reduce((sum, p) => sum + p.tasks.length, 0),
    [],
  );
  const completed = Object.values(done).filter(Boolean).length;

  function toggle(id: string) {
    setDone((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader backHref="/dashboard" backLabel="Dashboard" />

      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-10 space-y-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              The next 30 days
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              What actually needs to happen — in order.
            </h1>
            <p className="text-lg text-ink-soft">
              Three phases. Don&rsquo;t try to finish the whole list in one
              sitting. Check things off as you go &mdash; progress saves on this
              device.
            </p>
            {hydrated && (
              <p className="mt-4 text-sm text-ink-muted">
                {completed} of {total} done.
              </p>
            )}
          </div>

          {PHASES.map((phase) => (
            <div key={phase.id}>
              <div className="mb-4">
                <div className="text-xs uppercase tracking-wider text-primary-deep font-medium">
                  {phase.label}
                </div>
                <h2 className="font-serif text-2xl text-ink mt-1 mb-2">
                  {phase.heading}
                </h2>
                <p className="text-ink-soft">{phase.intro}</p>
              </div>
              <ul className="space-y-3">
                {phase.tasks.map((task) => {
                  const checked = !!done[task.id];
                  return (
                    <li key={task.id}>
                      <label
                        className={`flex gap-4 items-start rounded-2xl border p-5 cursor-pointer transition-colors ${
                          checked
                            ? "bg-good-soft border-good/30"
                            : "bg-surface border-border hover:border-primary"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(task.id)}
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
          ))}

          <Card tone="soft">
            <CardTitle>When you&rsquo;re ready, the estate side.</CardTitle>
            <p className="text-ink-soft">
              The full estate-settlement workflow &mdash; probate by state,
              inherited IRA playbooks, unclaimed property searches &mdash; is
              on the near-term roadmap. For now, this checklist covers the
              first month cleanly.
            </p>
          </Card>
        </div>
      </section>
    </main>
  );
}
