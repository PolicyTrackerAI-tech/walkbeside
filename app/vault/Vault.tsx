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

const STORAGE_KEY = "honestfuneral.vault.v1";

type DocStatus = "have-it" | "need-to-find" | "ordered" | "lost";

interface VaultDoc {
  id: string;
  type: string;
  description: string;
  location: string;
  status: DocStatus;
}

const STATUS_LABEL: Record<DocStatus, string> = {
  "have-it": "✓ Have it",
  "need-to-find": "Need to find",
  ordered: "Ordered",
  lost: "Lost — replacing",
};

const STATUS_TONE: Record<DocStatus, string> = {
  "have-it": "bg-good-soft border-good/30",
  "need-to-find": "bg-warn-soft border-warn/30",
  ordered: "bg-surface border-border",
  lost: "bg-warn-soft border-warn/30",
};

const STARTER_DOCS: { type: string; description: string }[] = [
  {
    type: "Death certificate (certified copies)",
    description:
      "Most families need 10–15 certified originals. Banks, insurers, the IRS — each wants their own.",
  },
  {
    type: "Will",
    description:
      "Names the executor and how assets get distributed. If there's no will, state intestate rules apply.",
  },
  {
    type: "Living trust documents",
    description:
      "If they had a revocable living trust, this likely keeps you out of probate.",
  },
  {
    type: "Birth certificate",
    description:
      "Required for some VA filings, Social Security claims, and identity verification.",
  },
  {
    type: "Marriage certificate",
    description:
      "Required for surviving-spouse benefits, property transfers, and pension claims.",
  },
  {
    type: "Social Security card / SSN record",
    description:
      "Required for SSA notification and survivor benefit applications.",
  },
  {
    type: "DD-214 (military discharge)",
    description:
      "Required for VA benefits, national cemetery burial, and military honors. Order free at archives.gov/veterans.",
  },
  {
    type: "Life insurance policies",
    description:
      "One claim per policy. NAIC's free life-policy locator finds policies you don't know about.",
  },
  {
    type: "Property deeds",
    description:
      "House, vacation home, land. Needed for title transfer.",
  },
  {
    type: "Vehicle titles",
    description:
      "Cars, trucks, boats, motorcycles. Needed for DMV transfer.",
  },
  {
    type: "Bank statements (last 3 months)",
    description:
      "For finding recurring charges to cancel and surfacing accounts you didn't know about.",
  },
  {
    type: "Tax returns (last 2 years)",
    description:
      "For the executor when filing the final 1040 and any 1041 estate return.",
  },
  {
    type: "Funeral pre-need contract (if any)",
    description:
      "If they pre-paid for a funeral, the contract is what the funeral home owes the family.",
  },
];

export function Vault() {
  const [docs, setDocs] = useState<VaultDoc[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [draftType, setDraftType] = useState("");
  const [draftLocation, setDraftLocation] = useState("");
  const [draftStatus, setDraftStatus] = useState<DocStatus>("have-it");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as VaultDoc[];
        if (Array.isArray(parsed)) setDocs(parsed);
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
    } catch {
      // ignore
    }
  }, [docs, hydrated]);

  function quickAdd(starter: { type: string; description: string }) {
    setDocs((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: starter.type,
        description: starter.description,
        location: "",
        status: "need-to-find",
      },
    ]);
  }

  function addCustom(e: React.FormEvent) {
    e.preventDefault();
    if (!draftType.trim()) return;
    setDocs((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: draftType.trim(),
        description: "",
        location: draftLocation.trim(),
        status: draftStatus,
      },
    ]);
    setDraftType("");
    setDraftLocation("");
    setDraftStatus("have-it");
  }

  function setStatus(id: string, status: DocStatus) {
    setDocs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status } : d)),
    );
  }

  function setLocation(id: string, location: string) {
    setDocs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, location } : d)),
    );
  }

  function remove(id: string) {
    setDocs((prev) => prev.filter((d) => d.id !== id));
  }

  const haveCount = docs.filter((d) => d.status === "have-it").length;
  const needCount = docs.filter((d) => d.status === "need-to-find").length;

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader rightSlot={<BackLink defaultHref="/dashboard" />} />
      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-10 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              Document vault
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              Track every document the family needs.
            </h1>
            <p className="text-lg text-ink-soft">
              Note where each one is, what&rsquo;s missing, what&rsquo;s
              been ordered. Saves the &ldquo;wait, where&rsquo;s
              their...&rdquo; conversation a week from now.
            </p>
            {hydrated && docs.length > 0 && (
              <p className="mt-4 text-sm text-ink-muted">
                {haveCount} on hand · {needCount} still to find
              </p>
            )}
          </div>

          {hydrated && docs.length === 0 && (
            <Card tone="primary">
              <CardEyebrow>Start here</CardEyebrow>
              <CardTitle>The documents most families need.</CardTitle>
              <p className="text-ink-soft mt-3 mb-4">
                Tap any to add it to your list. You can mark each as
                already on hand, still to find, or ordered.
              </p>
              <div className="grid gap-2">
                {STARTER_DOCS.map((d) => (
                  <button
                    key={d.type}
                    onClick={() => quickAdd(d)}
                    className="text-left p-3 rounded-xl border border-border bg-surface hover:border-primary hover:bg-primary-soft transition-colors"
                  >
                    <div className="font-medium text-ink text-sm">
                      + {d.type}
                    </div>
                    <div className="text-xs text-ink-muted mt-0.5">
                      {d.description}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {hydrated && docs.length > 0 && (
            <Card>
              <CardTitle>Your list</CardTitle>
              <ul className="mt-4 space-y-2">
                {docs.map((d) => (
                  <li key={d.id}>
                    <div
                      className={`rounded-xl border p-4 ${STATUS_TONE[d.status]}`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-ink">
                            {d.type}
                          </div>
                          {d.description && (
                            <div className="text-xs text-ink-soft mt-1">
                              {d.description}
                            </div>
                          )}
                          <div className="text-xs text-ink-muted mt-1">
                            {STATUS_LABEL[d.status]}
                          </div>
                        </div>
                        <button
                          onClick={() => remove(d.id)}
                          className="text-xs text-ink-muted hover:text-ink underline-offset-2 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                      <Input
                        placeholder="Where is it? (e.g. filing cabinet, attorney's office, safe deposit box)"
                        value={d.location}
                        onChange={(e) => setLocation(d.id, e.target.value)}
                      />
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(["have-it", "need-to-find", "ordered", "lost"] as DocStatus[]).map(
                          (s) => (
                            <StatusPill
                              key={s}
                              active={d.status === s}
                              onClick={() => setStatus(d.id, s)}
                            >
                              {STATUS_LABEL[s]}
                            </StatusPill>
                          ),
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card tone="soft">
            <CardEyebrow>Add a custom document</CardEyebrow>
            <form onSubmit={addCustom} className="space-y-3 mt-3">
              <div>
                <Label htmlFor="type">Document type</Label>
                <Input
                  id="type"
                  value={draftType}
                  onChange={(e) => setDraftType(e.target.value)}
                  placeholder="e.g. Pension paperwork from previous employer"
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Where it is (optional)</Label>
                <Input
                  id="location"
                  value={draftLocation}
                  onChange={(e) => setDraftLocation(e.target.value)}
                  placeholder="e.g. lockbox in mom's closet"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  id="status"
                  value={draftStatus}
                  onChange={(e) => setDraftStatus(e.target.value as DocStatus)}
                >
                  <option value="have-it">Have it</option>
                  <option value="need-to-find">Need to find</option>
                  <option value="ordered">Ordered</option>
                  <option value="lost">Lost — replacing</option>
                </Select>
              </div>
              <Button type="submit">Add</Button>
            </form>
          </Card>

          <Card tone="soft">
            <CardEyebrow>Coming soon</CardEyebrow>
            <CardTitle>Encrypted document upload.</CardTitle>
            <p className="text-ink-soft">
              We&rsquo;re building secure upload so you can stash
              actual scanned copies of the death certificate, the
              will, and other documents in your account &mdash;
              encrypted at rest, accessible from any device.
            </p>
            <p className="text-sm text-ink-muted mt-3">
              For now, this page is a tracker: <em>where</em> things
              are, what&rsquo;s missing, what&rsquo;s been ordered.
              Useful even without uploads, especially if you&rsquo;re
              coordinating with siblings.
            </p>
          </Card>

          <p className="text-xs text-ink-muted">
            Saved on this device only. Document contents are not yet
            stored — just your notes about where they are.
          </p>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
