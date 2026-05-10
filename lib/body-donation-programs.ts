/**
 * Whole-body donation programs in the United States.
 *
 * Whole-body donation is distinct from organ donation: the entire body
 * is given to medical research / education, generally with cremation
 * and return of remains 1–3 years later (varies by program).
 *
 * Programs fall into two camps:
 *   1. University medical school programs — the gold-standard option.
 *      Strict acceptance criteria, no fees, remains returned to family.
 *   2. Private "for-profit" body brokers — accept more donors,
 *      potentially less oversight, body parts may go to varied uses.
 *      The Reuters investigation series (2017-2018) revealed serious
 *      ethical problems with several private programs.
 *
 * We list university programs by default. Sister will vet private
 * programs case-by-case before recommending.
 *
 * NOT financial / legal / medical advice. Programs change acceptance
 * rules. Families should call before relying on any specific program.
 */

export interface DonationProgram {
  /** Display name. */
  name: string;
  /** State the program serves. Some serve neighboring states too. */
  state: string;
  /** Type. */
  type: "university" | "research-institute" | "private";
  /** Phone number. */
  phone: string;
  /** Website. */
  url: string;
  /** Notable details about acceptance, return of remains, etc. */
  notes: string;
}

/**
 * A representative (NOT exhaustive) list of US university body
 * donation programs. Most US states have at least one university
 * medical school with a body donation program; this list highlights
 * the largest and most respected.
 *
 * For a comprehensive directory, families should consult the
 * Anatomical Donations Council list or call their nearest medical
 * school directly.
 */
export const DONATION_PROGRAMS: DonationProgram[] = [
  {
    name: "Mayo Clinic Anatomical Bequest Program",
    state: "MN",
    type: "research-institute",
    phone: "1-800-866-2049",
    url: "https://www.mayoclinic.org/anatomical-bequest-program",
    notes:
      "One of the most respected programs nationally. Cremation and return of remains within 1–2 years. Accepts donors from across the US (transport must be arranged within 24 hours of death).",
  },
  {
    name: "Cleveland Clinic — Lerner College Anatomy Donation",
    state: "OH",
    type: "research-institute",
    phone: "216-444-2876",
    url: "https://my.clevelandclinic.org/about/community/donations/anatomy-donation",
    notes:
      "Serves Ohio and surrounding states. Cremated remains returned to family within 1–2 years.",
  },
  {
    name: "Stanford University School of Medicine — Body Donation Program",
    state: "CA",
    type: "university",
    phone: "650-723-2404",
    url: "https://med.stanford.edu/anatomy/donor-program.html",
    notes:
      "Serves Northern California. Donors must be pre-registered before death (pre-registration is strongly preferred but family can sometimes arrange post-death). Remains returned within 1–3 years.",
  },
  {
    name: "UCLA Donated Body Program",
    state: "CA",
    type: "university",
    phone: "310-825-1129",
    url: "https://medschool.ucla.edu/donated-body-program",
    notes: "Serves Southern California. No fee. Remains returned within 1–3 years.",
  },
  {
    name: "University of California San Francisco — Willed Body Program",
    state: "CA",
    type: "university",
    phone: "415-476-1981",
    url: "https://anatomy.ucsf.edu/willed-body-program",
    notes: "Serves the Bay Area. Pre-registration encouraged.",
  },
  {
    name: "University of Texas Southwestern — Willed Body Program",
    state: "TX",
    type: "university",
    phone: "214-648-2221",
    url: "https://www.utsouthwestern.edu/education/medical-school/about-us/willed-body/",
    notes: "Serves North Texas. Cremation and return within 1–2 years.",
  },
  {
    name: "Baylor College of Medicine — Willed Body Program",
    state: "TX",
    type: "university",
    phone: "713-798-4930",
    url: "https://www.bcm.edu/education/anatomical-program",
    notes: "Serves Houston / Greater Texas region.",
  },
  {
    name: "University of Florida College of Medicine — Anatomical Board",
    state: "FL",
    type: "university",
    phone: "352-273-8474",
    url: "https://anatbd.acb.med.ufl.edu/",
    notes: "Statewide Florida program. No fee. Remains returned within 1–3 years.",
  },
  {
    name: "Harvard Medical School — Anatomical Gift Program",
    state: "MA",
    type: "university",
    phone: "617-432-1735",
    url: "https://meded.hms.harvard.edu/anatomical-gift-program",
    notes:
      "Serves Eastern Massachusetts. Donors must be pre-registered. Remains returned within 1–2 years.",
  },
  {
    name: "Columbia University — Anatomical Donations",
    state: "NY",
    type: "university",
    phone: "212-305-3450",
    url: "https://www.cumc.columbia.edu/dept/anatomy/donations.html",
    notes: "Serves NYC region. Pre-registration required.",
  },
  {
    name: "Johns Hopkins — Anatomical Donations",
    state: "MD",
    type: "university",
    phone: "410-955-3313",
    url: "https://www.hopkinsmedicine.org/som/maryland-body-donation-program/",
    notes:
      "Serves Maryland. Coordinated through the Maryland State Anatomy Board.",
  },
  {
    name: "Northwestern University — Body Donation",
    state: "IL",
    type: "university",
    phone: "312-503-8200",
    url: "https://www.feinberg.northwestern.edu/sites/anatomy/donations/",
    notes: "Serves Illinois. Pre-registration encouraged.",
  },
  {
    name: "University of Washington — Willed Body Program",
    state: "WA",
    type: "university",
    phone: "206-543-1860",
    url: "https://www.uwmedicine.org/specialties/biological-structure/willed-body-program",
    notes: "Serves Washington state. No fee.",
  },
  {
    name: "University of Michigan — Anatomical Donations Program",
    state: "MI",
    type: "university",
    phone: "734-764-4359",
    url: "https://medschool.umich.edu/sites/default/files/anatomical-donations",
    notes: "Serves Michigan. Pre-registration encouraged.",
  },
  {
    name: "Emory University School of Medicine — Body Donation",
    state: "GA",
    type: "university",
    phone: "404-727-6242",
    url: "https://anatomy.med.emory.edu/donations/",
    notes: "Serves Georgia / Southeast.",
  },
  {
    name: "Duke University School of Medicine — Anatomical Gifts",
    state: "NC",
    type: "university",
    phone: "919-684-4124",
    url: "https://medschool.duke.edu/anatomical-gifts-program",
    notes: "Serves North Carolina.",
  },
];

export function programsForState(stateAbbr: string): DonationProgram[] {
  return DONATION_PROGRAMS.filter(
    (p) => p.state.toLowerCase() === stateAbbr.toLowerCase(),
  );
}
