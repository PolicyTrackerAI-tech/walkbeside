/**
 * Pure helpers for scripts/ingest-gpl-batch.mjs: validate a reviewed price
 * list record and build the price_list_analyses row the founder-ingest save
 * path (app/api/admin/ingest-gpl/route.ts handleSave) would write for it.
 *
 * A plain Node script can't import the app's TypeScript, so three small
 * pieces are mirrored here, and scripts/__tests__/gpl-batch.test.ts pins
 * each one to its TypeScript original:
 *   - analysisInputHash  (lib/analysis-hash.ts)
 *   - redactContact      (lib/redact.ts)
 *   - extractionConfidence (lib/extraction-confidence.ts)
 * and the LINE_ITEMS id list is read from lib/pricing-data.ts itself.
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/** @param {string} text */
export function analysisInputHash(text) {
  const normalized = text.trim().replace(/\s+/g, " ").toLowerCase();
  return createHash("sha256").update(normalized).digest("hex");
}

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const PHONE_PAREN_RE = /(?:\+?1[\s.-]?)?\(\d{3}\)[\s.-]?\d{3}[\s.-]?\d{4}\b/g;
const PHONE_SEP_RE = /\b(?:\+?1[.-]?)?\d{3}[.-]\d{3}[.-]\d{4}\b/g;
const SSN_RE = /\b\d{3}-\d{2}-\d{4}\b/g;
const CARD_SEP_RE = /\b\d{4}[ -]\d{4}[ -]\d{4}[ -]\d{4}\b/g;
const DIGIT_RUN_RE = /\b\d{9,19}\b/g;
const MARK = "[redacted]";

/** @param {string} text */
export function redactContact(text) {
  return text
    .replace(EMAIL_RE, MARK)
    .replace(CARD_SEP_RE, MARK)
    .replace(SSN_RE, MARK)
    .replace(PHONE_PAREN_RE, MARK)
    .replace(PHONE_SEP_RE, MARK)
    .replace(DIGIT_RUN_RE, MARK);
}

/**
 * @param {{ itemCount: number, statedTotalCents: number | null | undefined, itemSumCents: number }} o
 */
export function extractionConfidence({ itemCount, statedTotalCents, itemSumCents }) {
  if (itemCount <= 0) return statedTotalCents != null && statedTotalCents > 0 ? 0.35 : 0;
  let score = 0.5 + Math.min(itemCount, 5) * 0.04;
  if (statedTotalCents == null || itemSumCents <= 0) {
    score += 0.1;
  } else {
    const ratio = statedTotalCents / itemSumCents;
    if (ratio >= 0.98 && ratio <= 1.02) score += 0.3;
    else if (ratio >= 0.9 && ratio <= 1.5) score += 0.15;
    else score -= 0.15;
  }
  return Math.round(Math.min(1, Math.max(0, score)) * 100) / 100;
}

/** The LINE_ITEMS ids, read from the source of truth. @param {string} root */
export function lineItemIds(root = process.cwd()) {
  const src = readFileSync(join(root, "lib/pricing-data.ts"), "utf8");
  const start = src.indexOf("export const LINE_ITEMS");
  if (start < 0) throw new Error("LINE_ITEMS not found in lib/pricing-data.ts");
  return new Set([...src.slice(start).matchAll(/^\s{4}id: "([a-z0-9-]+)",/gm)].map((m) => m[1]));
}

export const PROVENANCE = ["posted", "fca_hosted", "requested", "family_consented"];

/**
 * @typedef {{ name: string, cents: number, matchedItemId?: string, qty?: number,
 *   isRange?: boolean, centsLow?: number, centsHigh?: number,
 *   matcherOverride?: string }} Item
 * @typedef {{ homeName: string, zip: string, sourceUrl?: string, provenance: string,
 *   effectiveDate: string, retrievedAt: string, statedTotalCents?: number | null,
 *   text: string, items: Item[] }} GplRecord
 */

const MAX_CENTS = 100_000_000;
const isInt = (/** @type {unknown} */ v) => typeof v === "number" && Number.isInteger(v);

/**
 * The same bounds the save route's zod schema enforces, plus the batch
 * file's own provenance fields. Returns a list of problems (empty = valid).
 * @param {GplRecord} r @param {Set<string>} ids
 */
export function validateRecord(r, ids) {
  const errs = [];
  if (typeof r.homeName !== "string" || r.homeName.trim().length < 2 || r.homeName.length > 160)
    errs.push("homeName must be 2-160 characters");
  if (!/^\d{5}$/.test(r.zip ?? "")) errs.push("zip must be 5 digits");
  if (r.sourceUrl !== undefined) {
    try {
      new URL(r.sourceUrl);
      if (r.sourceUrl.length > 500) errs.push("sourceUrl too long");
    } catch {
      errs.push("sourceUrl is not a URL");
    }
  }
  if (!PROVENANCE.includes(r.provenance)) errs.push(`provenance must be one of ${PROVENANCE.join(", ")}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.effectiveDate ?? "")) errs.push("effectiveDate must be YYYY-MM-DD (the date printed inside the document)");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.retrievedAt ?? "")) errs.push("retrievedAt must be YYYY-MM-DD");
  if (typeof r.text !== "string" || r.text.length < 20 || r.text.length > 20000) errs.push("text must be 20-20000 characters");
  if (!Array.isArray(r.items) || r.items.length < 1 || r.items.length > 200) errs.push("items must have 1-200 entries");
  const seen = new Set();
  for (const [i, it] of (r.items ?? []).entries()) {
    const at = `items[${i}] (${it?.name ?? "?"})`;
    if (typeof it.name !== "string" || !it.name.trim() || it.name.length > 200) errs.push(`${at}: name must be 1-200 characters`);
    if (!isInt(it.cents) || it.cents < 0 || it.cents > MAX_CENTS) errs.push(`${at}: cents must be an integer 0-${MAX_CENTS}`);
    if (it.matchedItemId !== undefined && !ids.has(it.matchedItemId)) errs.push(`${at}: unknown matchedItemId "${it.matchedItemId}"`);
    if (it.qty !== undefined && (!isInt(it.qty) || it.qty < 2 || it.qty > 999)) errs.push(`${at}: qty must be 2-999`);
    if (it.isRange && it.matchedItemId && !isInt(it.centsHigh)) errs.push(`${at}: a range needs centsLow/centsHigh`);
    // One observation per benchmark per document: the pipeline counts every
    // matched line, so two lines mapped to one benchmark would weight this
    // home twice (reviewers pick the FTC-comparable line).
    if (it.matchedItemId && !it.isRange) {
      if (seen.has(it.matchedItemId)) errs.push(`${at}: "${it.matchedItemId}" is already mapped by another line`);
      seen.add(it.matchedItemId);
    }
  }
  return errs;
}

/**
 * The price_list_analyses row, built exactly as handleSave builds it.
 * @param {GplRecord} r @param {string} userId @param {Set<string>} ids
 */
export function analysisRow(r, userId, ids) {
  const items = r.items.map((i) => ({
    name: i.name,
    cents: i.cents,
    ...(i.matchedItemId && ids.has(i.matchedItemId) ? { matchedItemId: i.matchedItemId } : {}),
    ...(i.qty ? { qty: i.qty } : {}),
    ...(i.isRange
      ? { isRange: true, centsLow: i.centsLow ?? i.cents, centsHigh: i.centsHigh ?? i.cents }
      : {}),
  }));
  const itemSumCents = items.filter((i) => !i.isRange).reduce((s, i) => s + (i.cents || 0), 0);
  return {
    user_id: userId,
    raw_text: redactContact(r.text).slice(0, 5000),
    items,
    zip: r.zip,
    total_quoted_cents: itemSumCents,
    total_fair_cents: 0,
    potential_savings_cents: 0,
    extraction_method: "founder_ingest",
    confidence: extractionConfidence({
      itemCount: items.length,
      statedTotalCents: r.statedTotalCents ?? null,
      itemSumCents,
    }),
    input_hash: analysisInputHash(`${r.homeName}\n${r.zip}\n${r.text}`),
  };
}

/**
 * The ilike pattern the save route uses to find the home to stamp:
 * metacharacters escaped so a name can't widen the match.
 * @param {string} homeName
 */
export function homeNamePattern(homeName) {
  return `%${homeName.replace(/[\\%_]/g, (ch) => `\\${ch}`).replace(/\*/g, "\\*")}%`;
}
