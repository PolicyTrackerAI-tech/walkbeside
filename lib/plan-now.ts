/**
 * The admission-week plan (/plan-now) — state + the benefit sweep.
 *
 * The one-sitting flow a hospice-referred family completes BEFORE the death:
 * choose a path, see what fair costs locally, capture wishes, surface likely
 * benefits, name the point person — and print the family plan + "first call"
 * card. Everything lives in localStorage on the family's own device: no
 * account, no DB write, no PII leaves the browser (channel rule: the hospice
 * transmits nothing; the family self-serves).
 *
 * The benefit sweep makes only defensible, sourced claims (guardrail #4):
 * program facts a family can verify, never invented dollar promises.
 */

import type { ServiceType } from "./pricing-data";

export type YesNoUnsure = "yes" | "no" | "unsure" | "";

export interface BenefitAnswers {
  veteran: YesNoUnsure;
  onSocialSecurity: YesNoUnsure;
  lifeInsurance: YesNoUnsure;
  onMedicaid: YesNoUnsure;
  wasEmployed: YesNoUnsure;
}

export interface PlanState {
  /** The service path the family is leaning toward. */
  path: ServiceType | "";
  zip: string;
  /** First name / what the family calls them. Optional; stays on-device. */
  personName: string;
  /** What matters to the family — free text. */
  wishes: string;
  /** Faith / tradition notes. */
  faithNotes: string;
  benefits: BenefitAnswers;
  /** Who makes the first call when the time comes. */
  pointPerson: string;
}

export const EMPTY_BENEFITS: BenefitAnswers = {
  veteran: "",
  onSocialSecurity: "",
  lifeInsurance: "",
  onMedicaid: "",
  wasEmployed: "",
};

export const DEFAULT_PLAN: PlanState = {
  path: "",
  zip: "",
  personName: "",
  wishes: "",
  faithNotes: "",
  benefits: { ...EMPTY_BENEFITS },
  pointPerson: "",
};

export const PLAN_STORAGE_KEY = "honestfuneral.plan-now.v1";

export function readPlan(): PlanState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PLAN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PlanState>;
    return {
      ...DEFAULT_PLAN,
      ...parsed,
      benefits: { ...EMPTY_BENEFITS, ...(parsed.benefits ?? {}) },
    };
  } catch {
    return null;
  }
}

export function writePlan(state: PlanState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Best-effort; private-mode storage failures are fine.
  }
}

export function clearPlan(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PLAN_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export interface BenefitItem {
  title: string;
  detail: string;
  /** Where to act — an internal path or a named external resource. */
  action: string;
}

/**
 * Map the family's answers to the benefits they likely qualify for. Facts
 * only — program rules a family can verify — no invented dollar promises.
 * "unsure" answers still surface the item (finding out IS the action).
 */
export function benefitSweep(a: BenefitAnswers): BenefitItem[] {
  const items: BenefitItem[] = [];

  if (a.veteran === "yes" || a.veteran === "unsure") {
    items.push({
      title: "VA burial benefits",
      detail:
        "Veterans with a qualifying discharge get free burial in a national cemetery. That covers the plot, the grave opening and closing, the liner, and a headstone or marker. Eligible veterans may also get a burial allowance. Most eligible families never claim any of this. The best step you can take now: find the DD-214 (discharge papers). Put it with your important documents.",
      action: "/veterans — our step-by-step checker",
    });
  }

  if (a.onSocialSecurity === "yes" || a.onSocialSecurity === "unsure") {
    items.push({
      title: "Social Security — the $255 payment and survivor benefits",
      detail:
        "A surviving spouse (or eligible child) can get the one-time $255 death payment. You must apply, within two years. Survivor benefits can be worth far more. A surviving spouse may be able to switch to the higher of the two benefit amounts. The funeral home usually reports the death to Social Security. The applications are still yours to make.",
      action: "ssa.gov or 1-800-772-1213 — when the time comes",
    });
  }

  if (a.lifeInsurance === "yes") {
    items.push({
      title: "Life insurance",
      detail:
        "Gather the policy papers now, while it's easy to ask. Even just the insurer's name helps. Claims usually need a certified death certificate. Most policies pay within weeks of a complete claim. You never have to sign a policy over to a funeral home to use it.",
      action: "Put the policies with your important documents",
    });
  } else if (a.lifeInsurance === "unsure") {
    items.push({
      title: "Life insurance — find every policy",
      detail:
        "Not sure what policies exist? The free NAIC Life Insurance Policy Locator asks every participating insurer to check for you. Families often find policies they didn't know about. It's free and official. Never pay a service to search.",
      action: "NAIC Life Insurance Policy Locator (naic.org)",
    });
  }

  if (a.onMedicaid === "yes" || a.onMedicaid === "unsure") {
    items.push({
      title: "County or state burial assistance",
      detail:
        "Many counties and states help pay for burial or cremation when someone had Medicaid or limited means. Amounts and rules are local, so ask the county human-services office directly. One thing worth knowing early, calmly: some states can later make a claim against a Medicaid recipient's estate — often the home. If there's a house involved, read our plain-English guide at honestfuneral.co/medicaid-estate-recovery. It covers the protections every family has. A short talk with an elder-law attorney is worth it too.",
      action: "Your county human-services office · honestfuneral.co/medicaid-estate-recovery",
    });
  }

  if (a.wasEmployed === "yes" || a.wasEmployed === "unsure") {
    items.push({
      title: "Employer and union benefits",
      detail:
        "Employers and unions often carry group life insurance the family doesn't know about. There may also be a final paycheck, unused PTO, and sometimes a pension survivor benefit. One call to HR (or the union hall) is all it takes. Ask: \"what benefits apply when an employee passes away?\"",
      action: "The employer's HR department",
    });
  }

  return items;
}
