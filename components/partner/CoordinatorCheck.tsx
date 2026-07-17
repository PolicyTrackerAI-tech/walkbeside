"use client";

import { useState } from "react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button, LinkButton } from "@/components/ui/Button";
import { Label, Textarea } from "@/components/ui/Field";
import { fmtCents } from "@/lib/stripe";
import { ViolationsPanel } from "@/components/analyzer/ViolationsPanel";
import type { AnalyzerItem, Violation } from "@/components/analyzer/types";

interface CheckResult {
  items: AnalyzerItem[];
  totalQuoted: number;
  totalFairMid: number;
  potentialSavings: number;
  violations?: Violation[];
}

/**
 * Coordinator quote check, shared by the token route
 * (/partner/r/[token]/check) and the signed-in portal (/portal/check). It
 * calls the same public analyzer endpoints the family tool uses — no partner
 * credential is ever sent. One honesty wrinkle: /api/analyze-price-list
 * persists a price_list_analyses row for any SIGNED-IN user, so the default
 * "Nothing was saved" closing line is only true for anonymous (token-route)
 * coordinators. Signed-in surfaces MUST pass `saveNote` with wording that is
 * true for a signed-in session.
 */
export function CoordinatorCheck({
  backHref,
  backLabel,
  saveNote,
}: {
  /** Where "done here" leads — the token report or /portal. */
  backHref: string;
  backLabel?: string;
  /** Replaces the "Nothing was saved" sentence when the caller is signed in. */
  saveNote?: string;
}) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [letter, setLetter] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [letterBusy, setLetterBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function check() {
    setBusy(true);
    setError(null);
    setResult(null);
    setLetter(null);
    try {
      // Deliberately NO `contributed` field (and never add the consent
      // checkbox here): absent → the route stores contributed=false, so a
      // coordinator's staged/test check can never feed the public fair-price
      // aggregation. Only a family can consent to contributing their data.
      const r = await fetch("/api/analyze-price-list", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!r.ok) {
        setError(
          r.status === 429
            ? "Getting a lot of checks right now — try again in a minute."
            : "Couldn't check that just now — try again.",
        );
        return;
      }
      setResult(await r.json());
    } catch {
      setError("Couldn't check that just now — try again.");
    } finally {
      setBusy(false);
    }
  }

  async function draftLetter() {
    if (!result) return;
    setLetterBusy(true);
    try {
      const r = await fetch("/api/analyze-price-list/draft-letter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: result.items,
          violations: result.violations,
          potentialSavings: result.potentialSavings,
          totalQuoted: result.totalQuoted,
        }),
      });
      if (r.ok) setLetter((await r.json()).letter);
    } finally {
      setLetterBusy(false);
    }
  }

  return (
    <>
      <Card>
        <CardTitle>Paste the price list</CardTitle>
        <div className="mt-3">
          <Label htmlFor="check-text">Price list text</Label>
          <Textarea
            id="check-text"
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the itemized price list here…"
          />
        </div>
        {error && <p className="text-sm text-bad mt-2">{error}</p>}
        <div className="mt-3">
          <Button onClick={check} disabled={busy || text.trim().length < 20}>
            {busy ? "Checking…" : "Check this quote →"}
          </Button>
        </div>
      </Card>

      {result && (
        <>
          <Card>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-ink-muted text-xs uppercase tracking-wider mb-1">
                  Total quoted
                </div>
                <div className="font-serif text-xl text-ink">
                  {fmtCents(result.totalQuoted)}
                </div>
              </div>
              <div>
                <div className="text-ink-muted text-xs uppercase tracking-wider mb-1">
                  Fair estimate
                </div>
                <div className="font-serif text-xl text-ink">
                  {fmtCents(result.totalFairMid)}
                </div>
              </div>
              <div>
                <div className="text-ink-muted text-xs uppercase tracking-wider mb-1">
                  Potential overcharge
                </div>
                <div className="font-serif text-xl text-ink">
                  {result.potentialSavings > 0
                    ? fmtCents(result.potentialSavings)
                    : "—"}
                </div>
              </div>
            </div>
          </Card>

          {result.violations && result.violations.length > 0 && (
            <ViolationsPanel violations={result.violations} />
          )}

          <Button variant="secondary" onClick={draftLetter} disabled={letterBusy}>
            {letterBusy ? "Drafting…" : "Draft a pushback letter"}
          </Button>
        </>
      )}

      {letter && (
        <Card>
          <CardTitle>Draft letter</CardTitle>
          <pre className="whitespace-pre-wrap text-sm text-ink mt-3 font-sans">
            {letter}
          </pre>
        </Card>
      )}

      {result && (
        <Card tone="soft">
          <p className="text-sm text-ink-soft mb-3">
            Done here?{" "}
            {saveNote ??
              "Nothing was saved — check another quote anytime, or head back to your report."}
          </p>
          <LinkButton href={backHref} variant="secondary">
            {backLabel ?? "Back to your report →"}
          </LinkButton>
        </Card>
      )}
    </>
  );
}
