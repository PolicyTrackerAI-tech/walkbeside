"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DocInput } from "@/components/checker/DocInput";
import { fmtUSD } from "@/lib/pricing-data";
import type { DriftItem, DriftResult } from "@/lib/bill-drift";

/**
 * Final-bill vs original-quote drift check. Two documents in, a line-by-line
 * diff out — pure arithmetic on the family's own paperwork, no benchmarks.
 * Reuses the analyzer's photo-OCR endpoint for each side (via DocInput).
 */

const KIND_LABEL: Record<DriftItem["kind"], { label: string; tone: string }> = {
  added: { label: "Added — not on the quote", tone: "text-bad" },
  increased: { label: "Increased", tone: "text-warn" },
  decreased: { label: "Decreased", tone: "text-good" },
  unchanged: { label: "Matches the quote", tone: "text-ink-muted" },
  selected: { label: "Selection made", tone: "text-ink-muted" },
  removed: { label: "On the quote, not the bill", tone: "text-ink-muted" },
};

export function BillCheck() {
  const [quoteText, setQuoteText] = useState("");
  const [billText, setBillText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DriftResult | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.focus();
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  async function compare() {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/compare-bill", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ quoteText, billText }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(
          d?.error === "couldnt_read_quote"
            ? "We couldn't read any line items from the quote — check that side and try again."
            : d?.error === "couldnt_read_bill"
              ? "We couldn't read any line items from the final bill — check that side and try again."
              : "Something went wrong comparing the documents. Try again.",
        );
        return;
      }
      setResult(d as DriftResult);
    } catch {
      setError("Network error — try again.");
    } finally {
      setBusy(false);
    }
  }

  const flagged = result
    ? result.items.filter((i) => i.kind === "added" || i.kind === "increased")
    : [];
  const rest = result
    ? result.items.filter((i) => i.kind !== "added" && i.kind !== "increased")
    : [];

  return (
    <main className="flex-1 flex flex-col">
      <div className="print:hidden">
        <SiteHeader rightSlot={<BackLink defaultHref="/analyzer" defaultLabel="← The quote checker" />} />
      </div>
      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-10 space-y-6">
          <div className="print:hidden">
            <CardEyebrow>Final-bill check</CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              Does the final bill match the quote you were given?
            </h1>
            <p className="text-ink-soft">
              Add both documents and we&rsquo;ll compare them line by line —
              anything added or increased, in plain dollars. Every finding comes
              from your own two documents, so it&rsquo;s not an estimate:
              it&rsquo;s arithmetic you can put in front of the funeral home.
              Free, like everything we do.
            </p>
          </div>

          <Card className="print:hidden">
            <div className="grid gap-6 sm:grid-cols-2">
              <DocInput
                id="quote"
                label="1. The original quote"
                hint="The price list or quote they gave you at the start — photo or typed."
                photoAriaLabel="Upload a photo of the original quote"
                text={quoteText}
                setText={setQuoteText}
                disabled={busy}
              />
              <DocInput
                id="bill"
                label="2. The final bill"
                hint="The signed statement or final bill — photo or typed."
                photoAriaLabel="Upload a photo of the final bill"
                text={billText}
                setText={setBillText}
                disabled={busy}
              />
            </div>
            {error && (
              <div
                role="status"
                aria-live="polite"
                className="mt-4 text-sm text-bad bg-bad-soft border border-bad/30 rounded-xl px-4 py-3"
              >
                {error}
              </div>
            )}
            <Button
              onClick={compare}
              disabled={busy || quoteText.length < 20 || billText.length < 20}
              className="mt-5"
            >
              {busy ? "Comparing…" : "Compare the documents"}
            </Button>
          </Card>

          {result && (
            <div ref={resultRef} tabIndex={-1} className="space-y-6 focus:outline-none">
              {/* Letterhead — print only, same convention as the analyzer. */}
              <div className="hidden print:block border-b border-border pb-3 mb-2">
                <div className="flex items-baseline justify-between">
                  <span className="font-serif text-xl text-ink">Honest Funeral</span>
                  <span className="text-xs text-ink-muted">
                    Final-bill check ·{" "}
                    {new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-xs text-ink-muted mt-1">
                  A line-by-line comparison of the family&rsquo;s own quote and
                  final bill. Free and neutral — no money from funeral homes or
                  insurers.
                </p>
              </div>

              <Card tone={result.driftCents > 0 ? "warn" : "good"}>
                {result.driftCents > 0 ? (
                  <>
                    <div className="text-xs uppercase tracking-wider text-ink-muted">
                      Above the quote you were given
                    </div>
                    <div
                      role="status"
                      className="font-serif text-4xl sm:text-5xl text-bad mt-1 leading-none"
                    >
                      {fmtUSD(result.driftCents / 100)}
                    </div>
                    <p className="text-ink-soft mt-2">
                      {result.addedCount > 0 &&
                        `${result.addedCount} charge${result.addedCount === 1 ? "" : "s"} on the bill that ${result.addedCount === 1 ? "wasn't" : "weren't"} on the quote`}
                      {result.addedCount > 0 && result.increasedCount > 0 && " and "}
                      {result.increasedCount > 0 &&
                        `${result.increasedCount} line${result.increasedCount === 1 ? "" : "s"} higher than quoted`}
                      . Worth asking the funeral home to walk you through each
                      one — you&rsquo;re entitled to an explanation before you
                      pay.
                    </p>
                  </>
                ) : (
                  <>
                    <div
                      role="status"
                      className="font-serif text-3xl sm:text-4xl text-good leading-tight"
                    >
                      The bill matches the quote
                    </div>
                    <p className="text-ink-soft mt-2">
                      Nothing on the final bill is new or higher than the quote
                      you shared. That&rsquo;s how it should be.
                    </p>
                  </>
                )}
                {result.savedCents > 0 && (
                  <p className="text-sm text-ink-muted mt-3">
                    In the other direction: {fmtUSD(result.savedCents / 100)} of
                    quoted charges were reduced or dropped on the final bill.
                  </p>
                )}
                <p className="text-xs text-ink-muted mt-3">
                  Line pairing is conservative — if we couldn&rsquo;t confidently
                  match a line across the two documents, it&rsquo;s listed as
                  &ldquo;added&rdquo; or &ldquo;on the quote, not the
                  bill&rdquo; for you to confirm, never silently merged.
                </p>
              </Card>

              {flagged.length > 0 && (
                <Card tone="warn">
                  <CardTitle>What to ask about</CardTitle>
                  <ul className="mt-3 divide-y divide-border">
                    {flagged.map((it, i) => (
                      <li key={i} className="py-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <div>
                          <span className="text-ink font-medium">{it.name}</span>
                          <span className={`block text-xs font-medium mt-0.5 ${KIND_LABEL[it.kind].tone}`}>
                            {KIND_LABEL[it.kind].label}
                          </span>
                        </div>
                        <div className="text-right whitespace-nowrap">
                          <span className="text-ink font-semibold">
                            {fmtUSD((it.billCents ?? 0) / 100)}
                          </span>
                          {it.kind === "increased" && it.quoteCents != null && (
                            <span className="block text-xs text-ink-muted">
                              quoted {fmtUSD(it.quoteCents / 100)} · +
                              {fmtUSD((it.deltaCents ?? 0) / 100)}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-ink-soft mt-4">
                    A calm script: &ldquo;These items are new or higher than the
                    quote you gave us on [date]. Can you walk me through each
                    one? If it wasn&rsquo;t something we selected, please remove
                    it.&rdquo;
                  </p>
                </Card>
              )}

              {rest.length > 0 && (
                <Card>
                  <CardEyebrow>Everything else</CardEyebrow>
                  <ul className="mt-2 divide-y divide-border">
                    {rest.map((it, i) => (
                      <li key={i} className="py-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <div>
                          <span className="text-ink">{it.name}</span>
                          <span className={`block text-xs mt-0.5 ${KIND_LABEL[it.kind].tone}`}>
                            {KIND_LABEL[it.kind].label}
                            {it.kind === "selected" &&
                              it.quoteCentsLow != null &&
                              it.quoteCentsHigh != null &&
                              ` (quote showed ${fmtUSD(it.quoteCentsLow / 100)}–${fmtUSD(it.quoteCentsHigh / 100)})`}
                          </span>
                        </div>
                        <div className="text-right whitespace-nowrap text-ink-soft">
                          {it.billCents != null
                            ? fmtUSD(it.billCents / 100)
                            : it.quoteCents != null
                              ? fmtUSD(it.quoteCents / 100)
                              : "—"}
                          {it.kind === "decreased" && it.deltaCents != null && (
                            <span className="block text-xs text-good">
                              −{fmtUSD(-it.deltaCents / 100)} vs quote
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              <div className="flex flex-wrap gap-3 print:hidden">
                <Button variant="secondary" onClick={() => window.print()}>
                  Print / Save as PDF
                </Button>
              </div>

              <p className="text-xs text-ink-muted print:hidden">
                Want the fairness read too? The{" "}
                <Link href="/analyzer" className="underline hover:text-ink-soft">
                  quote checker
                </Link>{" "}
                compares each line against fair-market ranges for your region.
              </p>

              {/* Print footer — same convention as the analyzer. */}
              <div className="hidden print:block border-t border-border pt-3 mt-4 text-xs text-ink-muted leading-relaxed">
                <p>
                  Line-by-line comparison of the family&rsquo;s own documents —
                  arithmetic, not an estimate. honestfuneral.co/bill-check ·
                  Honest Funeral is free to families and takes no money from
                  funeral homes or insurers.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
