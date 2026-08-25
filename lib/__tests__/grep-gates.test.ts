import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * Grep gates promoted from session ritual to machine enforcement (audit
 * A10-01). Each of these was previously run by hand at session close; a
 * session that forgot the ritual could regress channel law silently.
 */

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next" || name.startsWith(".")) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}

const root = process.cwd();

describe("word-ban: the retired CAHPS pitch never returns to a live surface", () => {
  // Channel law (market research 2026-07): NEVER pitch CAHPS / star-rating /
  // Annual-Payment-Update repair to hospices — the framing that burned this
  // channel once (and that A5-01 removed from /partners). Scope:
  //  - comments are stripped first (naming the law in a comment is fine —
  //    comments don't render);
  //  - a line that explicitly DISCLAIMS the instrument ("not a CMS or CAHPS
  //    instrument…") is the opposite of the pitch and stays allowed;
  //  - everything else in app/ + components/ is banned outright.
  const BANNED = [/CAHPS/i, /Care Compare/i, /Annual Payment Update/i, /star rating/i];
  // "CAHPS instrument" is disclaimer phrasing ("…not a CMS or CAHPS
  // instrument…", possibly wrapped across JSX lines); the banned pitch talks
  // about CAHPS composites/scores/ratings, never "instrument".
  const DISCLAIMER_OK = /not an? (?:CMS or )?CAHPS|CAHPS instrument/i;

  function stripComments(src: string): string {
    return src
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");
  }

  it("no rendered app/ or components/ copy contains a banned pitch phrase", () => {
    const sources = [
      ...walk(join(root, "app")),
      ...walk(join(root, "components")),
    ].filter((p) => !/\.test\.tsx?$/.test(p) && !p.includes("__tests__"));
    const hits: string[] = [];
    for (const p of sources) {
      const lines = stripComments(readFileSync(p, "utf8")).split("\n");
      for (const [i, line] of lines.entries()) {
        for (const re of BANNED) {
          if (re.test(line) && !DISCLAIMER_OK.test(line)) {
            hits.push(`${relative(root, p)}:${i + 1} matches ${re}`);
          }
        }
      }
    }
    expect(hits).toEqual([]);
  });
});

describe("raw-table gate: regional_benchmarks is only read through the store", () => {
  // Guardrail #4 machinery (n>=5 re-check, catalog-id filter, price-text
  // scrub) lives in lib/benchmarks-store.ts read edges. Any new code path
  // querying the table directly bypasses all of it. Allowlist: the store
  // itself + the founder promote route (which re-computes n server-side).
  const ALLOWED = new Set([
    "lib/benchmarks-store.ts",
    "app/api/admin/benchmarks/promote/route.ts",
  ]);

  it('every from("regional_benchmarks") call site is allowlisted', () => {
    const sources = [
      ...walk(join(root, "app")),
      ...walk(join(root, "lib")),
      ...walk(join(root, "components")),
    ].filter((p) => !/\.test\.tsx?$/.test(p) && !p.includes("__tests__"));
    const sites = sources
      .filter((p) => readFileSync(p, "utf8").includes('from("regional_benchmarks")'))
      .map((p) => relative(root, p));
    const rogue = sites.filter((s) => !ALLOWED.has(s));
    expect(rogue).toEqual([]);
    // The allowlist itself must stay real — if the store moves, update BOTH.
    expect(sites.sort()).toEqual([...ALLOWED].sort());
  });
});
