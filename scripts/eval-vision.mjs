#!/usr/bin/env node
/**
 * Vision-extractor eval harness (audit A10-03) — the photo-snap wedge's
 * first impression finally has a golden set.
 *
 * Exercises /api/extract-price-list-image end-to-end with REAL photographed
 * GPL pages (harvested 2026-08 from FCA of Utah rehosts; golden truths
 * hand-verified against the scans — see each .expected.json's _source).
 *
 * Fixtures: test/evals/vision/<name>.jpeg + <name>.expected.json
 *   mustFind         [{nameHint, price}] — some extracted LINE must match
 *                    /nameHint/i AND /price/ (price is a regex alternation).
 *   mustFindPrices   digit-strings that must appear as dollar amounts
 *                    anywhere in the output (commas ignored).
 *   rangeChecks      [{nameHint, low, high}] — a line with the name must
 *                    carry both ends of the printed range.
 *   maxDollarAmounts hallucination cap (the cover-page case: 0 — a page
 *                    with no prices must not grow any).
 *   expectDate       substring that should survive extraction.
 *
 * Usage:
 *   npm run eval:vision                # against http://localhost:3000
 *   BASE_URL=... node scripts/eval-vision.mjs
 *   node scripts/eval-vision.mjs --only allens-scan-p1
 *
 * Manual gate, not CI (it spends real Claude vision calls). House rule
 * (Day 1, extended by A10): model or prompt changes to the extractor
 * require a before/after run of this harness in the PR body.
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const FIXTURE_DIR = path.join(process.cwd(), "test", "evals", "vision");
const ONLY = process.argv.includes("--only")
  ? process.argv[process.argv.indexOf("--only") + 1]
  : null;
const REQUEST_TIMEOUT_MS = 120_000;

function dollars(text) {
  // Every $-amount in the output, commas stripped ("$2,975" → "2975").
  return [...text.matchAll(/\$\s?([\d,]+(?:\.\d{2})?)/g)].map((m) =>
    m[1].replace(/,/g, "").replace(/\.00$/, ""),
  );
}

async function loadFixtures() {
  const names = (await readdir(FIXTURE_DIR))
    .filter((f) => f.endsWith(".jpeg") || f.endsWith(".png"))
    .map((f) => f.replace(/\.(jpeg|png)$/, ""))
    .filter((n) => !ONLY || n === ONLY)
    .sort();
  const out = [];
  for (const name of names) {
    const ext = (await readdir(FIXTURE_DIR)).find((f) =>
      f.startsWith(name + "."),
    );
    const imgPath = path.join(
      FIXTURE_DIR,
      ext.endsWith(".png") ? `${name}.png` : `${name}.jpeg`,
    );
    const image = (await readFile(imgPath)).toString("base64");
    const mediaType = imgPath.endsWith(".png") ? "image/png" : "image/jpeg";
    const expected = JSON.parse(
      await readFile(path.join(FIXTURE_DIR, `${name}.expected.json`), "utf8"),
    );
    out.push({ name, image, mediaType, expected });
  }
  return out;
}

async function extract(fixture) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE_URL}/api/extract-price-list-image`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        image: fixture.image,
        mediaType: fixture.mediaType,
        evalRun: true,
      }),
      signal: controller.signal,
    });
    const json = await res.json().catch(() => ({}));
    return { status: res.status, text: typeof json.text === "string" ? json.text : "", error: json.error };
  } finally {
    clearTimeout(timer);
  }
}

function score(name, text, exp) {
  const lines = text.split("\n");
  const misses = [];
  let found = 0;
  for (const mf of exp.mustFind ?? []) {
    const nameRe = new RegExp(mf.nameHint, "i");
    const priceRe = new RegExp(mf.price);
    const hit = lines.some((l) => nameRe.test(l) && priceRe.test(l));
    if (hit) found++;
    else misses.push(`line: ${mf.nameHint} @ ${mf.price}`);
  }
  const outDollars = new Set(dollars(text));
  let pricesFound = 0;
  for (const p of exp.mustFindPrices ?? []) {
    if (outDollars.has(p)) pricesFound++;
    else misses.push(`price: $${p}`);
  }
  let rangesOk = 0;
  for (const rc of exp.rangeChecks ?? []) {
    const nameRe = new RegExp(rc.nameHint, "i");
    const lowRe = new RegExp(rc.low);
    const highRe = new RegExp(rc.high);
    const hit = lines.some((l) => {
      const flat = l.replace(/,/g, "");
      return nameRe.test(l) && lowRe.test(flat) && highRe.test(flat);
    });
    if (hit) rangesOk++;
    else misses.push(`range: ${rc.nameHint} ${rc.low}–${rc.high}`);
  }
  let hallucination = null;
  if (typeof exp.maxDollarAmounts === "number") {
    const n = dollars(text).length;
    hallucination = n > exp.maxDollarAmounts ? n : 0;
    if (hallucination) misses.push(`hallucination: ${n} dollar amounts on a ${exp.maxDollarAmounts}-price page`);
  }
  const dateOk = exp.expectDate ? text.includes(exp.expectDate) : null;
  if (dateOk === false && !exp.dateInfoOnly)
    misses.push(`date: "${exp.expectDate}" missing`);
  return {
    name,
    found,
    expected: (exp.mustFind ?? []).length,
    pricesFound,
    pricesExpected: (exp.mustFindPrices ?? []).length,
    rangesOk,
    rangesExpected: (exp.rangeChecks ?? []).length,
    hallucination,
    dateOk,
    misses,
    chars: text.length,
  };
}

const fixtures = await loadFixtures();
if (!fixtures.length) {
  console.error("no fixtures found");
  process.exit(2);
}
console.log(`eval:vision — ${fixtures.length} fixture(s) against ${BASE_URL}\n`);
let failed = 0;
const rows = [];
for (const f of fixtures) {
  const res = await extract(f);
  if (res.status !== 200) {
    if (f.expected.expectNoExtraction && res.status === 422) {
      console.log(`✓ ${f.name}: 422 no-extraction (correct — nothing priced on this page, no hallucination)`);
      rows.push({ name: f.name, misses: [] });
      continue;
    }
    console.error(`✗ ${f.name}: HTTP ${res.status} ${res.error ?? ""}`);
    failed++;
    continue;
  }
  const s = score(f.name, res.text, f.expected);
  rows.push(s);
  const ok = s.misses.length === 0;
  if (!ok) failed++;
  console.log(
    `${ok ? "✓" : "✗"} ${s.name}: lines ${s.found}/${s.expected} · prices ${s.pricesFound}/${s.pricesExpected}` +
      (s.rangesExpected ? ` · ranges ${s.rangesOk}/${s.rangesExpected}` : "") +
      (s.hallucination !== null ? ` · hallucinated $ ${s.hallucination}` : "") +
      (s.dateOk !== null ? ` · date ${s.dateOk ? "✓" : "✗"}` : "") +
      ` · ${s.chars}c`,
  );
  for (const m of s.misses) console.log(`    MISS ${m}`);
}
console.log(`\n${fixtures.length - failed}/${fixtures.length} fixtures clean`);
process.exit(failed ? 1 : 0);
