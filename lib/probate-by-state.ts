/**
 * State-by-state probate basics for the top 10 US states by population.
 *
 * This is general guidance, not legal advice. State rules change; see
 * each state's probate-court website (linked per state) for current
 * thresholds and forms.
 *
 * TODO-FD: review thresholds and timelines against current state code
 * before sister sends this to a real family.
 */

export interface StateProbateGuide {
  /** Lowercase URL-safe slug, e.g. "california". */
  slug: string;
  /** Display name. */
  name: string;
  /** State abbreviation. */
  abbr: string;
  /** Small-estate threshold (USD). NULL = state has no small-estate path. */
  smallEstateThresholdUSD: number | null;
  /** Plain-English description of the small-estate process. */
  smallEstateProcess: string;
  /** Typical timeline for full probate (calendar months). */
  typicalTimelineMonths: { low: number; high: number };
  /** Are there any expedited / informal probate options? */
  informalProbateAvailable: boolean;
  /** Does the state require a probate attorney for full probate? */
  attorneyRequiredForProbate: boolean;
  /** Notable quirks the family should know about. */
  notableQuirks: string[];
  /** Key forms the executor will need. */
  keyForms: { name: string; description: string }[];
  /** Where to look up actual current rules (state probate court / bar). */
  authoritativeSources: { label: string; url: string }[];
  /** Is this a community-property state? Affects spouse inheritance. */
  isCommunityPropertyState: boolean;
}

export const STATE_GUIDES: StateProbateGuide[] = [
  {
    slug: "california",
    name: "California",
    abbr: "CA",
    smallEstateThresholdUSD: 184_500,
    smallEstateProcess:
      "If the gross value of the estate is $184,500 or less, the family can use a Small Estate Affidavit (Probate Code §13100) to collect personal property without opening probate. For real estate, there's a separate Affidavit re Real Property of Small Value when the property is $61,500 or less. Wait 40 days after death before filing.",
    typicalTimelineMonths: { low: 9, high: 18 },
    informalProbateAvailable: false,
    attorneyRequiredForProbate: false,
    notableQuirks: [
      "California is a community-property state — half of property acquired during marriage goes to the surviving spouse automatically.",
      "Probate is famously slow and expensive in CA. Statutory attorney + executor fees are based on a sliding scale of gross estate value (4% on first $100k, 3% on next $100k, etc.) — these add up fast.",
      "The Spousal/Domestic Partner Property Petition (Probate Code §13650) is faster than full probate when assets pass to a spouse.",
      "Since 2020, California allows transfer-on-death deeds for real estate — a way to bypass probate entirely if set up before death.",
    ],
    keyForms: [
      {
        name: "DE-111 — Petition for Probate",
        description:
          "The form that opens a probate case. Filed with Superior Court in the county where the deceased lived.",
      },
      {
        name: "DE-160 — Inventory and Appraisal",
        description:
          "Lists every asset in the estate. Filed within 4 months of opening probate.",
      },
      {
        name: "Small Estate Affidavit (Probate Code §13100)",
        description:
          "For estates under $184,500. Bypass full probate.",
      },
    ],
    authoritativeSources: [
      {
        label: "California Courts — Wills, estates, and probate",
        url: "https://selfhelp.courts.ca.gov/wills-estates-probate",
      },
      {
        label: "California Probate Code §13100 (small estates)",
        url: "https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?lawCode=PROB&division=8.&title=&part=1.&chapter=3.&article=1.",
      },
    ],
    isCommunityPropertyState: true,
  },
  {
    slug: "texas",
    name: "Texas",
    abbr: "TX",
    smallEstateThresholdUSD: 75_000,
    smallEstateProcess:
      "Texas has multiple small-estate paths. The Small Estate Affidavit (Estates Code §205) works when the estate (excluding homestead and exempt property) is $75,000 or less, there's no will, and the family meets specific conditions. Wait 30 days after death.",
    typicalTimelineMonths: { low: 6, high: 12 },
    informalProbateAvailable: true,
    attorneyRequiredForProbate: true,
    notableQuirks: [
      "Texas is a community-property state.",
      "Texas REQUIRES an attorney for full probate — most states don't.",
      "Texas offers 'independent administration,' which is faster and less court-supervised than dependent administration. Most wills include the magic words 'independent executor' to enable this.",
      "If there's no will, the heirs can agree to independent administration, but it requires unanimous consent.",
      "Muniment of Title — a Texas-specific procedure that lets a will be probated as evidence of title transfer without full administration. Useful when the only assets are real estate.",
    ],
    keyForms: [
      {
        name: "Application for Probate of Will and Issuance of Letters Testamentary",
        description: "Opens probate when there's a will.",
      },
      {
        name: "Application for Letters of Administration",
        description: "Opens probate when there's no will.",
      },
      {
        name: "Small Estate Affidavit (Estates Code §205)",
        description:
          "For estates ≤$75,000 (excluding homestead). No will required.",
      },
    ],
    authoritativeSources: [
      {
        label: "Texas Law Help — Probate",
        url: "https://texaslawhelp.org/probate-wills-estate-planning",
      },
      {
        label: "State Bar of Texas — Probate guide",
        url: "https://www.texasbar.com/AM/Template.cfm?Section=Free_Legal_Information2",
      },
    ],
    isCommunityPropertyState: true,
  },
  {
    slug: "florida",
    name: "Florida",
    abbr: "FL",
    smallEstateThresholdUSD: 75_000,
    smallEstateProcess:
      "Florida has 'summary administration' for estates under $75,000 (excluding exempt property) OR when the deceased has been gone for more than 2 years. Faster and cheaper than formal administration. Filed in the county where the deceased lived.",
    typicalTimelineMonths: { low: 6, high: 12 },
    informalProbateAvailable: true,
    attorneyRequiredForProbate: true,
    notableQuirks: [
      "Florida REQUIRES an attorney for formal probate; not for summary administration in some cases.",
      "Florida has very strong homestead protections — the family home passes to the surviving spouse and lineal descendants regardless of what the will says.",
      "Florida does NOT have a state estate tax.",
      "Disposition of personal property without administration: for very small estates (no real estate), if assets are only enough to cover funeral expenses + 60 days of last illness expenses, no probate is needed.",
      "Beneficiary designations on accounts (TOD/POD) bypass probate entirely. Common Florida estate-planning move.",
    ],
    keyForms: [
      {
        name: "Petition for Summary Administration",
        description: "For small estates under $75,000.",
      },
      {
        name: "Petition for Administration",
        description: "Opens formal probate.",
      },
      {
        name: "Disposition of Personal Property Without Administration",
        description:
          "For very small estates with only funeral/last-illness expenses owed.",
      },
    ],
    authoritativeSources: [
      {
        label: "Florida Bar — Probate consumer pamphlet",
        url: "https://www.floridabar.org/public/consumer/pamphlet026/",
      },
      {
        label: "Florida Statutes Chapter 735 — Probate Code",
        url: "https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0700-0799/0735/0735.html",
      },
    ],
    isCommunityPropertyState: false,
  },
  {
    slug: "new-york",
    name: "New York",
    abbr: "NY",
    smallEstateThresholdUSD: 50_000,
    smallEstateProcess:
      "New York's 'voluntary administration' (Article 13 of the Surrogate's Court Procedure Act) handles personal property up to $50,000 when there's no real estate. Filed in Surrogate's Court in the county where the deceased lived.",
    typicalTimelineMonths: { low: 7, high: 14 },
    informalProbateAvailable: false,
    attorneyRequiredForProbate: false,
    notableQuirks: [
      "New York processes probate through Surrogate's Court (not regular probate court).",
      "New York has a state estate tax for estates over $7.16M (2025). The 'cliff' is steep: just over the threshold means the entire estate is taxed, not just the excess.",
      "If a will exists, the original document must be filed — copies are insufficient. Lost wills are extremely difficult to prove in NY.",
      "Real estate generally must go through full probate even when other assets fit small estate.",
    ],
    keyForms: [
      {
        name: "Voluntary Administration Affidavit",
        description: "Article 13 small-estate process.",
      },
      {
        name: "Petition for Probate",
        description: "Filed in Surrogate's Court.",
      },
      {
        name: "Letters Testamentary / Letters of Administration",
        description:
          "Issued by the court to authorize the executor/administrator.",
      },
    ],
    authoritativeSources: [
      {
        label: "NY Courts — Surrogate's Court",
        url: "https://ww2.nycourts.gov/courts/nyc/surrogates/index.shtml",
      },
      {
        label: "New York State Bar — Probate basics",
        url: "https://nysba.org/probate",
      },
    ],
    isCommunityPropertyState: false,
  },
  {
    slug: "pennsylvania",
    name: "Pennsylvania",
    abbr: "PA",
    smallEstateThresholdUSD: 50_000,
    smallEstateProcess:
      "Pennsylvania allows a Small Estate Petition for personal property up to $50,000 (excluding real estate, payments to family for last illness, and family allowance). Filed with the Register of Wills in the county where the deceased lived.",
    typicalTimelineMonths: { low: 6, high: 12 },
    informalProbateAvailable: true,
    attorneyRequiredForProbate: false,
    notableQuirks: [
      "Pennsylvania has a state inheritance tax — 0% to spouse, 4.5% to lineal descendants (kids, grandkids), 12% to siblings, 15% to others. Due 9 months after death.",
      "Probate happens through the Register of Wills, then the Orphans' Court Division if disputes arise.",
      "PA recognizes holographic (handwritten) wills if entirely in the deceased's handwriting.",
      "Joint property with right of survivorship is NOT subject to inheritance tax for spouses but IS for non-spouse joint owners.",
    ],
    keyForms: [
      {
        name: "Petition for Probate / Grant of Letters",
        description: "Opens probate.",
      },
      {
        name: "Pennsylvania Inheritance Tax Return (REV-1500)",
        description:
          "Required for almost every estate. Due 9 months from death.",
      },
      {
        name: "Small Estate Petition",
        description: "For personal property under $50,000.",
      },
    ],
    authoritativeSources: [
      {
        label: "PA Department of Revenue — Inheritance tax",
        url: "https://www.revenue.pa.gov/TaxTypes/InheritanceTax/Pages/default.aspx",
      },
      {
        label: "Pennsylvania Bar — Estate planning",
        url: "https://www.pabar.org/public/protectingyourfamily/index.asp",
      },
    ],
    isCommunityPropertyState: false,
  },
  {
    slug: "illinois",
    name: "Illinois",
    abbr: "IL",
    smallEstateThresholdUSD: 100_000,
    smallEstateProcess:
      "Illinois has a Small Estate Affidavit for personal property up to $100,000 (excluding real estate). Filed by the affiant — usually a surviving spouse or adult child — without going through court.",
    typicalTimelineMonths: { low: 7, high: 14 },
    informalProbateAvailable: true,
    attorneyRequiredForProbate: false,
    notableQuirks: [
      "Illinois has a state estate tax for estates over $4M. Steep cliff like New York's.",
      "Probate happens in the Circuit Court of the county where the deceased lived.",
      "Independent administration is available when the will allows it or all heirs consent — significantly faster than supervised administration.",
      "Surviving spouse is entitled to a $20,000 award + $10,000 per dependent child as a 'family allowance' that takes priority over creditors.",
    ],
    keyForms: [
      {
        name: "Petition for Letters Testamentary / of Administration",
        description: "Opens probate.",
      },
      {
        name: "Small Estate Affidavit",
        description:
          "For estates under $100,000 personal property, no real estate.",
      },
      {
        name: "Inventory of the estate",
        description:
          "Filed within 60 days. Lists every asset.",
      },
    ],
    authoritativeSources: [
      {
        label: "Illinois Courts — Probate",
        url: "https://www.illinoiscourts.gov/services/representing-yourself/family-and-personal-matters/death-of-a-loved-one",
      },
      {
        label: "Illinois Probate Act",
        url: "https://www.ilga.gov/legislation/ilcs/ilcs5.asp?ActID=2104",
      },
    ],
    isCommunityPropertyState: false,
  },
  {
    slug: "ohio",
    name: "Ohio",
    abbr: "OH",
    smallEstateThresholdUSD: 35_000,
    smallEstateProcess:
      "Ohio's Release From Administration handles estates under $35,000 (or under $100,000 if everything passes to a surviving spouse). Faster than full administration. Filed in Probate Court in the county where the deceased lived.",
    typicalTimelineMonths: { low: 6, high: 12 },
    informalProbateAvailable: true,
    attorneyRequiredForProbate: false,
    notableQuirks: [
      "Ohio's small-estate threshold is unusually low at $35,000 unless transferring entirely to a spouse.",
      "Summary release from administration: even smaller estate process for estates ≤$5,000 used only for funeral expenses.",
      "Ohio repealed its state estate tax in 2013.",
      "Probate Court handles it; each county has its own court forms (not always identical to the state's).",
    ],
    keyForms: [
      {
        name: "Application to Probate Will",
        description: "Opens probate when there's a will.",
      },
      {
        name: "Application for Release From Administration",
        description: "For small estates under $35,000.",
      },
      {
        name: "Inventory and Appraisal",
        description: "Required within 3 months of opening probate.",
      },
    ],
    authoritativeSources: [
      {
        label: "Ohio Supreme Court — Probate forms",
        url: "https://www.supremecourt.ohio.gov/JCS/CFC/probateForms/",
      },
      {
        label: "Ohio State Bar — Probate guide",
        url: "https://www.ohiobar.org/public-resources/commonly-asked-law-questions-results/law-you-can-use/the-probate-process/",
      },
    ],
    isCommunityPropertyState: false,
  },
  {
    slug: "georgia",
    name: "Georgia",
    abbr: "GA",
    smallEstateThresholdUSD: 25_000,
    smallEstateProcess:
      "Georgia has limited small-estate options. The 'No Administration Necessary' procedure works when all heirs agree, there's no will, and no creditors require formal administration. For modest estates with cooperative heirs, this can avoid probate entirely.",
    typicalTimelineMonths: { low: 6, high: 12 },
    informalProbateAvailable: true,
    attorneyRequiredForProbate: false,
    notableQuirks: [
      "Georgia has no state estate tax.",
      "Probate happens in Probate Court, which exists in every county.",
      "Year's Support — a Georgia-specific procedure that lets a surviving spouse and minor children claim support from the estate that takes priority over creditors. Often used to keep the family home.",
      "Solemn form vs common form probate: solemn form requires notice to all heirs and is harder to challenge; common form is faster but can be challenged for years afterward.",
    ],
    keyForms: [
      {
        name: "Petition to Probate Will (solemn or common form)",
        description: "Opens probate when there's a will.",
      },
      {
        name: "Petition for No Administration Necessary",
        description: "When heirs agree and no full probate is needed.",
      },
      {
        name: "Year's Support Petition",
        description: "Spouse/minor children claim from the estate.",
      },
    ],
    authoritativeSources: [
      {
        label: "Georgia Probate Court Standard Forms",
        url: "https://gaprobate.gov/forms",
      },
      {
        label: "Georgia State Bar — Probate basics",
        url: "https://www.gabar.org/forthepublic/upload/probateinformationbrochure.pdf",
      },
    ],
    isCommunityPropertyState: false,
  },
  {
    slug: "north-carolina",
    name: "North Carolina",
    abbr: "NC",
    smallEstateThresholdUSD: 20_000,
    smallEstateProcess:
      "North Carolina's Small Estate Affidavit handles personal property up to $20,000 ($30,000 if everything passes to surviving spouse). Wait 30 days after death before filing. Filed with the Clerk of Superior Court.",
    typicalTimelineMonths: { low: 6, high: 12 },
    informalProbateAvailable: true,
    attorneyRequiredForProbate: false,
    notableQuirks: [
      "North Carolina's threshold is among the lowest at $20,000.",
      "NC has no state estate tax.",
      "Summary administration is available for estates passing entirely to a surviving spouse — bypasses normal probate.",
      "Year's allowance: surviving spouse gets $60,000 + $5,000 per minor child as a priority claim against the estate.",
    ],
    keyForms: [
      {
        name: "Application for Probate and Letters",
        description: "Opens probate.",
      },
      {
        name: "Affidavit for Collection of Personal Property",
        description: "Small estate process under $20,000 / $30,000.",
      },
      {
        name: "AOC-E-202 — 90-Day Inventory",
        description: "Filed within 90 days of qualifying as executor.",
      },
    ],
    authoritativeSources: [
      {
        label: "NC Courts — Estates",
        url: "https://www.nccourts.gov/help-topics/wills-and-estates",
      },
      {
        label: "NC General Statutes Chapter 28A — Administration of Decedents' Estates",
        url: "https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/ByChapter/Chapter_28A.html",
      },
    ],
    isCommunityPropertyState: false,
  },
  {
    slug: "michigan",
    name: "Michigan",
    abbr: "MI",
    smallEstateThresholdUSD: 28_000,
    smallEstateProcess:
      "Michigan's Small Estate Affidavit (technically 'Petition and Order for Assignment') handles estates ≤$28,000 (2025; adjusted annually for inflation). Wait 28 days after death. Filed with the Probate Court.",
    typicalTimelineMonths: { low: 6, high: 12 },
    informalProbateAvailable: true,
    attorneyRequiredForProbate: false,
    notableQuirks: [
      "Michigan has 'unsupervised' probate (informal) and 'supervised' probate (formal). Most estates use unsupervised.",
      "Michigan has no state estate tax.",
      "Lady Bird deeds (enhanced life estate deeds) are a popular Michigan estate-planning tool — they let real estate pass to a beneficiary at death without probate.",
      "The small-estate threshold adjusts for inflation — check current year's number on the Michigan court site.",
    ],
    keyForms: [
      {
        name: "PC-558 — Petition and Order for Assignment (Small Estate)",
        description: "Small estate process.",
      },
      {
        name: "PC-559 — Application for Informal Probate",
        description: "Unsupervised probate.",
      },
      {
        name: "PC-577 — Inventory",
        description: "Filed within 91 days of appointment.",
      },
    ],
    authoritativeSources: [
      {
        label: "Michigan Courts — Probate forms",
        url: "https://www.courts.michigan.gov/administration/special-initiatives/forms/",
      },
      {
        label: "Michigan Estates and Protected Individuals Code (EPIC)",
        url: "http://www.legislature.mi.gov/(S(0))/mileg.aspx?page=getobject&objectname=mcl-act-386-of-1998",
      },
    ],
    isCommunityPropertyState: false,
  },
];

export function getStateGuide(slug: string): StateProbateGuide | undefined {
  return STATE_GUIDES.find((s) => s.slug === slug);
}

export function listStateSlugs(): string[] {
  return STATE_GUIDES.map((s) => s.slug);
}
