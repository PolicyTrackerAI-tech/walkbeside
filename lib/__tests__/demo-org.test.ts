import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DEMO_ORG_MARKER } from "../demo-org";

/**
 * scripts/seed-demo.mjs keeps its own copy of the marker (plain-node script,
 * can't import TS). If either copy drifts, demo orgs stop being excludable
 * from real aggregates — silently. This pin makes that drift loud.
 */
describe("DEMO_ORG_MARKER", () => {
  it("matches the literal seed-demo.mjs writes", () => {
    const script = readFileSync(
      join(process.cwd(), "scripts", "seed-demo.mjs"),
      "utf8",
    );
    expect(script).toContain(`"${DEMO_ORG_MARKER}"`);
  });
});
