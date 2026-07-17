"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Field";
import { PlanningAheadBanner } from "@/components/PlanningAheadBanner";
import {
  fmtUSD,
  dataSourceForZip,
  DATA_SOURCE_LABEL,
  SERVICE_LABELS,
} from "@/lib/pricing-data";
import { readReferral } from "@/lib/referral-codes";
import { trackTool } from "@/lib/analytics";
import {
  overchargeCents,
  ftcFlagFor,
  savingsBreakdown,
  buildShareText,
} from "@/lib/analyzer-display";
import { ViolationsPanel } from "@/components/analyzer/ViolationsPanel";
import { DataTierBadge } from "@/components/DataTierBadge";
import { TONES, type AnalyzerItem, type Violation } from "@/components/analyzer/types";

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
  /** Which benchmark tier the verdict was computed with (route-reported). */
  dataTier?: {
    tier: "verified" | "community" | "modeled";
    n: number | null;
    /** Benchmarked items classified against the winning tier's local data. */
    itemsCovered?: number;
    /** Benchmarked items in total (per-unit state-fee items excluded). */
    itemsBenchmarked?: number;
  };
}

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
export function Analyzer({
  partner,
  aheadMode,
}: {
  partner?: string;
  aheadMode?: boolean;
}) {
  const [text, setText] = useState("");
  const [zip, setZip] = useState("");
  // Feeds only the handoff to /negotiate/start — never the analyze POST.
  const [homeName, setHomeName] = useState("");
  // The serviceTypeHint the CURRENT result was analyzed with (opts.hint or the
  // hf-decide sessionStorage value) — the bridge to /negotiate/start passes it
  // along only when it's a real ServiceType key.
  const [usedHint, setUsedHint] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AnalyzerResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [sample, setSample] = useState(false);
  // Explicit opt-in to contribute this check's de-identified prices to the
  // benchmark feed (D8). Unchecked by default — consent is never assumed.
  const [contribute, setContribute] = useState(false);
  const [letter, setLetter] = useState<string | null>(null);
  const [letterBusy, setLetterBusy] = useState(false);
  const [letterCopied, setLetterCopied] = useState(false);
  // A persistent notice about the SOURCE (e.g. some uploaded pages couldn't be
  // read). Kept separate from `error` so clicking Analyze — which clears
  // `error` — can't silently erase a "we only read part of the bill" warning.
  const [pageWarning, setPageWarning] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  // After analysis completes, move focus and scroll to the result so keyboard
  // and screen-reader users (and anyone on a phone) know it appeared.
  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.focus();
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  async function analyze(opts?: {
    text?: string;
    zip?: string;
    hint?: string;
    sample?: boolean;
  }) {
    const useText = opts?.text ?? text;
    const useZip = opts?.zip ?? zip;
    const isSample = opts?.sample ?? false;
    setBusy(true);
    setError(null);
    setLetter(null);
    setLetterCopied(false);
    setSample(isSample);
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
          // Attribution for the referring institution's AGGREGATE report only
          // (remembered on-device from a ?ref= visit; absent for most
          // families). The sample demo bill never attributes — it isn't a
          // family's real quote.
          referralCode: isSample ? undefined : (readReferral() ?? undefined),
          // The explicit consent checkbox. The sample is always false — its
          // fixed demo prices are not the family's data and must never feed
          // the benchmark aggregation, whatever the box says.
          contributed: isSample ? false : contribute,
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
      setUsedHint(serviceTypeHint);
      trackTool("analyzer_completed");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not analyze.");
    } finally {
      setBusy(false);
    }
  }

  function loadSample() {
    setError(null);
    setPageWarning(null);
    setImagePreviews([]);
    setText(SAMPLE_BILL);
    setZip("");
    // Pass the service-type hint explicitly so the FTC casket-on-direct-cremation
    // finding fires for the demo no matter what's in sessionStorage.
    void analyze({
      text: SAMPLE_BILL,
      zip: "",
      hint: "direct-cremation",
      sample: true,
    });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;
    setError(null);
    setPageWarning(null);
    setResult(null);
    setSample(false);
    setUploading(true);
    setImagePreviews([]);
    // Real General Price Lists are often 2–4 pages. Read each photo in turn and
    // stitch the extracted line items together, so a multi-page list checks as
    // one bill. Only a page that actually yielded text becomes a thumbnail, so
    // the preview count reflects what we truly read.
    try {
      const previews: string[] = [];
      const pages: string[] = [];
      let failed = 0;
      for (const file of files) {
        const { dataUrl, mediaType } = await downscaleImage(file);
        const r = await fetch("/api/extract-price-list-image", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ image: dataUrl, mediaType }),
        });
        const d = await r.json().catch(() => ({}));
        const pageText = typeof d?.text === "string" ? d.text.trim() : "";
        if (!r.ok || !pageText) {
          // One bad page among several shouldn't sink the whole upload.
          if (files.length === 1 && !r.ok) {
            throw new Error(
              d?.error ??
                "Couldn't read that photo. Try a clearer image, or type the prices below.",
            );
          }
          failed++;
          continue;
        }
        pages.push(pageText);
        previews.push(dataUrl);
        setImagePreviews([...previews]);
      }
      const combined = pages.join("\n");
      if (!combined) {
        setImagePreviews([]);
        throw new Error(
          "Couldn't read the price list from those photos. Try clearer, straight-on images, or paste the prices below.",
        );
      }
      setText(combined);
      if (failed > 0) {
        setPageWarning(
          `We read ${pages.length} of ${files.length} pages — ${failed} couldn't be read clearly, so some line items may be missing. Re-add those pages or type them in before relying on the total.`,
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
      // Let the same file re-fire onChange if a read failed and they retry it.
      input.value = "";
    }
  }

  const breakdown = result
    ? savingsBreakdown(result.items, result.violations)
    : null;
  // The tier the RESULT was actually computed with wins; before a result
  // exists (or on the modeled fallback) the static note describes the model.
  // Flows into the copied summary and the print footer, so the artifact a
  // family carries states its own data tier.
  const dataSource = dataSourceForZip(zip);
  const modeledNote = `${DATA_SOURCE_LABEL[dataSource]} — an estimate, not yet locally validated for your metro.`;
  // Coverage-honest source note: local data that touched only some benchmarked
  // items must say so — one verified item among twenty modeled ones is not a
  // "verified verdict" (guardrail #4).
  const covered = result?.dataTier?.itemsCovered ?? 0;
  const benchmarked = result?.dataTier?.itemsBenchmarked ?? 0;
  const partialCoverage = covered > 0 && covered < benchmarked;
  const sourceNote =
    result?.dataTier?.tier === "verified"
      ? partialCoverage
        ? `Verified local price-list data${result.dataTier.n ? ` (${result.dataTier.n} lists)` : ""} covers ${covered} of ${benchmarked} benchmarked items; the rest are modeled estimates.`
        : result.dataTier.n
          ? `Verified — based on ${result.dataTier.n} real price lists in this area.`
          : "Verified — based on real price lists in this area."
      : result?.dataTier?.tier === "community"
        ? partialCoverage
          ? `Community-reported data covers ${covered} of ${benchmarked} benchmarked items; the rest are modeled estimates.`
          : "Community data — reported by families in this area."
        : modeledNote;

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
    setLetterCopied(false);
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
      if (!r.ok || typeof d?.letter !== "string") {
        setError(
          "Couldn't draft a message just now — the findings above are still good to use, or try again.",
        );
        return;
      }
      setLetter(d.letter);
    } catch {
      setError(
        "Couldn't draft a message just now — the findings above are still good to use, or try again.",
      );
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

  // Bridge to /negotiate/start. Only a hint that is a real ServiceType key is
  // carried over — the wizard's <Select> can't render anything else.
  const bridgeService =
    usedHint !== undefined && usedHint in SERVICE_LABELS ? usedHint : undefined;
  const bridgeParams = new URLSearchParams();
  if (/^\d{5}$/.test(zip)) bridgeParams.set("zip", zip);
  if (bridgeService) bridgeParams.set("svc", bridgeService);
  const bridgeQuery = bridgeParams.toString();
  const bridgeHref = bridgeQuery
    ? `/negotiate/start?${bridgeQuery}`
    : "/negotiate/start";

  // Written synchronously in the CTA's onClick, before Link navigates; the
  // wizard consumes it once on mount. Survives the sign-in redirect (same
  // tab), unlike the query params above.
  function writeAnalyzerHandoff() {
    try {
      window.sessionStorage.setItem(
        "hf-analyzer:handoff",
        JSON.stringify({
          zip,
          ...(bridgeService ? { serviceType: bridgeService } : {}),
          totalCents: result?.totalQuoted,
          ...(homeName.trim() ? { homeName: homeName.trim() } : {}),
        }),
      );
    } catch {
      // ignore
    }
  }

  return (
    <main className="flex-1 flex flex-col">
      <div className="print:hidden">
        <SiteHeader rightSlot={<BackLink defaultHref="/dashboard" defaultLabel="← Dashboard" />} />
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
              {aheadMode
                ? "Upload a photo of a General Price List, or type the line items in. Any funeral home must give you its price list when you ask — that’s a federal FTC rule, and asking now, before anything is urgent, is exactly how you compare homes on your terms."
                : "Upload a photo of the General Price List they handed you, or type the line items in. We’ll match each one to fair-market ranges for your region and flag likely FTC Funeral Rule problems — the most common violations and upsells."}
            </p>
            {aheadMode ? (
              <div className="mt-3">
                <PlanningAheadBanner note="Nothing has happened yet — checking prices now is the calm version of the rushed call most families get. Check a list from more than one home if you can." />
              </div>
            ) : (
              <p className="text-sm text-ink-muted mt-2">
                Already have the final bill?{" "}
                <Link href="/bill-check" className="underline hover:text-ink-soft">
                  Check it against the quote you were given &rarr;
                </Link>{" "}
                &middot; Shopping more than one home?{" "}
                <Link href="/compare-quotes" className="underline hover:text-ink-soft">
                  Compare quotes side by side &rarr;
                </Link>
              </p>
            )}
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
                  <p
                    role="status"
                    aria-live="polite"
                    className="text-sm text-ink-soft mt-2"
                  >
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
                  htmlFor="home-name"
                  hint="Optional &mdash; helps if you later want us to gather comparison quotes."
                >
                  Which funeral home is this from?
                </Label>
                <Input
                  id="home-name"
                  value={homeName}
                  onChange={(e) => setHomeName(e.target.value)}
                />
              </div>
              <div>
                <Label
                  htmlFor="list"
                  hint="One item per line, like &ldquo;Basic services fee $2,495&rdquo;."
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
                    setPageWarning(null);
                  }}
                  placeholder={`Basic services fee   $2,495\nEmbalming            $1,150\nMetal casket         $4,200\nViewing facility       $750\nGrave liner          $1,800\nDeath certificates (10) $250\nTotal                $12,650`}
                />
              </div>
              {error && (
                <div
                  role="status"
                  aria-live="polite"
                  className="text-sm text-bad bg-bad-soft border border-bad/30 rounded-xl px-4 py-3"
                >
                  {error}
                </div>
              )}
              {pageWarning && (
                <div
                  role="status"
                  aria-live="polite"
                  className="text-sm text-ink bg-warn-soft/50 border border-warn/40 rounded-xl px-4 py-3"
                >
                  {pageWarning}
                </div>
              )}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={contribute}
                  onChange={(e) => setContribute(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-[var(--primary-deep,#2f5d50)] shrink-0"
                />
                <span className="text-sm text-ink-soft">
                  Add my de-identified prices to the public fair-price data
                  &mdash; optional. Your name, contact details, and anything
                  personal are never included either way.
                </span>
              </label>
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
            <div
              ref={resultRef}
              tabIndex={-1}
              className="space-y-6 focus:outline-none"
            >
              {result.items.length === 0 ? (
                <Card tone="warn">
                  <CardEyebrow>Nothing to check yet</CardEyebrow>
                  <CardTitle>We couldn&rsquo;t read any line items</CardTitle>
                  <p className="text-ink-soft mt-2">
                    To check a quote we need the itemized list &mdash; each
                    service or item with its own price. Paste those lines above,
                    or upload a clearer photo of the itemized page, and try
                    again.
                  </p>
                </Card>
              ) : (
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
                dataTier={result.dataTier}
                partial={partialCoverage}
              />

              {pageWarning && (
                <div className="print:hidden rounded-xl border border-warn/40 bg-warn-soft/50 px-4 py-3 text-sm text-ink">
                  {pageWarning}
                </div>
              )}

              {result.coverage &&
                result.coverage.level !== "high" &&
                result.coverage.note && (
                  <CoverageNote coverage={result.coverage} />
                )}

              {/* The sample demo bill never bridges — its fake $10,730 quote
                  must not become a real case's savings baseline. */}
              {!sample && (
                <Card tone="primary" className="print:hidden">
                  <CardTitle>
                    Want comparison quotes? Free, from vetted homes near you.
                  </CardTitle>
                  <p className="text-ink-soft text-sm mt-1 mb-4">
                    We&rsquo;ll contact 3&ndash;5 homes near you as your
                    advocate, request itemized prices, and bring back the
                    options to compare &mdash; you choose, always. What you
                    found here comes along so you don&rsquo;t retype it.
                  </p>
                  <LinkButton href={bridgeHref} onClick={writeAnalyzerHandoff}>
                    Have us contact funeral homes — free
                  </LinkButton>
                </Card>
              )}

              <div className="flex flex-wrap gap-3 print:hidden">
                {canDraft && (
                  <Button
                    variant="secondary"
                    onClick={draftLetter}
                    disabled={letterBusy}
                  >
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
                    aria-label="Draft message to the funeral home"
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

              {/* Responsive semantic table: a real <table> on sm+ (header row,
                  th scope, and the print page-break-inside:avoid rule), and a
                  stacked labeled card per item on phones — the kitchen-table
                  case — so nothing scrolls off-screen. */}
              <div className="rounded-2xl border border-border bg-surface overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="hidden sm:table-header-group">
                    <tr className="bg-surface-soft text-xs uppercase tracking-wider text-ink-muted">
                      <th scope="col" className="text-left font-medium px-5 py-3">Item</th>
                      <th scope="col" className="text-right font-medium px-5 py-3">Quoted</th>
                      <th scope="col" className="text-right font-medium px-5 py-3">Fair range</th>
                      <th scope="col" className="text-right font-medium px-5 py-3">Verdict</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.items.map((it, i) => {
                      const itemCell =
                        "block sm:table-cell px-5 pt-3 pb-1 sm:py-4 text-ink sm:align-top";
                      const valCell =
                        "flex justify-between gap-3 sm:table-cell px-5 py-0.5 pb-2 sm:py-4 sm:align-top sm:text-right";
                      const lbl = (t: string) => (
                        <span className="sm:hidden text-xs uppercase tracking-wider text-ink-muted">
                          {t}
                        </span>
                      );
                      if (it.isRange && it.centsLow != null && it.centsHigh != null) {
                        return (
                          <tr
                            key={i}
                            className="block sm:table-row border-b border-border last:border-b-0"
                          >
                            <td className={itemCell}>{it.name}</td>
                            <td className={`${valCell} text-ink`}>
                              {lbl("Quoted")}
                              <span>{`${fmtUSD(it.centsLow / 100)}–${fmtUSD(it.centsHigh / 100)}`}</span>
                            </td>
                            <td className={`${valCell} text-ink-soft`}>
                              {lbl("Fair range")}
                              <span>buy 3rd-party</span>
                            </td>
                            <td className={`${valCell} font-medium text-ink-muted`}>
                              {lbl("Verdict")}
                              <span>Selection</span>
                            </td>
                          </tr>
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
                        <tr
                          key={i}
                          className={`block sm:table-row border-b border-border last:border-b-0 ${flagAccent}`}
                        >
                          <td className={itemCell}>
                            {it.name}
                            {flag && (
                              <span
                                className={`block text-xs font-medium mt-0.5 ${flag.severity === "violation" ? "text-bad" : "text-warn"}`}
                              >
                                {flag.severity === "violation"
                                  ? "Possible FTC issue — see below"
                                  : "Worth pushing back — see below"}
                              </span>
                            )}
                          </td>
                          <td className={`${valCell} text-ink`}>
                            {lbl("Quoted")}
                            <span>
                              {fmtUSD(it.cents / 100)}
                              {it.qty && it.qty > 1 && (
                                <span className="block text-xs text-ink-muted mt-0.5">
                                  {fmtUSD(it.cents / it.qty / 100)} ea &times; {it.qty}
                                </span>
                              )}
                            </span>
                          </td>
                          <td className={`${valCell} text-ink-soft`}>
                            {lbl("Fair range")}
                            <span>
                              {it.fairCentsLow != null && it.fairCentsHigh != null
                                ? `${fmtUSD(it.fairCentsLow / 100)}–${fmtUSD(it.fairCentsHigh / 100)}${it.qty && it.qty > 1 ? " ea" : ""}`
                                : "—"}
                            </span>
                          </td>
                          <td className={`${valCell} font-medium ${tone.tone}`}>
                            {lbl("Verdict")}
                            <span>
                              {tone.label}
                              {over > 0 && (
                                <span className="block text-xs font-semibold text-bad mt-0.5">
                                  +{fmtUSD(over / 100)} above fair
                                </span>
                              )}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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
          )}
        </div>
      </section>
    </main>
  );
}

function ResultHero({
  savings,
  sourceNote,
  dataTier,
  partial,
}: {
  savings: number;
  sourceNote: string;
  dataTier?: AnalyzerResult["dataTier"];
  /** Local data covered only some benchmarked items — badge must say so. */
  partial?: boolean;
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
              above the fair range for your region &mdash; worth questioning before
              you agree to it.
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
        {/* The badge carries the /methodology link, so no separate text link
            here. Print-hidden: the print footer already states the tier
            (sourceNote) and the methodology URL. */}
        <div className="mt-3 print:hidden">
          <DataTierBadge
            tier={dataTier?.tier ?? "modeled"}
            n={dataTier?.n}
            partial={partial}
          />
        </div>
        <p className="text-xs text-ink-muted mt-2">{sourceNote}</p>
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
