"use client";

import { useState } from "react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Input } from "@/components/ui/Field";
import type { TeamMemberRow } from "@/lib/partner/team";

/**
 * Owner-only team management: invite by email, deactivate/reactivate seats.
 * Optimistic list updates on ok (mirrors admin/partners/PartnersClient);
 * the API enforces the seat cap and the last-active-owner rule — this
 * component just surfaces those refusals calmly.
 */

type Status = "invited" | "active" | "deactivated";

function statusOf(m: TeamMemberRow): Status {
  if (m.deactivated_at) return "deactivated";
  if (m.accepted_at) return "active";
  return "invited";
}

const STATUS_STYLES: Record<Status, string> = {
  invited: "bg-surface-soft text-ink-soft border-border",
  active: "bg-good-soft text-good border-good/30",
  deactivated: "bg-surface-soft text-ink-muted border-border",
};

export function TeamClient({
  members: initial,
  selfMemberId,
}: {
  members: TeamMemberRow[];
  selfMemberId: string;
}) {
  const [members, setMembers] = useState(initial);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState<string | null>(null); // member id or "invite"
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    const address = email.trim();
    if (!address) return;
    setBusy("invite");
    setError(null);
    setNotice(null);
    try {
      const r = await fetch("/api/portal/team", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "invite", email: address }),
      });
      const body = (await r.json().catch(() => null)) as {
        ok?: boolean;
        already?: boolean;
        member?: TeamMemberRow | null;
        error?: string;
      } | null;
      if (!r.ok || !body?.ok) {
        if (body?.error === "seat_limit") {
          setError(
            "Your team is at 20 seats — deactivate someone before adding another.",
          );
        } else if (body?.error === "seat_deactivated") {
          setError(
            "That address has a deactivated seat — use Reactivate below.",
          );
        } else if (body?.error === "invalid_email") {
          setError(
            "That doesn't look like an email address — check it and try again.",
          );
        } else {
          setError("Couldn't add that person just now — try again.");
        }
        return;
      }
      if (body.already) {
        setNotice("That address is already on the team.");
      } else if (body.member) {
        const row = body.member;
        setMembers((prev) =>
          prev.some((m) => m.id === row.id) ? prev : [...prev, row],
        );
        setNotice(
          `Invite sent to ${row.invited_email} — they sign in at /portal/login with that email address.`,
        );
      }
      setEmail("");
    } catch {
      setError("Couldn't add that person just now — try again.");
    } finally {
      setBusy(null);
    }
  }

  async function setActive(memberId: string, active: boolean) {
    if (
      !active &&
      !window.confirm(
        "They lose portal access immediately. You can reactivate them any time.",
      )
    )
      return;
    setBusy(memberId);
    setError(null);
    setNotice(null);
    try {
      const r = await fetch("/api/portal/team", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: active ? "reactivate" : "deactivate",
          memberId,
        }),
      });
      const body = (await r.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;
      if (!r.ok || !body?.ok) {
        if (body?.error === "last_owner") {
          setError(
            "You're the only active owner — reply to any of our emails and we'll help transfer ownership.",
          );
        } else if (body?.error === "seat_limit") {
          setError(
            "Your team is at 20 seats — deactivate someone before reactivating.",
          );
        } else {
          setError("Couldn't update that seat just now — try again.");
        }
        return;
      }
      setMembers((prev) =>
        prev.map((m) =>
          m.id === memberId
            ? {
                ...m,
                deactivated_at: active ? null : new Date().toISOString(),
              }
            : m,
        ),
      );
    } catch {
      setError("Couldn't update that seat just now — try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-bad">{error}</p>}
      {notice && <p className="text-sm text-ink-soft">{notice}</p>}

      <Card>
        <CardTitle>Add a teammate</CardTitle>
        <form onSubmit={invite} className="mt-2 space-y-3">
          <div>
            <Label
              htmlFor="invite-email"
              hint="We'll email them a note; they sign in with a code sent to this address — no password to set up."
            >
              Work email
            </Label>
            <Input
              id="invite-email"
              type="email"
              required
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@yourorganization.org"
              autoComplete="off"
            />
          </div>
          <Button type="submit" disabled={busy === "invite"}>
            {busy === "invite" ? "Adding…" : "Add to team"}
          </Button>
        </form>
      </Card>

      <Card>
        <CardTitle>Members ({members.length})</CardTitle>
        {members.length === 0 ? (
          <p className="text-sm text-ink-soft mt-2">No seats yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {members.map((m) => {
              const status = statusOf(m);
              return (
                <li
                  key={m.id}
                  className="rounded-xl border border-border bg-surface px-4 py-3"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <span className="font-medium text-ink break-all">
                      {m.invited_email}
                      {m.id === selfMemberId && (
                        <span className="text-ink-muted text-xs font-normal">
                          {" "}
                          (you)
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-ink-muted">
                      invited {new Date(m.invited_at).toLocaleDateString("en-US")}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-border bg-surface-soft px-2.5 py-0.5 text-xs text-ink-soft">
                      {m.role}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs ${STATUS_STYLES[status]}`}
                    >
                      {status}
                    </span>
                    <span className="flex-1" />
                    {status === "deactivated" ? (
                      <Button
                        variant="ghost"
                        onClick={() => setActive(m.id, true)}
                        disabled={busy === m.id}
                      >
                        {busy === m.id ? "Working…" : "Reactivate"}
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        onClick={() => setActive(m.id, false)}
                        disabled={busy === m.id}
                      >
                        {busy === m.id ? "Working…" : "Deactivate"}
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <p className="text-xs text-ink-muted mt-4">
          Deactivating a seat removes portal access immediately and keeps its
          history — you can reactivate it any time. Up to 20 seats per
          organization.
        </p>
      </Card>
    </div>
  );
}
