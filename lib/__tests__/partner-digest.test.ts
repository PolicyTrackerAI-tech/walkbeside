import { describe, it, expect } from "vitest";
import { buildPartnerDigest, shouldSendDigest } from "@/lib/partner-digest";
import { aggregateCohort, SMALL_SAMPLE_THRESHOLD } from "@/lib/partner-report";
import { smallSampleDigest } from "@/lib/partner-report-digest";

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

  describe("employer variant", () => {
    const employerBase = {
      partnerName: "Acme Manufacturing",
      periodLabel: "June 2026",
      reportUrl: "https://honestfuneral.co/partner/r/xyz",
    };
    const cohort = aggregateCohort(
      Array.from({ length: SMALL_SAMPLE_THRESHOLD }, () => ({
        overchargeCaughtCents: 100_000,
        ftcIssues: 1,
        satisfaction: 4,
      })),
    );

    it("produces byte-identical output for both audiences — the body is deliberately neutral", () => {
      const employer = buildPartnerDigest({
        ...employerBase,
        partnerType: "employer",
        familiesStartedInPeriod: 3,
        cohort,
      });
      const hospice = buildPartnerDigest({
        ...employerBase,
        partnerType: "hospice",
        familiesStartedInPeriod: 3,
        cohort,
      });
      expect(employer).toEqual(hospice);
    });

    it("never carries clinical/regulatory vocabulary to an employer reader", () => {
      const { subject, text } = buildPartnerDigest({
        ...employerBase,
        partnerType: "employer",
        familiesStartedInPeriod: 3,
        cohort,
        // The AI paragraph reaches this body too — exercise the ban through it,
        // not just through the deterministic lines.
        outcomesDigest:
          "5 families referred through Acme Manufacturing completed cases, and 5 of them caught an overcharge — $5,000 total, $1,000 on average.",
      });
      const all = `${subject}\n${text}`.toLowerCase();
      for (const banned of [
        "medicare",
        "cahps",
        "cms",
        "42 cfr",
        "hospice",
        "snf",
        "bereavement mandate",
        "admission",
      ]) {
        expect(all).not.toContain(banned);
      }
    });
  });

  describe("the outcomes paragraph", () => {
    const fullCohort = aggregateCohort(
      Array.from({ length: SMALL_SAMPLE_THRESHOLD }, () => ({
        overchargeCaughtCents: 100_000,
        ftcIssues: 1,
        satisfaction: 4,
      })),
    );
    const smallCohort = aggregateCohort(
      Array.from({ length: SMALL_SAMPLE_THRESHOLD - 2 }, () => ({
        overchargeCaughtCents: 100_000,
        ftcIssues: 1,
        satisfaction: 5,
      })),
    );

    it("prints bare as its own paragraph, with no lead-in label", () => {
      const digest =
        "Five families referred through Canyon Home Hospice completed cases.";
      const { text } = buildPartnerDigest({
        ...base,
        familiesStartedInPeriod: 4,
        cohort: fullCohort,
        outcomesDigest: digest,
      });
      // Exactly one blank line above it, exactly one below (the tail block
      // opens with its own empty entry).
      expect(text).toContain(`\n\n${digest}\n\nThe full picture`);
      expect(text).not.toMatch(/In plain (words|English)|The short version|Summary:/);
    });

    it("omits the paragraph entirely when absent or whitespace-only", () => {
      const withoutField = buildPartnerDigest({
        ...base,
        familiesStartedInPeriod: 4,
        cohort: fullCohort,
      }).text;
      const whitespaceOnly = buildPartnerDigest({
        ...base,
        familiesStartedInPeriod: 4,
        cohort: fullCohort,
        outcomesDigest: "   \n  ",
      }).text;
      // No stray blank line from a whitespace-only value.
      expect(whitespaceOnly).toBe(withoutField);
      expect(withoutField).toMatch(/satisfaction\n\nThe full picture/);
    });

    it("carries no dollar figures through for a small-sample cohort", () => {
      const { text } = buildPartnerDigest({
        ...base,
        familiesStartedInPeriod: 2,
        cohort: smallCohort,
        outcomesDigest: smallSampleDigest(),
      });
      expect(text).toContain("stays suppressed");
      expect(text).toContain("so no single family is identifiable");
      expect(text).toContain("we'll summarize outcomes here");
      expect(text).not.toMatch(/\$\d/);
    });
  });
});
