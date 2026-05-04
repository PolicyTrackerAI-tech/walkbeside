/**
 * Veterans burial benefits eligibility rules + content.
 *
 * Source: VA.gov burial benefits pages (verified 2026-04-26). The VA
 * publishes the actual current allowance amounts; we link out for those
 * rather than hardcoding numbers that drift. Sister validates the rule
 * structure against what families actually see on VA Form 21P-530EZ.
 *
 * The checker is intentionally conservative: when in doubt, suggest
 * applying. The VA decides eligibility — we just stop families from
 * skipping the application entirely (the most common failure mode).
 */

export type DischargeType =
  | "honorable"
  | "general"
  | "other-than-honorable"
  | "bad-conduct"
  | "dishonorable"
  | "unknown";

export type ServiceEra =
  | "wartime" // any officially recognized wartime period
  | "peacetime"
  | "active-duty-death" // died on active duty
  | "unknown";

export type DispositionContext =
  | "national-cemetery" // burial in a VA national cemetery
  | "private-cemetery" // private cemetery, vet was service-connected
  | "private-non-service-connected" // private cemetery, no service-connected disability
  | "unknown";

export interface VeteransInputs {
  served: "yes" | "no" | "unsure";
  discharge: DischargeType;
  era: ServiceEra;
  disposition: DispositionContext;
  /** Did the death occur in a VA hospital or under VA contract care? */
  vaCare: "yes" | "no" | "unknown";
}

export interface BenefitMatch {
  id: string;
  title: string;
  whatItIs: string;
  /** Plain English on what's likely covered, with link-out to VA for amounts. */
  amountNote: string;
  /** Why we think this family qualifies, given the inputs. */
  whyEligible: string;
  /** What to do next. */
  howToClaim: string;
  vaLink: string;
  vaLinkLabel: string;
}

export interface CheckerResult {
  /** "likely-eligible" / "possibly-eligible" / "unlikely-but-apply" / "not-eligible" */
  verdict: "likely" | "possibly" | "unlikely" | "ineligible";
  headline: string;
  matches: BenefitMatch[];
  /** Caveats / things the family still needs to prove. */
  caveats: string[];
}

const DD214_NOTE =
  "You'll need a copy of the DD-214 (Certificate of Release or Discharge from Active Duty). If you can't find it, request one free at archives.gov/veterans — the funeral home often helps with this.";

const BURIAL_ALLOWANCE: BenefitMatch = {
  id: "burial-allowance",
  title: "VA burial allowance",
  whatItIs:
    "A partial reimbursement toward burial and funeral costs. Paid to whoever paid the funeral bill — usually a family member.",
  amountNote:
    "The VA publishes current amounts (typically a few hundred to a couple thousand dollars depending on whether the death was service-connected). Frequently unclaimed — file the form even if you're not sure.",
  whyEligible:
    "Honorably discharged veterans (and most general discharges) qualify. The amount depends on whether the death was service-connected and where the veteran was at the time.",
  howToClaim:
    "File VA Form 21P-530EZ within 2 years of burial. Most funeral homes will do this for you if you ask. " +
    DD214_NOTE,
  vaLink: "https://www.va.gov/burials-memorials/veterans-burial-allowance/",
  vaLinkLabel: "VA burial allowance details",
};

const PLOT_ALLOWANCE: BenefitMatch = {
  id: "plot-allowance",
  title: "Plot or interment allowance",
  whatItIs:
    "An additional allowance toward the cost of a private cemetery plot, when burial is not in a national cemetery.",
  amountNote:
    "Stacks on top of the burial allowance. Only paid for burials in private cemeteries (not VA national cemeteries — those are already free).",
  whyEligible:
    "Veteran is being buried in a private cemetery and meets discharge eligibility. Often the difference between out-of-pocket cost and a fully covered plot.",
  howToClaim:
    "Filed on the same VA Form 21P-530EZ as the burial allowance. Check the box for plot/interment allowance.",
  vaLink: "https://www.va.gov/burials-memorials/veterans-burial-allowance/",
  vaLinkLabel: "Plot allowance — same form",
};

const NATIONAL_CEMETERY: BenefitMatch = {
  id: "national-cemetery",
  title: "Burial in a VA national cemetery",
  whatItIs:
    "Burial space, opening and closing of the grave, a government headstone or marker, a burial flag, and perpetual care — all at no cost.",
  amountNote:
    "Effectively replaces $5,000–$15,000+ of private cemetery and headstone costs. The single largest benefit available, and frequently overlooked because families default to a local funeral home's preferred private cemetery.",
  whyEligible:
    "Most veterans with other-than-dishonorable discharges qualify. Spouses and dependent children may also be eligible to be buried alongside.",
  howToClaim:
    "Funeral home contacts the National Cemetery Scheduling Office at 800-535-1117. Decide before signing with a private cemetery — once a private plot is purchased, you're not getting that money back.",
  vaLink: "https://www.cem.va.gov/cems/listcem.asp",
  vaLinkLabel: "Find a national cemetery",
};

const HEADSTONE: BenefitMatch = {
  id: "headstone",
  title: "Government headstone or marker",
  whatItIs:
    "A free upright marble headstone, flat granite/marble/bronze marker, or bronze niche marker — even for burial in a private cemetery.",
  amountNote:
    "Replaces $800–$2,000+ in headstone costs. Available even when burial is in a private cemetery, not just national cemeteries.",
  whyEligible:
    "Eligible veterans qualify regardless of cemetery. Many families don't know this and pay the funeral home or monument company for a stone they could get free.",
  howToClaim:
    "File VA Form 40-1330. The funeral home or cemetery installs it once it arrives.",
  vaLink: "https://www.va.gov/burials-memorials/headstones-markers-medallions/",
  vaLinkLabel: "Headstones, markers & medallions",
};

const BURIAL_FLAG: BenefitMatch = {
  id: "burial-flag",
  title: "Burial flag",
  whatItIs:
    "A US flag to drape the casket or accompany the urn. Given to the next of kin after the service as a keepsake.",
  amountNote:
    "Free. Funeral home requests it on your behalf via VA Form 27-2008.",
  whyEligible:
    "Available for most veterans with other-than-dishonorable discharges, plus members of the Selected Reserves.",
  howToClaim:
    "Ask the funeral home — they file VA Form 27-2008 and pick up the flag at any US Post Office.",
  vaLink: "https://www.va.gov/burials-memorials/memorial-items/burial-flags/",
  vaLinkLabel: "Burial flags",
};

const PMC: BenefitMatch = {
  id: "presidential-memorial-certificate",
  title: "Presidential Memorial Certificate",
  whatItIs:
    "An engraved paper certificate signed by the current President honoring the veteran's service. Free.",
  amountNote: "No cost. Mostly sentimental, but families value it.",
  whyEligible:
    "Eligible veterans with other-than-dishonorable discharges. Multiple copies can be requested.",
  howToClaim:
    "Apply online at va.gov or via VA Form 40-0247.",
  vaLink: "https://www.va.gov/burials-memorials/memorial-items/presidential-memorial-certificates/",
  vaLinkLabel: "Presidential Memorial Certificate",
};

const SURVIVOR_PENSION: BenefitMatch = {
  id: "survivor-pension",
  title: "Survivors Pension (DIC) — worth checking",
  whatItIs:
    "A monthly payment to surviving spouses and dependent children of wartime veterans, if income is below a threshold. Separate from burial benefits.",
  amountNote:
    "Ongoing monthly payment, not a one-time benefit. Heavily underutilized — surviving spouses of low-income wartime veterans frequently don't realize they qualify.",
  whyEligible:
    "Wartime service + low household income for the survivor. Specific income limits change annually.",
  howToClaim:
    "File VA Form 21P-534EZ. Worth talking to a Veterans Service Officer (VSO) at your county VA office — they help file for free.",
  vaLink: "https://www.va.gov/pension/survivors-pension/",
  vaLinkLabel: "Survivors Pension overview",
};

function dischargeQualifies(d: DischargeType): boolean {
  // VA rule of thumb: anything other than dishonorable, bad-conduct (BCD by
  // general court martial), or other-than-honorable usually qualifies.
  // We treat OTH as "needs review" — many are reclassified.
  return d === "honorable" || d === "general" || d === "unknown";
}

export function checkVeteransBenefits(input: VeteransInputs): CheckerResult {
  if (input.served === "no") {
    return {
      verdict: "ineligible",
      headline: "VA burial benefits don't apply.",
      matches: [],
      caveats: [
        "If a parent or grandparent served and you're unsure, use 'Unsure' on the question above and we'll show what to check.",
      ],
    };
  }

  // If they're unsure whether the deceased served, point them at the
  // discovery path before showing benefits.
  if (input.served === "unsure") {
    return {
      verdict: "possibly",
      headline: "Worth checking — start with the DD-214.",
      matches: [BURIAL_ALLOWANCE, NATIONAL_CEMETERY],
      caveats: [
        "If you find a DD-214 (Certificate of Release or Discharge from Active Duty) in their papers, they served. Even partial service in the Reserves or National Guard can qualify in some cases.",
        "Request a free copy of military records at archives.gov/veterans (form SF-180) — takes 2–4 weeks.",
        "A Veterans Service Officer (VSO) at your county VA office reviews this for free and files the paperwork. Always cheaper than a private claims service.",
      ],
    };
  }

  if (!dischargeQualifies(input.discharge)) {
    return {
      verdict: "unlikely",
      headline: "Discharge type may disqualify — but apply anyway.",
      matches: [BURIAL_FLAG, PMC],
      caveats: [
        "Other-than-honorable, bad-conduct, and dishonorable discharges generally don't qualify for burial benefits, but families have successfully appealed for benefits when the discharge is upgraded or when the death was service-connected.",
        "Talk to a Veterans Service Officer (VSO) before assuming you're disqualified. They review discharge papers free of charge.",
        "Burial flag and Presidential Memorial Certificate may still be available.",
      ],
    };
  }

  // Eligible — assemble matches.
  const matches: BenefitMatch[] = [];

  // National cemetery is the biggest single benefit — surface first if they
  // haven't already chosen a private cemetery.
  if (
    input.disposition === "national-cemetery" ||
    input.disposition === "unknown"
  ) {
    matches.push(NATIONAL_CEMETERY);
  }

  matches.push(BURIAL_ALLOWANCE);

  // Plot allowance only relevant for private burial.
  if (
    input.disposition === "private-cemetery" ||
    input.disposition === "private-non-service-connected" ||
    input.disposition === "unknown"
  ) {
    matches.push(PLOT_ALLOWANCE);
  }

  matches.push(HEADSTONE, BURIAL_FLAG, PMC);

  // Survivor pension hint — only for wartime + active-duty death cases, since
  // it has income gates we can't evaluate here.
  if (input.era === "wartime" || input.era === "active-duty-death") {
    matches.push(SURVIVOR_PENSION);
  }

  const caveats: string[] = [
    "A Veterans Service Officer (VSO) at your county VA office files all of this for free. Avoid paid claims services — they charge for work the VSO does at no cost.",
    "Most claims must be filed within 2 years of burial. Don't wait until the estate is settled.",
  ];
  if (input.vaCare === "yes") {
    caveats.unshift(
      "Death in a VA facility or under VA contract care often increases the burial allowance. Mention it on the form.",
    );
  }

  return {
    verdict: "likely",
    headline: "Looks eligible. Here's what's likely available.",
    matches,
    caveats,
  };
}

export const VSO_NOTE =
  "A Veterans Service Officer (VSO) at your county VA office will review eligibility and file every form on this page for free. Find one at va.gov/ogc/apps/accreditation/index.asp or by calling your county veterans services department.";
