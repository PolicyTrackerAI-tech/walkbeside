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

  it("regression: a COMPLIANT 'not required by state law' disclosure never fires violation", () => {
    // Live bug (caught 2026-07-01): a bare substring match on "required by
    // state law" fired even when the text said "NOT required" — the exact
    // FTC-mandated compliant disclosure wording. This must stay silent (or at
    // most the calm 'suspicious' authorization-language check), never violation.
    const d = fire(
      "Embalming (not required by state law, family authorized in writing) $900",
      [{ name: "Embalming", cents: 90000 }],
    );
    expect(sev(d, "embalming-no-disclosure")).not.toBe("violation");
    expect(ids(d)).not.toContain("embalming-no-disclosure");
  });
});

describe("casket-handling-fee", () => {
  it("flags a priced fee for a casket bought elsewhere as a violation, on that line", () => {
    for (const name of [
      "Outside casket handling fee (casket bought elsewhere)",
      "Outside casket handling fee (caskets not purchased from Canyon Rim Memorial Chapel)",
      "Casket handling fee",
      "Fee for caskets purchased elsewhere",
      "Third-party casket surcharge",
    ]) {
      const d = fire(`${name} $625`, [{ name, cents: 62500 }]);
      expect(sev(d, "casket-handling-fee"), name).toBe("violation");
      expect(d.find((x) => x.ruleId === "casket-handling-fee")?.evidence).toBe(name);
    }
  });

  it("stays silent on a compliant or unrelated line", () => {
    for (const [name, cents] of [
      ["No handling fee for caskets purchased elsewhere", 0],
      ["Outside casket handling fee waived", 0],
      ["Outside caskets accepted without charge", 50000],
      ["Air tray / casket handling for shipment", 25000],
      ["Casket — 18-gauge metal", 250000],
      ["Rental casket fee", 95000],
      ["Casket coach (hearse) handling fee", 45000],
      ["Death certificate handling (per certified copy)", 5500],
    ] as const) {
      const d = fire(`${name} $${cents / 100}`, [{ name, cents }]);
      expect(ids(d), name).not.toContain("casket-handling-fee");
    }
  });
});

describe("FTC engine — expansion rules (2026-06-26)", () => {
  // THE most important tests: the FTC Funeral Rule's OWN mandated disclosures
  // say "...does not require...". Those compliant lines must NEVER fire a
  // 'violation' — the negation guard is the whole point.
  describe("negation guard — compliant disclosures never fire a violation", () => {
    it("does not flag 'a vault is not required by law'", () => {
      const d = fire("Grave liner — a vault is not required by law. $1,200", [
        { name: "Grave liner", cents: 120000 },
      ]);
      expect(ids(d)).not.toContain("vault-required-by-law-claim");
    });
    it("does not flag 'a casket is not required for direct cremation'", () => {
      const d = fire(
        "Direct cremation. A casket is not required; you may use an alternative container.",
        [],
        { serviceTypeHint: "direct-cremation" },
      );
      expect(ids(d)).not.toContain("casket-required-by-law-claim");
      expect(ids(d)).not.toContain("cremation-casket-asserted-required");
    });
  });

  describe("required-by-law misrepresentations DO fire (self-proving from text)", () => {
    it("flags a vault claimed required by law (violation)", () => {
      const d = fire("Burial vault — required by law $1,295", [
        { name: "Burial vault", cents: 129500 },
      ]);
      expect(sev(d, "vault-required-by-law-claim")).toBe("violation");
    });
    it("flags a casket claimed required by law on a burial (violation)", () => {
      const d = fire("Traditional burial\nA casket is required by law $3,000", [
        { name: "Casket", cents: 300000 },
      ]);
      expect(sev(d, "casket-required-by-law-claim")).toBe("violation");
    });
    it("grades an optional item claimed required by law as suspicious, not violation", () => {
      const d = fire("Register book is required by law $95");
      expect(sev(d, "declinable-item-required-by-law-claim")).toBe("suspicious");
    });
    it("does not bleed a vault's 'required by law' into an adjacent casket line", () => {
      // Regression (caught live, deploy #20): the windowed scan crossed the
      // newline and false-fired the CASKET violation off the VAULT's claim.
      const d = fire(
        "Burial vault — required by law $1,295\nMetal casket $3,000",
        [
          { name: "Burial vault", cents: 129500 },
          { name: "Metal casket", cents: 300000 },
        ],
      );
      expect(sev(d, "vault-required-by-law-claim")).toBe("violation");
      expect(ids(d)).not.toContain("casket-required-by-law-claim");
    });
  });

  describe("suppression — no double/triple casket flags", () => {
    it("suppresses the textual casket claims when the item-based direct-cremation rule fires", () => {
      const d = fire(
        "Direct cremation\nA casket is required by law\nMetal casket $3,000",
        [{ name: "Metal casket", cents: 300000 }],
        { serviceTypeHint: "direct-cremation" },
      );
      expect(ids(d)).toContain("casket-required-for-direct-cremation");
      expect(ids(d)).not.toContain("casket-required-by-law-claim");
      expect(ids(d)).not.toContain("cremation-casket-asserted-required");
    });
  });

  describe("embalming on a no-viewing arrangement", () => {
    it("flags embalming charged on a direct cremation with no viewing", () => {
      const d = fire("Direct cremation\nEmbalming $900", [
        { name: "Embalming", cents: 90000 },
      ], { serviceTypeHint: "direct-cremation" });
      expect(sev(d, "embalming-on-no-viewing-arrangement")).toBe("suspicious");
    });
    it("does not flag when a viewing is present (lawful pre-cremation viewing)", () => {
      const d = fire("Direct cremation with a viewing first\nEmbalming $900", [
        { name: "Embalming", cents: 90000 },
      ], { serviceTypeHint: "direct-cremation" });
      expect(ids(d)).not.toContain("embalming-on-no-viewing-arrangement");
    });
  });

  describe("cash-advance & fee rules", () => {
    it("flags a death certificate above the per-copy fee and suppresses the generic cash-advance flag", () => {
      const d = fire("Death certificates $250", [
        {
          name: "Death certificates",
          cents: 25000,
          matchedItemId: "death-cert",
          classification: "high",
          fairCentsLow: 1000,
          fairCentsHigh: 2500,
        },
      ]);
      expect(sev(d, "death-certificate-marked-up")).toBe("suspicious");
      expect(ids(d)).not.toContain("cash-advance-no-disclosure"); // superseded
    });
    it("flags a separate permit/filing fee stacked on basic services", () => {
      const d = fire("Basic services fee $2,000\nPermit filing fee $150", [
        { name: "Basic services fee", cents: 200000 },
        { name: "Permit filing fee", cents: 15000 },
      ]);
      expect(sev(d, "duplicate-permit-filing-fee")).toBe("suspicious");
    });
  });

  describe("a clean, compliant itemized quote fires no new false violation", () => {
    it("normal burial GPL → zero violations", () => {
      const d = fire(
        "PROFESSIONAL SERVICES\nBasic services fee $2,000\nEmbalming (you authorized) $800\nViewing $400\nMetal casket $2,000\nHearse $350",
        [
          { name: "Basic services fee", cents: 200000 },
          { name: "Embalming", cents: 80000 },
          { name: "Viewing", cents: 40000 },
          { name: "Metal casket", cents: 200000 },
          { name: "Hearse", cents: 35000 },
        ],
      );
      expect(d.filter((x) => x.severity === "violation")).toEqual([]);
    });
  });
});

describe("urn-vault-handling-fee", () => {
  it("flags a priced fee for an urn or vault bought elsewhere as a violation, on that line", () => {
    for (const [name, what] of [
      ["Handling fee for urn provided by the family", "an urn"],
      ["Outside urn handling fee (urn purchased elsewhere)", "an urn"],
      ["Third-party urn acceptance charge", "an urn"],
      ["Outside vault handling fee (vault purchased elsewhere)", "a burial vault"],
      ["Outer burial container provided by family — handling charge", "a burial vault"],
      ["Grave liner not purchased from us — surcharge", "a burial vault"],
    ] as const) {
      const d = fire(`${name} $295`, [{ name, cents: 29500 }]);
      const hit = d.find((x) => x.ruleId === "urn-vault-handling-fee");
      expect(hit?.severity, name).toBe("violation");
      expect(hit?.evidence, name).toBe(name);
      expect(hit?.title, name).toBe(`A fee for using ${what} bought elsewhere`);
    }
  });

  it("stays silent on real services, pass-throughs, waived fees, and plain merchandise", () => {
    for (const [name, cents] of [
      ["Urn handling fee", 9500], // no bought-elsewhere signal: could be mailing
      ["Vault handling", 25000], // no bought-elsewhere signal: could be setting
      ["Shipping of cremated remains in family-provided urn — fee", 9500],
      ["Vault installation fee (vault purchased elsewhere)", 45000],
      ["Cemetery charge for outside vault (cash advance)", 30000],
      ["No fee for urns purchased elsewhere", 0],
      ["Outside urn handling fee waived", 0],
      ["Outside urns accepted without charge", 50000],
      ["Urn (basic)", 15000],
      ["Burial vault — Guardian", 239500],
    ] as const) {
      const d = fire(`${name} $${cents / 100}`, [{ name, cents }]);
      expect(ids(d), name).not.toContain("urn-vault-handling-fee");
    }
  });

  it("leaves a line casket-handling-fee flags to it (one card per line)", () => {
    const name = "Handling fee for caskets or urns purchased elsewhere";
    const d = fire(`${name} $495`, [{ name, cents: 49500 }]);
    expect(ids(d)).toContain("casket-handling-fee");
    expect(ids(d)).not.toContain("urn-vault-handling-fee");
  });

  it("flags a mixed casket-and-urn line the casket rule doesn't recognize, instead of dropping it", () => {
    // Review finding: skipping every casket-mentioning line let this fall
    // between the two rules, leaving only the generic info card.
    const name = "Acceptance charge for customer-provided casket and urn";
    const d = fire(`${name} $495`, [{ name, cents: 49500 }]);
    expect(ids(d)).not.toContain("casket-handling-fee");
    const hit = d.find((x) => x.ruleId === "urn-vault-handling-fee");
    expect(hit?.severity).toBe("violation");
    expect(hit?.title).toBe("A fee for using a casket or urn bought elsewhere");
  });
});
