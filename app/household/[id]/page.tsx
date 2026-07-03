import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { parseHouseholdView } from "@/lib/household-view";
import { PHASES } from "@/app/next-30-days/tasks";
import { SERVICE_LABELS, type ServiceType } from "@/lib/pricing-data";
import {
  householdAvailable,
  serviceClient,
  isUuid,
} from "@/app/api/household/service";

export const metadata: Metadata = {
  title: "Family view | Honest Funeral",
  robots: { index: false, follow: false },
};

const DOC_LABEL: Record<string, string> = {
  "have-it": "have it",
  "need-to-find": "need to find",
  ordered: "ordered",
  lost: "lost — replacing",
};

const CONTACT_LABEL: Record<string, string> = {
  todo: "to reach",
  called: "called",
  emailed: "emailed",
  "in-person": "told in person",
  skipped: "skipped",
};

/**
 * The read-only family view. Whoever holds the link sees the point person's
 * last-published state — nothing here writes anything, and nothing hydrates
 * into the viewer's own browser (unlike /resume, which hands the whole
 * session over). Expired/revoked slugs get a calm dead-end.
 */
export default async function HouseholdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let row: { payload: Record<string, string>; updated_at: string } | null = null;
  let state: "ok" | "gone" | "unavailable" = "unavailable";
  if (householdAvailable() && isUuid(id)) {
    const { data } = await serviceClient()
      .from("household_links")
      .select("payload, updated_at, expires_at, revoked_at")
      .eq("id", id)
      .maybeSingle();
    if (!data || data.revoked_at || new Date(data.expires_at) < new Date()) {
      state = "gone";
    } else {
      state = "ok";
      row = data as { payload: Record<string, string>; updated_at: string };
    }
  } else if (householdAvailable()) {
    state = "gone";
  }

  if (state !== "ok" || !row) {
    return (
      <main className="flex-1 flex flex-col">
        <SiteHeader />
        <section className="flex-1">
          <div className="max-w-xl mx-auto px-5 py-16 space-y-4">
            <h1 className="font-serif text-3xl text-ink leading-tight">
              {state === "gone"
                ? "This family link has expired or been replaced."
                : "The family view isn't available right now."}
            </h1>
            <p className="text-ink-soft">
              {state === "gone"
                ? "Links expire for the family's privacy, and the person coordinating can rotate them at any time. Ask them to send you a fresh link — it takes them one tap."
                : "Try again in a little while, or ask the person who sent it to re-share."}
            </p>
            <p className="text-sm text-ink-muted">
              Honest Funeral is free help for families handling a funeral —
              price checking, paperwork, and calm guidance.{" "}
              <Link href="/" className="text-primary-deep underline">
                honestfuneral.co
              </Link>
            </p>
          </div>
        </section>
      </main>
    );
  }

  const view = parseHouseholdView(row.payload ?? {});
  const updated = new Date(row.updated_at);
  const doneCount = Object.values(view.taskProgress).filter((s) => s === "done").length;
  const svcLabel =
    view.recommendedServiceType && view.recommendedServiceType in SERVICE_LABELS
      ? SERVICE_LABELS[view.recommendedServiceType as ServiceType]
      : undefined;

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader />
      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-10 space-y-6">
          <div>
            <CardEyebrow>The family view</CardEyebrow>
            <h1 className="font-serif text-3xl text-ink leading-tight mb-2">
              Where things stand
            </h1>
            <p className="text-sm text-ink-muted">
              Read-only, shared by your family&rsquo;s point person. Last
              updated{" "}
              {updated.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
              })}{" "}
              — it refreshes whenever they use the tools.
              {svcLabel && (
                <>
                  {" "}
                  The family is planning: <strong className="text-ink">{svcLabel}</strong>.
                </>
              )}
            </p>
          </div>

          <Card>
            <CardTitle>The checklist ({doneCount} done)</CardTitle>
            {Object.keys(view.taskProgress).length === 0 ? (
              <p className="text-sm text-ink-soft mt-2">
                Nothing checked off yet — the list lives at{" "}
                <Link href="/next-30-days" className="text-primary-deep underline">
                  the next 30 days
                </Link>
                .
              </p>
            ) : (
              <div className="mt-3 space-y-4">
                {PHASES.map((phase) => {
                  const touched = phase.tasks.filter(
                    (t) => view.taskProgress[t.id],
                  );
                  if (touched.length === 0) return null;
                  return (
                    <div key={phase.id}>
                      <div className="text-xs uppercase tracking-wider text-ink-muted mb-1">
                        {phase.label}
                      </div>
                      <ul className="space-y-1">
                        {touched.map((t) => (
                          <li key={t.id} className="text-sm text-ink flex gap-2">
                            <span className={view.taskProgress[t.id] === "done" ? "text-good" : "text-ink-muted"}>
                              {view.taskProgress[t.id] === "done" ? "✓" : "—"}
                            </span>
                            <span className={view.taskProgress[t.id] === "skipped" ? "text-ink-muted line-through" : ""}>
                              {t.title}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card>
            <CardTitle>Who has been told ({view.contacts.length})</CardTitle>
            {view.contacts.length === 0 ? (
              <p className="text-sm text-ink-soft mt-2">No contacts tracked yet.</p>
            ) : (
              <ul className="mt-3 space-y-1">
                {view.contacts.map((c, i) => (
                  <li key={`${c.name}-${i}`} className="text-sm flex flex-wrap justify-between gap-x-4">
                    <span className="text-ink">
                      {c.name}
                      {c.relationship && (
                        <span className="text-ink-muted"> — {c.relationship}</span>
                      )}
                    </span>
                    <span className={c.status === "todo" ? "text-warn" : "text-ink-muted"}>
                      {CONTACT_LABEL[c.status] ?? c.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardTitle>The documents ({view.vaultDocs.length})</CardTitle>
            {view.vaultDocs.length === 0 ? (
              <p className="text-sm text-ink-soft mt-2">No documents tracked yet.</p>
            ) : (
              <ul className="mt-3 space-y-1">
                {view.vaultDocs.map((d, i) => (
                  <li key={`${d.type}-${i}`} className="text-sm flex flex-wrap justify-between gap-x-4">
                    <span className="text-ink">
                      {d.type}
                      {d.location && (
                        <span className="text-ink-muted"> — {d.location}</span>
                      )}
                    </span>
                    <span className={d.status === "have-it" ? "text-good" : "text-ink-muted"}>
                      {DOC_LABEL[d.status] ?? d.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <p className="text-xs text-ink-muted">
            This view is read-only and shows only what the point person chose
            to publish. Want to help with a task? Tell them directly — or use
            the free tools yourself at{" "}
            <Link href="/" className="text-primary-deep underline">
              honestfuneral.co
            </Link>
            . Free to families; no money from funeral homes or insurers.
          </p>
        </div>
      </section>
    </main>
  );
}
