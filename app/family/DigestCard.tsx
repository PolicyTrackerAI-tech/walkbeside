"use client";

import { useEffect, useState } from "react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Field";
import { snapshotHousehold } from "@/lib/household-link";
import { parseHouseholdView } from "@/lib/household-view";
import { PHASES } from "@/app/next-30-days/tasks";
import type { DigestItem } from "@/lib/family-digest";

/**
 * "Send someone their list" — builds ONE person's digest from the on-device
 * data (their assigned open tasks, contacts, missing documents) and emails
 * just that slice. Nothing else leaves the device; nothing is stored.
 */

function buildItemsFor(name: string): DigestItem[] {
  const view = parseHouseholdView(snapshotHousehold());
  const match = (a?: string) =>
    (a ?? "").trim().toLowerCase() === name.trim().toLowerCase();
  const items: DigestItem[] = [];

  for (const phase of PHASES) {
    for (const t of phase.tasks) {
      const status = view.taskProgress[t.id];
      if (status === "done" || status === "skipped") continue;
      if (match(view.taskAssignees[t.id])) {
        items.push({ kind: "task", title: t.title });
      }
    }
  }
  for (const c of view.contacts) {
    if (c.status !== "todo" || !match(c.assignee)) continue;
    items.push({
      kind: "contact",
      title: c.relationship ? `${c.name} (${c.relationship})` : c.name,
    });
  }
  for (const d of view.vaultDocs) {
    if (d.status === "have-it" || !match(d.assignee)) continue;
    items.push({
      kind: "document",
      title: d.type,
      ...(d.location ? { note: `last known: ${d.location}` } : {}),
    });
  }
  return items.slice(0, 40);
}

function knownAssignees(): string[] {
  const view = parseHouseholdView(snapshotHousehold());
  const names = new Map<string, string>();
  const add = (a?: string) => {
    const n = (a ?? "").trim();
    if (n && !names.has(n.toLowerCase())) names.set(n.toLowerCase(), n);
  };
  Object.values(view.taskAssignees).forEach(add);
  view.contacts.forEach((c) => add(c.assignee));
  view.vaultDocs.forEach((d) => add(d.assignee));
  return [...names.values()];
}

export function DigestCard() {
  const [names, setNames] = useState<string[]>([]);
  const [who, setWho] = useState("");
  const [email, setEmail] = useState("");
  const [from, setFrom] = useState("");
  const [count, setCount] = useState(0);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating from sessionStorage/localStorage via snapshotHousehold(), which cannot be read during render
    setNames(knownAssignees());
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- re-reads sessionStorage/localStorage via buildItemsFor()/snapshotHousehold() when the selected assignee changes; not a pure derivation from in-memory state
    setCount(who ? buildItemsFor(who).length : 0);
    setState("idle");
  }, [who]);

  if (names.length === 0) return null;

  async function send() {
    const items = buildItemsFor(who);
    if (items.length === 0 || !email) return;
    setState("sending");
    try {
      const r = await fetch("/api/family/digest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          assigneeName: who,
          senderName: from || undefined,
          items,
        }),
      });
      setState(r.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <Card>
      <CardTitle>Email someone just their part of the list.</CardTitle>
      <p className="text-ink-soft mt-3 mb-4">
        You&rsquo;ve put names on tasks, calls, and documents. Send a sibling
        one calm email with only their items — no login, no app, nothing else
        from the family&rsquo;s plan included.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="digest-who">Whose list</Label>
          <Select id="digest-who" value={who} onChange={(e) => setWho(e.target.value)}>
            <option value="">Choose a name…</option>
            {names.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="digest-email">Their email</Label>
          <Input
            id="digest-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
          />
        </div>
      </div>
      <div className="mt-3 max-w-sm">
        <Label htmlFor="digest-from" hint="So the email says who it's from.">
          Your name (optional)
        </Label>
        <Input
          id="digest-from"
          value={from}
          maxLength={60}
          onChange={(e) => setFrom(e.target.value)}
        />
      </div>
      {who && (
        <p className="text-sm text-ink-muted mt-3">
          {count === 0
            ? `Nothing is currently assigned to ${who} — assign items in the checklist, notifications, or vault first.`
            : `${count} open item${count === 1 ? "" : "s"} assigned to ${who}.`}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-3 items-center">
        <Button onClick={send} disabled={!who || !email || count === 0 || state === "sending"}>
          {state === "sending" ? "Sending…" : state === "sent" ? "Sent ✓" : "Send their list →"}
        </Button>
        {state === "error" && (
          <span className="text-sm text-bad">Couldn&rsquo;t send just now — try again.</span>
        )}
      </div>
      <p className="text-xs text-ink-muted mt-3">
        One-time email, sent at your request. We don&rsquo;t store the address
        or the list.
      </p>
    </Card>
  );
}
