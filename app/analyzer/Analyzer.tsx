"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Field";
import { fmtUSD, dataSourceForZip, DATA_SOURCE_LABEL } from "@/lib/pricing-data";
import {
  overchargeCents,
  ftcFlagFor,
  savingsBreakdown,
  buildShareText,
} from "@/lib/analyzer-display";

interface AnalyzerItem {
  name: string;
  cents: number;
  classification?: "good" | "fair" | "high" | "predatory";
  fairCentsLow?: number;
  fairCentsHigh?: number;
  isRange?: boolean;
  centsLow?: number;
  centsHigh?: number;
  qty?: number;
}

type Severity = "violation" | "suspicious" | "info";

interface Violation {
  ruleId: string;
  severity: Severity;
  title: string;
  description: string;
  ftcReference?: string;
  evidence?: string;
  whatToSay?: string;
}

interface AdvocacyMove {
  title: string;
  detail: string;
}

interface Coverage {
  pricedLines: number;
  parsedItems: number;
  benchmarked: number;
  unbenchmarked: number;
  missed: number;
  level: "high" | "partial" | "low";
  note: string;
}

interface AnalyzerResult {
  items: AnalyzerItem[];
  totalQuoted: number;
  totalFairMid: number;
  potentialSavings: number;
  violations?: Violation[];
  summary?: {
    bottomLine: string;
    moves: AdvocacyMove[];
    reassurance: string;
  };
  coverage?: Coverage;
}

const TONES: Record<string, { label: string; tone: string }> = {
  good: { label: "Good", tone: "text-good" },
  fair: { label: "Fair", tone: "text-good" },
  high: { label: "High", tone: "text-warn" },
  predatory: { label: "Overpriced", tone: "text-bad" },
};

/**
 * Client-side downscale before posting an image to /api/extract-price-list-image.
 * Phones produce 4-12MB JPEGs; we cap at 2048px on the long edge and re-encode
 * JPEG at 0.85 quality so the base64 payload stays comfortably under Vercel's
 * serverless body limit. Always outputs image/jpeg so the server gets a
 * consistent media_type.
 */
async function downscaleImage(
  file: File,
  maxDim = 2048,
  quality = 0.85,
): Promise<{ dataUrl: string; mediaType: "image/jpeg" }> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Couldn't read the file."));
    reader.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("Couldn't decode the image."));
    i.src = dataUrl;
  });
  let { width, height } = img;
  if (width > maxDim || height > maxDim) {
    const ratio = Math.min(maxDim / width, maxDim / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable in this browser.");
  ctx.drawImage(img, 0, 0, width, height);
  return {
    dataUrl: canvas.toDataURL("image/jpeg", quality),
    mediaType: "image/jpeg",
  };
}

/**
 * A realistic, deliberately-overpriced direct-cremation quote used by the "see a
 * sample" button. It exercises the whole checker at once: services above fair,
 * an FTC violation (a casket pushed on a direct cremation), third-party rights
 * (the urn range), and a correctly-fair per-unit item (10 death certs at $25).
 * It is just demo input — the checker computes the result live, nothing faked.
 */
const SAMPLE_BILL = `Direct cremation arrangement
Basic services fee $3,995
Transfer of remains $695
Embalming $1,295
Metal casket $4,200
Cremation container $295
Death certificates (10) $250
Urns $95-$1,800
Total $10,730`;

/** Screen 10 — Price list analyzer. */
export function Analyzer({ partner }: { partner?: string }) {
  const [text, setText] = useState("");
  const [zip, setZip] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AnalyzerResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [sample, setSample] = useState(false);
  const [letter, setLetter] = useState<string | null>(null);
  const [letterBusy, setLetterBusy] = useState(false);
  const [letterCopied, setLetterCopied] = useState(false);

  async function analyze(opts?: { text?: string; zip?: string; hint?: string }) {
    const useText = opts?.text ?? text;
    const useZip = opts?.zip ?? zip;
    setBusy(true);
    setError(null);
    setLetter(null);
    try {
      // Pass the recommended service type from /decide if we have it —
      // it lets the bundling detector know things like 'this is a direct
      // cremation, so a casket on the quote is a violation.' The sample passes
      // its own hint so the demo result is deterministic regardless of any
      // stale /decide value left in this browser.
      let serviceTypeHint = opts?.hint;
      if (serviceTypeHint === undefined) {
        try {
          serviceTypeHint =
            window.sessionStorage.getItem(
              "hf-decide:recommendedServiceType",
            ) ?? undefined;
        } catch {
          // ignore
        }
      }
      const r = await fetch("/api/analyze-price-list", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          text: useText,
          zip: useZip || undefined,
          serviceTypeHint,
        }),
      });
      if (!r.ok) {
        const e = await r.json();
        const msg =
          e?.error?.message ??
          e?.message ??
          (typeof e?.error === "string" ? e.error : null) ??
          "Something went wrong analyzing this list. Try again, or paste the items as plain text.";
        throw new Error(msg);
      }
      setResult(await r.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not analyze.");
    } finally {
      setBusy(false);
    }
  }

  function loadSample() {
    setError(null);
    setImagePreviews([]);
    setText(SAMPLE_BILL);
    setZip("");
    setSample(true);
    // Pass the service-type hint explicitly so the FTC casket-on-direct-cremation
    // finding fires for the demo no matter what's in sessionStorage.
    void analyze({ text: SAMPLE_BILL, zip: "", hint: "direct-cremation" });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setError(null);
    setResult(null);
    setSample(false);
    setUploading(true);
    setImagePreviews([]);
    // Real General Price Lists are often 2–4 pages. Read each photo in turn and
    // stitch the extracted line items together, so a multi-page list checks as
    // one bill. Previews fill in progressively as pages are read.
    try {
      const previews: string[] = [];
      const pages: string[] = [];
      let failed = 0;
      for (const file of files) {
        const { dataUrl, mediaType } = await downscaleImage(file);
        previews.push(dataUrl);
        setImagePreviews([...previews]);
        const r = await fetch("/api/extract-price-list-image", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ image: dataUrl, mediaType }),
        });
        const d = await r.json().catch(() => ({}));
        if (!r.ok) {
          // One bad page among several shouldn't sink the whole upload.
          if (files.length === 1) {
            throw new Error(
              d?.error ??
                "Couldn't read that photo. Try a clearer image, or type the prices below.",
            );
          }
          failed++;
          continue;
        }
        if (typeof d?.text === "string" && d.text.trim()) pages.push(d.text.trim());
      }
      const combined = pages.join("\n");
      if (!combined) {
        throw new Error(
          "Couldn't read the price list from those photos. Try clearer, straight-on images, or paste the prices below.",
        );
      }
      setText(combined);
      if (failed > 0) {
        setError(
          `Read ${pages.length} of ${files.length} pages — ${failed} couldn't be read clearly. Review below and re-add any missing pages, or type them in.`,
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't process the image. Try again or type the prices below.",
      );
    } finally {
      setUploading(false);
    }
  }

  const breakdown = result
    ? savingsBreakdown(result.items, result.violations)
    : null;
  const dataSource = dataSourceForZip(zip);
  const sourceNote =
    dataSource === "national-adjusted"
      ? `${DATA_SOURCE_LABEL[dataSource]} — an estimate, not yet locally validated for your metro.`
      : DATA_SOURCE_LABEL[dataSource];

  async function copyResults() {
    if (!result) return;
    const text = buildShareText({
      items: result.items,
      totalQuoted: result.totalQuoted,
      totalFairMid: result.totalFairMid,
      potentialSavings: result.potentialSavings,
      violations: result.violations,
      summary: result.summary,
      sourceNote,
      coverage: result.coverage,
    });
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (e.g. insecure context) — let the user copy manually.
      window.prompt("Copy this summary:", text);
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
      const d = await r.json().catch(() => ({}));
      if (typeof d?.letter === "string") setLetter(d.letter);
    } catch {
      // Leave the letter unset; the button stays available to retry.
    } finally {
      setLetterBusy(false);
    }
  }

  async function copyLetter() {
    if (!letter) return;
    try {
      await navigator.clipboard.writeText(letter);
      setLetterCopied(true);
      setTimeout(() => setLetterCopied(false), 2000);
    } catch {
      window.prompt("Copy this message:", letter);
    }
  }

  const canDraft =
    !!result &&
    (result.potentialSavings > 0 || (result.violations?.length ?? 0) > 0);

  return (
    <main className="flex-1 flex flex-col">
      <div className="print:hidden">
        <SiteHeader rightSlot={<BackLink defaultHref="/dashboard" defaultLabel="Dashboard" />} />
      </div>
      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-10 space-y-6">
          {partner && (
            <div className="print:hidden rounded-xl border border-primary/30 bg-primary-soft/50 px-4 py-3 text-sm text-ink">
              <span className="font-medium">Provided to you free by {partner}.</span>{" "}
              Neutral funeral-price help, at no cost to you — Honest Funeral
              takes no money from funeral homes or insurers.
            </div>
          )}
          <div className="print:hidden">
            <CardEyebrow>Price list analyzer</CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              Snap a photo or paste their price list. We&rsquo;ll flag the overcharges.
            </h1>
            <p className="text-ink-soft">
              Upload a photo of the General Price List they handed you, or type
              the line items in. We&rsquo;ll match each one to fair-market ranges
              for your region and flag any FTC violations.
            </p>
          </div>

          <Card className="print:hidden">
            <div className="space-y-5">
              <div>
                <Label
                  htmlFor="photo"
                  hint="Multi-page list? Add every page — we&rsquo;ll read them as one bill."
                >
                  Upload a photo of the price list
                </Label>
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  onChange={handleFileChange}
                  disabled={uploading || busy}
                  className="block w-full text-sm text-ink-soft file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-primary-soft file:text-primary-deep hover:file:bg-primary-soft/80 disabled:opacity-60"
                />
                {uploading && (
                  <p className="text-sm text-ink-soft mt-2">
                    Reading {imagePreviews.length > 1
                      ? `${imagePreviews.length} pages`
                      : "the price list"}
                    …
                  </p>
                )}
                {imagePreviews.length > 0 && !uploading && (
                  <div className="mt-3 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {imagePreviews.map((src, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={i}
                          src={src}
                          alt={`Uploaded price list page ${i + 1}`}
                          className="max-w-[96px] max-h-[96px] object-contain rounded-lg border border-border"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-ink-soft">
                      Here&rsquo;s what we read across{" "}
                      {imagePreviews.length > 1
                        ? `${imagePreviews.length} pages`
                        : "this page"}{" "}
                      &mdash; review and edit below if anything looks off, then
                      click{" "}
                      <strong className="text-ink">Analyze price list</strong>.
                    </p>
                  </div>
                )}
              </div>
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
                  onChange={(e) => {
                    setText(e.target.value);
                    setSample(false);
                  }}
                  placeholder={`Basic services fee   $2,495\nEmbalming            $1,150\nMetal casket         $4,200\nViewing facility       $750\nGrave liner          $1,800\nDeath certificates (10) $250\nTotal                $12,650`}
                />
              </div>
              {error && (
                <div className="text-sm text-bad bg-bad-soft border border-bad/30 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => analyze()}
                  disabled={busy || uploading || text.length < 20}
                >
                  {busy ? "Analyzing…" : "Analyze price list"}
                </Button>
                <button
                  type="button"
                  onClick={loadSample}
                  disabled={busy || uploading}
                  className="text-sm text-primary-deep underline underline-offset-2 hover:text-ink disabled:opacity-60"
                >
                  Don&rsquo;t have a bill handy? See it work on a sample
                </button>
              </div>
            </div>
          </Card>

          {result && (
            <>
              {sample && (
                <div className="print:hidden rounded-xl border border-border bg-surface-soft px-4 py-3 text-sm text-ink-soft">
                  <span className="font-medium text-ink">This is a sample bill.</span>{" "}
                  A real, deliberately-overpriced quote — the numbers below are
                  computed live, nothing is faked. Upload or paste your own to
                  check it.
                </div>
              )}
              {/* Letterhead — print only. The printed sheet is the artifact a
                  family carries into the arrangement conference, so it must
                  identify itself, carry a date, and state our neutrality. */}
              <div className="hidden print:block border-b border-border pb-3 mb-2">
                <div className="flex items-baseline justify-between">
                  <span className="font-serif text-xl text-ink">
                    Honest Funeral
                  </span>
                  <span className="text-xs text-ink-muted">
                    Price-list check ·{" "}
                    {new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-xs text-ink-muted mt-1">
                  Free and neutral — we take no money from funeral homes or
                  insurers. An informational estimate, not legal advice.
                </p>
              </div>

              <ResultHero
                savings={result.potentialSavings}
                sourceNote={sourceNote}
              />

              {result.coverage &&
                result.coverage.level !== "high" &&
                result.coverage.note && (
                  <CoverageNote coverage={result.coverage} />
                )}

              <div className="flex flex-wrap gap-3 print:hidden">
                {canDraft && (
                  <Button onClick={draftLetter} disabled={letterBusy}>
                    {letterBusy
                      ? "Writing…"
                      : letter
                        ? "Rewrite the message"
                        : "Draft a message to the funeral home"}
                  </Button>
                )}
                <Button variant="secondary" onClick={copyResults}>
                  {copied ? "Copied to clipboard" : "Copy results"}
                </Button>
                <Button variant="secondary" onClick={() => window.print()}>
                  Print / Save as PDF
                </Button>
              </div>

              {letter && (
                <Card tone="primary" className="print:hidden">
                  <CardEyebrow>Your message to the funeral home</CardEyebrow>
                  <p className="text-ink-soft text-sm mt-1 mb-4">
                    Built only from the findings above — review it, add the
                    home&rsquo;s name and your own, and send or read it aloud. You can
                    edit anything before you do.
                  </p>
                  <Textarea
                    rows={14}
                    value={letter}
                    onChange={(e) => setLetter(e.target.value)}
                    className="font-sans"
                  />
                  <div className="flex flex-wrap gap-3 mt-4">
                    <Button variant="secondary" onClick={copyLetter}>
                      {letterCopied ? "Copied to clipboard" : "Copy message"}
                    </Button>
                  </div>
                </Card>
              )}

              {result.summary && (
                <Card tone="primary">
                  <CardEyebrow>What we&rsquo;d do</CardEyebrow>
                  <p className="text-ink text-lg leading-relaxed mt-1">
                    {result.summary.bottomLine}
                  </p>
                  {result.summary.moves.length > 0 && (
                    <ol className="mt-5 space-y-4">
                      {result.summary.moves.map((m, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="flex-shrink-0 font-serif text-lg leading-7 text-primary-deep">
                            {i + 1}.
                          </span>
                          <div>
                            <div className="font-medium text-ink">{m.title}</div>
                            {m.detail && (
                              <p className="text-ink-soft text-sm mt-0.5 leading-relaxed">
                                {m.detail}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                  {result.summary.reassurance && (
                    <p className="text-ink-soft text-sm mt-5">
                      {result.summary.reassurance}
                    </p>
                  )}
                </Card>
              )}

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
                {breakdown &&
                  (breakdown.negotiateCount > 0 ||
                    breakdown.thirdPartyCount > 0 ||
                    breakdown.declineCount > 0) && (
                    <div className="mt-5 pt-4 border-t border-border/60 space-y-2">
                      <div className="text-xs uppercase tracking-wider text-ink-muted">
                        Where it comes from
                      </div>
                      {breakdown.negotiateCount > 0 && (
                        <div className="flex justify-between gap-3 text-sm">
                          <span className="text-ink-soft">
                            Negotiate {breakdown.negotiateCount} overpriced
                            service
                            {breakdown.negotiateCount === 1 ? "" : "s"} down to
                            fair
                          </span>
                          <span className="font-semibold text-bad whitespace-nowrap">
                            ~{fmtUSD(breakdown.negotiateCents / 100)}
                          </span>
                        </div>
                      )}
                      {breakdown.thirdPartyCount > 0 && (
                        <div className="flex justify-between gap-3 text-sm">
                          <span className="text-ink-soft">
                            Buy {breakdown.thirdPartyCount} item
                            {breakdown.thirdPartyCount === 1 ? "" : "s"}{" "}
                            (casket / urn / vault) from a third party
                          </span>
                          <span className="font-medium text-ink-soft whitespace-nowrap">
                            50–80% less
                          </span>
                        </div>
                      )}
                      {breakdown.declineCount > 0 && (
                        <div className="flex justify-between gap-3 text-sm">
                          <span className="text-ink-soft">
                            Question or remove {breakdown.declineCount} flagged
                            item
                            {breakdown.declineCount === 1 ? "" : "s"}
                          </span>
                          <span className="font-medium text-warn whitespace-nowrap">
                            see FTC findings
                          </span>
                        </div>
                      )}
                    </div>
                  )}
              </Card>

              {result.violations && result.violations.length > 0 && (
                <ViolationsPanel violations={result.violations} />
              )}

              <div className="overflow-x-auto">
                <div className="rounded-2xl border border-border bg-surface overflow-hidden min-w-[560px]">
                  <div className="grid grid-cols-12 px-5 py-3 border-b border-border bg-surface-soft text-xs uppercase tracking-wider text-ink-muted">
                    <div className="col-span-6">Item</div>
                    <div className="col-span-2 text-right">Quoted</div>
                    <div className="col-span-2 text-right">Fair range</div>
                    <div className="col-span-2 text-right">Verdict</div>
                  </div>
                  <ul>
                    {result.items.map((it, i) => {
                      if (it.isRange && it.centsLow != null && it.centsHigh != null) {
                        return (
                          <li
                            key={i}
                            className="grid grid-cols-12 px-5 py-4 border-b border-border last:border-b-0"
                          >
                            <div className="col-span-6 text-ink">{it.name}</div>
                            <div className="col-span-2 text-right text-ink">
                              {`${fmtUSD(it.centsLow / 100)}–${fmtUSD(it.centsHigh / 100)}`}
                            </div>
                            <div className="col-span-2 text-right text-ink-soft">
                              buy 3rd-party
                            </div>
                            <div className="col-span-2 text-right font-medium text-ink-muted">
                              Selection
                            </div>
                          </li>
                        );
                      }
                      const tone = it.classification
                        ? TONES[it.classification]
                        : { label: "—", tone: "text-ink-muted" };
                      const over = overchargeCents(it);
                      const flag = ftcFlagFor(it, result.violations);
                      const flagAccent =
                        flag?.severity === "violation"
                          ? "border-l-4 border-l-bad bg-bad-soft/30"
                          : flag?.severity === "suspicious"
                            ? "border-l-4 border-l-warn bg-warn-soft/30"
                            : "";
                      return (
                        <li
                          key={i}
                          className={`grid grid-cols-12 px-5 py-4 border-b border-border last:border-b-0 ${flagAccent}`}
                        >
                          <div className="col-span-6 text-ink">
                            {it.name}
                            {flag && (
                              <div
                                className={`text-xs font-medium mt-0.5 ${flag.severity === "violation" ? "text-bad" : "text-warn"}`}
                              >
                                {flag.severity === "violation"
                                  ? "Possible FTC issue — see below"
                                  : "Worth pushing back — see below"}
                              </div>
                            )}
                          </div>
                          <div className="col-span-2 text-right text-ink">
                            {fmtUSD(it.cents / 100)}
                            {it.qty && it.qty > 1 && (
                              <div className="text-xs text-ink-muted mt-0.5">
                                {fmtUSD(it.cents / it.qty / 100)} ea &times; {it.qty}
                              </div>
                            )}
                          </div>
                          <div className="col-span-2 text-right text-ink-soft">
                            {it.fairCentsLow != null && it.fairCentsHigh != null
                              ? `${fmtUSD(it.fairCentsLow / 100)}–${fmtUSD(it.fairCentsHigh / 100)}${it.qty && it.qty > 1 ? " ea" : ""}`
                              : "—"}
                          </div>
                          <div className={`col-span-2 text-right font-medium ${tone.tone}`}>
                            {tone.label}
                            {over > 0 && (
                              <div className="text-xs font-semibold text-bad mt-0.5">
                                +{fmtUSD(over / 100)} above fair
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {/* Footer — print only. Closes the document with the source note
                  and where to verify the method. */}
              <div className="hidden print:block border-t border-border pt-3 mt-4 text-xs text-ink-muted leading-relaxed">
                <p>{sourceNote}</p>
                <p className="mt-1">
                  How these figures are calculated: honestfuneral.co/methodology
                  · Honest Funeral is free to families and takes no money from
                  funeral homes or insurers.
                </p>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function ResultHero({
  savings,
  sourceNote,
}: {
  savings: number;
  sourceNote: string;
}) {
  const over = savings > 0;
  return (
    <Card tone={over ? "warn" : "good"}>
      <div className="text-center sm:text-left">
        {over ? (
          <>
            <div className="text-xs uppercase tracking-wider text-ink-muted">
              Estimated overcharge on this quote
            </div>
            <div className="font-serif text-4xl sm:text-5xl text-bad mt-1 leading-none">
              {fmtUSD(savings / 100)}
            </div>
            <p className="text-ink-soft mt-2">
              above fair for your region &mdash; money you may be able to keep.
            </p>
          </>
        ) : (
          <>
            <div className="font-serif text-3xl sm:text-4xl text-good leading-tight">
              This quote looks fair
            </div>
            <p className="text-ink-soft mt-2">
              Nothing on it reads as priced above the fair range for your
              region.
            </p>
          </>
        )}
        <p className="text-xs text-ink-muted mt-3">
          {sourceNote}{" "}
          <Link href="/methodology" className="underline hover:text-ink-soft print:hidden">
            How we calculate this
          </Link>
        </p>
      </div>
    </Card>
  );
}

/**
 * Honesty band: when we couldn't read the whole bill, or matched items we don't
 * benchmark, say so before the family acts on the number. "low" (likely missed
 * lines) gets a warn tone; "partial" (un-benchmarked items only) stays calm —
 * the estimate is still conservative, we just didn't check everything.
 */
function CoverageNote({ coverage }: { coverage: Coverage }) {
  const low = coverage.level === "low";
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${
        low
          ? "border-warn/40 bg-warn-soft/50 text-ink"
          : "border-border bg-surface-soft text-ink-soft"
      }`}
    >
      <span className="font-medium text-ink">
        {low ? "Double-check this against your copy. " : "Heads up. "}
      </span>
      {coverage.note}
    </div>
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

const SEVERITY_LABEL: Record<Severity, string> = {
  violation: "FTC violation",
  suspicious: "Suspicious upsell",
  info: "Worth checking",
};

function ViolationsPanel({ violations }: { violations: Violation[] }) {
  // Sort by severity: violation > suspicious > info.
  const order: Severity[] = ["violation", "suspicious", "info"];
  const sorted = [...violations].sort(
    (a, b) => order.indexOf(a.severity) - order.indexOf(b.severity),
  );
  const violationCount = sorted.filter((v) => v.severity === "violation")
    .length;
  const suspiciousCount = sorted.filter((v) => v.severity === "suspicious")
    .length;

  return (
    <Card tone={violationCount > 0 ? "bad" : "warn"}>
      <CardEyebrow>FTC compliance + bundling check</CardEyebrow>
      <CardTitle>
        {violationCount > 0
          ? `${violationCount} likely FTC violation${violationCount === 1 ? "" : "s"}${
              suspiciousCount > 0
                ? ` + ${suspiciousCount} suspicious item${suspiciousCount === 1 ? "" : "s"}`
                : ""
            }`
          : suspiciousCount > 0
            ? `${suspiciousCount} suspicious item${suspiciousCount === 1 ? "" : "s"} flagged`
            : "Worth a closer look"}
      </CardTitle>
      <p className="text-ink-soft mt-3 mb-5 text-sm">
        We scanned the price list against the FTC Funeral Rule (16 CFR
        Part 453) and known industry upsell patterns. Each finding
        below comes with a script you can quote back.
      </p>
      <ul className="space-y-3">
        {sorted.map((v) => (
          <ViolationRow key={v.ruleId} v={v} />
        ))}
      </ul>
    </Card>
  );
}

function ViolationRow({ v }: { v: Violation }) {
  const toneClass =
    v.severity === "violation"
      ? "border-bad/40 bg-bad-soft/60"
      : v.severity === "suspicious"
        ? "border-warn/40 bg-warn-soft/60"
        : "border-border bg-surface";
  const labelClass =
    v.severity === "violation"
      ? "text-bad"
      : v.severity === "suspicious"
        ? "text-warn"
        : "text-ink-muted";

  return (
    <li className={`rounded-xl border p-4 ${toneClass}`}>
      <div className={`text-[10px] uppercase tracking-wider font-semibold ${labelClass}`}>
        {SEVERITY_LABEL[v.severity]}
        {v.ftcReference && (
          <span className="ml-2 text-ink-muted font-normal">
            · {v.ftcReference}
          </span>
        )}
      </div>
      <div className="font-serif text-base text-ink mt-1">{v.title}</div>
      {v.evidence && (
        <div className="mt-1 text-xs text-ink-muted italic">
          Evidence: &ldquo;{v.evidence}&rdquo;
        </div>
      )}
      <p className="text-sm text-ink-soft mt-2 leading-relaxed">
        {v.description}
      </p>
      {v.whatToSay && (
        <div className="mt-3 rounded-lg bg-surface border border-border px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold mb-1">
            What to say to the funeral home
          </div>
          <p className="text-sm text-ink leading-relaxed">
            &ldquo;{v.whatToSay}&rdquo;
          </p>
        </div>
      )}
    </li>
  );
}
