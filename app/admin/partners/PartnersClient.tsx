"use client";

import { useState } from "react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";

const STATUSES = ["pilot", "active", "paused", "archived"] as const;

export interface PartnerRow {
  id: string;
  name: string;
  partner_type: string;
  status: string;
  active: boolean;
  report_token: string;
  contact_name: string | null;
  contact_email: string | null;
  application_notes: string | null;
  created_at: string;
}

export interface CodeStat {
  code: string;
  partner_id: string;
  label: string | null;
  active: boolean;
  created_at: string;
  claims: number;
}

export function PartnersClient({
  partners: initial,
  codeStats,
}: {
  partners: PartnerRow[];
  codeStats: CodeStat[];
}) {
  const [partners, setPartners] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function setActive(id: string, active: boolean) {
    if (
      active &&
      !window.confirm(
        "Approve this partner? Their report link, referral codes, and co-branding go live immediately.",
      )
    )
      return;
    setBusy(id);
    setError(null);
    try {
      const r = await fetch("/api/admin/partners", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, active }),
      });
      if (!r.ok) throw new Error();
      setPartners((prev) =>
        prev.map((p) => (p.id === id ? { ...p, active } : p)),
      );
    } catch {
      setError("Couldn't update that partner — try again.");
    } finally {
      setBusy(null);
    }
  }

  async function setStatus(id: string, status: string) {
    setBusy(id);
    setError(null);
    try {
      const r = await fetch("/api/admin/partners", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!r.ok) throw new Error();
      setPartners((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    } catch {
      setError("Couldn't update that partner's stage — try again.");
    } finally {
      setBusy(null);
    }
  }

  const pending = partners.filter((p) => !p.active);
  const activePartners = partners.filter((p) => p.active);

  return (
    <>
      {error && <p className="text-sm text-bad">{error}</p>}

      <Card tone={pending.length > 0 ? "primary" : "soft"}>
        <CardTitle>
          {pending.length > 0
            ? `${pending.length} awaiting your approval`
            : "No pending applications"}
        </CardTitle>
        {pending.length > 0 && (
          <ul className="mt-3 space-y-3">
            {pending.map((p) => (
              <li key={p.id} className="rounded-xl border border-border bg-surface px-4 py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <span className="font-medium text-ink">
                    {p.name} <span className="text-ink-muted text-xs">({p.partner_type})</span>
                  </span>
                  <span className="text-xs text-ink-muted">
                    {new Date(p.created_at).toLocaleDateString("en-US")}
                  </span>
                </div>
                {(p.contact_name || p.contact_email) && (
                  <div className="text-sm text-ink-soft mt-1">
                    {p.contact_name} {p.contact_email && `· ${p.contact_email}`}
                  </div>
                )}
                {p.application_notes && (
                  <p className="text-sm text-ink-muted mt-1">{p.application_notes}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Button onClick={() => setActive(p.id, true)} disabled={busy === p.id}>
                    {busy === p.id ? "Working…" : "Approve →"}
                  </Button>
                  <Select
                    value={p.status}
                    onChange={(e) => setStatus(p.id, e.target.value)}
                    disabled={busy === p.id}
                    className="w-auto text-sm"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s[0].toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </Select>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardTitle>Active partners ({activePartners.length})</CardTitle>
        {activePartners.length === 0 ? (
          <p className="text-sm text-ink-soft mt-2">None yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {activePartners.map((p) => {
              const codes = codeStats.filter((c) => c.partner_id === p.id);
              const totalClaims = codes.reduce((s, c) => s + c.claims, 0);
              const unclaimed = codes.filter((c) => c.active && c.claims === 0);
              return (
                <li key={p.id} className="rounded-xl border border-border bg-surface px-4 py-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <span className="font-medium text-ink">
                      {p.name} <span className="text-ink-muted text-xs">({p.partner_type})</span>
                    </span>
                    <span className="text-xs text-ink-muted">
                      {codes.length} code{codes.length === 1 ? "" : "s"} · {totalClaims} claim{totalClaims === 1 ? "" : "s"}
                    </span>
                  </div>
                  {p.contact_email && (
                    <div className="text-sm text-ink-soft mt-1">
                      {p.contact_name} · {p.contact_email}
                    </div>
                  )}
                  <div className="text-xs text-ink-muted mt-1 break-all">
                    Report + links: honestfuneral.co/partner/r/{p.report_token}
                  </div>
                  {unclaimed.length > 0 && (
                    <p className="text-xs text-warn mt-1">
                      {unclaimed.length} active code{unclaimed.length === 1 ? "" : "s"} with zero
                      claims — worth a friendly check-in with the coordinator.
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Button variant="ghost" onClick={() => setActive(p.id, false)} disabled={busy === p.id}>
                      Pause
                    </Button>
                    <Select
                      value={p.status}
                      onChange={(e) => setStatus(p.id, e.target.value)}
                      disabled={busy === p.id}
                      className="w-auto text-sm"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s[0].toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </Select>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}
