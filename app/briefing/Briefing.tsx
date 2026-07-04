"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PrintHeader, PrintFooter } from "@/components/print/PrintHeader";
import { snapshotHousehold } from "@/lib/household-link";
import { parseHouseholdView, type HouseholdView } from "@/lib/household-view";
import { readPlan, type PlanState } from "@/lib/plan-now";
import { PHASES } from "@/app/next-30-days/tasks";
import { SERVICE_LABELS, type ServiceType } from "@/lib/pricing-data";

/**
 * The consolidated family briefing (roadmap Phase 2) — one PRINTED page that
 * answers "where does everything stand?" for an out-of-town relative, the
 * folder with the important documents, or the fridge door. Rolls up the
 * family's own on-device data (plan, checklist + assignees, contacts,
 * documents) — nothing fetched, nothing sent; reuses the household-view
 * parser so a corrupted key can never break the page.
 */

const DOC_LABEL: Record<string, string> = {
  "have-it": "have it",
  "need-to-find": "need to find",
  ordered: "ordered",
  lost: "lost — replacing",
};

const CONTACT_LABEL: Record<string, string> = {
  todo: "still to reach",
  called: "called",
  emailed: "emailed",
  "in-person": "told in person",
  skipped: "skipped",
};

export function Briefing() {
  const [view, setView] = useState<HouseholdView | null>(null);
  const [plan, setPlan] = useState<PlanState | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating from sessionStorage/localStorage, which is only readable client-side after mount
    setView(parseHouseholdView(snapshotHousehold()));
    setPlan(readPlan());
  }, []);

  if (!view) return null;

  const svcLabel =
    view.recommendedServiceType && view.recommendedServiceType in SERVICE_LABELS
      ? SERVICE_LABELS[view.recommendedServiceType as ServiceType]
      : plan?.path && plan.path in SERVICE_LABELS
        ? SERVICE_LABELS[plan.path as ServiceType]
        : undefined;

  const doneCount = Object.values(view.taskProgress).filter((s) => s === "done").length;
  const openTasks = PHASES.flatMap((phase) =>
    phase.tasks
      .filter((t) => view.taskProgress[t.id] !== "done" && view.taskProgress[t.id] !== "skipped")
      .filter((t) => view.taskAssignees[t.id] || view.taskProgress[t.id])
      .map((t) => ({ phase: phase.label, title: t.title, assignee: view.taskAssignees[t.id] })),
  );
  const todoContacts = view.contacts.filter((c) => c.status === "todo");
  const reachedContacts = view.contacts.filter((c) => c.status !== "todo");
  const missingDocs = view.vaultDocs.filter((d) => d.status !== "have-it");
  const haveDocs = view.vaultDocs.filter((d) => d.status === "have-it");
  const isEmpty =
    view.vaultDocs.length === 0 &&
    view.contacts.length === 0 &&
    Object.keys(view.taskProgress).length === 0 &&
    !plan;

  return (
    <main className="flex-1 flex flex-col">
      <div className="print:hidden">
        <SiteHeader rightSlot={<BackLink defaultHref="/dashboard" defaultLabel="← Dashboard" />} />
      </div>

      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-10 space-y-6 print:py-0 print:space-y-4">
          <PrintHeader
            title="The family briefing"
            subtitle="Where everything stands — from the family's own records"
          />

          <div className="print:hidden">
            <CardEyebrow>The family briefing</CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-3">
              Everything, on one page.
            </h1>
            <p className="text-ink-soft">
              A rollup of your plan, checklist, contact list, and documents —
              built from what&rsquo;s already on this device, sent nowhere.
              Print it for the folder, the fridge, or the relative who wants
              to know where things stand without twelve phone calls.
            </p>
            {isEmpty && (
              <p className="text-sm text-ink-muted mt-3">
                Nothing here yet — the briefing fills in as you use{" "}
                <Link href="/next-30-days" className="text-primary-deep underline">the checklist</Link>,{" "}
                <Link href="/notifications" className="text-primary-deep underline">notifications</Link>,{" "}
                <Link href="/vault" className="text-primary-deep underline">the vault</Link>, and{" "}
                <Link href="/plan-now" className="text-primary-deep underline">the family plan</Link>.
              </p>
            )}
          </div>

          {(plan || svcLabel) && (
            <Card>
              <h2 className="font-serif text-lg text-ink">The plan</h2>
              <div className="mt-2 space-y-1 text-sm text-ink">
                {svcLabel && (
                  <p>
                    <span className="text-ink-muted">Path:</span> {svcLabel}
                  </p>
                )}
                {plan?.pointPerson.trim() && (
                  <p>
                    <span className="text-ink-muted">Point person (makes the first call):</span>{" "}
                    <strong>{plan.pointPerson.trim()}</strong>
                  </p>
                )}
                {plan?.wishes.trim() && (
                  <p className="whitespace-pre-wrap">
                    <span className="text-ink-muted">Wishes:</span> {plan.wishes.trim()}
                  </p>
                )}
                {plan?.faithNotes.trim() && (
                  <p>
                    <span className="text-ink-muted">Tradition:</span> {plan.faithNotes.trim()}
                  </p>
                )}
              </div>
            </Card>
          )}

          {Object.keys(view.taskProgress).length + openTasks.length > 0 && (
            <Card>
              <h2 className="font-serif text-lg text-ink">
                The checklist — {doneCount} done
              </h2>
              {openTasks.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm">
                  {openTasks.map((t) => (
                    <li key={t.title} className="flex flex-wrap justify-between gap-x-4 text-ink">
                      <span>◻ {t.title}</span>
                      <span className="text-ink-muted">
                        {t.assignee ? `${t.assignee} is on it` : t.phase}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-ink-muted mt-2">
                Full list with help for every task: honestfuneral.co/next-30-days
              </p>
            </Card>
          )}

          {view.contacts.length > 0 && (
            <Card>
              <h2 className="font-serif text-lg text-ink">
                Who&rsquo;s been told — {reachedContacts.length} of {view.contacts.length}
              </h2>
              {todoContacts.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm">
                  {todoContacts.map((c, i) => (
                    <li key={`${c.name}-${i}`} className="flex flex-wrap justify-between gap-x-4 text-ink">
                      <span>
                        ◻ {c.name}
                        {c.relationship && <span className="text-ink-muted"> — {c.relationship}</span>}
                      </span>
                      <span className="text-ink-muted">
                        {c.assignee ? `${c.assignee} is on it` : CONTACT_LABEL[c.status]}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {todoContacts.length === 0 && (
                <p className="text-sm text-good mt-2">Everyone on the list has been reached.</p>
              )}
            </Card>
          )}

          {view.vaultDocs.length > 0 && (
            <Card>
              <h2 className="font-serif text-lg text-ink">
                Documents — {haveDocs.length} on hand
                {missingDocs.length > 0 && `, ${missingDocs.length} to find`}
              </h2>
              {missingDocs.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm">
                  {missingDocs.map((d, i) => (
                    <li key={`${d.type}-${i}`} className="flex flex-wrap justify-between gap-x-4 text-ink">
                      <span>
                        ◻ {d.type}
                        {d.location && <span className="text-ink-muted"> — {d.location}</span>}
                      </span>
                      <span className="text-ink-muted">
                        {d.assignee ? `${d.assignee} is on it` : (DOC_LABEL[d.status] ?? d.status)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {haveDocs.length > 0 && (
                <p className="text-xs text-ink-muted mt-2">
                  On hand: {haveDocs.map((d) => d.type).join(" · ")}
                </p>
              )}
            </Card>
          )}

          <div className="flex flex-wrap gap-3 print:hidden">
            <Button onClick={() => window.print()} disabled={isEmpty}>
              Print / Save as PDF
            </Button>
          </div>

          <p className="text-sm text-ink-soft print:hidden">
            Want relatives to see this live, without printing? The{" "}
            <Link href="/family" className="text-primary-deep underline">
              family view link
            </Link>{" "}
            updates automatically as things change.
          </p>

          <PrintFooter />
        </div>
      </section>
    </main>
  );
}
