"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
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
  isRange?: boolean;
  centsLow?: number;
  centsHigh?: number;
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
}

const TONES: Record<string, { label: string; tone: string }> = {
  good: { label: "Fair", tone: "text-good" },
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

/** Screen 10 — Price list analyzer. */
export function Analyzer() {
  const [text, setText] = useState("");
  const [zip, setZip] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AnalyzerResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  async function analyze() {
    setBusy(true);
    setError(null);
    try {
      // Pass the recommended service type from /decide if we have it —
      // it lets the bundling detector know things like 'this is a direct
      // cremation, so a casket on the quote is a violation.'
      let serviceTypeHint: string | undefined;
      try {
        serviceTypeHint =
          window.sessionStorage.getItem(
            "hf-decide:recommendedServiceType",
          ) ?? undefined;
      } catch {
        // ignore
      }
      const r = await fetch("/api/analyze-price-list", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          text,
          zip: zip || undefined,
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

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setResult(null);
    setUploading(true);
    try {
      const { dataUrl, mediaType } = await downscaleImage(file);
      setImagePreview(dataUrl);
      const r = await fetch("/api/extract-price-list-image", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ image: dataUrl, mediaType }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        throw new Error(
          d?.error ??
            "Couldn't read that photo. Try a clearer image, or type the prices below.",
        );
      }
      setText(typeof d?.text === "string" ? d.text : "");
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

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader rightSlot={<BackLink defaultHref="/dashboard" defaultLabel="Dashboard" />} />
      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-10 space-y-6">
          <div>
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

          <Card>
            <div className="space-y-5">
              <div>
                <Label
                  htmlFor="photo"
                  hint="Or type / paste the prices below."
                >
                  Upload a photo of the price list
                </Label>
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  disabled={uploading || busy}
                  className="block w-full text-sm text-ink-soft file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-primary-soft file:text-primary-deep hover:file:bg-primary-soft/80 disabled:opacity-60"
                />
                {uploading && (
                  <p className="text-sm text-ink-soft mt-2">
                    Reading the price list…
                  </p>
                )}
                {imagePreview && !uploading && (
                  <div className="mt-3 flex items-start gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Uploaded price list"
                      className="max-w-[120px] max-h-[120px] object-contain rounded-lg border border-border"
                    />
                    <p className="text-sm text-ink-soft">
                      Here&rsquo;s what we read &mdash; review and edit
                      below if anything looks off, then click{" "}
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
                  onChange={(e) => setText(e.target.value)}
                  placeholder={`Basic services fee   $2,495\nEmbalming            $1,150\nMetal casket         $4,200\nViewing facility       $750\nGrave liner          $1,800\nDeath certificates (10) $250\nTotal                $12,650`}
                />
              </div>
              {error && (
                <div className="text-sm text-bad bg-bad-soft border border-bad/30 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}
              <Button onClick={analyze} disabled={busy || uploading || text.length < 20}>
                {busy ? "Analyzing…" : "Analyze price list"}
              </Button>
            </div>
          </Card>

          {result && (
            <>
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
                {result.potentialSavings > 0 && (
                  <p className="text-ink-soft text-sm mt-4">
                    Most of that is fixable. The high-priced rows below are
                    where to push back — sometimes you can ask the funeral home
                    to match fair-market prices, sometimes you can swap to a
                    third-party vendor (caskets, urns, headstones).
                  </p>
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
