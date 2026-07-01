"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { DocInput } from "@/components/checker/DocInput";
import { fmtUSD } from "@/lib/pricing-data";

/**
 * Self-collected multi-home comparison: a family who gathered their own quotes
 * (outside the outreach flow) runs each through the SAME analyzer the single-
 * quote checker uses, and sees them side by side.
 *
 * Neutrality is structural (guardrail #3): quotes render in the order the
 * family entered them, every column shows the identical metric set, and there
 * is no ranking, sorting, winner badge, or recommendation anywhere. Parallel
 * facts; the family chooses.
 */

interface QuoteSlot {
  label: string;
  text: string;
}

interface SlotResult {
  totalQuoted: number;
  potentialSavings: number;
  violations?: { severity: "violation" | "suspicious" | "info" }[];
  coverage?: { level: "high" | "partial" | "low" };
}

const EMPTY_SLOT: QuoteSlot = { label: "", text: "" };

export function CompareQuotes() {
  const [slots, setSlots] = useState<QuoteSlot[]>([
    { ...EMPTY_SLOT },
    { ...EMPTY_SLOT },
  ]);
  const [zip, setZip] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<(SlotResult | null)[] | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (results && resultRef.current) {
      resultRef.current.focus();
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [results]);

  function updateSlot(i: number, patch: Partial<QuoteSlot>) {
    setSlots((prev) => prev.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  }

  const filled = slots.filter((s) => s.text.trim().length >= 20);

  async function compare() {
    setBusy(true);
    setError(null);
    try {
      // Each quote goes through the exact same analysis the single checker
      // runs — same benchmarks, same FTC rules, same conservative math.
      const settled = await Promise.all(
        slots.map(async (s) => {
          if (s.text.trim().length < 20) return null;
          const r = await fetch("/api/analyze-price-list", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ text: s.text, zip: zip || undefined }),
          });
          if (!r.ok) return null;
          return (await r.json()) as SlotResult;
        }),
      );
      if (settled.filter(Boolean).length < 2) {
        setError(
          "We couldn't read at least two of the quotes — check them and try again.",
        );
        return;
      }
      setResults(settled);
    } catch {
      setError("Network error — try again.");
    } finally {
      setBusy(false);
    }
  }

  const compared = results
    ? slots
        .map((s, i) => ({ slot: s, res: results[i], idx: i }))
        .filter((x): x is { slot: QuoteSlot; res: SlotResult; idx: number } =>
          Boolean(x.res),
        )
    : [];

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader rightSlot={<BackLink defaultHref="/analyzer" defaultLabel="← The quote checker" />} />
      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-10 space-y-6">
          <div>
            <CardEyebrow>Compare quotes</CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              Gathered quotes from more than one home? See them side by side.
            </h1>
            <p className="text-ink-soft">
              Each quote gets the exact same neutral check &mdash; fair-range
              verdicts for your region and likely FTC Funeral Rule flags. We
              never rank, score, or recommend a home. Same facts for each; the
              choice is yours.
            </p>
          </div>

          <Card>
            <div className="mb-5 max-w-xs">
              <Label htmlFor="zip" hint="One zip for all quotes — adjusts the fair ranges.">
                Zip code
              </Label>
              <Input
                id="zip"
                inputMode="numeric"
                maxLength={5}
                value={zip}
                onChange={(e) => setZip(e.target.value.replace(/[^0-9]/g, ""))}
              />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {slots.map((s, i) => (
                <div key={i} className="space-y-3">
                  <div>
                    <Label htmlFor={`label-${i}`} hint="Just for your own labels — never shared.">
                      Funeral home name (optional)
                    </Label>
                    <Input
                      id={`label-${i}`}
                      value={s.label}
                      maxLength={80}
                      placeholder={`Quote ${i + 1}`}
                      onChange={(e) => updateSlot(i, { label: e.target.value })}
                    />
                  </div>
                  <DocInput
                    id={`quote-${i}`}
                    label={`Quote ${i + 1}`}
                    hint="Photo of the price list, or type the lines."
                    photoAriaLabel={`Upload a photo of quote ${i + 1}`}
                    text={s.text}
                    setText={(v) => updateSlot(i, { text: v })}
                    disabled={busy}
                    rows={6}
                  />
                </div>
              ))}
            </div>
            {slots.length < 3 && (
              <button
                type="button"
                onClick={() => setSlots((prev) => [...prev, { ...EMPTY_SLOT }])}
                className="mt-4 text-sm text-primary-deep underline underline-offset-2 hover:text-ink"
              >
                + Add a third quote
              </button>
            )}
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
              disabled={busy || filled.length < 2}
              className="mt-5"
            >
              {busy ? "Checking each quote…" : "Compare the quotes"}
            </Button>
          </Card>

          {compared.length >= 2 && (
            <div ref={resultRef} tabIndex={-1} className="space-y-6 focus:outline-none">
              <div className={`grid gap-4 ${compared.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
                {compared.map(({ slot, res, idx }) => {
                  const violations =
                    res.violations?.filter((v) => v.severity === "violation").length ?? 0;
                  const suspicious =
                    res.violations?.filter((v) => v.severity === "suspicious").length ?? 0;
                  return (
                    <Card key={idx}>
                      <CardEyebrow>{slot.label.trim() || `Quote ${idx + 1}`}</CardEyebrow>
                      <dl className="mt-2 space-y-3 text-sm">
                        <div>
                          <dt className="text-xs uppercase tracking-wider text-ink-muted">
                            They quoted
                          </dt>
                          <dd className="font-serif text-2xl text-ink mt-0.5">
                            {fmtUSD(res.totalQuoted / 100)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase tracking-wider text-ink-muted">
                            Above fair for your region
                          </dt>
                          <dd
                            className={`font-serif text-2xl mt-0.5 ${res.potentialSavings > 0 ? "text-bad" : "text-good"}`}
                          >
                            {res.potentialSavings > 0
                              ? fmtUSD(res.potentialSavings / 100)
                              : "$0"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase tracking-wider text-ink-muted">
                            FTC findings
                          </dt>
                          <dd className="text-ink mt-0.5">
                            {violations > 0 && (
                              <span className="text-bad font-medium">
                                {violations} likely violation{violations === 1 ? "" : "s"}
                              </span>
                            )}
                            {violations > 0 && suspicious > 0 && " · "}
                            {suspicious > 0 && (
                              <span className="text-warn">
                                {suspicious} worth questioning
                              </span>
                            )}
                            {violations === 0 && suspicious === 0 && (
                              <span className="text-ink-muted">none flagged</span>
                            )}
                          </dd>
                        </div>
                        {res.coverage && res.coverage.level !== "high" && (
                          <div className="text-xs text-ink-muted">
                            Partial read &mdash; we couldn&rsquo;t benchmark every
                            line on this one. Treat its numbers as a floor.
                          </div>
                        )}
                      </dl>
                    </Card>
                  );
                })}
              </div>

              <p className="text-sm text-ink-soft">
                Shown in the order you entered them &mdash; we never rank or
                recommend a home. For the full line-by-line detail on any quote,
                run it through the{" "}
                <Link href="/analyzer" className="text-primary-deep underline">
                  checker
                </Link>
                . And remember: prices are negotiable, and you can mix &mdash;
                buy the casket or urn anywhere, use any home for services.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
