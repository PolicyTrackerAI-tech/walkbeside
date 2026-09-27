import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  familyHeldPreDeath,
  homeHeldPreDeath,
  isPreDeath,
  PRE_DEATH_HOLD_STATUS,
  PRE_DEATH_OUTREACH_BLOCKED_STATES,
} from "@/lib/negotiation/pre-death-gate";

describe("isPreDeath", () => {
  it("no date of passing → before a death (the field is optional, so skipping it holds)", () => {
    expect(isPreDeath({ timing: "today" })).toBe(true);
    expect(isPreDeath({ dateOfDeath: "", timing: "this-week" })).toBe(true);
    expect(isPreDeath({ dateOfDeath: null })).toBe(true);
  });

  it("planning ahead → before a death, even with a date", () => {
    expect(isPreDeath({ dateOfDeath: "2026-09-01", timing: "planning-ahead" })).toBe(true);
  });

  it("a date of passing with an at-need timing → after a death", () => {
    expect(isPreDeath({ dateOfDeath: "2026-09-20", timing: "today" })).toBe(false);
    expect(isPreDeath({ dateOfDeath: "2026-09-20", timing: "not-sure" })).toBe(false);
  });
});

describe("familyHeldPreDeath", () => {
  it("holds a Virginia family before a death, across every DC-metro Virginia zip3", () => {
    for (const zip of ["20190", "22030", "22101", "22201", "22314"]) {
      expect(familyHeldPreDeath(zip, true)).toBe(true);
    }
    // And outside the metro (Richmond).
    expect(familyHeldPreDeath("23219", true)).toBe(true);
  });

  it("never holds a Virginia family after a death", () => {
    expect(familyHeldPreDeath("22201", false)).toBe(false);
  });

  it("never holds a DC or Maryland family (their Virginia homes are filtered instead)", () => {
    expect(familyHeldPreDeath("20011", true)).toBe(false);
    expect(familyHeldPreDeath("20910", true)).toBe(false);
  });
});

describe("homeHeldPreDeath", () => {
  it("holds a Virginia home by recorded state or by zip, and either one is enough", () => {
    expect(homeHeldPreDeath({ state: "VA", zip: "22201" })).toBe(true);
    expect(homeHeldPreDeath({ state: "va ", zip: null })).toBe(true);
    expect(homeHeldPreDeath({ state: "DC", zip: "22201" })).toBe(true);
    expect(homeHeldPreDeath({ state: null, zip: "22314" })).toBe(true);
  });

  it("holds a home whose state can't be told at all", () => {
    expect(homeHeldPreDeath({})).toBe(true);
    expect(homeHeldPreDeath({ state: "", zip: "" })).toBe(true);
  });

  it("lets DC and Maryland homes through", () => {
    expect(homeHeldPreDeath({ state: "DC", zip: "20011" })).toBe(false);
    expect(homeHeldPreDeath({ state: "MD", zip: "20814" })).toBe(false);
    expect(homeHeldPreDeath({ state: null, zip: "20743" })).toBe(false);
  });

  it("Virginia is the only held state until counsel clears it", () => {
    expect(PRE_DEATH_OUTREACH_BLOCKED_STATES).toEqual(["VA"]);
  });
});

/**
 * Structural tripwire: the gate only works if the one intake route and the
 * one re-run route both call it. Deleting either call must fail CI, not
 * pass silently.
 */
describe("the gate is wired into every path that makes outreach sendable", () => {
  const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

  it("the intake route holds a Virginia family and passes preDeath to the directory", () => {
    const src = read("app/api/negotiate/start/route.ts");
    expect(src).toMatch(/familyHeldPreDeath\(ctx\.zip, preDeath\)/);
    expect(src).toMatch(/PRE_DEATH_HOLD_STATUS/);
    expect(src).toMatch(/findHomesFromDirectory\([\s\S]*?preDeath,?\s*\}\)/);
  });

  it("the admin re-run route checks both the family and each home", () => {
    const src = read("app/api/admin/negotiations/rerun/route.ts");
    expect(src).toMatch(/familyHeldPreDeath\(/);
    expect(src).toMatch(/homeHeldPreDeath\(/);
  });

  it("the family status page handles the hold status by name", () => {
    const src = read("app/negotiate/[id]/status/page.tsx");
    expect(src).toContain(`"${PRE_DEATH_HOLD_STATUS}"`);
  });
});
