import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { marketForZip } from "@/lib/service-markets";

/** Minimal RFC-4180 reader (quoted fields, "" escapes) for the seed file. */
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [head, ...body] = rows;
  return body.filter((r) => r.length > 1).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ""])));
}

describe("supabase/seed/dmv-homes.draft.csv", () => {
  const rows = parseCsv(readFileSync(join(process.cwd(), "supabase/seed/dmv-homes.draft.csv"), "utf8"));

  it("has the importer's columns and rows", () => {
    expect(rows.length).toBeGreaterThanOrEqual(100);
    expect(Object.keys(rows[0])).toEqual([
      "name", "email", "phone", "address", "city", "state", "zip",
      "google_rating", "google_review_count", "notes",
    ]);
  });

  it("every home is inside the DC-metro service market (DC, MD, VA only)", () => {
    const outside = rows.filter((r) => marketForZip(r.zip)?.id !== "dmv" || !["DC", "MD", "VA"].includes(r.state));
    expect(outside.map((r) => `${r.name} ${r.state} ${r.zip}`)).toEqual([]);
  });

  it("no home appears twice (the importer's name + zip key)", () => {
    const keys = rows.map((r) => `${r.name.toLowerCase()}|${r.zip}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("no row carries an email: a home is contactable only after an email is confirmed in vetting", () => {
    expect(rows.filter((r) => r.email.trim()).map((r) => r.name)).toEqual([]);
  });

  it("every row says it is an unverified lead", () => {
    expect(rows.filter((r) => !/UNVERIFIED/.test(r.notes)).map((r) => r.name)).toEqual([]);
  });

  it("every row that shares a street address with another says so in its notes", () => {
    // Two names at one address are often one licensed establishment (a
    // rebrand, a cremation brand, a successor). Vetting must see it on both
    // rows, never on just one.
    const addressKey = (r: Record<string, string>) =>
      `${r.address
        .toLowerCase()
        .replace(/\bstreet\b/g, "st")
        .replace(/\broad\b/g, "rd")
        .replace(/\bavenue\b/g, "ave")
        .replace(/[^a-z0-9 ]/g, "")
        .replace(/\s+(?:ste|suite)\s*\S+$/, "")
        .trim()}|${r.zip}`;
    const byAddress = new Map<string, Array<Record<string, string>>>();
    for (const r of rows.filter((r) => r.address)) {
      byAddress.set(addressKey(r), [...(byAddress.get(addressKey(r)) ?? []), r]);
    }
    const said = /same (?:street )?address|same building|lists the same|address shared|give the same address/i;
    const silent = [...byAddress.values()]
      .filter((group) => group.length > 1)
      .flat()
      .filter((r) => !said.test(r.notes))
      .map((r) => r.name);
    expect(silent).toEqual([]);
  });
});

describe("supabase/seed/dmv-tracker.csv stays in step with the roster and the reviewed price lists", () => {
  const read = (p: string) => parseCsv(readFileSync(join(process.cwd(), p), "utf8"));
  const roster = read("supabase/seed/dmv-homes.draft.csv");
  const tracker = read("supabase/seed/dmv-tracker.csv");
  const key = (r: Record<string, string>) => `${r.name.toLowerCase()}|${r.zip}`;

  it("has exactly one row per roster home", () => {
    expect(tracker.map(key).sort()).toEqual(roster.map(key).sort());
  });

  it("uses only known statuses, and each row's area is its zip's benchmark area", async () => {
    // The area the pipeline groups by: the zip-regions label, or its pool
    // once pooling is on (docs/data/BENCHMARK_AREA_POOLING_DECISION.md).
    const { benchmarkAreaForZip } = await import("@/lib/benchmark-areas");
    const statuses = new Set(["reviewed", "held_stale", "link_found", "site_check", "no_site_known", "requested", "none_available"]);
    for (const r of tracker) {
      expect(statuses.has(r.gpl_status), `${r.name}: ${r.gpl_status}`).toBe(true);
      expect(r.benchmark_area, r.name).toBe(benchmarkAreaForZip(r.zip));
    }
  });

  it("every reviewed price list in supabase/seed/gpl is marked reviewed (or held_stale, when the loader holds it) for its home", async () => {
    const { heldReason } = await import("../lib/gpl-batch.mjs");
    const { readdirSync, statSync } = await import("node:fs");
    const files: string[] = [];
    const walk = (d: string) => {
      for (const n of readdirSync(d)) {
        const p = join(d, n);
        if (statSync(p).isDirectory()) walk(p);
        else if (n.endsWith(".json")) files.push(p);
      }
    };
    walk(join(process.cwd(), "supabase/seed/gpl"));
    const byKey = new Map(tracker.map((r) => [key(r), r]));
    for (const f of files) {
      const rec = JSON.parse(readFileSync(f, "utf8"));
      const row = byKey.get(`${rec.homeName.toLowerCase()}|${rec.zip}`);
      expect(row, `${rec.homeName} has no tracker row`).toBeDefined();
      expect(row?.gpl_status, rec.homeName).toBe(heldReason(rec) ? "held_stale" : "reviewed");
      expect(row?.gpl_effective).toBe(rec.effectiveDate);
    }
  });
});
