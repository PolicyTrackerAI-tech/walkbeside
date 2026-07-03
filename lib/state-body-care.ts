/**
 * State-by-state body-care rules for /rights (roadmap Phase 1, guardrail 4):
 * what each state's law actually says about embalming vs refrigeration over
 * time. Replaces the blanket "about 15 states..." approximation with rows
 * that each carry an explicit statute/administrative-code citation.
 *
 * PROVENANCE RULE — the reason this file exists: a state appears in
 * VERIFIED_RULES only if the citation was independently verified against the
 * statute/regulation text (research + adversarial verification pass,
 * 2026-07-02; see docs/STATE_BODY_CARE_FINDINGS.md for the full audit trail).
 * Everything else falls back to NATIONAL_BASELINE, which is deliberately
 * conservative and already validated in docs/CLAIMS_VALIDATION.md. Adding a
 * row without a verified cite is how this page becomes wrong legal advice to
 * a grieving family — don't.
 */

export type BodyCareRule =
  /** No statute imposes a time-based embalm-or-refrigerate requirement. */
  | "no-time-rule"
  /** Embalming OR refrigeration required after N hours. */
  | "embalm-or-refrigerate-after-hours"
  /** Rule applies only to transport/common carrier or specific circumstances. */
  | "refrigerate-or-embalm-cemetery-or-transport-only"
  | "other";

export interface StateBodyCareRow {
  /** Two-letter USPS code. */
  code: string;
  state: string;
  rule: BodyCareRule;
  /** Hour threshold when the rule has one. */
  hoursThreshold?: number;
  /** ONE plain-English sentence, exactly what the statute supports. */
  summary: string;
  /** The statute / administrative-code citation backing the summary. */
  statuteCite: string;
}

/**
 * The safe, nationally-true statements shown for any state without a
 * verified row (and above the table for all states).
 */
export const NATIONAL_BASELINE = {
  headline: "No US state requires embalming for every death.",
  detail:
    "Some states have a time rule: embalm or refrigerate if burial or cremation waits past a set point — often 24 to 48 hours. Where a time rule exists, refrigeration is always a legal option. If a funeral home says state law always requires embalming, that is false. Saying so also breaks the FTC Funeral Rule.",
} as const;

/** Populated only with statute-verified rows — see the provenance rule above. */
export const VERIFIED_RULES: StateBodyCareRow[] = [
  {
    code: "AL",
    state: "Alabama",
    rule: "embalm-or-refrigerate-after-hours",
    hoursThreshold: 48,
    summary: "Alabama requires final disposition within 48 hours after death (or release by a coroner or medical examiner) unless the body has been embalmed or is kept under refrigeration.",
    statuteCite: "Ala. Code § 34-13-117",
  },
  {
    code: "AK",
    state: "Alaska",
    rule: "no-time-rule",
    summary: "Alaska has no statute or regulation requiring embalming or refrigeration of a body after any set number of hours; the mortuary licensing law expressly contemplates disposition without embalming.",
    statuteCite: "Alaska Stat. § 08.42.020(c); 12 AAC 50 (chapter reviewed in full — contains no embalming/refrigeration time rule)",
  },
  {
    code: "AZ",
    state: "Arizona",
    rule: "embalm-or-refrigerate-after-hours",
    hoursThreshold: 24,
    summary: "Arizona's funeral rule makes it a violation to claim embalming is legally required, and frames embalming as not required by law except where burial or cremation will not occur within 24 hours or where the body is not refrigerated immediately after death; separately, crematories must hold unembalmed remains refrigerated at or below 38°F (or in compliance with applicable public health laws).",
    statuteCite: "Ariz. Admin. Code R4-12-303; Ariz. Rev. Stat. § 32-1399(3)",
  },
  {
    code: "AR",
    state: "Arkansas",
    rule: "embalm-or-refrigerate-after-hours",
    hoursThreshold: 48,
    summary: "Arkansas requires a body not buried within 48 hours after death to be either embalmed or stored under refrigeration at 45°F or less, and bodies awaiting cremation get the same 48-hour grace period before embalming or refrigeration is required.",
    statuteCite: "Code of Arkansas Rules, 20 CAR § 1-802 (Ark. Dep't of Health, Preservation of Bodies; authority Ark. Code Ann. § 20-18-202)",
  },
  {
    code: "CA",
    state: "California",
    rule: "embalm-or-refrigerate-after-hours",
    hoursThreshold: 24,
    summary: "California requires a licensed funeral establishment or funeral director holding an unembalmed body for more than 24 hours to refrigerate it at an approved facility (16 CCR § 1223(c)); embalming is never generally required, and Cal. Health & Safety Code § 7355 separately requires embalming (or, if embalming is impossible, an airtight sealed container) only for transport by common carrier.",
    statuteCite: "Cal. Code Regs. tit. 16, § 1223(c)",
  },
  {
    code: "CO",
    state: "Colorado",
    rule: "embalm-or-refrigerate-after-hours",
    hoursThreshold: 24,
    summary: "Colorado requires a funeral establishment to embalm, refrigerate, cremate, bury, or entomb a body within 24 hours after taking custody of it; a separate exemption at C.R.S. 12-135-109 lets religious sects caring for their own deceased members take up to seven days to refrigerate, freeze, embalm, inter, cremate, or begin natural reduction.",
    statuteCite: "Colo. Rev. Stat. § 12-135-106",
  },
  {
    code: "CT",
    state: "Connecticut",
    rule: "refrigerate-or-embalm-cemetery-or-transport-only",
    summary: "Connecticut sets no time limit for caring for an unembalmed body — state law requires washing or embalming only when a body is shipped by common carrier (with a religious-belief exception), and requires washing, embalming, or wrapping only when death was from a reportable disease.",
    statuteCite: "Conn. Gen. Stat. § 19a-91(b)(1), (c)",
  },
  {
    code: "DE",
    state: "Delaware",
    rule: "embalm-or-refrigerate-after-hours",
    hoursThreshold: 24,
    summary: "Delaware requires a body kept longer than 24 hours to be embalmed, refrigerated in an industry-standard refrigerator, or placed in a sealed casket that will not be reopened (unembalmed refrigerated remains generally may not be held more than 15 days), and every body must be buried, cremated, disposed of by natural organic reduction, or placed in a receiving vault within five days of death.",
    statuteCite: "16 Del. Admin. Code § 4204-10.0 (effective Feb. 11, 2026)",
  },
  {
    code: "DC",
    state: "District of Columbia",
    rule: "embalm-or-refrigerate-after-hours",
    hoursThreshold: 24,
    summary: "The District of Columbia never requires embalming, but if a funeral establishment holds an unembalmed body for more than 24 hours it must be kept in a refrigerated storage room (unless the Chief Medical Examiner directs otherwise).",
    statuteCite: "D.C. Mun. Regs. tit. 17, § 3110.4",
  },
  {
    code: "FL",
    state: "Florida",
    rule: "embalm-or-refrigerate-after-hours",
    hoursThreshold: 24,
    summary: "Florida requires that a body not be held anywhere (or in transit) more than 24 hours after death unless it is refrigerated at 40 degrees Fahrenheit or below, embalmed, or otherwise preserved in a manner approved by the licensing authority.",
    statuteCite: "Fla. Stat. § 497.386(2)",
  },
  {
    code: "GA",
    state: "Georgia",
    rule: "no-time-rule",
    summary: "Georgia has no statute or regulation requiring a body to be embalmed or refrigerated after any set number of hours.",
    statuteCite: "O.C.G.A. tit. 43, ch. 18 and Ga. Comp. R. & Regs. ch. 250, reviewed in full — no preservation time rule exists in either",
  },
  {
    code: "HI",
    state: "Hawaii",
    rule: "other",
    hoursThreshold: 30,
    summary: "Hawaii requires a body to be embalmed (if its condition permits), cremated, or buried within 30 hours after death; for bodies placed in coroner, medical examiner, county, or county-physician custody, the 30-hour clock runs from release, with refrigerated storage in a state-approved hospital as an additional option only in those custody cases.",
    statuteCite: "Haw. Admin. Rules (HAR) § 11-22-4(a)(2)",
  },
  {
    code: "ID",
    state: "Idaho",
    rule: "embalm-or-refrigerate-after-hours",
    hoursThreshold: 24,
    summary: "Idaho requires a body held longer than 24 hours before burial, cremation, or other disposition to be either embalmed or refrigerated at 36 degrees Fahrenheit or less until disposition.",
    statuteCite: "Idaho Admin. Code (IDAPA) 24.08.01.100.06.d.iii (Rules of the State Board of Morticians, eff. 7-1-25)",
  },
  {
    code: "IL",
    state: "Illinois",
    rule: "no-time-rule",
    summary: "Illinois has no law requiring embalming and no hour deadline for embalming or refrigerating an unembalmed body; the only adjacent time rules are facility-side, under the Crematory Regulation Act — a crematory may not take possession of unembalmed remains it cannot cremate within 24 hours unless it has sub-40°F refrigeration, and cremation itself may not occur until 24 hours after death — not mandates on families or the body itself.",
    statuteCite: "225 ILCS 41; 410 ILCS 18/35; 77 Ill. Adm. Code 500.50",
  },
  {
    code: "IN",
    state: "Indiana",
    rule: "no-time-rule",
    summary: "Indiana law sets no hour deadline requiring embalming or refrigeration of an unembalmed body — disposition must simply occur within “a reasonable time” — and the funeral board's embalming rule expressly provides that nothing in that section may be read to require embalming if the next of kin does not authorize it.",
    statuteCite: "832 Ind. Admin. Code 2-2-3(e)",
  },
  {
    code: "IA",
    state: "Iowa",
    rule: "embalm-or-refrigerate-after-hours",
    hoursThreshold: 72,
    summary: "Iowa's funeral rules allow embalming to be skipped only if burial or cremation happens within 72 hours of death (or 24 hours after the funeral director takes custody, whichever is longer), and refrigeration at 38–42 degrees Fahrenheit can extend that deadline by up to 72 more hours.",
    statuteCite: "Iowa Admin. Code r. 481—900.6(3) (formerly 645—100.6(3))",
  },
  {
    code: "KS",
    state: "Kansas",
    rule: "embalm-or-refrigerate-after-hours",
    hoursThreshold: 24,
    summary: "Kansas requires a body to be embalmed or kept refrigerated (below 40 degrees Fahrenheit) if burial or cremation will not take place within 24 hours of death, with a limited extension allowed for religious observance.",
    statuteCite: "Kan. Admin. Regs. § 63-3-11",
  },
  {
    code: "KY",
    state: "Kentucky",
    rule: "no-time-rule",
    summary: "Kentucky has no statute or regulation requiring embalming or setting a time limit after which an unembalmed body must be embalmed or refrigerated.",
    statuteCite: "KRS ch. 316 and 201 KAR ch. 15 (Board of Embalmers and Funeral Directors) contain no embalming or refrigeration time requirement (reviewed in full)",
  },
  {
    code: "LA",
    state: "Louisiana",
    rule: "embalm-or-refrigerate-after-hours",
    hoursThreshold: 30,
    summary: "Louisiana's Sanitary Code requires that a body that is not embalmed or refrigerated be buried, cremated, or otherwise disposed of within 30 hours after death; its explicit 45-degrees-Fahrenheit continuous-refrigeration mandate applies to unembalmed bodies held longer than 30 hours in the custody of a Louisiana licensed hospital, medical school, the Louisiana Anatomical Board, or a coroner (and a body may not be transported out of state more than 24 hours after death unless embalmed or cremated).",
    statuteCite: "La. Admin. Code tit. 51, § XXVI-103",
  },
  {
    code: "ME",
    state: "Maine",
    rule: "refrigerate-or-embalm-cemetery-or-transport-only",
    summary: "Maine sets no time limit requiring embalming or refrigeration of a body awaiting disposition; embalming is required only for bodies shipped by common carrier, and even then the rule lets bodies that cannot be embalmed (or are decomposing) ship in a container designed to prevent the escape of fluids or odors. Separately, the funeral board requires unembalmed remains in temporary storage to be kept in a sealed casket or container.",
    statuteCite: "10-146 C.M.R. ch. 1, § 4 (Transportation of Dead Bodies); see also 02-331 C.M.R. ch. 14, § 4",
  },
  {
    code: "MD",
    state: "Maryland",
    rule: "embalm-or-refrigerate-after-hours",
    hoursThreshold: 48,
    summary: "Maryland never requires embalming, but if an unembalmed body will be stored more than 48 hours before final disposition, the funeral establishment, crematory, or reduction facility holding it must keep it refrigerated.",
    statuteCite: "Md. Code Ann., Health-Gen. § 5-513",
  },
  {
    code: "MA",
    state: "Massachusetts",
    rule: "embalm-or-refrigerate-after-hours",
    hoursThreshold: 50,
    summary: "Massachusetts regulations require an unembalmed body that will be buried or cremated in-state to be kept at 34–39°F if disposition will not occur within 50 hours of death; only if those temperatures cannot be maintained must the body be embalmed, and even then the client can decline embalming in writing (except that a local board of health may order embalming in advanced-decomposition cases where public health is at issue).",
    statuteCite: "239 Mass. Code Regs. (CMR) 3.10(7)",
  },
  {
    code: "MI",
    state: "Michigan",
    rule: "other",
    hoursThreshold: 48,
    summary: "Michigan has no deadline requiring embalming or refrigeration of a body that remains where it is, but an unembalmed body generally may not be transported once 48 hours have passed since death — the state licensing agency reads this as requiring embalming whenever a body will not reach its place of final disposition within 48 hours, so in practice plan for burial, cremation, or embalming within that window.",
    statuteCite: "Mich. Admin. Code R 325.2 (with R 325.1); LARA CSCL guidance (June 26, 2018)",
  },
  {
    code: "MN",
    state: "Minnesota",
    rule: "embalm-or-refrigerate-after-hours",
    hoursThreshold: 72,
    summary: "Minnesota law requires a body to be embalmed, refrigerated, or packed in dry ice if final disposition will not be accomplished within 72 hours after death or release of the body, and it caps refrigeration at six calendar days and dry ice at four.",
    statuteCite: "Minn. Stat. § 149A.91, subd. 3",
  },
  {
    code: "MS",
    state: "Mississippi",
    rule: "embalm-or-refrigerate-after-hours",
    hoursThreshold: 48,
    summary: "Mississippi health regulations require a body to be buried, cremated, or otherwise disposed of within 48 hours of death unless it has been embalmed by a licensed embalmer or is kept under refrigeration.",
    statuteCite: "Miss. Admin. Code tit. 15, pt. 5, subpt. 85, R. 4.6.3 (15 Miss. Code R. § 5-85-4.6.3)",
  },
  {
    code: "MO",
    state: "Missouri",
    rule: "embalm-or-refrigerate-after-hours",
    hoursThreshold: 24,
    summary: "Missouri regulations prohibit a licensed funeral establishment from holding an unembalmed body longer than 24 hours unless it is refrigerated at 40°F or cooler or encased in an airtight, hermetically sealed metal casket or container.",
    statuteCite: "Mo. Code Regs. tit. 20, § 2120-2.070(16) (20 CSR 2120-2.070)",
  },
  {
    code: "MT",
    state: "Montana",
    rule: "refrigerate-or-embalm-cemetery-or-transport-only",
    summary: "Montana has no general time limit for keeping an unembalmed body; embalming or refrigeration (35°F or colder) is required only for transportation — by common carrier if the body is en route more than 8 hours or arrives more than 36 hours after death, or by private vehicle if it arrives more than 48 hours after death.",
    statuteCite: "Mont. Admin. R. 37.116.103",
  },
  {
    code: "NE",
    state: "Nebraska",
    rule: "embalm-or-refrigerate-after-hours",
    hoursThreshold: 24,
    summary: "Nebraska requires a licensed funeral establishment, within 24 hours of receiving a body, to bury, cremate, embalm, place it in refrigerated storage (below 40°F, for up to 8 days), or place it in a hermetically sealed container.",
    statuteCite: "172 Neb. Admin. Code ch. 68, § 006.04(A) (24-hour rule) and § 006.04(A)(i) (refrigeration below 40°F, max 8 days)",
  },
  {
    code: "NV",
    state: "Nevada",
    rule: "embalm-or-refrigerate-after-hours",
    hoursThreshold: 24,
    summary: "Nevada requires a funeral establishment, crematory, or direct cremation facility to embalm a body or refrigerate it at no more than 42°F within 24 hours of receiving it (NAC 451.015), and separately prohibits any crematory, funeral home, cemetery, or other place that accepts human remains for disposition from requiring embalming or other preparation before disposition, subject to narrow health/board-authorized exceptions (NRS 451.065).",
    statuteCite: "Nev. Admin. Code (NAC) 451.015",
  },
  {
    code: "NH",
    state: "New Hampshire",
    rule: "embalm-or-refrigerate-after-hours",
    hoursThreshold: 48,
    summary: "New Hampshire requires that if final disposition has not occurred within 48 hours after a funeral home takes physical custody of a body, the body must be embalmed, kept at a temperature under 40°F, or encased in a closed container that prevents leakage — a rule that applies to funeral-home custody, not home funerals.",
    statuteCite: "N.H. Rev. Stat. Ann. (RSA) 325:40-b",
  },
  {
    code: "NJ",
    state: "New Jersey",
    rule: "embalm-or-refrigerate-after-hours",
    hoursThreshold: 48,
    summary: "New Jersey requires that a body not remain unburied or uncremated for more than 48 hours unless it is embalmed or kept refrigerated at 45°F or below.",
    statuteCite: "N.J. Admin. Code § 8:9-1.1",
  },
  {
    code: "NM",
    state: "New Mexico",
    rule: "embalm-or-refrigerate-after-hours",
    hoursThreshold: 24,
    summary: "New Mexico requires a body not disposed of within 24 hours after death (or after the funeral establishment or crematory receives it) to be either embalmed or kept under refrigeration, which board rules set at 40 degrees Fahrenheit or below.",
    statuteCite: "N.M. Stat. Ann. § 61-32-20(A); N.M. Admin. Code 16.64.4.12",
  },
  {
    code: "NY",
    state: "New York",
    rule: "no-time-rule",
    summary: "New York never requires embalming and sets no hour deadline for refrigerating an unembalmed body; state law requires burial, cremation, or natural organic reduction within a reasonable time after death, plus a disposition permit before a body is held more than 72 hours — and deaths in New York City carry a separate four-day disposition deadline.",
    statuteCite: "N.Y. Pub. Health Law §§ 4200(1), 4144; NYC Health Code § 205.13",
  },
  {
    code: "NC",
    state: "North Carolina",
    rule: "other",
    hoursThreshold: 24,
    summary: "North Carolina never requires embalming, but funeral establishments and crematories must refrigerate a body at 40 degrees Fahrenheit or below unless final disposition will occur within 24 hours of taking custody (the current statute names refrigeration as the required care and does not list embalming as an exception).",
    statuteCite: "N.C. Gen. Stat. § 90-210.27A(l)",
  },
  {
    code: "ND",
    state: "North Dakota",
    rule: "refrigerate-or-embalm-cemetery-or-transport-only",
    hoursThreshold: 48,
    summary: "North Dakota's embalm-or-refrigerate clock appears only in the burial-transit/transportation regulation — an unembalmed body may be moved to its place of final disposition if it arrives within 48 hours of death, or within 72 hours if refrigerated at 38 to 40 degrees Fahrenheit, beyond which it must be embalmed (with mandatory embalming for six listed communicable diseases); separately, N.D.C.C. § 23-06-04 requires final disposition within eight days but imposes no embalming or refrigeration duty.",
    statuteCite: "N.D. Admin. Code 33-06-15-01",
  },
  {
    code: "OH",
    state: "Ohio",
    rule: "embalm-or-refrigerate-after-hours",
    hoursThreshold: 48,
    summary: "Ohio prohibits anyone from holding a body more than 48 hours after death before final disposition unless it is embalmed or kept refrigerated at a constant temperature below 40 degrees Fahrenheit.",
    statuteCite: "Ohio Rev. Code § 4717.13(A)(10)",
  },
  {
    code: "OK",
    state: "Oklahoma",
    rule: "embalm-or-refrigerate-after-hours",
    hoursThreshold: 24,
    summary: "Oklahoma requires an unembalmed body to be buried or cremated within 24 hours of death unless it is kept refrigerated at 40°F or below (with embalming or disposition required within 8 hours once removed from refrigeration).",
    statuteCite: "Okla. Admin. Code § 235:10-11-1(a)(13)",
  },
  {
    code: "OR",
    state: "Oregon",
    rule: "embalm-or-refrigerate-after-hours",
    hoursThreshold: 24,
    summary: "Oregon requires that a body held longer than 24 hours be either embalmed or refrigerated at 36°F or below until final disposition, and final disposition must occur within ten days after a funeral establishment takes possession.",
    statuteCite: "Or. Admin. R. 830-030-0010(1), (4)",
  },
  {
    code: "PA",
    state: "Pennsylvania",
    rule: "embalm-or-refrigerate-after-hours",
    hoursThreshold: 24,
    summary: "Pennsylvania requires that a body held more than 24 hours after death be embalmed, refrigerated (at 35–40°F), or sealed in a container that will not allow fumes or odors to escape, unless that conflicts with a religious belief or medical examination.",
    statuteCite: "49 Pa. Code § 13.201(6)(i)-(ii)",
  },
  {
    code: "RI",
    state: "Rhode Island",
    rule: "embalm-or-refrigerate-after-hours",
    hoursThreshold: 48,
    summary: "Rhode Island prohibits holding a body more than 48 hours without either embalming or refrigeration.",
    statuteCite: "216-RICR-40-05-25 § 25.5.6(B)",
  },
  {
    code: "SC",
    state: "South Carolina",
    rule: "no-time-rule",
    summary: "South Carolina law sets no time limit requiring embalming or refrigeration of an unembalmed body, and its cremation statute expressly forbids crematories from refusing remains because they are not embalmed.",
    statuteCite: "S.C. Code Ann. § 32-8-340(C) (no embalm/refrigerate time rule found in statute or regulation)",
  },
  {
    code: "SD",
    state: "South Dakota",
    rule: "embalm-or-refrigerate-after-hours",
    hoursThreshold: 24,
    summary: "South Dakota requires that within 24 hours of death the body be refrigerated, embalmed, or buried, unless a court order or a coroner's written directive allows otherwise.",
    statuteCite: "S.D. Admin. R. 20:45:02:07",
  },
  {
    code: "TN",
    state: "Tennessee",
    rule: "no-time-rule",
    summary: "Tennessee has no statute or regulation requiring embalming or refrigeration of a body within a set time after death; the only hour-based rule applies at crematories, which must refrigerate an unembalmed body they hold for eight hours or longer.",
    statuteCite: "Tenn. Code Ann. § 62-5-507(b)(1) (crematory-facility duty only; no general time rule exists in Tenn. Code Ann. tit. 62, ch. 5 or Tenn. Comp. R. & Regs. ch. 0660-11)",
  },
  {
    code: "TX",
    state: "Texas",
    rule: "embalm-or-refrigerate-after-hours",
    hoursThreshold: 24,
    summary: "Texas requires that a body held or in transit more than 24 hours after death, pending final disposition, be embalmed, kept refrigerated at 34-40 degrees Fahrenheit, or encased in a container that prevents seepage of fluid and escape of odors.",
    statuteCite: "25 Tex. Admin. Code § 181.4",
  },
  {
    code: "UT",
    state: "Utah",
    rule: "embalm-or-refrigerate-after-hours",
    hoursThreshold: 24,
    summary: "Utah requires that a body held more than 24 hours after death, pending final disposition, be embalmed or kept refrigerated at 40 degrees Fahrenheit or below.",
    statuteCite: "Utah Admin. Code R436-8-4",
  },
  {
    code: "VT",
    state: "Vermont",
    rule: "no-time-rule",
    summary: "Vermont law never requires embalming and sets no deadline by which an unembalmed body must be embalmed or refrigerated; the state Health Department confirms embalming is not required by law.",
    statuteCite: "18 V.S.A. ch. 107 (§§ 5201 et seq.) — the disposition chapter contains no embalming or refrigeration deadline, and neither do the Board of Funeral Service administrative rules",
  },
  {
    code: "VA",
    state: "Virginia",
    rule: "embalm-or-refrigerate-after-hours",
    hoursThreshold: 48,
    summary: "Virginia requires a funeral establishment storing a body for more than 48 hours before disposition to keep it refrigerated at about 40 degrees Fahrenheit or embalmed, and it may not embalm without the next of kin's express permission or a court order.",
    statuteCite: "Va. Code § 54.1-2811.1(B); see also 18 VAC 65-20-581",
  },
  {
    code: "WA",
    state: "Washington",
    rule: "embalm-or-refrigerate-after-hours",
    hoursThreshold: 24,
    summary: "Washington requires funeral directors, embalmers, and others preparing remains for final disposition to refrigerate or embalm the remains upon receipt, but refrigeration may be delayed up to 24 hours for washing, viewing, praying over, or otherwise accompanying the deceased at the family's direction.",
    statuteCite: "Wash. Admin. Code (WAC) 246-500-030",
  },
  {
    code: "WV",
    state: "West Virginia",
    rule: "no-time-rule",
    summary: "West Virginia law sets no deadline requiring an unembalmed body to be embalmed or refrigerated; the funeral board's rules bar embalming without permission from the authorized person (with a narrow exception letting a home embalm an unclaimed body after 12 hours of failed contact attempts or on health-officer certification of contagious disease), and impose no hour-based care-of-body requirement.",
    statuteCite: "Reviewed W. Va. Code R. §§ 6-1-6 (control of dead bodies), 6-1-7 (health requirements), 6-1-14 (equipment), 6-1-26 (unclaimed remains) and W. Va. Code ch. 30, art. 6; no embalm-or-refrigerate time rule exists in them (reviewed in full)",
  },
  {
    code: "WI",
    state: "Wisconsin",
    rule: "refrigerate-or-embalm-cemetery-or-transport-only",
    summary: "Wisconsin has no hour-based embalming or refrigeration requirement; embalming is required only when a body will be shipped by common carrier, and even then not if embalming is impossible, the body is donated for research, or the immediate family objects on religious grounds.",
    statuteCite: "Wis. Admin. Code DHS § 135.05(1)(c)-(d)",
  },
  {
    code: "WY",
    state: "Wyoming",
    rule: "embalm-or-refrigerate-after-hours",
    hoursThreshold: 36,
    summary: "Wyoming requires a funeral service practitioner or funeral director in possession of a body to have it refrigerated, embalmed, buried, cremated, or chemically disposed of within 36 hours after receiving it.",
    statuteCite: "Wyo. Bd. of Funeral Serv. Practitioners Rules ch. 4, § 5 (035-4 Wyo. Code R. § 4-5, \"Requirement for Cremation, Chemical Disposition, Burial, Embalming or Refrigeration\")",
  },
];

export function ruleForState(code: string): StateBodyCareRow | undefined {
  const c = code.trim().toUpperCase();
  return VERIFIED_RULES.find((r) => r.code === c);
}
