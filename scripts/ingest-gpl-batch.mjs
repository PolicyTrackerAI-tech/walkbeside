/**
 * Batch-load reviewed General Price Lists into the benchmark pipeline.
 *
 * The one-at-a-time path is /admin/ingest-gpl (paste → parse → review →
 * save). This script loads price lists that were already reviewed into
 * JSON files (supabase/seed/gpl/<market>/*.json), writing exactly the row
 * that screen's save writes: a price_list_analyses row tagged
 * extraction_method 'founder_ingest', and, when the file names its source
 * URL, a gpl_url/last_verified_at stamp on the unambiguously matching
 * funeral_homes row (import the homes first, or the stamp is skipped with a
 * warning and the price list still saves).
 *
 * Safe by default:
 *   - Dry run unless --apply is passed: validates every file and prints what
 *     it would write.
 *   - Idempotent: a document already saved (same user + input_hash) is
 *     skipped, so re-running the folder writes nothing new.
 *   - A price list printed more than MAX_LIST_AGE_MONTHS before it was
 *     retrieved is held back (not loaded) until the file records, in
 *     stillCurrent, how the home confirmed it is still current.
 *   - Nothing here contacts anyone. Benchmarks still publish only through
 *     the n≥5 promotion step on /admin/benchmarks (guardrail #4).
 *
 * Usage:
 *   node --env-file-if-exists=.env.local scripts/ingest-gpl-batch.mjs \
 *     supabase/seed/gpl/dmv [--apply] [--user-email=you@example.com]
 * (or: npm run ingest:gpl -- supabase/seed/gpl/dmv [--apply])
 *
 * Rows are attributed to an admin account (price_list_analyses.user_id is
 * required): --user-email, else the first address in ADMIN_EMAILS.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  analysisRow,
  heldReason,
  homeNamePattern,
  lineItemIds,
  validateRecord,
} from "./lib/gpl-batch.mjs";

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const target = args.find((a) => !a.startsWith("--"));
const emailArg = args.find((a) => a.startsWith("--user-email="))?.split("=")[1];

function die(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

if (!target) die("Usage: node scripts/ingest-gpl-batch.mjs <file.json|folder> [--apply] [--user-email=...]");

const files = statSync(target).isDirectory()
  ? readdirSync(target).filter((f) => f.endsWith(".json")).sort().map((f) => join(target, f))
  : [target];
if (!files.length) die(`No .json files in ${target}`);

const ids = lineItemIds();
const records = [];
let invalid = 0;
let heldCount = 0;
for (const f of files) {
  let rec;
  try {
    rec = JSON.parse(readFileSync(f, "utf8"));
  } catch (e) {
    console.log(`✗ ${f}: not valid JSON (${e.message})`);
    invalid++;
    continue;
  }
  const errs = validateRecord(rec, ids);
  if (errs.length) {
    console.log(`✗ ${f}:\n    ${errs.join("\n    ")}`);
    invalid++;
    continue;
  }
  const held = heldReason(rec);
  if (held) {
    console.log(`⏸ held: ${rec.homeName} (${rec.zip}): ${held}`);
    heldCount++;
    continue;
  }
  const matched = rec.items.filter((i) => i.matchedItemId && !i.isRange).length;
  console.log(`✓ ${rec.homeName} (${rec.zip}) · effective ${rec.effectiveDate} · ${rec.provenance} · ${rec.items.length} items, ${matched} benchmark-matched`);
  records.push({ file: f, rec });
}
if (invalid) die(`${invalid} file(s) invalid. Nothing written.`);
if (heldCount) console.log(`\n${heldCount} price list(s) held back as too old to load; the rest continue.`);

const { NEXT_PUBLIC_SUPABASE_URL: URL_, SUPABASE_SERVICE_ROLE_KEY: KEY, ADMIN_EMAILS } = process.env;
if (!URL_ || !KEY) {
  console.log("\nValidated offline (no Supabase env). Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to check against the database.\n");
  process.exit(0);
}

const admin = createClient(URL_, KEY, { auth: { persistSession: false, autoRefreshToken: false } });

const userEmail = (emailArg ?? ADMIN_EMAILS?.split(",")[0] ?? "").trim().toLowerCase();
if (!userEmail) die("Pass --user-email=<an admin's sign-in email> (or set ADMIN_EMAILS).");
let userId = null;
for (let page = 1; !userId; page++) {
  const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
  if (error) die(`Could not list users: ${error.message}`);
  userId = data.users.find((u) => (u.email ?? "").toLowerCase() === userEmail)?.id ?? null;
  if (data.users.length < 200) break;
}
if (!userId) die(`No account signs in as ${userEmail}. Sign in to the site once with it, then re-run.`);

let saved = 0;
let skipped = 0;
let stamped = 0;
const warnings = [];
for (const { file, rec } of records) {
  const row = analysisRow(rec, userId, ids);
  const { data: existing, error: exErr } = await admin
    .from("price_list_analyses")
    .select("id")
    .eq("user_id", userId)
    .eq("input_hash", row.input_hash)
    .limit(1);
  if (exErr) die(`Lookup failed for ${file}: ${exErr.message}`);
  if (existing?.length) {
    console.log(`↺ already saved: ${rec.homeName}`);
    skipped++;
    continue;
  }

  let homeId = null;
  if (rec.sourceUrl) {
    const { data: homes, error } = await admin
      .from("funeral_homes")
      .select("id, name")
      .eq("zip", rec.zip)
      .ilike("name", homeNamePattern(rec.homeName))
      .limit(2);
    if (error) warnings.push(`${rec.homeName}: home lookup failed (${error.message}); gpl_url not stamped`);
    else if (!homes?.length) warnings.push(`${rec.homeName}: no funeral_homes row at ${rec.zip}; import the homes first, then re-run to stamp gpl_url`);
    else if (homes.length > 1) warnings.push(`${rec.homeName}: more than one home matches at ${rec.zip}; gpl_url not stamped`);
    else homeId = homes[0].id;
  }

  if (!APPLY) {
    console.log(`→ would save: ${rec.homeName}${homeId ? " + stamp gpl_url" : ""}`);
    continue;
  }
  const { error: insErr } = await admin.from("price_list_analyses").insert(row);
  if (insErr) die(`Insert failed for ${file}: ${insErr.message}`);
  saved++;
  if (homeId) {
    const { error: stErr } = await admin
      .from("funeral_homes")
      .update({ gpl_url: rec.sourceUrl, last_verified_at: new Date().toISOString() })
      .eq("id", homeId);
    if (stErr) warnings.push(`${rec.homeName}: saved, but stamping gpl_url failed (${stErr.message})`);
    else stamped++;
  }
  console.log(`✓ saved: ${rec.homeName}`);
}

for (const w of warnings) console.log(`⚠ ${w}`);
console.log(
  APPLY
    ? `\nDone: ${saved} saved, ${stamped} gpl_url stamped, ${skipped} already there.\nBenchmarks publish only after promotion at n≥5 on /admin/benchmarks.\n`
    : `\nDry run: nothing written. Re-run with --apply to save.\n`,
);
