"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import {
  markupSummary,
  markupLetter,
  type MarkupRow,
} from "@/lib/cash-advance";
import { fmtUSD } from "@/lib/pricing-data";

/**
 * Cash-advance markup verification — the proven-number tool. The family holds
 * two documents for the same item: the funeral home's statement and the
 * vendor's own receipt. Two numbers in, the exact difference out. Everything
 * stays on this device; nothing is uploaded or sent.
 */

interface RowState {
  name: string;
  charged: string; // dollars as typed
  vendor: string;
}

const EMPTY: RowState = { name: "", charged: "", vendor: "" };

const EXAMPLES = [
  "Flowers — casket spray",
  "Newspaper obituary",
  "Death certificates",
  "Clergy honorarium",
  "Crematory fee",
];

function parseDollars(s: string): number {
  const cleaned = s.replace(/[$,\s]/g, "");
  if (!cleaned || !/^\d*(?:\.\d{0,2})?$/.test(cleaned)) return 0;
  return Math.round(parseFloat(cleaned) * 100) || 0;
}

export function CashAdvanceCheck() {
  const [rows, setRows] = useState<RowState[]>([
    { ...EMPTY },
    { ...EMPTY },
    { ...EMPTY },
  ]);
  const [homeName, setHomeName] = useState("");
  const [copied, setCopied] = useState(false);

  function update(i: number, patch: Partial<RowState>) {
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  }

  const parsed: MarkupRow[] = rows.map((r) => ({
    name: r.name,
    chargedCents: parseDollars(r.charged),
    vendorCents: parseDollars(r.vendor),
  }));
  const summary = markupSummary(parsed);
  const hasResults = summary.rows.length > 0;
  const letter = hasResults && summary.markedUp.length > 0
    ? markupLetter(summary, homeName)
    : "";

  return (
    <main className="flex-1 flex flex-col">
      <div className="print:hidden">
        <SiteHeader rightSlot={<BackLink defaultHref="/analyzer" defaultLabel="← Price checker" />} />
      </div>
      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-10 space-y-6">
          <div className="print:hidden">
            <CardEyebrow>Cash-advance check</CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              The receipt says one number. The bill says another.
            </h1>
            <p className="text-ink-soft">
              Cash-advance items are things the funeral home buys from someone
              else on your behalf &mdash; flowers, the newspaper obituary,
              death certificates, the clergy honorarium. You&rsquo;re entitled
              to ask what the vendor actually charged. Put the two numbers side
              by side and the difference stops being a suspicion and becomes a
              documented fact.
            </p>
            <p className="text-sm text-ink-muted mt-2">
              A markup isn&rsquo;t automatically illegal &mdash; but the FTC
              Funeral Rule requires the funeral home to disclose that it adds a
              charge to cash-advance items. Nothing you type here leaves this
              device.
            </p>
          </div>

          <Card>
            <CardTitle>The items, from your two documents</CardTitle>
            <p className="text-sm text-ink-soft mt-1 mb-4">
              For each item: what the funeral home billed, and what the
              vendor&rsquo;s own receipt or invoice shows. Common ones:{" "}
              {EXAMPLES.join(" · ")}.
            </p>
            <div className="space-y-4">
              {rows.map((r, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_8rem_8rem] gap-2 items-end">
                  <div>
                    <Label htmlFor={`name-${i}`}>Item</Label>
                    <Input
                      id={`name-${i}`}
                      value={r.name}
                      maxLength={80}
                      placeholder={EXAMPLES[i % EXAMPLES.length]}
                      onChange={(e) => update(i, { name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`charged-${i}`}>Home billed ($)</Label>
                    <Input
                      id={`charged-${i}`}
                      inputMode="decimal"
                      value={r.charged}
                      onChange={(e) => update(i, { charged: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`vendor-${i}`}>Receipt says ($)</Label>
                    <Input
                      id={`vendor-${i}`}
                      inputMode="decimal"
                      value={r.vendor}
                      onChange={(e) => update(i, { vendor: e.target.value })}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button
                variant="secondary"
                onClick={() => setRows((rs) => [...rs, { ...EMPTY }])}
              >
                + Add another item
              </Button>
            </div>
          </Card>

          {hasResults && (
            <Card tone={summary.totalMarkupCents > 0 ? "primary" : "soft"}>
              <CardTitle>
                {summary.totalMarkupCents > 0
                  ? `Documented difference: ${fmtUSD(summary.totalMarkupCents / 100)}`
                  : "No markup found — billed at or below the receipts"}
              </CardTitle>
              <div className="mt-3 space-y-2">
                {summary.rows.map((r) => (
                  <div
                    key={r.name}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm"
                  >
                    <span className="text-ink font-medium">{r.name}</span>
                    <span className={r.atCost ? "text-ink-muted" : "text-ink"}>
                      {r.atCost
                        ? "at cost — good sign"
                        : `billed ${fmtUSD(r.chargedCents / 100)}, receipt ${fmtUSD(r.vendorCents / 100)} → +${fmtUSD(r.markupCents / 100)}${r.markupPct != null ? ` (${r.markupPct}%)` : ""}`}
                    </span>
                  </div>
                ))}
              </div>
              {summary.totalMarkupCents > 0 && (
                <p className="text-sm text-ink-soft mt-3">
                  Worth asking about &mdash; calmly and in writing. If the
                  price list said cash-advance items are billed at cost, this
                  is provable overbilling. If not, the home should have
                  disclosed the added charge.
                </p>
              )}
            </Card>
          )}

          {letter && (
            <Card>
              <CardTitle>The message to send</CardTitle>
              <div className="mt-3 max-w-sm">
                <Label htmlFor="home">Funeral home name (optional)</Label>
                <Input
                  id="home"
                  value={homeName}
                  maxLength={80}
                  onChange={(e) => setHomeName(e.target.value)}
                />
              </div>
              <pre className="mt-4 whitespace-pre-wrap font-sans text-sm text-ink bg-surface-soft border border-border rounded-xl p-4">
                {letter}
              </pre>
              <div className="mt-3 flex flex-wrap gap-3 print:hidden">
                <Button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(letter);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    } catch {
                      // clipboard unavailable — the text is selectable above
                    }
                  }}
                >
                  {copied ? "Copied ✓" : "Copy the message"}
                </Button>
                <Button variant="secondary" onClick={() => window.print()}>
                  Print / Save as PDF
                </Button>
              </div>
            </Card>
          )}

          <p className="text-sm text-ink-soft print:hidden">
            Checking the whole bill, not just these items? The{" "}
            <Link href="/bill-check" className="text-primary-deep underline">
              final-bill check
            </Link>{" "}
            diffs it against the original quote line by line, and the{" "}
            <Link href="/analyzer" className="text-primary-deep underline">
              price checker
            </Link>{" "}
            flags overcharges on the price list itself.
          </p>

          {/* Print footer — house convention. */}
          <div className="hidden print:block border-t border-border pt-3 mt-4 text-xs text-ink-muted leading-relaxed">
            <p>
              Every number above comes from the family&rsquo;s own documents.
              Free to families &mdash; Honest Funeral takes no money from
              funeral homes or insurers, and never steers you to any provider.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
