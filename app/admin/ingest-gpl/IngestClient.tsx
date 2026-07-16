"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import { LINE_ITEMS } from "@/lib/pricing-data";

/**
 * The founder GPL ingest workflow: paste/photo → parse → review-edit → save.
 * The review table is the human gate — every row is editable (name, price,
 * benchmark mapping) or removable before anything is written. The displayed
 * total is computed from the item rows: the extraction chain returns a
 * stated total ONLY when the document prints one (it never sums items), so
 * summing here is the honest number to eyeball against the paper.
 */

interface Row {
  name: string;
  /** Single price, dollars as typed. Ignored for range rows. */
  dollars: string;
  /** "" = unmatched — the row still saves, it just doesn't feed a benchmark group. */
  matchedItemId: string;
  /** Count for per-unit items quoted as a total (10 death certs). "" = none. */
  qty: string;
  /** Selection range (caskets/vaults/urns) — excluded from benchmarks + totals. */
  isRange: boolean;
  dollarsLow: string;
  dollarsHigh: string;
}

interface ParsedItem {
  name: string;
  cents: number;
  matchedItemId?: string;
  qty?: number;
  isRange?: boolean;
  centsLow?: number;
  centsHigh?: number;
}

const centsToDollars = (c: number): string =>
  c % 100 === 0 ? String(c / 100) : (c / 100).toFixed(2);

const dollarsToCents = (d: string): number | null => {
  const n = Number(d);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
};

const fmtUsd = (cents: number): string =>
  `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;

/**
 * Same client-side downscale the analyzer uses before posting a GPL photo
 * (app/analyzer/Analyzer.tsx) — duplicated here on purpose; the analyzer is
 * checker-correctness law and stays untouched mid-sprint.
 */
function downscaleImage(
  file: File,
  maxDim = 2048,
  quality = 0.85,
): Promise<{ dataUrl: string; mediaType: "image/jpeg" }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("That doesn't look like an image."));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Couldn't process that image."));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve({
          dataUrl: canvas.toDataURL("image/jpeg", quality),
          mediaType: "image/jpeg",
        });
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function IngestClient() {
  const [text, setText] = useState("");
  const [zip, setZip] = useState("");
  const [homeName, setHomeName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  const [photoBusy, setPhotoBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parseBusy, setParseBusy] = useState(false);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [statedTotalCents, setStatedTotalCents] = useState<number | null>(null);
  const [extractionMethod, setExtractionMethod] = useState<
    "claude" | "naive" | null
  >(null);

  const [saveBusy, setSaveBusy] = useState(false);
  const [saved, setSaved] = useState<{
    id?: string;
    homeMatched: boolean;
    warning?: string;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);

  async function handlePhotos(files: FileList | null) {
    if (!files || files.length === 0) return;
    setPhotoBusy(true);
    setError(null);
    try {
      const pages: string[] = [];
      let failed = 0;
      for (const file of Array.from(files)) {
        const { dataUrl, mediaType } = await downscaleImage(file);
        const r = await fetch("/api/extract-price-list-image", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ image: dataUrl, mediaType }),
        });
        const d = await r.json().catch(() => ({}) as Record<string, unknown>);
        const pageText = typeof d?.text === "string" ? d.text.trim() : "";
        if (!r.ok || !pageText) {
          failed++;
          continue;
        }
        pages.push(pageText);
      }
      if (pages.length === 0) {
        setError("Couldn't read the photo(s) — paste the price list instead.");
      } else {
        const combined = pages.join("\n");
        setText((prev) => (prev.trim() ? `${prev}\n${combined}` : combined));
        if (failed > 0) {
          setError(
            `${failed} of ${files.length} photo(s) couldn't be read — check the text for gaps.`,
          );
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't process the photo.");
    } finally {
      setPhotoBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function parse() {
    setParseBusy(true);
    setError(null);
    setSaved(null);
    try {
      const r = await fetch("/api/admin/ingest-gpl", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "parse", text }),
      });
      const j = await r.json().catch(() => ({}) as Record<string, unknown>);
      if (!r.ok) {
        setError(
          typeof j.error === "string"
            ? j.error
            : `Parse rejected (${r.status}): ${JSON.stringify(j.error ?? j)}`,
        );
        return;
      }
      const items = (j.items ?? []) as ParsedItem[];
      setRows(
        items.map((i) => ({
          name: i.name,
          dollars: i.isRange ? "" : centsToDollars(i.cents),
          matchedItemId: i.matchedItemId ?? "",
          qty: i.qty ? String(i.qty) : "",
          isRange: !!i.isRange,
          dollarsLow: i.centsLow != null ? centsToDollars(i.centsLow) : "",
          dollarsHigh: i.centsHigh != null ? centsToDollars(i.centsHigh) : "",
        })),
      );
      setStatedTotalCents(
        typeof j.statedTotalCents === "number" ? j.statedTotalCents : null,
      );
      setExtractionMethod(
        j.extractionMethod === "claude" || j.extractionMethod === "naive"
          ? j.extractionMethod
          : null,
      );
    } catch {
      setError("Parse request failed — try again.");
    } finally {
      setParseBusy(false);
    }
  }

  function updateRow(idx: number, patch: Partial<Row>) {
    setRows((prev) =>
      prev ? prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)) : prev,
    );
  }

  function removeRow(idx: number) {
    setRows((prev) => (prev ? prev.filter((_, i) => i !== idx) : prev));
  }

  // The honest total to eyeball against the paper: computed from the item
  // rows (ranges excluded — no single transacted price). Never the model's.
  const rowTotalCents = (rows ?? [])
    .filter((r) => !r.isRange)
    .reduce((s, r) => s + (dollarsToCents(r.dollars) ?? 0), 0);

  const totalsDisagree =
    statedTotalCents != null &&
    rowTotalCents > 0 &&
    Math.abs(statedTotalCents - rowTotalCents) / statedTotalCents > 0.02;

  async function save() {
    if (!rows || rows.length === 0) return;
    setError(null);

    if (!/^\d{5}$/.test(zip)) {
      setError("Zip must be 5 digits.");
      return;
    }
    if (homeName.trim().length < 2) {
      setError("Enter the funeral home's name.");
      return;
    }
    const items = [];
    for (const [i, r] of rows.entries()) {
      const name = r.name.trim();
      if (!name) {
        setError(`Row ${i + 1} has no name — fix or remove it.`);
        return;
      }
      if (r.isRange) {
        const low = dollarsToCents(r.dollarsLow);
        const high = dollarsToCents(r.dollarsHigh);
        if (low == null || high == null || low > high) {
          setError(`Row ${i + 1} ("${name}") has a bad range — fix or remove it.`);
          return;
        }
        items.push({
          name,
          cents: low,
          isRange: true,
          centsLow: low,
          centsHigh: high,
        });
        continue;
      }
      const cents = dollarsToCents(r.dollars);
      if (cents == null) {
        setError(`Row ${i + 1} ("${name}") has a bad price — fix or remove it.`);
        return;
      }
      const qty = r.qty.trim() === "" ? null : Number(r.qty);
      if (qty != null && (!Number.isInteger(qty) || qty < 1 || qty > 999)) {
        setError(`Row ${i + 1} ("${name}") has a bad quantity.`);
        return;
      }
      items.push({
        name,
        cents,
        ...(r.matchedItemId ? { matchedItemId: r.matchedItemId } : {}),
        ...(qty != null && qty > 1 ? { qty } : {}),
      });
    }

    setSaveBusy(true);
    try {
      const r = await fetch("/api/admin/ingest-gpl", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "save",
          text,
          zip,
          homeName: homeName.trim(),
          ...(sourceUrl.trim() ? { sourceUrl: sourceUrl.trim() } : {}),
          ...(statedTotalCents != null ? { statedTotalCents } : {}),
          items,
        }),
      });
      const j = await r.json().catch(() => ({}) as Record<string, unknown>);
      if (!r.ok) {
        setError(
          typeof j.error === "string"
            ? j.error
            : `Save rejected (${r.status}): ${JSON.stringify(j.error ?? j)}`,
        );
        return;
      }
      setSaved({
        id: typeof j.id === "string" ? j.id : undefined,
        homeMatched: !!j.homeMatched,
        warning: typeof j.warning === "string" ? j.warning : undefined,
      });
    } catch {
      setError("Save request failed — try again.");
    } finally {
      setSaveBusy(false);
    }
  }

  function ingestAnother() {
    // Keeps zip — the weekend workflow ingests several homes per metro.
    setText("");
    setHomeName("");
    setSourceUrl("");
    setRows(null);
    setStatedTotalCents(null);
    setExtractionMethod(null);
    setSaved(null);
    setError(null);
  }

  if (saved) {
    return (
      <div className="p-5 bg-surface-soft border border-border rounded-xl space-y-3">
        <p className="text-good text-sm font-medium">
          Saved{saved.id ? ` — analysis ${saved.id}` : ""} with founder_ingest
          provenance.{" "}
          {saved.homeMatched
            ? "The home's gpl_url and last_verified_at are stamped."
            : ""}
        </p>
        {saved.warning && <p className="text-warn text-sm">{saved.warning}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/admin/benchmarks"
            className="text-sm text-primary-deep underline"
          >
            See it in the benchmark groups →
          </a>
          <Button variant="secondary" onClick={ingestAnother}>
            Ingest another GPL
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step 1 — the source */}
      <div className="p-5 bg-surface-soft border border-border rounded-xl grid gap-4">
        <div>
          <Label htmlFor="ingest-text" hint="paste the GPL text, or add photos below">
            General Price List text
          </Label>
          <Textarea
            id="ingest-text"
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"Basic services fee ......... $2,195\nEmbalming ......... $895\n..."}
            className="font-mono text-sm"
          />
          <p className="text-xs text-ink-muted mt-1">
            {text.length.toLocaleString("en-US")} / 20,000 characters
            {text.length > 0 && text.length < 20 ? " (need at least 20)" : ""}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="ingest-photo" hint="photos are OCR'd into the textarea; review before parsing">
              Or photograph the GPL
            </Label>
            <input
              ref={fileInputRef}
              id="ingest-photo"
              type="file"
              accept="image/*"
              multiple
              disabled={photoBusy}
              onChange={(e) => handlePhotos(e.target.files)}
              className="block w-full text-sm text-ink-soft file:mr-3 file:rounded-xl file:border file:border-border file:bg-surface file:px-4 file:py-2 file:text-sm file:text-ink"
            />
            {photoBusy && (
              <p className="text-xs text-ink-muted mt-1">Reading photo(s)…</p>
            )}
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              onClick={parse}
              disabled={parseBusy || photoBusy || text.trim().length < 20}
            >
              {parseBusy
                ? "Parsing…"
                : rows
                  ? "Re-parse the text"
                  : "Parse the price list"}
            </Button>
          </div>
        </div>
      </div>

      {/* Step 2 — review (the human gate) */}
      {rows && (
        <div className="p-5 bg-surface-soft border border-border rounded-xl space-y-4">
          <div>
            <p className="text-sm text-ink font-medium">
              {rows.length} parsed item{rows.length === 1 ? "" : "s"} — review
              before saving
            </p>
            <p className="text-xs text-ink-muted mt-1">
              {extractionMethod === "naive"
                ? "Parsed by the deterministic fallback (Claude unavailable or its output unusable) — check every row against the document."
                : "Parsed by Claude — eyeball names, prices, and benchmark mappings against the document."}{" "}
              Unmatched rows still save; they just don&rsquo;t feed a benchmark
              group.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-ink-muted">
                  <th className="py-1 pr-3">Item</th>
                  <th className="py-1 pr-3 w-36">Price ($)</th>
                  <th className="py-1 pr-3 w-20">Qty</th>
                  <th className="py-1 pr-3">Benchmark item</th>
                  <th className="py-1 w-16" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t border-border align-top">
                    <td className="py-2 pr-3 min-w-56">
                      <Input
                        aria-label={`Row ${i + 1} name`}
                        value={r.name}
                        onChange={(e) => updateRow(i, { name: e.target.value })}
                        className="py-2 text-sm"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      {r.isRange ? (
                        <span className="flex items-center gap-1">
                          <Input
                            aria-label={`Row ${i + 1} range low`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={r.dollarsLow}
                            onChange={(e) =>
                              updateRow(i, { dollarsLow: e.target.value })
                            }
                            className="py-2 text-sm w-24"
                          />
                          <span className="text-ink-muted">–</span>
                          <Input
                            aria-label={`Row ${i + 1} range high`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={r.dollarsHigh}
                            onChange={(e) =>
                              updateRow(i, { dollarsHigh: e.target.value })
                            }
                            className="py-2 text-sm w-24"
                          />
                        </span>
                      ) : (
                        <Input
                          aria-label={`Row ${i + 1} price in dollars`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={r.dollars}
                          onChange={(e) =>
                            updateRow(i, { dollars: e.target.value })
                          }
                          className="py-2 text-sm"
                        />
                      )}
                    </td>
                    <td className="py-2 pr-3">
                      {r.isRange ? (
                        <span className="text-xs text-ink-muted">—</span>
                      ) : (
                        <Input
                          aria-label={`Row ${i + 1} quantity`}
                          type="number"
                          min="1"
                          max="999"
                          value={r.qty}
                          placeholder="—"
                          onChange={(e) => updateRow(i, { qty: e.target.value })}
                          className="py-2 text-sm"
                        />
                      )}
                    </td>
                    <td className="py-2 pr-3 min-w-48">
                      {r.isRange ? (
                        <span className="text-xs text-ink-muted">
                          selection range (caskets/vaults/urns) — not
                          benchmarked
                        </span>
                      ) : (
                        <Select
                          aria-label={`Row ${i + 1} benchmark mapping`}
                          value={r.matchedItemId}
                          onChange={(e) =>
                            updateRow(i, { matchedItemId: e.target.value })
                          }
                          className="py-2 text-sm"
                        >
                          <option value="">— unmatched —</option>
                          {LINE_ITEMS.map((li) => (
                            <option key={li.id} value={li.id}>
                              {li.name}
                            </option>
                          ))}
                        </Select>
                      )}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeRow(i)}
                        className="text-xs text-bad underline"
                        aria-label={`Remove row ${i + 1}`}
                      >
                        remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-sm text-ink-soft">
            <p>
              Item-row total (ranges excluded):{" "}
              <strong className="text-ink">{fmtUsd(rowTotalCents)}</strong>
            </p>
            {statedTotalCents != null && (
              <p className={totalsDisagree ? "text-warn" : "text-ink-muted"}>
                The document prints a total of {fmtUsd(statedTotalCents)}
                {totalsDisagree
                  ? " — that disagrees with the rows; check for missed or extra lines."
                  : "."}
              </p>
            )}
          </div>

          {/* Step 3 — provenance + save */}
          <div className="grid gap-3 sm:grid-cols-3 border-t border-border pt-4">
            <div>
              <Label htmlFor="ingest-zip" hint="drives metro grouping">
                Home&rsquo;s zip
              </Label>
              <Input
                id="ingest-zip"
                inputMode="numeric"
                pattern="\d{5}"
                maxLength={5}
                value={zip}
                onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
                required
              />
            </div>
            <div>
              <Label htmlFor="ingest-home" hint="exact directory name matches best">
                Funeral home name
              </Label>
              <Input
                id="ingest-home"
                value={homeName}
                onChange={(e) => setHomeName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label
                htmlFor="ingest-source"
                hint="stamps gpl_url + last_verified_at on the matched home"
              >
                Source URL (optional)
              </Label>
              <Input
                id="ingest-source"
                type="url"
                placeholder="https://…"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
              />
            </div>
            <div className="sm:col-span-3 flex items-center gap-3">
              <Button
                type="button"
                onClick={save}
                disabled={saveBusy || rows.length === 0}
              >
                {saveBusy ? "Saving…" : "Save to price_list_analyses"}
              </Button>
              <p className="text-xs text-ink-muted">
                Saving is the publish gate into the benchmark groups — the
                verified tier itself still needs a founder promotion at n ≥ 5.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-bad">{error}</p>}
    </div>
  );
}
