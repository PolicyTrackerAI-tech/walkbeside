import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * The single-send-path architecture tripwire (audit A10-02; A1-C2 made this
 * guarantee by convention only).
 *
 * CLAUDE.md's law says every funeral-home-directed email routes through the
 * kill switch. In code there are exactly THREE home-directed send sites, each
 * carrying its own OUTREACH_LIVE gate + denylist re-check. Nothing structural
 * stopped a fourth site from forgetting both — until this test:
 *
 *  1. The complete set of files that call sendEmail( is pinned. A new call
 *     site anywhere fails CI until it is deliberately added below with its
 *     recipient class named.
 *  2. Every HOME-directed site must contain both `OUTREACH_LIVE` and
 *     `isEmailDenylisted` in-source.
 *
 * Adding a send site: decide who the recipient is. Family- or institution-
 * directed → add to FAMILY_OR_INSTITUTION_SITES. Funeral-home-directed →
 * think hard (the law prefers routing through send.ts), then add to
 * HOME_DIRECTED_SITES — the gate assertions will hold you to the kill switch.
 */

const HOME_DIRECTED_SITES = [
  "lib/negotiation/send.ts",
  "lib/negotiation/notify-chosen-home.ts",
  "app/api/negotiate/[id]/messages/route.ts",
];

const FAMILY_OR_INSTITUTION_SITES = [
  // definition
  "lib/email.ts",
  // family-directed
  "lib/negotiation/notify-family-of-reply.ts",
  "app/api/family/digest/route.ts",
  "app/api/cron/anniversary/route.ts",
  "app/api/cron/nurture-emails/route.ts",
  "app/api/cron/quote-notifications/route.ts",
  "app/api/planning/signup/route.ts",
  // institution-directed (partner org staff / founder)
  "app/api/admin/partners/route.ts",
  "app/api/cron/partner-digest/route.ts",
  "app/api/partner/apply/route.ts",
  "app/api/partner/claim/route.ts",
  "app/api/partner/demo-request/route.ts",
  "app/api/partner/nominate/route.ts",
  "app/api/portal/team/route.ts",
];

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next" || name.startsWith(".")) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name)) out.push(p);
  }
  return out;
}

const root = process.cwd();
const sources = [...walk(join(root, "app")), ...walk(join(root, "lib"))];
const callSites = sources
  .filter((p) => readFileSync(p, "utf8").includes("sendEmail("))
  .map((p) => relative(root, p))
  .sort();

describe("send-path architecture", () => {
  it("the set of sendEmail call sites is exactly the pinned allowlist", () => {
    expect(callSites).toEqual(
      [...HOME_DIRECTED_SITES, ...FAMILY_OR_INSTITUTION_SITES].sort(),
    );
  });

  it("every home-directed site carries the kill switch AND the denylist re-check", () => {
    for (const site of HOME_DIRECTED_SITES) {
      const src = readFileSync(join(root, site), "utf8");
      expect(src, `${site} lost its OUTREACH_LIVE gate`).toContain(
        "OUTREACH_LIVE",
      );
      expect(src, `${site} lost its denylist re-check`).toContain(
        "isEmailDenylisted",
      );
    }
  });

  it("no family/institution site quietly grew home-directed gating (a sign its recipient class changed)", () => {
    // If one of these starts referencing the outreach kill switch, its
    // recipient class likely changed — reclassify it deliberately instead of
    // letting the categories blur.
    for (const site of FAMILY_OR_INSTITUTION_SITES) {
      if (site === "lib/email.ts") continue; // definition file documents the switch
      const src = readFileSync(join(root, site), "utf8");
      expect(
        src.includes('process.env.OUTREACH_LIVE === "true"'),
        `${site} now gates on OUTREACH_LIVE — reclassify it in this test`,
      ).toBe(false);
    }
  });
});
