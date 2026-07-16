#!/usr/bin/env node
/**
 * Analyzer eval harness (D3) — scores the PRODUCTION extraction pipeline
 * end-to-end by POSTing golden GPL fixtures at the real
 * /api/analyze-price-list endpoint of a running dev server.
 *
 *   npm run eval:analyzer
 *   npm run eval:analyzer -- --model=claude-sonnet-5 --out=candidate.md
 *   EVAL_BASE_URL=http://localhost:3000 node scripts/eval-analyzer.mjs
 *
 * Flags:
 *   --model=<id>       Model override for this run (honored by the route ONLY
 *                      on a dev server — NODE_ENV !== "production"; silently
 *                      ignored in prod builds). Omit to measure the server's
 *                      default MODEL from lib/claude.ts.
 *   --min-recall=0.9   Exit non-zero when aggregate STRICT item recall falls
 *                      below the threshold (CI-style gate for future use).
 *   --out=<path>       Also write the markdown report to a file
 *                      (e.g. test/evals/BASELINE.md).
 *   --json=<path>      Also write machine-readable results for run diffing.
 *   --base-url=<url>   Overrides EVAL_BASE_URL (default http://localhost:3000).
 *   --fixture=<name>   Run a single fixture (debugging).
 *
 * Why HTTP and not imports: a plain Node script can't import the TS libs
 * (same constraint that made ingest an admin page) — and hitting the route
 * means the score covers the real pipeline: prompt → callClaude → JSON parse →
 * cleanItemName/matchLineItem mapping → reconcileTotalQuoted → runRules.
 *
 * Cost + safety notes:
 * - Runs cost real API cents (two Claude calls per fixture) and appear in
 *   /admin/ai-costs under the "eval" feature tag. Not part of vitest/CI.
 * - Requests run SEQUENTIALLY with ~6s spacing — the route is rate-limited
 *   12/min (lib/rate-limit.ts). Do not parallelize.
 * - Eval POSTs are unauthenticated and the route only persists rows for
 *   signed-in users, so runs never pollute price_list_analyses or the
 *   benchmark pipeline.
 * - Fixtures never send a zip, so scoring uses national ranges only and
 *   golden classifications can't shift when local benchmarks get promoted.
 *
 * Scoring (extraction-weighted by design — see test/evals/BASELINE.md):
 * - Expected items are matched to response items by unique name substring;
 *   recall/precision, then per-field accuracy on cents / matchedItemId /
 *   qty / isRange+centsLow/High over the matched pairs.
 * - Stated-total reconciliation re-derives the expected totalQuoted with the
 *   same rules as lib/analyzer-totals.ts reconcileTotalQuoted().
 * - Rule must/mustNot hits are secondary signals (they're deterministic
 *   given a correct extraction).
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const FIXTURE_DIR = path.join(process.cwd(), "test", "evals", "gpl");
const REQUEST_SPACING_MS = 6200; // 12/min route limit → stay under 10/min
const REQUEST_TIMEOUT_MS = 120_000;

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = /^--([^=]+)(?:=(.*))?$/.exec(a);
    return m ? [m[1], m[2] ?? "true"] : [a, "true"];
  }),
);
const BASE_URL = args["base-url"] ?? process.env.EVAL_BASE_URL ?? "http://localhost:3000";
const MODEL_OVERRIDE = args.model;
const MIN_RECALL = args["min-recall"] != null ? Number(args["min-recall"]) : null;
const ONLY_FIXTURE = args.fixture;

// ---------------------------------------------------------------------------
// Expected-total reconciliation — mirrors lib/analyzer-totals.ts
// reconcileTotalQuoted() (kept in sync by test/evals/fixtures.test.ts, which
// imports the real function and pins this duplicate against it).
// ---------------------------------------------------------------------------
function reconcileTotalQuoted(statedTotalCents, itemSumCents) {
  if (itemSumCents <= 0) return statedTotalCents ?? 0;
  if (statedTotalCents == null) return itemSumCents;
  if (statedTotalCents < itemSumCents) return itemSumCents;
  if (statedTotalCents > itemSumCents * 3) return itemSumCents;
  return statedTotalCents;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pct = (num, den) => (den === 0 ? null : num / den);
const fmtPct = (v) => (v == null ? "n/a" : `${(v * 100).toFixed(1)}%`);

async function loadFixtures() {
  let entries;
  try {
    entries = await readdir(FIXTURE_DIR);
  } catch {
    console.error(`No fixture directory at ${FIXTURE_DIR}`);
    process.exit(1);
  }
  const names = entries
    .filter((f) => f.endsWith(".txt"))
    .map((f) => f.replace(/\.txt$/, ""))
    .filter((n) => !ONLY_FIXTURE || n === ONLY_FIXTURE)
    .sort();
  const fixtures = [];
  for (const name of names) {
    const text = await readFile(path.join(FIXTURE_DIR, `${name}.txt`), "utf8");
    const expected = JSON.parse(
      await readFile(path.join(FIXTURE_DIR, `${name}.expected.json`), "utf8"),
    );
    fixtures.push({ name, text, expected });
  }
  return fixtures;
}

async function postFixture(fixture) {
  const body = {
    text: fixture.text,
    ...(fixture.expected.post?.serviceTypeHint
      ? { serviceTypeHint: fixture.expected.post.serviceTypeHint }
      : {}),
    // NEVER send a zip: national ranges only, immune to benchmark promotions.
    evalRun: true,
    ...(MODEL_OVERRIDE ? { evalModel: MODEL_OVERRIDE } : {}),
  };
  for (let attempt = 1; attempt <= 2; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(`${BASE_URL}/api/analyze-price-list`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (res.status === 429 && attempt === 1) {
        const retry = JSON.parse(await res.text().catch(() => "{}"));
        const waitMs = Number(retry?.retryAfterMs) || 15_000;
        console.error(`  rate-limited; waiting ${waitMs}ms`);
        await sleep(waitMs);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
      return await res.json();
    } catch (e) {
      if (attempt === 2) throw e;
      console.error(`  request failed (${e?.message ?? e}); retrying in 15s`);
      await sleep(15_000);
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error("unreachable");
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------
function scoreFixture(expected, resp) {
  const respItems = (resp.items ?? []).map((i) => ({ ...i, _claimed: false }));
  const pairs = [];
  const misses = [];

  for (const exp of expected.items) {
    const needle = exp.match.toLowerCase();
    const cand = respItems.find(
      (r) => !r._claimed && String(r.name ?? "").toLowerCase().includes(needle),
    );
    if (!cand) {
      misses.push(`missing: "${exp.match}"`);
      pairs.push({ exp, found: false, strict: false });
      continue;
    }
    cand._claimed = true;
    const wrong = [];
    if (!exp.isRange && exp.cents != null && cand.cents !== exp.cents)
      wrong.push(`cents ${cand.cents}≠${exp.cents}`);
    if ((cand.matchedItemId ?? null) !== (exp.matchedItemId ?? null))
      wrong.push(`matchedItemId ${cand.matchedItemId ?? "null"}≠${exp.matchedItemId ?? "null"}`);
    if ((cand.qty ?? null) !== (exp.qty ?? null))
      wrong.push(`qty ${cand.qty ?? "null"}≠${exp.qty ?? "null"}`);
    if (Boolean(exp.isRange) !== Boolean(cand.isRange))
      wrong.push(`isRange ${Boolean(cand.isRange)}≠${Boolean(exp.isRange)}`);
    if (exp.isRange && exp.centsLow != null && (cand.centsLow !== exp.centsLow || cand.centsHigh !== exp.centsHigh))
      wrong.push(`range ${cand.centsLow}-${cand.centsHigh}≠${exp.centsLow}-${exp.centsHigh}`);
    if (wrong.length) misses.push(`"${exp.match}": ${wrong.join(", ")}`);
    pairs.push({
      exp,
      found: true,
      strict: wrong.length === 0,
      centsOk: exp.isRange ? null : exp.cents == null ? null : cand.cents === exp.cents,
      idOk: (cand.matchedItemId ?? null) === (exp.matchedItemId ?? null),
      qtyOk: exp.qty != null ? (cand.qty ?? null) === exp.qty : null,
      rangeOk: exp.isRange
        ? Boolean(cand.isRange) &&
          (exp.centsLow == null || (cand.centsLow === exp.centsLow && cand.centsHigh === exp.centsHigh))
        : null,
    });
  }

  const extras = respItems.filter((r) => !r._claimed);
  for (const x of extras) misses.push(`extra item extracted: "${x.name}" (${x.cents ?? `${x.centsLow}-${x.centsHigh}`})`);

  // Expected end-to-end total from GOLDEN items + the document's stated total.
  const goldenSum = expected.items
    .filter((i) => !i.isRange)
    .reduce((s, i) => s + (i.cents ?? 0), 0);
  const expectedTotal = reconcileTotalQuoted(expected.statedTotalCents ?? null, goldenSum);
  const totalOk = resp.totalQuoted === expectedTotal;
  if (!totalOk) misses.push(`totalQuoted ${resp.totalQuoted}≠${expectedTotal}`);

  const flagged = new Set((resp.violations ?? []).map((v) => v.ruleId));
  const mustFlag = expected.mustFlagRuleIds ?? [];
  const mustNot = expected.mustNotFlagRuleIds ?? [];
  const flagHits = mustFlag.filter((id) => flagged.has(id));
  const mustNotViolations = mustNot.filter((id) => flagged.has(id));
  for (const id of mustFlag.filter((id) => !flagged.has(id))) misses.push(`rule not flagged: ${id}`);
  for (const id of mustNotViolations) misses.push(`rule flagged but pinned mustNot: ${id}`);

  return {
    expectedCount: expected.items.length,
    foundCount: pairs.filter((p) => p.found).length,
    strictCount: pairs.filter((p) => p.strict).length,
    respCount: respItems.length,
    claimedCount: respItems.length - extras.length,
    cents: countPair(pairs, "centsOk"),
    ids: { ok: pairs.filter((p) => p.found && p.idOk).length, total: pairs.filter((p) => p.found).length },
    qty: {
      ok: pairs.filter((p) => p.exp.qty != null && p.found && p.qtyOk).length,
      total: pairs.filter((p) => p.exp.qty != null).length,
    },
    range: {
      ok: pairs.filter((p) => p.exp.isRange && p.found && p.rangeOk).length,
      total: pairs.filter((p) => p.exp.isRange).length,
    },
    totalOk,
    hasStatedTotal: expected.statedTotalCents != null,
    statedTotalOk: expected.statedTotalCents != null ? totalOk : null,
    flags: { ok: flagHits.length, total: mustFlag.length },
    mustNot: { violations: mustNotViolations.length, total: mustNot.length },
    extractionMethod: resp.extractionMethod ?? "unknown",
    misses,
  };
}

function countPair(pairs, key) {
  const applicable = pairs.filter((p) => p.found && p[key] != null);
  return { ok: applicable.filter((p) => p[key]).length, total: applicable.length };
}

function aggregate(rows) {
  const sum = (fn) => rows.reduce((s, r) => s + fn(r.score), 0);
  const statedRows = rows.filter((r) => r.score.hasStatedTotal);
  return {
    fixtures: rows.length,
    nameRecall: pct(sum((s) => s.foundCount), sum((s) => s.expectedCount)),
    strictRecall: pct(sum((s) => s.strictCount), sum((s) => s.expectedCount)),
    precision: pct(sum((s) => s.claimedCount), sum((s) => s.respCount)),
    centsAccuracy: pct(sum((s) => s.cents.ok), sum((s) => s.cents.total)),
    matchedIdAccuracy: pct(sum((s) => s.ids.ok), sum((s) => s.ids.total)),
    qtyDetection: pct(sum((s) => s.qty.ok), sum((s) => s.qty.total)),
    rangeDetection: pct(sum((s) => s.range.ok), sum((s) => s.range.total)),
    statedTotalReconciliation: pct(
      statedRows.filter((r) => r.score.statedTotalOk).length,
      statedRows.length,
    ),
    totalAccuracy: pct(rows.filter((r) => r.score.totalOk).length, rows.length),
    rulesMustFlag: pct(sum((s) => s.flags.ok), sum((s) => s.flags.total)),
    rulesMustNotClean: pct(
      sum((s) => s.mustNot.total - s.mustNot.violations),
      sum((s) => s.mustNot.total),
    ),
  };
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
function renderReport({ modelLabel, rows, agg, startedAt }) {
  const lines = [];
  lines.push(`# Analyzer eval — ${modelLabel}`);
  lines.push("");
  lines.push(`- Run: ${startedAt}`);
  lines.push(`- Base URL: ${BASE_URL}`);
  lines.push(`- Fixtures: ${rows.length} (test/evals/gpl/)`);
  const naive = rows.filter((r) => r.score.extractionMethod !== "claude");
  if (naive.length)
    lines.push(
      `- ⚠️ ${naive.length} fixture(s) fell back to the naive regex extractor (${naive
        .map((r) => r.name)
        .join(", ")}) — those rows did NOT measure the model.`,
    );
  lines.push("");
  lines.push("## Aggregates");
  lines.push("");
  lines.push("| Metric | Value |");
  lines.push("|---|---|");
  const label = {
    nameRecall: "Item recall (name match)",
    strictRecall: "Item recall (strict: every field)",
    precision: "Item precision (no fabricated items)",
    centsAccuracy: "Cents accuracy (matched items)",
    matchedIdAccuracy: "Benchmark-id accuracy (matched items)",
    qtyDetection: "Per-unit qty detection",
    rangeDetection: "Selection-range detection",
    statedTotalReconciliation: "Stated-total reconciliation",
    totalAccuracy: "End-to-end totalQuoted accuracy",
    rulesMustFlag: "Rules: must-flag hit rate",
    rulesMustNotClean: "Rules: must-not-flag clean rate",
  };
  for (const [k, v] of Object.entries(agg)) {
    if (k === "fixtures") continue;
    lines.push(`| ${label[k] ?? k} | ${fmtPct(v)} |`);
  }
  lines.push("");
  lines.push("## Per fixture");
  lines.push("");
  lines.push("| Fixture | Method | Recall (strict/name/expected) | Precision | Qty | Range | Total | Rules |");
  lines.push("|---|---|---|---|---|---|---|---|");
  for (const r of rows) {
    const s = r.score;
    lines.push(
      `| ${r.name} | ${s.extractionMethod} | ${s.strictCount}/${s.foundCount}/${s.expectedCount} | ${s.claimedCount}/${s.respCount} | ${s.qty.total ? `${s.qty.ok}/${s.qty.total}` : "—"} | ${s.range.total ? `${s.range.ok}/${s.range.total}` : "—"} | ${s.totalOk ? "✓" : "✗"} | ${s.flags.total || s.mustNot.total ? `${s.flags.ok}/${s.flags.total} flag, ${s.mustNot.total - s.mustNot.violations}/${s.mustNot.total} clean` : "—"} |`,
    );
  }
  const withMisses = rows.filter((r) => r.score.misses.length);
  if (withMisses.length) {
    lines.push("");
    lines.push("## Misses (the honest map of what the checker gets wrong)");
    for (const r of withMisses) {
      lines.push("");
      lines.push(`### ${r.name}`);
      for (const m of r.score.misses) lines.push(`- ${m}`);
    }
  }
  lines.push("");
  lines.push("---");
  lines.push(
    "Reproduce: start the dev server (`npm run dev`), then `npm run eval:analyzer`" +
      (MODEL_OVERRIDE ? ` -- --model=${MODEL_OVERRIDE}` : "") +
      ". Costs real API cents; runs appear in /admin/ai-costs under the `eval` feature. Not part of vitest/CI.",
  );
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const fixtures = await loadFixtures();
  if (!fixtures.length) {
    console.error("No fixtures found.");
    process.exit(1);
  }
  const startedAt = new Date().toISOString();
  const modelLabel = MODEL_OVERRIDE ?? "server default (lib/claude.ts MODEL)";
  console.log(`Analyzer eval — ${fixtures.length} fixtures — model: ${modelLabel}`);
  console.log(`Endpoint: ${BASE_URL}/api/analyze-price-list (sequential, ${REQUEST_SPACING_MS}ms spacing)\n`);

  const rows = [];
  for (let i = 0; i < fixtures.length; i++) {
    const f = fixtures[i];
    process.stdout.write(`[${i + 1}/${fixtures.length}] ${f.name} ... `);
    try {
      const resp = await postFixture(f);
      const score = scoreFixture(f.expected, resp);
      rows.push({ name: f.name, score });
      console.log(
        `${score.strictCount}/${score.expectedCount} strict, ${score.extractionMethod}${score.misses.length ? `, ${score.misses.length} miss(es)` : ""}`,
      );
    } catch (e) {
      console.log(`ERROR: ${e?.message ?? e}`);
      rows.push({
        name: f.name,
        score: {
          ...scoreFixture(f.expected, { items: [], totalQuoted: -1, violations: [] }),
          extractionMethod: "request-error",
          misses: [`request failed: ${e?.message ?? e}`],
        },
      });
    }
    if (i < fixtures.length - 1) await sleep(REQUEST_SPACING_MS);
  }

  const agg = aggregate(rows);
  const report = renderReport({ modelLabel, rows, agg, startedAt });
  console.log(`\n${report}`);

  if (args.out) {
    await writeFile(args.out, `${report}\n`);
    console.log(`\nWrote ${args.out}`);
  }
  if (args.json) {
    await writeFile(
      args.json,
      JSON.stringify({ model: modelLabel, startedAt, aggregates: agg, rows }, null, 2),
    );
    console.log(`Wrote ${args.json}`);
  }

  if (MIN_RECALL != null && (agg.strictRecall ?? 0) < MIN_RECALL) {
    console.error(
      `\nFAIL: strict recall ${fmtPct(agg.strictRecall)} < --min-recall=${MIN_RECALL}`,
    );
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
