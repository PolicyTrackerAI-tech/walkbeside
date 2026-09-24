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
});
