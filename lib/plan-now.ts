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
        "Veterans with a qualifying discharge are entitled to free burial in a national cemetery — the plot, grave opening and closing, the grave liner, and a headstone or marker — plus a burial allowance for eligible veterans. Most eligible families never claim these. The single best step you can take now: find the DD-214 (discharge papers) and put it with your important documents.",
      action: "/veterans — our step-by-step checker",
    });
  }

  if (a.onSocialSecurity === "yes" || a.onSocialSecurity === "unsure") {
    items.push({
      title: "Social Security — the $255 payment and survivor benefits",
      detail:
        "A surviving spouse (or eligible child) can receive the one-time $255 lump-sum death payment — you must apply, within two years. Separately, survivor benefits can be worth far more: a surviving spouse may be able to switch to the higher of the two benefit amounts. The funeral home usually reports the death to Social Security, but the applications are yours to make.",
      action: "ssa.gov or 1-800-772-1213 — when the time comes",
    });
  }

  if (a.lifeInsurance === "yes") {
    items.push({
      title: "Life insurance",
      detail:
        "Gather the policy documents (or even just the insurer's name) now, while it's easy to ask. Claims usually need a certified death certificate; most policies pay within weeks of a complete claim. You never have to assign a policy to a funeral home to use it.",
      action: "Put the policies with your important documents",
    });
  } else if (a.lifeInsurance === "unsure") {
    items.push({
      title: "Life insurance — find every policy",
      detail:
        "If you're not sure what policies exist, the free NAIC Life Insurance Policy Locator asks every participating insurer to check their records for you. Families regularly find policies they didn't know about. It's free and official — never pay a service to search.",
      action: "NAIC Life Insurance Policy Locator (naic.org)",
    });
  }

  if (a.onMedicaid === "yes" || a.onMedicaid === "unsure") {
    items.push({
      title: "County or state burial assistance",
      detail:
        "Many counties and states offer burial or cremation assistance for people who received Medicaid or had limited means — amounts and rules are local, so ask the county human-services office directly. One thing worth knowing about, calmly and early: some states can later make a claim against a Medicaid recipient's estate (often the home). If there's a house involved, a short conversation with an elder-law attorney is worth it.",
      action: "Your county human-services office",
    });
  }

  if (a.wasEmployed === "yes" || a.wasEmployed === "unsure") {
    items.push({
      title: "Employer and union benefits",
      detail:
        "Employers and unions often carry group life insurance the family doesn't know about, plus a final paycheck, unused PTO payout, and sometimes a pension survivor benefit. One call to HR (or the union hall) with the right question — \"what benefits apply when an employee passes away?\" — is all it takes.",
      action: "The employer's HR department",
    });
  }

  return items;
}
