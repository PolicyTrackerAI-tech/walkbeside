"use client";

import * as React from "react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea, Label } from "@/components/ui/Field";

export interface VettingHome {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  google_rating: number | null;
  google_review_count: number | null;
  notes: string | null;
  active: boolean;
  vetted: boolean;
  vetted_at: string | null;
  vetted_by: string | null;
}

type Status = "pending" | "approved" | "rejected";
type StatusFilter = "all" | Status | "needs-email";
type Action = "approve" | "reject" | "reset" | "save";

const REVIEWER_KEY = "wb_vetting_reviewer";

function statusOf(h: VettingHome): Status {
  if (!h.vetted) return "pending";
  return h.active ? "approved" : "rejected";
}

function hasEmail(h: VettingHome): boolean {
  return typeof h.email === "string" && h.email.trim().length > 0;
}

const STATUS_BADGE: Record<Status, string> = {
  pending: "bg-surface-soft text-ink-soft border-border",
  approved: "bg-good/10 text-good border-good/30",
  rejected: "bg-bad/10 text-bad border-bad/30",
};

const STATUS_LABEL: Record<Status, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export function VettingClient({ initial }: { initial: VettingHome[] }) {
  const [homes, setHomes] = React.useState<VettingHome[]>(initial);
  const [edits, setEdits] = React.useState<
    Record<string, { email?: string; notes?: string }>
  >({});
  const [saving, setSaving] = React.useState<Record<string, boolean>>({});
  const [error, setError] = React.useState<string | null>(null);

  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("pending");
  const [stateFilter, setStateFilter] = React.useState<string>("all");
  const [query, setQuery] = React.useState("");
  const [reviewer, setReviewer] = React.useState("");

  // Load the reviewer name once from localStorage (admin convenience).
  React.useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const v =
      typeof window !== "undefined"
        ? window.localStorage.getItem(REVIEWER_KEY)
        : null;
    if (v) setReviewer(v);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function onReviewerChange(v: string) {
    setReviewer(v);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(REVIEWER_KEY, v);
    }
  }

  const counts = React.useMemo(() => {
    let pending = 0,
      approved = 0,
      rejected = 0,
      needsEmail = 0;
    for (const h of homes) {
      const s = statusOf(h);
      if (s === "pending") pending++;
      else if (s === "approved") approved++;
      else rejected++;
      if (!hasEmail(h)) needsEmail++;
    }
    return { total: homes.length, pending, approved, rejected, needsEmail };
  }, [homes]);

  const states = React.useMemo(() => {
    const set = new Set<string>();
    for (const h of homes) if (h.state) set.add(h.state);
    return Array.from(set).sort();
  }, [homes]);

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return homes.filter((h) => {
      if (stateFilter !== "all" && h.state !== stateFilter) return false;
      if (statusFilter === "needs-email") {
        if (hasEmail(h)) return false;
      } else if (statusFilter !== "all") {
        if (statusOf(h) !== statusFilter) return false;
      }
      if (q) {
        const hay = [h.name, h.city, h.email, h.address]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [homes, statusFilter, stateFilter, query]);

  function edited(id: string) {
    return edits[id];
  }

  function isDirty(h: VettingHome): boolean {
    const e = edits[h.id];
    if (!e) return false;
    const emailDirty =
      e.email !== undefined && e.email.trim() !== (h.email ?? "").trim();
    const notesDirty = e.notes !== undefined && e.notes !== (h.notes ?? "");
    return emailDirty || notesDirty;
  }

  function fieldEdits(id: string): { email?: string | null; notes?: string } {
    const e = edits[id];
    const extra: { email?: string | null; notes?: string } = {};
    if (e?.email !== undefined) {
      const t = e.email.trim();
      extra.email = t === "" ? null : t;
    }
    if (e?.notes !== undefined) extra.notes = e.notes;
    return extra;
  }

  async function patch(id: string, action: Action) {
    setSaving((s) => ({ ...s, [id]: true }));
    setError(null);
    try {
      const res = await fetch("/api/admin/funeral-homes", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          id,
          action,
          reviewer: reviewer.trim() || undefined,
          ...fieldEdits(id),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof json?.error === "string" ? json.error : "Save failed",
        );
      }
      const updated = json.home as VettingHome;
      setHomes((prev) => prev.map((h) => (h.id === id ? updated : h)));
      setEdits((e) => {
        const n = { ...e };
        delete n[id];
        return n;
      });
    } catch (err) {
      setError(
        `${err instanceof Error ? err.message : "Save failed"} — try again.`,
      );
    } finally {
      setSaving((s) => ({ ...s, [id]: false }));
    }
  }

  return (
    <div className="space-y-5">
      {/* Summary counts */}
      <div className="flex flex-wrap gap-2 text-sm">
        <CountPill label="Total" value={counts.total} />
        <CountPill label="Pending" value={counts.pending} tone="soft" />
        <CountPill label="Approved" value={counts.approved} tone="good" />
        <CountPill label="Rejected" value={counts.rejected} tone="bad" />
        <CountPill label="Needs email" value={counts.needsEmail} tone="warn" />
      </div>

      {/* Controls */}
      <Card tone="soft">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label htmlFor="f-status">Status</Label>
            <Select
              id="f-status"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as StatusFilter)
              }
            >
              <option value="pending">Pending review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="needs-email">Needs email</option>
              <option value="all">All</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="f-state">State</Label>
            <Select
              id="f-state"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
            >
              <option value="all">All states</option>
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="f-q">Search</Label>
            <Input
              id="f-q"
              placeholder="name, city, email…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="f-rev" hint="saved on this device, stamped on each decision">
              Reviewed by
            </Label>
            <Input
              id="f-rev"
              placeholder="your name"
              value={reviewer}
              onChange={(e) => onReviewerChange(e.target.value)}
            />
          </div>
        </div>
        <p className="text-xs text-ink-muted mt-3">
          Showing {visible.length} of {counts.total}. Approving makes a home
          eligible for outreach (once the OUTREACH_LIVE switch is on).
          Rejecting keeps it on record but excluded.
        </p>
      </Card>

      {error && (
        <div className="rounded-xl border border-bad/30 bg-bad/10 text-bad text-sm px-4 py-3">
          {error}
        </div>
      )}

      {visible.length === 0 ? (
        <Card tone="soft">
          <p className="text-ink-soft">No homes match these filters.</p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {visible.map((h) => {
            const s = statusOf(h);
            const isSaving = !!saving[h.id];
            const dirty = isDirty(h);
            const e = edited(h.id);
            const emailVal = e?.email ?? h.email ?? "";
            const notesVal = e?.notes ?? h.notes ?? "";
            return (
              <li key={h.id}>
                <Card>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <CardTitle className="mb-0.5">{h.name}</CardTitle>
                      <div className="text-sm text-ink-soft">
                        {[h.address, h.city, h.state, h.zip]
                          .filter(Boolean)
                          .join(", ") || "No address on file"}
                      </div>
                      <div className="text-sm text-ink-soft mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5">
                        {h.phone && <span>{h.phone}</span>}
                        {typeof h.google_rating === "number" && (
                          <span>
                            ★ {h.google_rating}
                            {typeof h.google_review_count === "number"
                              ? ` (${h.google_review_count})`
                              : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 inline-block text-xs font-medium border rounded-full px-2.5 py-1 ${STATUS_BADGE[s]}`}
                    >
                      {STATUS_LABEL[s]}
                      {h.vetted_by ? ` · ${h.vetted_by}` : ""}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 mt-4">
                    <div>
                      <Label htmlFor={`email-${h.id}`}>Outreach email</Label>
                      <Input
                        id={`email-${h.id}`}
                        type="email"
                        placeholder="none on file — add one"
                        value={emailVal}
                        onChange={(ev) =>
                          setEdits((prev) => ({
                            ...prev,
                            [h.id]: { ...prev[h.id], email: ev.target.value },
                          }))
                        }
                      />
                      {!hasEmail(h) && e?.email === undefined && (
                        <p className="text-xs text-warn mt-1">
                          No email — can&rsquo;t be contacted until you add one.
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor={`notes-${h.id}`}>Notes</Label>
                      <Textarea
                        id={`notes-${h.id}`}
                        rows={2}
                        placeholder="UFDA member? wrong listing? duplicate?"
                        value={notesVal}
                        onChange={(ev) =>
                          setEdits((prev) => ({
                            ...prev,
                            [h.id]: { ...prev[h.id], notes: ev.target.value },
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <Button
                      onClick={() => patch(h.id, "approve")}
                      disabled={isSaving}
                      aria-label={`Approve ${h.name}`}
                    >
                      {s === "approved" ? "Re-approve" : "Approve"}
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => patch(h.id, "reject")}
                      disabled={isSaving}
                      aria-label={`Reject ${h.name}`}
                    >
                      Reject
                    </Button>
                    {dirty && (
                      <Button
                        variant="secondary"
                        onClick={() => patch(h.id, "save")}
                        disabled={isSaving}
                      >
                        Save email/notes
                      </Button>
                    )}
                    {s !== "pending" && (
                      <Button
                        variant="ghost"
                        onClick={() => patch(h.id, "reset")}
                        disabled={isSaving}
                      >
                        Reset
                      </Button>
                    )}
                    {isSaving && (
                      <span className="text-xs text-ink-muted">saving…</span>
                    )}
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function CountPill({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "soft" | "good" | "bad" | "warn";
}) {
  const toneClass: Record<string, string> = {
    neutral: "bg-surface border-border text-ink",
    soft: "bg-surface-soft border-border text-ink-soft",
    good: "bg-good/10 border-good/30 text-good",
    bad: "bg-bad/10 border-bad/30 text-bad",
    warn: "bg-warn/10 border-warn/30 text-warn",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded-full px-3 py-1 ${toneClass[tone]}`}
    >
      <span className="font-semibold">{value}</span>
      <span className="text-xs uppercase tracking-wide">{label}</span>
    </span>
  );
}
