import { describe, it, expect } from "vitest";
import {
  benefitSweep,
  EMPTY_BENEFITS,
  type BenefitAnswers,
} from "@/lib/plan-now";

const answers = (patch: Partial<BenefitAnswers>): BenefitAnswers => ({
  ...EMPTY_BENEFITS,
  ...patch,
});

describe("benefitSweep", () => {
  it("returns nothing when nothing applies", () => {
    expect(benefitSweep(EMPTY_BENEFITS)).toEqual([]);
    expect(
      benefitSweep(
        answers({
          veteran: "no",
          onSocialSecurity: "no",
          lifeInsurance: "no",
          onMedicaid: "no",
          wasEmployed: "no",
        }),
      ),
    ).toEqual([]);
  });

  it("surfaces VA benefits for veterans — and for 'unsure' (finding out is the action)", () => {
    for (const v of ["yes", "unsure"] as const) {
      const items = benefitSweep(answers({ veteran: v }));
      expect(items).toHaveLength(1);
      expect(items[0].title).toContain("VA");
      expect(items[0].detail).toContain("DD-214");
      expect(items[0].action).toContain("/veterans");
    }
  });

  it("names the $255 SSA payment and the two-year application window", () => {
    const [ssa] = benefitSweep(answers({ onSocialSecurity: "yes" }));
    expect(ssa.title).toContain("$255");
    expect(ssa.detail).toContain("two years");
  });

  it("routes 'unsure' life insurance to the free NAIC locator, 'yes' to gathering policies", () => {
    const [unsure] = benefitSweep(answers({ lifeInsurance: "unsure" }));
    expect(unsure.action).toContain("NAIC");
    expect(unsure.detail.toLowerCase()).toContain("free");
    const [yes] = benefitSweep(answers({ lifeInsurance: "yes" }));
    expect(yes.action).not.toContain("NAIC");
    expect(yes.detail).toContain("certified death certificate");
  });

  it("pairs Medicaid assistance with the calm estate-recovery awareness note", () => {
    const [medicaid] = benefitSweep(answers({ onMedicaid: "yes" }));
    expect(medicaid.detail).toContain("estate");
    expect(medicaid.detail.toLowerCase()).toContain("elder-law");
  });

  it("never invents a dollar promise — only program facts", () => {
    const all = benefitSweep(
      answers({
        veteran: "yes",
        onSocialSecurity: "yes",
        lifeInsurance: "unsure",
        onMedicaid: "yes",
        wasEmployed: "yes",
      }),
    );
    expect(all).toHaveLength(5);
    for (const item of all) {
      // The only dollar figure permitted is the statutory $255 SSA payment.
      const dollars = item.detail.match(/\$\d[\d,]*/g) ?? [];
      for (const d of dollars) expect(d).toBe("$255");
      expect(item.detail.toLowerCase()).not.toContain("typically save");
      expect(item.detail.toLowerCase()).not.toContain("you will receive");
    }
  });
});
