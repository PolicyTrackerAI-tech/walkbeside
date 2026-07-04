"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Field";
import { StatusPill } from "@/components/ui/StatusPill";
import { HelpFooter } from "@/components/HelpFooter";
import { maybePublishHousehold } from "@/lib/household-link";
import { AssigneeFilter } from "@/components/AssigneeFilter";
import { assigneeNames, matchesAssignee } from "@/lib/assignees";
import { PrintHeader, PrintFooter } from "@/components/print/PrintHeader";

const STORAGE_KEY = "honestfuneral.notifications.v1";

type Status = "todo" | "called" | "emailed" | "in-person" | "skipped";

interface Contact {
  id: string;
  name: string;
  relationship: string;
  channel: string;
  status: Status;
  notes?: string;
  /** Free-text "who's making this call" — sibling division of labor. */
  assignee?: string;
}

const STATUS_LABEL: Record<Status, string> = {
  todo: "To call/email",
  called: "✓ Called",
  emailed: "✓ Emailed",
  "in-person": "✓ Told in person",
  skipped: "Skipped",
};

const STATUS_TONE: Record<Status, string> = {
  todo: "bg-surface border-border",
  called: "bg-good-soft border-good/30",
  emailed: "bg-good-soft border-good/30",
  "in-person": "bg-good-soft border-good/30",
  skipped: "bg-surface-soft border-border",
};

const STARTER_CATEGORIES: { name: string; relationship: string }[] = [
  { name: "Immediate family", relationship: "spouse / kids / parents" },
  { name: "Their employer / HR", relationship: "work" },
  { name: "Their primary doctor", relationship: "medical" },
  { name: "Insurance agent", relationship: "insurance" },
  { name: "Bank / credit union", relationship: "financial" },
  { name: "Estate attorney", relationship: "legal" },
  { name: "Religious community", relationship: "community" },
  { name: "Close friends", relationship: "personal" },
];

export function Notifications() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftRelationship, setDraftRelationship] = useState("");
  const [draftChannel, setDraftChannel] = useState("phone");
  const [assigneeFilter, setAssigneeFilter] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Contact[];
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time localStorage hydration on mount; can't read localStorage during SSR-safe render
        if (Array.isArray(parsed)) setContacts(parsed);
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
    } catch {
      // ignore
    }
    maybePublishHousehold();
  }, [contacts, hydrated]);

  function addContact(name: string, relationship: string, channel: string) {
    if (!name.trim()) return;
    setContacts((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: name.trim(),
        relationship: relationship.trim(),
        channel: channel.trim(),
        status: "todo",
      },
    ]);
  }

  function setStatus(id: string, status: Status) {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c)),
    );
  }

  function setAssignee(id: string, assignee: string) {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, assignee } : c)),
    );
  }

  function remove(id: string) {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }

  function quickAdd(category: { name: string; relationship: string }) {
    addContact(category.name, category.relationship, "phone");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addContact(draftName, draftRelationship, draftChannel);
    setDraftName("");
    setDraftRelationship("");
    setDraftChannel("phone");
  }

  const todoCount = contacts.filter((c) => c.status === "todo").length;
  const doneCount = contacts.filter((c) =>
    ["called", "emailed", "in-person"].includes(c.status),
  ).length;

  return (
    <NotificationsView
      contacts={contacts}
      hydrated={hydrated}
      doneCount={doneCount}
      todoCount={todoCount}
      draftName={draftName}
      setDraftName={setDraftName}
      draftRelationship={draftRelationship}
      setDraftRelationship={setDraftRelationship}
      draftChannel={draftChannel}
      setDraftChannel={setDraftChannel}
      handleSubmit={handleSubmit}
      quickAdd={quickAdd}
      setStatus={setStatus}
      setAssignee={setAssignee}
      assigneeFilter={assigneeFilter}
      setAssigneeFilter={setAssigneeFilter}
      remove={remove}
    />
  );
}

function NotificationsView({
  contacts,
  hydrated,
  doneCount,
  todoCount,
  draftName,
  setDraftName,
  draftRelationship,
  setDraftRelationship,
  draftChannel,
  setDraftChannel,
  handleSubmit,
  quickAdd,
  setStatus,
  setAssignee,
  assigneeFilter,
  setAssigneeFilter,
  remove,
}: {
  contacts: Contact[];
  hydrated: boolean;
  doneCount: number;
  todoCount: number;
  draftName: string;
  setDraftName: (s: string) => void;
  draftRelationship: string;
  setDraftRelationship: (s: string) => void;
  draftChannel: string;
  setDraftChannel: (s: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  quickAdd: (cat: { name: string; relationship: string }) => void;
  setStatus: (id: string, status: Status) => void;
  setAssignee: (id: string, assignee: string) => void;
  assigneeFilter: string;
  setAssigneeFilter: (filter: string) => void;
  remove: (id: string) => void;
}) {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader rightSlot={<BackLink defaultHref="/dashboard" />} />

      {/* Print-only clean rendering. Renders a real-document version
          of the contact list with letterhead, hand-off-friendly
          layout, and a checkbox column to mark calls as done with a
          pen. The on-screen UI below is hidden when printing. */}
      <div className="print-only" style={{ padding: "0.5in" }}>
        <PrintHeader
          title="Who needs to be told"
          subtitle="A list to hand off to a friend or family member."
        />
        <p style={{ fontSize: "11pt", color: "#444", marginBottom: "1em" }}>
          For each person below: call, email, or visit. Mark the box
          when it&rsquo;s done. The family doesn&rsquo;t need to be the
          one telling everyone.
        </p>
        {hydrated && contacts.length > 0 ? (
          <table style={{ width: "100%", fontSize: "11pt", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #999" }}>
                <th style={{ textAlign: "left", padding: "6px 8px", width: "20px" }}>✓</th>
                <th style={{ textAlign: "left", padding: "6px 8px" }}>Name</th>
                <th style={{ textAlign: "left", padding: "6px 8px" }}>Relationship</th>
                <th style={{ textAlign: "left", padding: "6px 8px" }}>Best way</th>
                <th style={{ textAlign: "left", padding: "6px 8px" }}>Who</th>
                <th style={{ textAlign: "left", padding: "6px 8px" }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid #ddd", pageBreakInside: "avoid" }}>
                  <td style={{ padding: "8px", verticalAlign: "top" }}>
                    <span style={{ display: "inline-block", width: 14, height: 14, border: "1px solid #444", borderRadius: 2 }} />
                  </td>
                  <td style={{ padding: "8px", verticalAlign: "top" }}>{c.name}</td>
                  <td style={{ padding: "8px", verticalAlign: "top", color: "#555" }}>{c.relationship}</td>
                  <td style={{ padding: "8px", verticalAlign: "top", color: "#555" }}>{c.channel}</td>
                  <td style={{ padding: "8px", verticalAlign: "top", color: "#555" }}>{c.assignee ?? ""}</td>
                  <td style={{ padding: "8px", verticalAlign: "top", color: "#555" }}>{c.notes ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>(No contacts added yet.)</p>
        )}
        <PrintFooter />
      </div>

      <section className="flex-1 print:hidden">
        <div className="max-w-2xl mx-auto px-5 py-10 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              Notifications hub
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              Who&rsquo;s been told, and who still needs to be.
            </h1>
            <p className="text-lg text-ink-soft">
              Hand the list to a friend or family member. They make
              the calls. You don&rsquo;t have to be the one telling
              everyone.
            </p>
            {hydrated && contacts.length > 0 && (
              <p className="mt-4 text-sm text-ink-muted">
                {doneCount} done · {todoCount} to go
              </p>
            )}
          </div>

          {hydrated && contacts.length === 0 && (
            <Card tone="primary">
              <CardEyebrow>Start here</CardEyebrow>
              <CardTitle>Add the people who need to know.</CardTitle>
              <p className="text-ink-soft mt-3 mb-4">
                Tap any starter category to add it, or write in your
                own. You can edit, mark done, or remove anytime.
              </p>
              <div className="flex flex-wrap gap-2">
                {STARTER_CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => quickAdd(cat)}
                    className="text-sm px-3 py-2 rounded-xl border border-border bg-surface hover:border-primary hover:bg-primary-soft transition-colors"
                  >
                    + {cat.name}
                  </button>
                ))}
              </div>
            </Card>
          )}

          {hydrated && contacts.length > 0 && (
            <Card>
              <CardTitle>Your list</CardTitle>
              <AssigneeFilter
                names={assigneeNames(contacts)}
                active={assigneeFilter}
                onChange={setAssigneeFilter}
              />
              <ul className="mt-4 space-y-2">
                {contacts.filter(matchesAssignee(assigneeFilter)).map((c) => (
                  <li key={c.id}>
                    <div
                      className={`rounded-xl border p-4 ${STATUS_TONE[c.status]}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-ink truncate">
                            {c.name}
                          </div>
                          {c.relationship && (
                            <div className="text-xs text-ink-muted">
                              {c.relationship}
                              {c.channel && ` · ${c.channel}`}
                            </div>
                          )}
                          <div className="text-xs text-ink-soft mt-1">
                            {STATUS_LABEL[c.status]}
                          </div>
                        </div>
                        <button
                          onClick={() => remove(c.id)}
                          className="text-xs text-ink-muted hover:text-ink underline-offset-2 hover:underline"
                          aria-label={`Remove ${c.name}`}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="mt-3 max-w-[14rem]">
                        <Input
                          placeholder="Assigned to (optional)"
                          value={c.assignee ?? ""}
                          maxLength={40}
                          onChange={(e) => setAssignee(c.id, e.target.value)}
                        />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <StatusPill
                          active={c.status === "called"}
                          onClick={() => setStatus(c.id, "called")}
                        >
                          Called
                        </StatusPill>
                        <StatusPill
                          active={c.status === "emailed"}
                          onClick={() => setStatus(c.id, "emailed")}
                        >
                          Emailed
                        </StatusPill>
                        <StatusPill
                          active={c.status === "in-person"}
                          onClick={() => setStatus(c.id, "in-person")}
                        >
                          In person
                        </StatusPill>
                        {c.status !== "todo" && (
                          <button
                            onClick={() => setStatus(c.id, "todo")}
                            className="text-xs text-ink-muted hover:text-ink underline-offset-2 hover:underline ml-auto"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card tone="soft">
            <CardEyebrow>Add someone</CardEyebrow>
            <form onSubmit={handleSubmit} className="space-y-3 mt-3">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="e.g. Aunt Susan"
                  required
                />
              </div>
              <div>
                <Label htmlFor="relationship">Relationship / role</Label>
                <Input
                  id="relationship"
                  value={draftRelationship}
                  onChange={(e) => setDraftRelationship(e.target.value)}
                  placeholder="e.g. dad's sister"
                />
              </div>
              <div>
                <Label htmlFor="channel">Best way to reach them</Label>
                <Select
                  id="channel"
                  value={draftChannel}
                  onChange={(e) => setDraftChannel(e.target.value)}
                >
                  <option value="phone">Phone</option>
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="in-person">In person</option>
                </Select>
              </div>
              <Button type="submit">Add to list</Button>
            </form>
          </Card>

          <Card tone="soft">
            <CardTitle>Hand it off.</CardTitle>
            <p className="text-ink-soft">
              You don&rsquo;t have to be the one telling everyone.
              Print this list and give it to a friend or relative
              who&rsquo;s less close to the loss. They make the calls.
              You give yourself permission to grieve.
            </p>
            <div className="mt-4 flex gap-3">
              <Button variant="secondary" onClick={() => window.print()}>
                Print the list
              </Button>
            </div>
          </Card>

          <p className="text-xs text-ink-muted">
            Saved on this device only. Nothing is sent to anyone unless
            you choose to share.
          </p>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
