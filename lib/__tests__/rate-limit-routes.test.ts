import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { RATE_LIMITS } from "@/lib/rate-limit";

/**
 * A10 meta-tests, generated from source — no hand-maintained lists.
 */

describe("RATE_LIMITS keys map to real routes", () => {
  // The proxy looks rules up by pathname; a key pointing at a moved/deleted
  // route silently rate-limits NOTHING. Generated from RATE_LIMITS itself,
  // so adding a rule without a route (or moving a route out from under its
  // rule) fails here.
  it("every rate-limited path has a route.ts", () => {
    const missing = Object.keys(RATE_LIMITS).filter(
      (p) => !existsSync(join(process.cwd(), "app", p, "route.ts")),
    );
    expect(missing).toEqual([]);
  });
});

describe("smoke-check mirrors the real directory gate", () => {
  // scripts/smoke-check.mjs runs under plain node and cannot import the TS
  // directory module, so it re-states the contactable-homes filter. This pin
  // holds the two in sync: lib/negotiation/directory.ts's chain is asserted
  // by directory.test.ts; the script's copy is asserted here. If the gate
  // ever changes shape, both tests name both sites.
  it("the script carries all three gate filters verbatim", () => {
    const src = readFileSync(
      join(process.cwd(), "scripts", "smoke-check.mjs"),
      "utf8",
    );
    expect(src).toContain('.eq("active", true)');
    expect(src).toContain('.eq("vetted", true)');
    expect(src).toContain('.not("email", "is", null)');
  });
});
