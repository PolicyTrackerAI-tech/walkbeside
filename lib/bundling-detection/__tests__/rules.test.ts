import { describe, it, expect } from "vitest";
import { runRules, type AnalyzedItem } from "@/lib/bundling-detection/rules";

/**
 * Direct coverage for the FTC Funeral Rule detection engine. These rules are
 * the load-bearing "violation flags" half of the checker — a false positive
 * (crying "FTC VIOLATION" when there isn't one) is more damaging to trust than
 * a miss, so the tests pin both what fires AND what must stay silent.
 */
function fire(text: string, items: AnalyzedItem[] = [], extra = {}) {
  return runRules({
    rawText: text,
    items,
    totalCents: items.reduce((s, i) => s + i.cents, 0),
    ...extra,
  });
}
const ids = (ds: { ruleId: string }[]) => ds.map((d) => d.ruleId);
const sev = (ds: { ruleId: string; severity: string }[], id: string) =>
  ds.find((d) => d.ruleId === id)?.severity;

describe("cash-advance-no-disclosure", () => {
  const item: AnalyzedItem = { name: "Death certificates", cents: 2500 };

  it("prompts (suspicious, not violation) when no disclosure language is present", () => {
    const d = fire("Death certificates $25", [item]);
    expect(ids(d)).toContain("cash-advance-no-disclosure");
    // Critical: this must NOT be a confident "violation" — we can't prove
    // non-disclosure from a price list we only partially see.
    expect(sev(d, "cash-advance-no-disclosure")).toBe("suspicious");
  });

  it("stays silent when the GPL discloses cash advances (any common wording)", () => {
    for (const phrase of [
      "Cash advance items: death certificates $25",
      "Disbursements — death certificates $25",
      "Advance item: death certificates $25",
      "Death certificates (paid on your behalf) $25",
      "Third-party charges: death certificates $25",
    ]) {
      const d = fire(phrase, [item]);
      expect(ids(d)).not.toContain("cash-advance-no-disclosure");
    }
  });

  it("does not fire when there are no pass-through items at all", () => {
    const d = fire("Basic services fee $2,000\nEmbalming $1,000", [
      { name: "Basic services fee", cents: 200000 },
      { name: "Embalming", cents: 100000 },
    ]);
    expect(ids(d)).not.toContain("cash-advance-no-disclosure");
  });
});

describe("casket-required-for-direct-cremation", () => {
  it("flags a casket on a direct-cremation quote as a violation", () => {
    const d = fire("Direct cremation\nMetal casket $3,000", [
      { name: "Metal casket", cents: 300000 },
    ]);
    expect(sev(d, "casket-required-for-direct-cremation")).toBe("violation");
  });

  it("does not mistake a 'casket coach' (hearse) for a casket", () => {
    const d = fire("Direct cremation\nCasket coach (hearse) $400", [
      { name: "Casket coach", cents: 40000 },
    ]);
    expect(ids(d)).not.toContain("casket-required-for-direct-cremation");
  });

  it("is silent on a casket when the service is a full burial", () => {
    const d = fire("Traditional burial service\nMetal casket $3,000", [
      { name: "Metal casket", cents: 300000 },
    ]);
    expect(ids(d)).not.toContain("casket-required-for-direct-cremation");
  });
});

describe("vault-required-for-cremation", () => {
  it("flags a burial vault on a cremation-only quote", () => {
    const d = fire("Cremation service\nBurial vault $1,200", [
      { name: "Burial vault", cents: 120000 },
    ]);
    expect(sev(d, "vault-required-for-cremation")).toBe("violation");
  });

  it("stays silent when a burial is also present", () => {
    const d = fire("Cremation and burial of remains\nBurial vault $1,200", [
      { name: "Burial vault", cents: 120000 },
    ]);
    expect(ids(d)).not.toContain("vault-required-for-cremation");
  });
});

describe("embalming-no-disclosure", () => {
  it("escalates to violation when state law is falsely claimed to require it", () => {
    const d = fire("Embalming $900 — required by state law", [
      { name: "Embalming", cents: 90000 },
    ]);
    expect(sev(d, "embalming-no-disclosure")).toBe("violation");
  });

  it("stays calm (suspicious) when there's simply no authorization language", () => {
    const d = fire("Embalming $900", [{ name: "Embalming", cents: 90000 }]);
    expect(sev(d, "embalming-no-disclosure")).toBe("suspicious");
  });

  it("is silent when embalming is disclosed as optional/authorized", () => {
    const d = fire("Embalming (optional, you authorized) $900", [
      { name: "Embalming", cents: 90000 },
    ]);
    expect(ids(d)).not.toContain("embalming-no-disclosure");
  });
});
