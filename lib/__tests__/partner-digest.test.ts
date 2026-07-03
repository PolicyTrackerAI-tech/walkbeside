import { describe, it, expect } from "vitest";
import { buildPartnerDigest, shouldSendDigest } from "@/lib/partner-digest";
import { aggregateCohort, SMALL_SAMPLE_THRESHOLD } from "@/lib/partner-report";

const base = {
  partnerName: "Canyon Home Hospice",
  periodLabel: "June 2026",
  reportUrl: "https://honestfuneral.co/partner/r/abc",
};

describe("shouldSendDigest", () => {
  it("skips partners with zero activity — a zero digest is noise", () => {
    expect(
      shouldSendDigest({ ...base, familiesStartedInPeriod: 0, cohort: aggregateCohort([]) }),
    ).toBe(false);
    expect(
      shouldSendDigest({ ...base, familiesStartedInPeriod: 1, cohort: aggregateCohort([]) }),
    ).toBe(true);
  });
});

describe("buildPartnerDigest", () => {
  it("suppresses dollar/satisfaction under the small-sample gate and says why", () => {
    const cohort = aggregateCohort(
      Array.from({ length: SMALL_SAMPLE_THRESHOLD - 1 }, () => ({
        overchargeCaughtCents: 100_000,
        ftcIssues: 1,
        satisfaction: 5,
      })),
    );
    const { text } = buildPartnerDigest({ ...base, familiesStartedInPeriod: 2, cohort });
    expect(text).not.toMatch(/\$\d/);
    expect(text).toContain("stays suppressed");
  });

  it("reports aggregate totals once the sample is sufficient — and only aggregates", () => {
    const cohort = aggregateCohort(
      Array.from({ length: SMALL_SAMPLE_THRESHOLD }, () => ({
        overchargeCaughtCents: 100_000,
        ftcIssues: 1,
        satisfaction: 4,
      })),
    );
    const { subject, text } = buildPartnerDigest({ ...base, familiesStartedInPeriod: 3, cohort });
    expect(subject).toContain("June 2026");
    expect(text).toContain("$5,000 in overcharges caught across the cohort");
    expect(text).toContain("4/5 average family satisfaction");
    expect(text).toContain("never shared");
    // No per-family or per-home leakage vocabulary, ever.
    expect(text.toLowerCase()).not.toMatch(/funeral home:|family name|chose |selected /);
  });
});
