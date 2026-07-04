"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Field";
import { StatusPill } from "@/components/ui/StatusPill";
import { HelpFooter } from "@/components/HelpFooter";

const STORAGE_KEY = "honestfuneral.subscriptions.v1";

type Status = "todo" | "keeping" | "cancelling" | "cancelled";

type Frequency = "monthly" | "annual" | "unknown";

type Category =
  | "streaming"
  | "software"
  | "gym"
  | "subscription-box"
  | "membership"
  | "utility"
  | "insurance"
  | "donation"
  | "other";

interface Charge {
  id: string;
  merchant: string;
  amountCents: number;
  frequency: Frequency;
  category: Category;
  lastSeen?: string;
  status: Status;
  cancelNote?: string;
}

const STATUS_LABEL: Record<Status, string> = {
  todo: "To decide",
  keeping: "Keeping",
  cancelling: "Cancelling",
  cancelled: "✓ Cancelled",
};

const STATUS_TONE: Record<Status, string> = {
  todo: "bg-surface border-border",
  keeping: "bg-surface-soft border-border",
  cancelling: "bg-warn-soft border-warn/30",
  cancelled: "bg-good-soft border-good/30",
};

const CATEGORY_LABEL: Record<Category, string> = {
  streaming: "Streaming",
  software: "Software",
  gym: "Gym/fitness",
  "subscription-box": "Subscription box",
  membership: "Membership",
  utility: "Utility",
  insurance: "Insurance",
  donation: "Recurring donation",
  other: "Other",
};

// Common merchants → cancel guidance.
const CANCEL_TIPS: Record<string, string> = {
  netflix: "netflix.com → Account → Cancel Membership. Effective at end of current billing period.",
  spotify: "spotify.com/account/subscription → Cancel.",
  hulu: "hulu.com/account → Cancel Your Subscription.",
  "disney+": "disneyplus.com/account → Subscription → Cancel.",
  amazon: "amazon.com → Account → Memberships & Subscriptions → Cancel each.",
  audible: "audible.com → Account → Cancel Membership.",
  "apple music": "appleid.apple.com or via iPhone Settings → Apple ID → Subscriptions.",
  "youtube premium": "youtube.com/paid_memberships → Manage.",
  peloton: "Cancel via app or onepeloton.com → Subscription.",
  "planet fitness": "Most locations require an in-person visit OR a certified mailed letter to the home club. Ask your club for the exact procedure.",
  "la fitness": "Phone the home club to start cancellation; some require in-person.",
  "experian credit": "experian.com/cancel — also call 1-866-617-1894.",
  "credit karma": "Free product — no cancellation needed. Account closure via help.creditkarma.com.",
  geico: "geico.com → Service → Cancel Policy. Or call 1-800-841-3000. May get prorated refund.",
  progressive: "progressive.com → Account → Manage Policy → Cancel. Or call 1-800-776-4737.",
  statefarm: "Call your local agent. State Farm doesn't have a self-serve online cancel.",
  aaa: "aaa.com → Cancel via local club. Refund prorated.",
  newyorktimes: "nytimes.com → Account → Manage Subscription → Cancel.",
};

function tipFor(merchant: string): string | null {
  const m = merchant.toLowerCase();
  for (const key of Object.keys(CANCEL_TIPS)) {
    if (m.includes(key)) return CANCEL_TIPS[key];
  }
  return null;
}

function fmtUSD(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function Subscriptions() {
  const [statementText, setStatementText] = useState("");
  const [charges, setCharges] = useState<Charge[]>([]);
  const [busy, setBusy] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [draftMerchant, setDraftMerchant] = useState("");
  const [draftAmount, setDraftAmount] = useState("");
  const [draftFrequency, setDraftFrequency] = useState<Frequency>("monthly");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Charge[];
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time localStorage hydration on mount; cannot read localStorage during SSR-safe render
        if (Array.isArray(parsed)) setCharges(parsed);
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(charges));
    } catch {
      // ignore
    }
  }, [charges, hydrated]);

  async function extract() {
    if (!statementText.trim() || statementText.length < 20) return;
    setBusy(true);
    setWarning(null);
    try {
      const r = await fetch("/api/subscription-finder", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: statementText }),
      });
      const data = (await r.json()) as {
        charges?: Omit<Charge, "id" | "status">[];
        warning?: string;
      };
      if (data.warning) setWarning(data.warning);
      if (data.charges && data.charges.length > 0) {
        setCharges((prev) => [
          ...prev,
          ...data.charges!.map((c) => ({
            ...c,
            id: makeId(),
            status: "todo" as Status,
          })),
        ]);
        setStatementText("");
      } else if (!data.warning) {
        setWarning("No recurring charges found. Try pasting a longer statement, or add manually below.");
      }
    } catch (e) {
      setWarning(e instanceof Error ? e.message : "Extraction failed.");
    } finally {
      setBusy(false);
    }
  }

  function addManual(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(draftAmount.replace(/[^0-9.]/g, ""));
    if (!draftMerchant.trim() || !Number.isFinite(amount) || amount <= 0)
      return;
    setCharges((prev) => [
      ...prev,
      {
        id: makeId(),
        merchant: draftMerchant.trim(),
        amountCents: Math.round(amount * 100),
        frequency: draftFrequency,
        category: "other",
        status: "todo",
      },
    ]);
    setDraftMerchant("");
    setDraftAmount("");
    setDraftFrequency("monthly");
  }

  function setStatus(id: string, status: Status) {
    setCharges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c)),
    );
  }

  function remove(id: string) {
    setCharges((prev) => prev.filter((c) => c.id !== id));
  }

  // Calculate annual savings from cancelling/cancelled items.
  const cancelSavings = charges
    .filter((c) => c.status === "cancelling" || c.status === "cancelled")
    .reduce((sum, c) => {
      const yearly =
        c.frequency === "annual" ? c.amountCents : c.amountCents * 12;
      return sum + yearly;
    }, 0);

  const cancelledCount = charges.filter((c) => c.status === "cancelled").length;

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader rightSlot={<BackLink defaultHref="/dashboard" />} />
      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-10 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              Subscription finder
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              Stop the bleeding from forgotten subscriptions.
            </h1>
            <p className="text-lg text-ink-soft">
              Paste a bank or credit card statement &mdash; we
              extract every recurring charge so you can decide what
              to cancel. Most families turn up{" "}
              <strong className="text-ink">
                $30&ndash;$200 in monthly subscriptions
              </strong>{" "}
              they didn&rsquo;t realize the deceased was paying for.
            </p>
            {hydrated && cancelSavings > 0 && (
              <p className="mt-4 text-sm text-good">
                <strong>
                  Annual savings on the chopping block:{" "}
                  {fmtUSD(cancelSavings)}
                </strong>{" "}
                · {cancelledCount} fully cancelled
              </p>
            )}
          </div>

          <Card>
            <CardEyebrow>Step 1 — paste a statement</CardEyebrow>
            <CardTitle>The last 1&ndash;2 months works best.</CardTitle>
            <p className="text-ink-soft mt-3 mb-4 text-sm">
              Copy the transactions from the deceased&rsquo;s bank or
              credit card statement (PDF or web export). Anything
              recurring shows up multiple times in a couple of months
              &mdash; that&rsquo;s what we&rsquo;re looking for.
            </p>
            <Textarea
              rows={8}
              value={statementText}
              onChange={(e) => setStatementText(e.target.value)}
              placeholder="Paste your statement here — date, merchant, amount per line is fine. Bank-app exports usually work as-is."
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                onClick={extract}
                disabled={busy || statementText.length < 20}
                size="lg"
              >
                {busy ? "Scanning…" : "Find subscriptions →"}
              </Button>
              {statementText && (
                <Button
                  variant="ghost"
                  onClick={() => setStatementText("")}
                  disabled={busy}
                >
                  Clear
                </Button>
              )}
            </div>
            {warning && (
              <p className="mt-3 text-sm text-ink-soft italic">{warning}</p>
            )}
            <p className="mt-4 text-xs text-ink-muted">
              Statement text is sent to our AI provider only for the
              extraction; nothing is stored on our servers. The list
              below saves on your device only.
            </p>
          </Card>

          {hydrated && charges.length > 0 && (
            <Card>
              <CardEyebrow>Your list</CardEyebrow>
              <CardTitle>
                {charges.length} subscription
                {charges.length === 1 ? "" : "s"} found
              </CardTitle>
              <ul className="mt-4 space-y-2">
                {charges.map((c) => (
                  <ChargeRow
                    key={c.id}
                    charge={c}
                    onSetStatus={setStatus}
                    onRemove={remove}
                  />
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => window.print()}>
                  Print the list
                </Button>
              </div>
            </Card>
          )}

          <Card tone="soft">
            <CardEyebrow>Add one manually</CardEyebrow>
            <p className="text-ink-soft text-sm mt-1 mb-4">
              Found one in their email or wallet that wasn&rsquo;t on
              the statement?
            </p>
            <form onSubmit={addManual} className="space-y-3">
              <div>
                <Label htmlFor="merchant">Merchant / service</Label>
                <Input
                  id="merchant"
                  value={draftMerchant}
                  onChange={(e) => setDraftMerchant(e.target.value)}
                  placeholder="e.g. Patreon, Local YMCA"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="amount">Amount per charge</Label>
                  <Input
                    id="amount"
                    inputMode="decimal"
                    value={draftAmount}
                    onChange={(e) => setDraftAmount(e.target.value)}
                    placeholder="9.99"
                  />
                </div>
                <div>
                  <Label htmlFor="frequency">How often</Label>
                  <select
                    id="frequency"
                    value={draftFrequency}
                    onChange={(e) =>
                      setDraftFrequency(e.target.value as Frequency)
                    }
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-base"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual</option>
                    <option value="unknown">Not sure</option>
                  </select>
                </div>
              </div>
              <Button type="submit">Add</Button>
            </form>
          </Card>

          <Card tone="primary">
            <CardEyebrow>Why this matters</CardEyebrow>
            <p className="text-ink-soft mt-2 leading-relaxed">
              Subscriptions keep charging until somebody actively
              cancels. After a death, they often run for months
              before the family notices &mdash; sometimes years for
              annual charges. Cancelling everything within the first
              30 days is one of the highest-leverage things the
              executor can do.
            </p>
          </Card>

          <p className="text-xs text-ink-muted">
            Saved on this device only. Statement contents not retained
            after extraction.
          </p>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}

function ChargeRow({
  charge,
  onSetStatus,
  onRemove,
}: {
  charge: Charge;
  onSetStatus: (id: string, s: Status) => void;
  onRemove: (id: string) => void;
}) {
  const tip = tipFor(charge.merchant);
  return (
    <li>
      <div
        className={`rounded-xl border p-4 ${STATUS_TONE[charge.status]}`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-medium text-ink">
                {charge.merchant}
              </span>
              <span className="text-sm text-ink-soft">
                {fmtUSD(charge.amountCents)}
                {charge.frequency === "monthly" && "/mo"}
                {charge.frequency === "annual" && "/yr"}
              </span>
              <span className="text-xs text-ink-muted">
                · {CATEGORY_LABEL[charge.category] ?? "Other"}
              </span>
            </div>
            <div className="text-xs text-ink-muted mt-0.5">
              {STATUS_LABEL[charge.status]}
              {charge.lastSeen && ` · last seen ${charge.lastSeen}`}
            </div>
          </div>
          <button
            onClick={() => onRemove(charge.id)}
            className="text-xs text-ink-muted hover:text-ink underline-offset-2 hover:underline shrink-0"
          >
            Remove
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <StatusPill
            active={charge.status === "keeping"}
            onClick={() => onSetStatus(charge.id, "keeping")}
          >
            Keeping
          </StatusPill>
          <StatusPill
            active={charge.status === "cancelling"}
            onClick={() => onSetStatus(charge.id, "cancelling")}
          >
            Cancelling
          </StatusPill>
          <StatusPill
            active={charge.status === "cancelled"}
            onClick={() => onSetStatus(charge.id, "cancelled")}
          >
            Cancelled
          </StatusPill>
          {charge.status !== "todo" && (
            <button
              onClick={() => onSetStatus(charge.id, "todo")}
              className="text-xs text-ink-muted hover:text-ink underline-offset-2 hover:underline ml-auto self-center"
            >
              Reset
            </button>
          )}
        </div>

        {tip &&
          (charge.status === "cancelling" ||
            charge.status === "todo") && (
            <div className="mt-3 rounded-lg bg-surface border border-border px-3 py-2">
              <div className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold mb-1">
                How to cancel
              </div>
              <p className="text-sm text-ink-soft leading-relaxed">
                {tip}
              </p>
            </div>
          )}
      </div>
    </li>
  );
}
