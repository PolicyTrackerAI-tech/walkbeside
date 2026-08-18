import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Payment-blindness firewall for the hospice directory
 * (docs/HOSPICE_DIRECTORY_FIREWALL.md — the supply-side sibling of
 * docs/ANTI_STEERING_EVIDENCE.md).
 *
 * Hospice care is federally payable, so a hospice that pays us (or claims
 * its page) receiving ANY preferential ranking, badging, ordering, or
 * placement in a surface a family could use to choose a hospice is
 * Anti-Kickback exposure for the platform itself. The directory is
 * payment-blind by construction; this gate pins the construction. A failure
 * here is a counsel-grade design change — re-read the firewall doc before
 * touching an allowlist, and never widen one to make a build pass.
 */

const ROOT = process.cwd();
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");

/** Product-code scan roots. scripts/ is founder tooling, not a family surface. */
const SCAN_ROOTS = ["app", "lib", "components"];

/** The ONLY product-code modules allowed to query public.hospices. */
const QUERY_MODULES = [
  "app/api/hospices/search/route.ts",
  "lib/hospice-directory.ts",
];

/** Every family-facing file that renders hospices (or lives on those pages). */
const RENDER_SURFACES = [
  "app/hospices/[state]/[ccn]/ClaimPanel.tsx",
  "app/hospices/[state]/[ccn]/page.tsx",
  "app/hospices/[state]/page.tsx",
  "app/hospices/page.tsx",
  "components/HospiceFinder.tsx",
];

/** The three directory page templates that carry the no-pay pledge in copy. */
const PLEDGE_PAGES = [
  "app/hospices/page.tsx",
  "app/hospices/[state]/page.tsx",
  "app/hospices/[state]/[ccn]/page.tsx",
];

/** The CMS reference columns — the complete vocabulary the query layer may read. */
const CMS_COLUMNS = new Set([
  "ccn",
  "name",
  "city",
  "state",
  "zip",
  "ownership",
]);

/** Mechanical partner/billing markers that must never appear in a query module. */
const QUERY_MODULE_BANNED = [
  'from("partner', // any partner-table read
  "partner_id",
  "partner_code",
  "partners (", // embedded PostgREST join, e.g. select("x, partners ( name )")
  "partners(",
  "!inner", // PostgREST join modifier
  "stripe",
];

function walk(relDir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(join(ROOT, relDir), {
    withFileTypes: true,
  })) {
    const rel = `${relDir}/${entry.name}`;
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "__tests__") continue;
      out.push(...walk(rel));
    } else if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)) {
      out.push(rel);
    }
  }
  return out;
}

describe("hospice query inventory", () => {
  it("only the two audited modules query public.hospices", () => {
    const hits = SCAN_ROOTS.flatMap(walk).filter((f) =>
      read(f).includes('.from("hospices")'),
    );
    expect(hits.sort()).toEqual([...QUERY_MODULES].sort());
  });

  it("the render-surface inventory covers every file under app/hospices", () => {
    const expected = RENDER_SURFACES.filter((f) =>
      f.startsWith("app/hospices/"),
    );
    expect(walk("app/hospices").sort()).toEqual(expected.sort());
  });
});

describe.each(QUERY_MODULES)("query module %s", (mod) => {
  const src = read(mod);

  it("selects only CMS reference columns", () => {
    const lists = [
      ...src.matchAll(/\.select\(\s*"([^"]+)"\s*\)/g),
      ...src.matchAll(/const SELECT = "([^"]+)"/g),
    ].map((m) => m[1]);
    expect(lists.length).toBeGreaterThan(0);
    const badColumns = lists
      .flatMap((list) => list.split(",").map((c) => c.trim()))
      .filter((c) => !CMS_COLUMNS.has(c));
    expect(badColumns).toEqual([]);
    // Every .select() argument is the audited constant or a literal checked
    // above — no dynamically built column list can dodge the allowlist.
    const badArgs = [...src.matchAll(/\.select\(([^)]*)\)/g)]
      .map((m) => m[1].trim())
      .filter((arg) => arg !== "SELECT" && !/^"[^"]*"$/.test(arg));
    expect(badArgs).toEqual([]);
  });

  it("orders only by name/ccn (alphabetical + deterministic pagination tiebreak)", () => {
    const badOrders = [...src.matchAll(/\.order\(\s*"([^"]+)"/g)]
      .map((m) => m[1])
      .filter((col) => col !== "name" && col !== "ccn");
    expect(badOrders).toEqual([]);
  });

  it("is read-only and joins nothing", () => {
    expect(src).not.toMatch(/\.(insert|update|upsert|delete)\(/);
    const found = QUERY_MODULE_BANNED.filter((token) => src.includes(token));
    expect(found).toEqual([]);
  });
});

describe.each(RENDER_SURFACES)("render surface %s", (surface) => {
  const src = read(surface);

  it("does no database reads of its own (data arrives via lib/hospice-directory)", () => {
    // A table read is .from("...") with a string arg; Array.from(iterable)
    // stays legal.
    expect(src).not.toMatch(/\.from\(\s*["'`]/);
    expect(src).not.toContain("@supabase/supabase-js");
    expect(src).not.toContain("@/lib/supabase");
  });

  it("imports no partner or billing code", () => {
    expect(src).not.toContain("@/lib/partner");
    expect(src.toLowerCase()).not.toContain("stripe");
  });
});

describe("the written pledge", () => {
  it.each(PLEDGE_PAGES)("%s still says no hospice pays to appear", (page) => {
    expect(read(page)).toMatch(/pays to appear/);
  });

  it("the claim panel still says claiming changes nothing", () => {
    expect(read("app/hospices/[state]/[ccn]/ClaimPanel.tsx")).toMatch(
      /changes\s+nothing/i,
    );
  });
});

describe("the schema", () => {
  it("no schema/migration statement attaches partner/payment/rank vocabulary to hospices", () => {
    const migDir = "supabase/migrations";
    const files = [
      "supabase/schema.sql",
      ...readdirSync(join(ROOT, migDir))
        .filter((f) => f.endsWith(".sql"))
        .map((f) => `${migDir}/${f}`),
    ];
    const offenders: string[] = [];
    for (const file of files) {
      // Strip line comments so prose about the product can't false-positive;
      // what remains is executable DDL (including comment-on strings, which
      // ARE statements and stay in scope).
      const sql = read(file)
        .split("\n")
        .filter((line) => !line.trimStart().startsWith("--"))
        .join("\n");
      for (const stmt of sql.split(";")) {
        if (!/\bhospices\b/i.test(stmt)) continue;
        const hit = stmt.match(
          /\b(partner\w*|claim\w*|paid|payment\w*|billing|stripe|tier\w*|rank\w*|featured|sponsor\w*|preferred|badge\w*)\b/i,
        );
        if (hit) offenders.push(`${file}: "${hit[0]}"`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
