import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { homeUpdatePatch } from "../lib/home-update-patch.mjs";

const NOW = new Date("2026-09-24T00:00:00.000Z");

describe("homeUpdatePatch (re-importing an existing funeral home)", () => {
  it("a blank email, phone or note in the file never overwrites the database", () => {
    const patch = homeUpdatePatch(
      { name: "Stewart Funeral Home", email: null, phone: "(202) 399-3600", address: null, notes: "", zip: "20019" },
      NOW,
    );
    expect(patch).toEqual({
      name: "Stewart Funeral Home",
      phone: "(202) 399-3600",
      zip: "20019",
      updated_at: NOW.toISOString(),
    });
    expect(patch).not.toHaveProperty("email");
    expect(patch).not.toHaveProperty("address");
    expect(patch).not.toHaveProperty("notes");
  });

  it("never re-activates a home (a bounced or complained home stays off) and never touches vetting", () => {
    const patch = homeUpdatePatch(
      { name: "X", zip: "20001", active: true, vetted: true, vetted_at: "2026-01-01", vetted_by: "a@b.c" },
      NOW,
    );
    for (const k of ["active", "vetted", "vetted_at", "vetted_by"]) expect(patch).not.toHaveProperty(k);
  });

  it("a value the file does know still updates", () => {
    expect(homeUpdatePatch({ name: "X", zip: "20001", email: "office@x.com" }, NOW).email).toBe("office@x.com");
  });

  it("the importer uses it for every update", () => {
    const src = readFileSync(join(process.cwd(), "scripts/import-funeral-homes.mjs"), "utf8");
    expect(src).toMatch(/const patch = homeUpdatePatch\(row\);/);
    expect(src).not.toMatch(/\{\s*\.\.\.row,\s*updated_at/);
  });
});
