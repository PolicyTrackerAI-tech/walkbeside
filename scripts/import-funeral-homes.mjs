/**
 * Import funeral homes from a CSV into public.funeral_homes.
 *
 * THE #1 LAUNCH DATA GATE. Until real, vetted homes exist in the directory,
 * the outreach flow falls back to placeholder homes and nothing real can be
 * contacted.
 *
 * Safety guarantees:
 *   - Every imported row lands active=true, vetted=FALSE. This script NEVER
 *     sets vetted/vetted_at/vetted_by. A human must approve each home in
 *     /admin/vetting before it can ever be contacted (findHomesFromDirectory
 *     requires vetted=true). So importing is safe even with OUTREACH_LIVE on.
 *   - Idempotent + dedup-safe: existing rows are matched by email, then by
 *     (name + zip), and UPDATED in place rather than duplicated. Re-running the
 *     same CSV makes no new rows.
 *   - --dry-run validates + reports without writing anything.
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/import-funeral-homes.mjs path/to/homes.csv [--dry-run] [--state=UT|ALL]
 *
 *   # or, reading creds from .env.local:
 *   npm run import:homes -- path/to/homes.csv --dry-run
 *
 * CSV header (exact, order-independent; extra columns ignored):
 *   name,email,phone,address,city,state,zip,google_rating,google_review_count,notes
 *
 * A home with no/blank email still imports (it just can't be contacted until an
 * email is added in /admin/vetting). Rows missing a name or a valid 5-digit zip,
 * or whose state doesn't match the expected state, are skipped as invalid.
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Args + env
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const positional = args.filter((a) => !a.startsWith("--"));
const csvPath = positional[0];
const DRY_RUN = flags.has("--dry-run");
// --parse-only validates + reports offline (no Supabase creds, no DB read).
const PARSE_ONLY = flags.has("--parse-only");

const stateArg = args.find((a) => a.startsWith("--state="));
// Default to UT for the Utah launch; pass --state=ALL to accept any 2-letter
// state (for the eventual nationwide dataset), or --state=XX to pin another.
const EXPECT_STATE = (stateArg ? stateArg.split("=")[1] : "UT").toUpperCase();

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
    "No CSV path given.\n  Usage: node scripts/import-funeral-homes.mjs homes.csv [--dry-run] [--state=UT|ALL]",
  );
}
if (!PARSE_ONLY) {
  if (!SUPABASE_URL) die("Missing env var NEXT_PUBLIC_SUPABASE_URL");
  if (!SUPABASE_SERVICE_ROLE_KEY) die("Missing env var SUPABASE_SERVICE_ROLE_KEY");
}

// ---------------------------------------------------------------------------
// CSV parser (RFC-4180-ish: quoted fields, "" escapes, commas + newlines in
// quotes, CRLF or LF). No external deps.
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
// Normalisation + validation
// ---------------------------------------------------------------------------
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function titleCase(s) {
  return s
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase());
}

function normPhone(raw) {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1);
  // Unusual format — keep the trimmed original rather than mangle it.
  return raw.trim() || null;
}

function toNumberOrNull(raw) {
  if (raw == null || raw.trim() === "") return null;
  const v = Number(raw);
  return Number.isFinite(v) ? v : NaN; // NaN signals "present but unparseable"
}

/**
 * Returns { ok, row?, errors[], warnings[] }.
 * Invalid (ok=false) when name/zip/state are unusable. Soft problems (bad
 * email/rating) become warnings and the row still imports.
 */
function normalizeRow(raw, lineNo) {
  const errors = [];
  const warnings = [];

  const name = (raw.name ?? "").trim();
  if (!name) errors.push("missing name");
  if (name.length > 255) errors.push("name too long (>255)");

  const zip = (raw.zip ?? "").trim();
  if (!/^\d{5}$/.test(zip)) errors.push(`invalid zip "${zip}" (need 5 digits)`);

  let state = (raw.state ?? "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(state)) {
    errors.push(`invalid state "${raw.state ?? ""}" (need 2-letter code)`);
  } else if (EXPECT_STATE !== "ALL" && state !== EXPECT_STATE) {
    errors.push(`state ${state} != expected ${EXPECT_STATE} (use --state=ALL to allow)`);
  }

  let email = (raw.email ?? "").trim().toLowerCase();
  if (email === "") {
    email = null;
    warnings.push("no email — imports but can't be contacted until one is added");
  } else if (!EMAIL_RE.test(email)) {
    warnings.push(`email "${email}" looks invalid — clearing it`);
    email = null;
  } else if (email.length > 200) {
    warnings.push("email too long (>200) — clearing it");
    email = null;
  }

  const phone = normPhone(raw.phone ?? "");

  let rating = toNumberOrNull(raw.google_rating ?? "");
  if (Number.isNaN(rating)) {
    warnings.push(`google_rating "${raw.google_rating}" not a number — clearing`);
    rating = null;
  } else if (rating != null && (rating < 0 || rating > 5)) {
    warnings.push(`google_rating ${rating} out of 0–5 range — clearing`);
    rating = null;
  } else if (rating != null) {
    rating = Math.round(rating * 10) / 10; // numeric(2,1)
  }

  let reviews = toNumberOrNull(raw.google_review_count ?? "");
  if (Number.isNaN(reviews)) {
    warnings.push(`google_review_count "${raw.google_review_count}" not a number — clearing`);
    reviews = null;
  } else if (reviews != null) {
    reviews = Math.max(0, Math.round(reviews));
  }

  if (errors.length) return { ok: false, errors, warnings, lineNo, name, zip };

  const row = {
    name,
    email,
    phone,
    address: (raw.address ?? "").trim() || null,
    city: (raw.city ?? "").trim() ? titleCase((raw.city ?? "").trim()) : null,
    state,
    zip,
    google_rating: rating,
    google_review_count: reviews,
    notes: (raw.notes ?? "").trim() || null,
    active: true,
    // vetted is intentionally OMITTED → DB default false. Never set here.
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

  const header = table[0].map((h) => h.trim().toLowerCase());
  const required = ["name", "zip", "state"];
  for (const col of required) {
    if (!header.includes(col)) die(`CSV header missing required column: ${col}`);
  }
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));
  const get = (cells, col) => (idx[col] != null ? cells[idx[col]] ?? "" : "");

  // Normalise every data row.
  const valid = [];
  const invalid = [];
  for (let r = 1; r < table.length; r++) {
    const cells = table[r];
    const raw = {
      name: get(cells, "name"),
      email: get(cells, "email"),
      phone: get(cells, "phone"),
      address: get(cells, "address"),
      city: get(cells, "city"),
      state: get(cells, "state"),
      zip: get(cells, "zip"),
      google_rating: get(cells, "google_rating"),
      google_review_count: get(cells, "google_review_count"),
      notes: get(cells, "notes"),
    };
    const res = normalizeRow(raw, r + 1);
    if (res.ok) valid.push(res);
    else invalid.push(res);
  }

  const nameZipKey = (name, zip) =>
    `${name.trim().toLowerCase()}|${(zip ?? "").trim()}`;

  // ---- Within-file dedup (DB-independent) ----
  const unique = []; // valid rows after removing in-file dups
  const dupInFile = [];
  const seenEmail = new Set();
  const seenNameZip = new Set();
  for (const v of valid) {
    const { row } = v;
    const emailKey = row.email ? row.email.toLowerCase() : null;
    const nzKey = nameZipKey(row.name, row.zip);
    if (emailKey && seenEmail.has(emailKey)) {
      dupInFile.push({ row, reason: `duplicate email in file (${emailKey})` });
      continue;
    }
    if (seenNameZip.has(nzKey)) {
      dupInFile.push({
        row,
        reason: `duplicate name+zip in file (${row.name}, ${row.zip})`,
      });
      continue;
    }
    if (emailKey) seenEmail.add(emailKey);
    seenNameZip.add(nzKey);
    unique.push(v);
  }

  // ---- Parse report (always) ----
  console.log("");
  console.log(
    `Funeral-home import${PARSE_ONLY ? "  (PARSE ONLY — offline)" : DRY_RUN ? "  (DRY RUN — no writes)" : ""}`,
  );
  console.log(`  file:           ${csvPath}`);
  console.log(`  expected state: ${EXPECT_STATE}`);
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
      console.log(`    line ${v.lineNo} (${v.name || "?"}): ${v.errors.join("; ")}`);
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

  // ---- DB dedup: classify unique rows into insert vs update ----
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const existing = [];
  {
    const PAGE = 1000;
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await admin
        .from("funeral_homes")
        .select("id, name, email, zip")
        .range(from, from + PAGE - 1);
      if (error) die(`Could not read existing funeral_homes: ${error.message}`);
      existing.push(...(data ?? []));
      if (!data || data.length < PAGE) break;
    }
  }
  const byEmail = new Map();
  const byNameZip = new Map();
  for (const e of existing) {
    if (e.email) byEmail.set(e.email.toLowerCase(), e.id);
    byNameZip.set(nameZipKey(e.name, e.zip), e.id);
  }

  const toInsert = [];
  const toUpdate = []; // { id, row }
  for (const { row } of unique) {
    const emailKey = row.email ? row.email.toLowerCase() : null;
    const nzKey = nameZipKey(row.name, row.zip);
    const existingId =
      (emailKey && byEmail.get(emailKey)) || byNameZip.get(nzKey) || null;
    if (existingId) toUpdate.push({ id: existingId, row });
    else toInsert.push(row);
  }

  console.log(`\n  existing rows:  ${existing.length}`);
  console.log(`  → to insert:    ${toInsert.length}`);
  console.log(`  → to update:    ${toUpdate.length}`);

  if (DRY_RUN) {
    console.log("\nDry run complete — nothing written. Re-run without --dry-run to apply.\n");
    return;
  }

  if (!toInsert.length && !toUpdate.length) {
    console.log("\nNothing to write. Directory already up to date.\n");
    return;
  }

  // ---- Writes ----
  let inserted = 0;
  let updated = 0;

  if (toInsert.length) {
    const CHUNK = 500;
    for (let i = 0; i < toInsert.length; i += CHUNK) {
      const batch = toInsert.slice(i, i + CHUNK);
      const { error, count } = await admin
        .from("funeral_homes")
        .insert(batch, { count: "exact" });
      if (error) die(`Insert failed at batch ${i}: ${error.message}`);
      inserted += count ?? batch.length;
    }
  }

  for (const { id, row } of toUpdate) {
    // Never touch vetted/vetted_at/vetted_by; refresh updated_at.
    const patch = { ...row, updated_at: new Date().toISOString() };
    const { error } = await admin
      .from("funeral_homes")
      .update(patch)
      .eq("id", id);
    if (error) die(`Update failed for ${row.name} (${id}): ${error.message}`);
    updated++;
  }

  console.log("");
  console.log(`✓ Imported: ${inserted} inserted, ${updated} updated, ${dupInFile.length} dup skipped, ${invalid.length} invalid skipped.`);
  console.log("");
  console.log("All rows are vetted=FALSE. Approve real homes in /admin/vetting");
  console.log("before any can be contacted (the directory only returns vetted homes).");
  console.log("");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
