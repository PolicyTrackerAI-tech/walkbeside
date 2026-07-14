import { describe, it, expect } from "vitest";
import { statsToCsv } from "@/lib/partner/stats-csv";
import { aggregateCohort, type CohortStatsFull } from "@/lib/partner-report";

const FULL_STATS: CohortStatsFull = {
  familiesHelped: 14,
  smallSample: false,
  familiesWhoSaved: 13,
  totalOverchargeCaughtCents: 2_417_500,
  avgOverchargeCaughtCents: 172_679,
  ftcIssuesFlagged: 17,
  avgSatisfaction: 4.7,
  medianResolutionDays: 4,
  toolEngagement: { checkerPct: 86, certTrackerPct: 57, obituaryPct: 36 },
  pilotMetrics: {
    medianSavedVsMetroCents: 54_500,
    avgQuotesPerFamily: 3.4,
    totalBenefitDollarsCents: null,
    satisfactionPromoterPct: 100,
    bereavementRemindedPct: 71,
  },
};

describe("statsToCsv — suppressed cohort (n=4)", () => {
  const stats = aggregateCohort(
    Array.from({ length: 4 }, () => ({
      overchargeCaughtCents: 123_400,
      ftcIssues: 2,
      satisfaction: 5,
      resolutionDays: 3,
    })),
  );
  const csv = statsToCsv("Canyon Home Hospice", stats);
  const lines = csv.trim().split("\n");

  it("keeps only the header, organization, and families-helped rows numeric/named", () => {
    expect(lines[0]).toBe("metric,value,period");
    expect(lines).toContain("organization,Canyon Home Hospice,pilot to date");
    expect(lines).toContain("families helped,4,pilot to date");
  });

  it("renders every dollar/satisfaction/engagement row as the literal 'collecting data' — no digit leaks", () => {
    const dataRows = lines
      .slice(1)
      .filter(
        (l) =>
          !l.startsWith("organization,") && !l.startsWith("families helped,"),
      );
    // Every metric CohortStats carries is present even while suppressed.
    expect(dataRows.length).toBe(14);
    for (const line of dataRows) {
      expect(line).toContain(`,collecting data,`);
      expect(line).not.toMatch(/\d/);
    }
  });

  it("ends with a trailing newline", () => {
    expect(csv.endsWith("\n")).toBe(true);
  });
});

describe("statsToCsv — full cohort", () => {
  const csv = statsToCsv("Sunrise Hospice", FULL_STATS);
  const lines = csv.trim().split("\n");

  it("spot-checks the aggregate values (whole dollars, pcts, counts)", () => {
    expect(lines).toContain("families helped,14,pilot to date");
    expect(lines).toContain("families who saved,13,pilot to date");
    expect(lines).toContain(
      "total overcharge caught (dollars),24175,pilot to date",
    );
    expect(lines).toContain(
      "avg caught per family (dollars),1727,pilot to date",
    );
    expect(lines).toContain("ftc issues flagged,17,pilot to date");
    expect(lines).toContain("avg satisfaction,4.7,pilot to date");
    expect(lines).toContain("median resolution days,4,pilot to date");
    expect(lines).toContain("checked a price list,86%,pilot to date");
    expect(lines).toContain("tracked certificates,57%,pilot to date");
    expect(lines).toContain("wrote the obituary,36%,pilot to date");
    expect(lines).toContain(
      "median saved vs metro (dollars),545,pilot to date",
    );
    expect(lines).toContain("avg quotes per family,3.4,pilot to date");
    expect(lines).toContain("satisfaction promoter share,100%,pilot to date");
    expect(lines).toContain("bereavement check-in reminders,71%,pilot to date");
  });

  it("renders a null field inside full stats as 'collecting data', never 0", () => {
    expect(lines).toContain("benefit dollars recovered,collecting data,pilot to date");
  });

  it("escapes org names containing commas and quotes per RFC 4180", () => {
    const escaped = statsToCsv('Acme "Best" Co, Inc.', FULL_STATS);
    expect(escaped).toContain(
      'organization,"Acme ""Best"" Co, Inc.",pilot to date',
    );
  });
});

describe("statsToCsv — employer variant", () => {
  it("omits the hospice-program bereavement row entirely", () => {
    const csv = statsToCsv("Acme Benefits", FULL_STATS, "employer");
    expect(csv).not.toContain("bereavement");
  });

  it("leaves every other row identical to the hospice output", () => {
    const employer = statsToCsv("Sunrise Hospice", FULL_STATS, "employer")
      .trim()
      .split("\n");
    const hospice = statsToCsv("Sunrise Hospice", FULL_STATS)
      .trim()
      .split("\n");
    expect(hospice.filter((l) => !l.startsWith("bereavement"))).toEqual(
      employer,
    );
  });

  it("passing 'hospice' explicitly matches the default output", () => {
    expect(statsToCsv("Sunrise Hospice", FULL_STATS, "hospice")).toBe(
      statsToCsv("Sunrise Hospice", FULL_STATS),
    );
  });
});
