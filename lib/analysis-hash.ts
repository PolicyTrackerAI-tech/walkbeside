import { createHash } from "node:crypto";

/**
 * Content hash identifying the SOURCE DOCUMENT behind a stored analysis
 * (price_list_analyses.input_hash, 2026-08-25-analysis-input-hash.sql).
 *
 * The benchmark feed dedupes observations by this hash (scoped per user):
 * re-analyzing one document must collapse to ONE observation even when the
 * extraction wobbled the cents, and two DIFFERENT documents from one user
 * that print the same price must count as TWO. Normalization (trim, collapse
 * every whitespace run, lowercase) makes the same document pasted twice with
 * stray whitespace hash identically.
 */
export function analysisInputHash(text: string): string {
  const normalized = text.trim().replace(/\s+/g, " ").toLowerCase();
  return createHash("sha256").update(normalized).digest("hex");
}
