import { describe, it, expect } from "vitest";
import {
  fallbackOutcomesDigest,
  smallSampleDigest,
} from "@/lib/partner-report-digest";
import { partnerOutcomesDigestSystem } from "@/lib/negotiation/prompts";
import { SMALL_SAMPLE_THRESHOLD, type CohortStatsFull } from "@/lib/partner-report";

const FULL_STATS: CohortStatsFull = {
  familiesHelped: 14,
  smallSample: false,
  familiesWhoSaved: 13,
  totalOverchargeCaughtCents: 2_417_500,
  avgOverchargeCaughtCents: 172_679,
  ftcIssuesFlagged: 17,
  avgSatisfaction: 4.7,
  medianResolutionDays: 4,
  toolEngagement: { checkerPct: 50, certTrackerPct: 30, obituaryPct: 20 },
  pilotMetrics: {
    medianSavedVsMetroCents: null,
    avgQuotesPerFamily: null,
    totalBenefitDollarsCents: null,
    satisfactionPromoterPct: null,
    bereavementRemindedPct: 0,
  },
};

describe("fallbackOutcomesDigest", () => {
  it("leads with families helped, families who saved, and total/avg overcharge", () => {
    const out = fallbackOutcomesDigest("Test Hospice", FULL_STATS);
    expect(out).toContain("14 families referred through Test Hospice");
    expect(out).toContain("13 of them caught an overcharge");
    expect(out).toContain("$24,175 total");
    expect(out).toContain("$1,727 on average");
  });

  it("mentions FTC issues only when > 0, with correct singular/plural", () => {
    const withIssues = fallbackOutcomesDigest("Test Hospice", FULL_STATS);
    expect(withIssues).toContain("17 likely FTC Funeral Rule issues were flagged");

    const noIssues = fallbackOutcomesDigest("Test Hospice", {
      ...FULL_STATS,
      ftcIssuesFlagged: 0,
    });
    expect(noIssues).not.toContain("FTC Funeral Rule");

    const oneIssue = fallbackOutcomesDigest("Test Hospice", {
      ...FULL_STATS,
      ftcIssuesFlagged: 1,
    });
    expect(oneIssue).toContain("1 likely FTC Funeral Rule issue was flagged");
  });

  it("mentions satisfaction and resolution time only when non-null", () => {
    const withBoth = fallbackOutcomesDigest("Test Hospice", FULL_STATS);
    expect(withBoth).toContain("4.7 of 5");
    expect(withBoth).toContain("4 days");

    const withNeither = fallbackOutcomesDigest("Test Hospice", {
      ...FULL_STATS,
      avgSatisfaction: null,
      medianResolutionDays: null,
    });
    expect(withNeither).not.toContain("rated their experience");
    expect(withNeither).not.toContain("time to resolution");
  });

  it("never invents a number outside the given stats", () => {
    const zeroed: CohortStatsFull = {
      ...FULL_STATS,
      familiesHelped: 0,
      familiesWhoSaved: 0,
      totalOverchargeCaughtCents: 0,
      avgOverchargeCaughtCents: 0,
      ftcIssuesFlagged: 0,
      avgSatisfaction: null,
      medianResolutionDays: null,
    };
    const out = fallbackOutcomesDigest("Test Hospice", zeroed);
    expect(out).toBe(
      "0 families referred through Test Hospice completed cases, and 0 of them caught an overcharge — $0 total, $0 on average.",
    );
  });
});

describe("smallSampleDigest", () => {
  it("returns a static line referencing the suppression threshold, no Claude call", () => {
    const out = smallSampleDigest();
    expect(out).toContain(String(SMALL_SAMPLE_THRESHOLD));
    expect(out.toLowerCase()).toContain("privacy");
  });
});

describe("employer variant", () => {
  it("fallback wording is byte-identical for both audiences — deliberately neutral", () => {
    expect(fallbackOutcomesDigest("Acme Manufacturing", FULL_STATS, "employer")).toBe(
      fallbackOutcomesDigest("Acme Manufacturing", FULL_STATS),
    );
    expect(fallbackOutcomesDigest("Acme Manufacturing", FULL_STATS, "hospice")).toBe(
      fallbackOutcomesDigest("Acme Manufacturing", FULL_STATS),
    );
  });

  it("system prompt swaps the reader line for an HR/benefits leader", () => {
    const hospice = partnerOutcomesDigestSystem();
    const employer = partnerOutcomesDigestSystem("employer");
    expect(hospice).toContain("hospice coordinator or executive director");
    expect(employer).toContain("HR or benefits leader");
    expect(employer).toContain("benefits review");
    expect(employer).not.toContain("hospice coordinator or executive director");
    // Defaulting matches the explicit hospice arg — no third variant.
    expect(partnerOutcomesDigestSystem("hospice")).toBe(hospice);
  });

  it("adds the employer-only Medicare/clinical rule and keeps the CMS/CAHPS guard for both", () => {
    const hospice = partnerOutcomesDigestSystem();
    const employer = partnerOutcomesDigestSystem("employer");
    expect(employer).toContain(
      "Never mention Medicare, hospices, or clinical compliance — this reader runs a workplace benefit.",
    );
    expect(hospice).not.toContain("workplace benefit");
    expect(hospice).toContain("Never mention CMS, CAHPS, or imply regulatory endorsement.");
    expect(employer).toContain("Never mention CMS, CAHPS, or imply regulatory endorsement.");
  });
});
