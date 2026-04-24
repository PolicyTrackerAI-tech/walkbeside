"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Field";
import { fmtUSD } from "@/lib/pricing-data";

interface AnalyzerItem {
  name: string;
  cents: number;
  classification?: "good" | "fair" | "high" | "predatory";
  fairCentsLow?: number;
  fairCentsHigh?: number;
}

interface AnalyzerResult {
  items: AnalyzerItem[];
  totalQuoted: number;
  totalFairMid: number;
  potentialSavings: number;
}

const TONES: Record<string, { label: string; tone: string }> = {
  good: { label: "Fair", tone: "text-good" },
  fair: { label: "Fair", tone: "text-good" },
  high: { label: "High", tone: "text-warn" },
  predatory: { label: "Overpriced", tone: "text-bad" },
};

/** Screen 10 — Price list analyzer. */
export default function AnalyzerPage() {
  const [text, setText] = useState("");
  const [zip, setZip] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AnalyzerResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function analyze() {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/analyze-price-list", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, zip: zip || undefined }),
      });
      if (!r.ok) {
        const e = await r.json();
        throw new Error(JSON.stringify(e.error ?? "error"));
      }
      setResult(await r.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not analyze.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader backHref="/dashboard" backLabel="Dashboard" />
      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-10 space-y-6">
          <div>
            <CardEyebrow>Price list analyzer</CardEyebrow>
            <h1 className="font-serif text-3xl text-ink mb-3">
              Paste their itemized price list. We&rsquo;ll flag the overcharges.
            </h1>
            <p className="text-ink-soft">
              Type or paste the line items from the General Price List they
              gave you (or what&rsquo;s on your contract). We&rsquo;ll match each item
              to fair-market ranges for your region.
            </p>
          </div>

          <Card>
            <div className="space-y-5">
              <div>
                <Label htmlFor="zip" hint="So we can adjust for your region.">
                  Zip code
                </Label>
                <Input
                  id="zip"
                  inputMode="numeric"
                  maxLength={5}
                  value={zip}
                  onChange={(e) =>
                    setZip(e.target.value.replace(/[^0-9]/g, ""))
                  }
                />
              </div>
              <div>
                <Label
                  htmlFor="list"
                  hint="One item per line, like 'Basic services fee  $2,495'."
                >
                  Itemized price list
                </Label>
                <Textarea
                  id="list"
                  rows={10}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={`Basic services fee   $2,495\nEmbalming            $1,150\nMetal casket         $4,200\nViewing facility       $750\nGrave liner          $1,800\nDeath certificates (10) $250\nTotal                $12,650`}
                />
              </div>
              {error && (
                <div className="text-sm text-bad bg-bad-soft border border-bad/30 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}
              <Button onClick={analyze} disabled={busy || text.length < 20}>
                {busy ? "Analyzing…" : "Analyze price list"}
              </Button>
              <p className="text-xs text-ink-muted">
                Photo upload &amp; OCR is the next iteration. For now, type or
                paste — it works just as well.
              </p>
            </div>
          </Card>

          {result && (
            <>
              <Card tone={result.potentialSavings > 0 ? "warn" : "good"}>
                <CardEyebrow>Summary</CardEyebrow>
                <div className="grid sm:grid-cols-3 gap-4">
                  <Stat label="They quoted" value={fmtUSD(result.totalQuoted / 100)} />
                  <Stat
                    label="Fair total (midpoint)"
                    value={fmtUSD(result.totalFairMid / 100)}
                  />
                  <Stat
                    label="Potential savings"
                    value={fmtUSD(result.potentialSavings / 100)}
                    tone={result.potentialSavings > 0 ? "bad" : "good"}
                  />
                </div>
                {result.potentialSavings > 0 && (
                  <p className="text-ink-soft text-sm mt-4">
                    Most of that is fixable. The high-priced rows below are
                    where to push back — sometimes you can ask the funeral home
                    to match fair-market prices, sometimes you can swap to a
                    third-party vendor (caskets, urns, headstones).
                  </p>
                )}
              </Card>

              <div className="rounded-2xl border border-border bg-surface overflow-hidden">
                <div className="grid grid-cols-12 px-5 py-3 border-b border-border bg-surface-soft text-xs uppercase tracking-wider text-ink-muted">
                  <div className="col-span-6">Item</div>
                  <div className="col-span-2 text-right">Quoted</div>
                  <div className="col-span-2 text-right">Fair range</div>
                  <div className="col-span-2 text-right">Verdict</div>
                </div>
                <ul>
                  {result.items.map((it, i) => {
                    const tone = it.classification
                      ? TONES[it.classification]
                      : { label: "—", tone: "text-ink-muted" };
                    return (
                      <li
                        key={i}
                        className="grid grid-cols-12 px-5 py-4 border-b border-border last:border-b-0"
                      >
                        <div className="col-span-6 text-ink">{it.name}</div>
                        <div className="col-span-2 text-right text-ink">
                          {fmtUSD(it.cents / 100)}
                        </div>
                        <div className="col-span-2 text-right text-ink-soft">
                          {it.fairCentsLow != null && it.fairCentsHigh != null
                            ? `${fmtUSD(it.fairCentsLow / 100)}–${fmtUSD(it.fairCentsHigh / 100)}`
                            : "—"}
                        </div>
                        <div className={`col-span-2 text-right font-medium ${tone.tone}`}>
                          {tone.label}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "good" | "bad";
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-ink-muted">
        {label}
      </div>
      <div
        className={`font-serif text-2xl mt-1 ${tone === "good" ? "text-good" : tone === "bad" ? "text-bad" : "text-ink"}`}
      >
        {value}
      </div>
    </div>
  );
}
