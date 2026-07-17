/**
 * Import the CMS hospice directory into public.hospices.
 *
 * Source: data.cms.gov Provider Data Catalog — "Hospice - General
 * Information", dataset yc9t-dgbk (~6,852 rows, refreshed ~quarterly).
 * Download the CSV from the dataset page's Download button.
 *
 * This is PUBLIC REFERENCE data — the product-side top of the partner funnel
 * (homepage hospice finder, /partners apply autocomplete, /hospices pages).
 * No patient or family data is anywhere near this table, and nothing in it is
 * ever contacted, so importing is always safe.
 *
 * Guarantees:
 *   - CCN stays a ZERO-PADDED STRING ("011500") end-to-end. Never Number() —
 *     the leading zeros CMS keys facilities with would be destroyed.
 *   - Idempotent: rows upsert on ccn. Re-running the same CSV makes no new
 *     rows; a refreshed CMS file updates facilities in place. Rows CMS drops
 *     are kept (a closure shouldn't break existing links to the facility).
 *   - --dry-run validates + classifies against the live table, writes nothing.
 *   - --parse-only validates offline (no Supabase creds, no DB).
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/import-hospices.mjs --file=path/to/hospices.csv [--dry-run]
 *
 *   # or, reading creds from .env.local:
 *   npm run import:hospices -- --file=path/to/hospices.csv [--dry-run]
 *
 * CSV header: the CMS export's own headers, matched case/punctuation-
 * insensitively — "CMS Certification Number (CCN)", "Facility Name",
 * "City/Town", "State", "ZIP Code", "Ownership Type". The datastore API's
 * snake_case names (cms_certification_number_ccn, citytown, …) match too.
 * Extra columns are ignored.
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Args + env
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const fileArg = args.find((a) => a.startsWith("--file="));
const positional = args.filter((a) => !a.startsWith("--"));
const csvPath = fileArg ? fileArg.split("=").slice(1).join("=") : positional[0];
const flags = new Set(args.filter((a) => a.startsWith("--") && !a.includes("=")));
const DRY_RUN = flags.has("--dry-run");
// --parse-only validates + reports offline (no Supabase creds, no DB read).
const PARSE_ONLY = flags.has("--parse-only");

const {
  NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

function die(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

if (!csvPath) {
  die(
    "No CSV path given.\n  Usage: node scripts/import-hospices.mjs --file=hospices.csv [--dry-run|--parse-only]",
  );
}
if (!PARSE_ONLY) {
  if (!SUPABASE_URL) die("Missing env var NEXT_PUBLIC_SUPABASE_URL");
  if (!SUPABASE_SERVICE_ROLE_KEY) die("Missing env var SUPABASE_SERVICE_ROLE_KEY");
}

// ---------------------------------------------------------------------------
// CSV parser (RFC-4180-ish: quoted fields, "" escapes, commas + newlines in
// quotes, CRLF or LF). No external deps. Same as import-funeral-homes.mjs.
// ---------------------------------------------------------------------------
function parseCsv(text) {
  // Strip a leading UTF-8 BOM if present.
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  const n = text.length;
  while (i < n) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (c === "\r") {
      i++;
      continue;
    }
    if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += c;
    i++;
  }
  // Flush trailing field/row (file may not end in newline).
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  // Drop fully-empty trailing rows.
  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ""));
}

// ---------------------------------------------------------------------------
// Header matching + normalisation
// ---------------------------------------------------------------------------
// Squash a header to lowercase alphanumerics so both the CSV export's pretty
// headers ("CMS Certification Number (CCN)") and the datastore API's
// snake_case ("cms_certification_number_ccn") resolve to the same key.
const squash = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

const COLUMNS = {
  ccn: ["cmscertificationnumberccn", "ccn"],
  name: ["facilityname"],
  city: ["citytown", "city"],
  state: ["state"],
  zip: ["zipcode", "zip"],
  ownership: ["ownershiptype"],
};

const collapseWs = (s) => s.replace(/\s+/g, " ").trim();

/**
 * Returns { ok, row?, errors[], warnings[] }.
 * Invalid (ok=false) when ccn/name/state are unusable. Soft problems (odd
 * ccn shape, unusable zip) become warnings and the row still imports.
 */
function normalizeRow(raw, lineNo) {
  const errors = [];
  const warnings = [];

  // CCN is the upsert key — TEXT, verbatim. Hospice CCNs are 6-character
  // zero-padded strings; anything else-shaped still imports (CMS owns the
  // identifier) but gets flagged for eyeballs.
  const ccn = collapseWs(raw.ccn ?? "");
  if (!ccn) errors.push("missing ccn");
  else if (ccn.length > 12) errors.push(`ccn "${ccn}" too long (>12)`);
  else if (!/^[0-9A-Za-z]{6}$/.test(ccn)) {
    warnings.push(`ccn "${ccn}" is not the usual 6-character shape — keeping verbatim`);
  }

  // Names/cities stay VERBATIM (CMS publishes uppercase) — this table is a
  // faithful mirror of the federal dataset; display casing is a UI concern.
  const name = collapseWs(raw.name ?? "");
  if (!name) errors.push("missing facility name");
  if (name.length > 255) errors.push("facility name too long (>255)");

  const state = collapseWs(raw.state ?? "").toUpperCase();
  if (!/^[A-Z]{2}$/.test(state)) {
    errors.push(`invalid state "${raw.state ?? ""}" (need 2-letter code)`);
  }

  // ZIPs are zero-padded strings too ("01040"); accept ZIP+4 by truncating.
  let zip = null;
  const zipDigits = (raw.zip ?? "").replace(/\D/g, "");
  if (zipDigits.length === 5) zip = zipDigits;
  else if (zipDigits.length === 9) zip = zipDigits.slice(0, 5);
  else if (zipDigits.length > 0) {
    warnings.push(`zip "${raw.zip}" unusable (need 5 or 9 digits) — storing null`);
  }

  if (errors.length) return { ok: false, errors, warnings, lineNo, name, ccn };

  const row = {
    ccn,
    name,
    city: collapseWs(raw.city ?? "") || null,
    state,
    zip,
    ownership: collapseWs(raw.ownership ?? "") || null,
  };
  return { ok: true, row, errors, warnings, lineNo };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const text = readFileSync(csvPath, "utf8");
  const table = parseCsv(text);
  if (table.length < 2) die("CSV has no data rows.");

  const header = table[0].map(squash);
  const idx = {};
  for (const [key, aliases] of Object.entries(COLUMNS)) {
    const at = header.findIndex((h) => aliases.includes(h));
    if (at !== -1) idx[key] = at;
  }
  for (const required of ["ccn", "name", "state"]) {
    if (idx[required] == null) {
      die(
        `CSV header missing required column: ${required} (accepted: ${COLUMNS[required].join(", ")}).\n  Headers seen: ${table[0].join(" | ")}`,
      );
    }
  }
  const get = (cells, key) => (idx[key] != null ? (cells[idx[key]] ?? "") : "");

  // Normalise every data row.
  const valid = [];
  const invalid = [];
  for (let r = 1; r < table.length; r++) {
    const cells = table[r];
    const raw = {
      ccn: get(cells, "ccn"),
      name: get(cells, "name"),
      city: get(cells, "city"),
      state: get(cells, "state"),
      zip: get(cells, "zip"),
      ownership: get(cells, "ownership"),
    };
    const res = normalizeRow(raw, r + 1);
    if (res.ok) valid.push(res);
    else invalid.push(res);
  }

  // ---- Within-file dedup on ccn (first row wins) ----
  const unique = [];
  const dupInFile = [];
  const seenCcn = new Set();
  for (const v of valid) {
    if (seenCcn.has(v.row.ccn)) {
      dupInFile.push({ row: v.row, reason: `duplicate ccn in file (${v.row.ccn})` });
      continue;
    }
    seenCcn.add(v.row.ccn);
    unique.push(v);
  }

  // ---- Parse report (always) ----
  console.log("");
  console.log(
    `Hospice import${PARSE_ONLY ? "  (PARSE ONLY — offline)" : DRY_RUN ? "  (DRY RUN — no writes)" : ""}`,
  );
  console.log(`  file:           ${csvPath}`);
  console.log("  ────────────────────────────────");
  console.log(`  data rows read: ${table.length - 1}`);
  console.log(`  valid:          ${valid.length}`);
  console.log(`  invalid:        ${invalid.length}`);
  console.log(`  dup in file:    ${dupInFile.length}`);
  console.log(`  unique to load: ${unique.length}`);

  const warned = valid.filter((v) => v.warnings.length);
  if (warned.length) {
    console.log(`\n  ⚠ ${warned.length} row(s) with warnings:`);
    for (const v of warned.slice(0, 50)) {
      console.log(`    line ${v.lineNo} (${v.row.name}): ${v.warnings.join("; ")}`);
    }
    if (warned.length > 50) console.log(`    …and ${warned.length - 50} more`);
  }

  if (invalid.length) {
    console.log(`\n  ✗ ${invalid.length} invalid row(s) skipped:`);
    for (const v of invalid.slice(0, 100)) {
      console.log(`    line ${v.lineNo} (${v.name || v.ccn || "?"}): ${v.errors.join("; ")}`);
    }
    if (invalid.length > 100) console.log(`    …and ${invalid.length - 100} more`);
  }

  if (dupInFile.length) {
    console.log(`\n  ↺ ${dupInFile.length} within-file duplicate(s) skipped:`);
    for (const d of dupInFile.slice(0, 50)) {
      console.log(`    ${d.row.name}: ${d.reason}`);
    }
  }

  if (PARSE_ONLY) {
    console.log("\nParse-only complete — no database touched. Drop --parse-only to import.\n");
    return;
  }

  // ---- Classify against the live table (report insert vs update counts) ----
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const existingCcns = new Set();
  {
    const PAGE = 1000;
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await admin
        .from("hospices")
        .select("ccn")
        .range(from, from + PAGE - 1);
      if (error) {
        die(
          `Could not read existing hospices: ${error.message}\n  (Is Migration A — 2026-07-20-hospices-consent.sql — applied?)`,
        );
      }
      for (const e of data ?? []) existingCcns.add(e.ccn);
      if (!data || data.length < PAGE) break;
    }
  }

  const toInsert = unique.filter((v) => !existingCcns.has(v.row.ccn)).length;
  const toUpdate = unique.length - toInsert;

  console.log(`\n  existing rows:  ${existingCcns.size}`);
  console.log(`  → to insert:    ${toInsert}`);
  console.log(`  → to update:    ${toUpdate}`);

  if (DRY_RUN) {
    console.log("\nDry run complete — nothing written. Re-run without --dry-run to apply.\n");
    return;
  }

  if (!unique.length) {
    console.log("\nNothing to write.\n");
    return;
  }

  // ---- Writes: chunked upsert on ccn ----
  let written = 0;
  const CHUNK = 500;
  for (let i = 0; i < unique.length; i += CHUNK) {
    const batch = unique.slice(i, i + CHUNK).map((v) => v.row);
    const { error } = await admin
      .from("hospices")
      .upsert(batch, { onConflict: "ccn" });
    if (error) die(`Upsert failed at batch ${i}: ${error.message}`);
    written += batch.length;
    process.stdout.write(`  upserted ${written}/${unique.length}\r`);
  }

  console.log("");
  console.log(
    `✓ Imported: ${toInsert} inserted, ${toUpdate} updated, ${dupInFile.length} dup skipped, ${invalid.length} invalid skipped.`,
  );
  console.log("");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
