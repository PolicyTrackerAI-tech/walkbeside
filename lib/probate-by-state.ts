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
  {
    slug: "new-jersey",
    name: "New Jersey",
    abbr: "NJ",
    smallEstateThresholdUSD: 50_000,
    smallEstateProcess:
      "When the estate is $50,000 or less and there's no will, the surviving spouse or domestic partner can file an Affidavit of Surviving Spouse to collect assets. If there's no spouse, heirs can use a similar affidavit at $20,000 or less. New Jersey has no formal small-estate threshold for testate (with-will) cases — those typically still need probate.",
    typicalTimelineMonths: { low: 9, high: 14 },
    informalProbateAvailable: false,
    attorneyRequiredForProbate: false,
    notableQuirks: [
      "Probate is handled by the County Surrogate's Court — NJ is one of the few states with a dedicated Surrogate.",
      "New Jersey has an inheritance tax (paid by certain beneficiaries based on relationship to the deceased) — Class A relatives (spouse, children, parents) are exempt; Class C and D pay 11–16%.",
      "Estate tax was repealed in 2018, but the inheritance tax remains.",
      "The Surrogate handles informal probate (uncontested wills, no challenges); contested matters go to the Superior Court Chancery Division.",
    ],
    keyForms: [
      {
        name: "Application for Probate (filed with Surrogate)",
        description: "Opens probate when there's a will.",
      },
      {
        name: "Affidavit of Surviving Spouse / Domestic Partner",
        description: "Small-estate path under $50,000 with no will.",
      },
      {
        name: "Inheritance Tax Return (Form IT-R or IT-NR)",
        description: "Required for non-Class-A beneficiaries within 8 months.",
      },
    ],
    authoritativeSources: [
      {
        label: "NJ Courts — Probate",
        url: "https://www.njcourts.gov/self-help/wills-estates",
      },
      {
        label: "NJ Division of Taxation — Inheritance Tax",
        url: "https://www.nj.gov/treasury/taxation/inheritance-estate/inheritance.shtml",
      },
    ],
    isCommunityPropertyState: false,
  },
  {
    slug: "virginia",
    name: "Virginia",
    abbr: "VA",
    smallEstateThresholdUSD: 50_000,
    smallEstateProcess:
      "Virginia's Small Estate Affidavit covers personal property up to $50,000 (excluding real estate and certain assets). Wait 60 days after death before filing. The successor presents the affidavit directly to banks, brokerage firms, or whoever holds the assets — no court filing required for the affidavit itself.",
    typicalTimelineMonths: { low: 6, high: 12 },
    informalProbateAvailable: true,
    attorneyRequiredForProbate: false,
    notableQuirks: [
      "Virginia has no state estate tax and no inheritance tax.",
      "Probate is handled by the Circuit Court Clerk in the county where the deceased lived — clerks often help walk executors through paperwork without an attorney.",
      "Real estate generally does NOT require probate to transfer if the will is properly recorded; Virginia uses 'probate' in a narrower sense than many states.",
      "The probate tax is a small percentage of estate value (around $1 per $1,000) — among the lowest in the country.",
    ],
    keyForms: [
      {
        name: "List of Heirs (Form CC-1611)",
        description: "Filed at probate to identify all legal heirs.",
      },
      {
        name: "Inventory (Form CC-1670)",
        description: "Filed within 4 months of qualifying as executor.",
      },
      {
        name: "Small Estate Affidavit (§64.2-601)",
        description: "Personal-property affidavit up to $50,000.",
      },
    ],
    authoritativeSources: [
      {
        label: "Virginia Courts — Probate",
        url: "https://www.vacourts.gov/courts/circuit/probate.html",
      },
      {
        label: "Virginia Code §64.2 — Wills, Trusts, and Fiduciaries",
        url: "https://law.lis.virginia.gov/vacode/title64.2/",
      },
    ],
    isCommunityPropertyState: false,
  },
  {
    slug: "washington",
    name: "Washington",
    abbr: "WA",
    smallEstateThresholdUSD: 100_000,
    smallEstateProcess:
      "Washington's Small Estate Affidavit (RCW 11.62) covers personal property up to $100,000 — among the highest thresholds in the country. The successor presents the affidavit to whoever holds the assets, 40+ days after death, no court filing required.",
    typicalTimelineMonths: { low: 6, high: 12 },
    informalProbateAvailable: true,
    attorneyRequiredForProbate: false,
    notableQuirks: [
      "Washington is a community-property state — half of all property acquired during marriage automatically belongs to the surviving spouse.",
      "Probate in Washington is generally faster and cheaper than most states — known for being executor-friendly.",
      "Most wills include 'nonintervention powers,' which lets the executor handle the estate with minimal court supervision after appointment.",
      "Washington has its own state estate tax that kicks in at $2.193 million (2024) — separate from the federal threshold.",
      "Community Property Agreements (CPA) — a Washington-specific document spouses can sign that automatically transfers all community property to the survivor without probate.",
    ],
    keyForms: [
      {
        name: "Petition for Probate of Will and Letters Testamentary",
        description: "Opens probate when there's a will.",
      },
      {
        name: "Small Estate Affidavit (RCW 11.62)",
        description: "Personal property up to $100,000.",
      },
      {
        name: "Notice to Creditors",
        description: "Published in a county newspaper; cuts the creditor claim window to 4 months.",
      },
    ],
    authoritativeSources: [
      {
        label: "Washington Courts — Probate",
        url: "https://www.courts.wa.gov/court_dir/?fa=court_dir.psearch",
      },
      {
        label: "RCW Title 11 — Probate and Trust",
        url: "https://app.leg.wa.gov/RCW/default.aspx?cite=11",
      },
    ],
    isCommunityPropertyState: true,
  },
  {
    slug: "arizona",
    name: "Arizona",
    abbr: "AZ",
    smallEstateThresholdUSD: 75_000,
    smallEstateProcess:
      "Arizona has two small-estate paths. Affidavit for personal property up to $75,000 (wait 30 days after death). Affidavit for real estate up to $100,000 (wait 6 months). Both are filed directly with whoever holds the asset (or recorded with the county for real estate) — no probate court required.",
    typicalTimelineMonths: { low: 6, high: 12 },
    informalProbateAvailable: true,
    attorneyRequiredForProbate: false,
    notableQuirks: [
      "Arizona is a community-property state.",
      "Arizona has no state estate tax and no inheritance tax.",
      "Informal probate is the default for uncontested estates — the Registrar (a court clerk) approves the application without a hearing.",
      "Beneficiary deeds (transfer-on-death) for real estate are recognized — record one before death and the property bypasses probate entirely.",
    ],
    keyForms: [
      {
        name: "Application for Informal Probate",
        description: "Standard path for uncontested estates.",
      },
      {
        name: "Affidavit for Collection of Personal Property",
        description: "Small estate up to $75,000.",
      },
      {
        name: "Affidavit for Transfer of Real Property",
        description: "Real estate up to $100,000.",
      },
    ],
    authoritativeSources: [
      {
        label: "Arizona Courts — Probate self-help",
        url: "https://www.azcourts.gov/selfservicecenter/Self-Service-Forms/Probate-PB",
      },
      {
        label: "Arizona Revised Statutes Title 14 — Probate",
        url: "https://www.azleg.gov/arsDetail/?title=14",
      },
    ],
    isCommunityPropertyState: true,
  },
  {
    slug: "massachusetts",
    name: "Massachusetts",
    abbr: "MA",
    smallEstateThresholdUSD: 25_000,
    smallEstateProcess:
      "Massachusetts Voluntary Administration (G.L. c. 190B §3-1201) is available when the estate (excluding one motor vehicle) is $25,000 or less and there's no real property. Wait 30 days after death. Filed with Probate and Family Court.",
    typicalTimelineMonths: { low: 9, high: 14 },
    informalProbateAvailable: true,
    attorneyRequiredForProbate: false,
    notableQuirks: [
      "Massachusetts has its own state estate tax — kicks in at $2 million (2024) with rates up to 16%. Substantially lower threshold than the federal level.",
      "Probate is handled by the Probate and Family Court (one combined court for both kinds of cases).",
      "Massachusetts adopted the Uniform Probate Code in 2012 — informal probate (no hearing) is now the default for uncontested cases.",
      "The 'magistrate's hour' is a longstanding tradition — uncontested matters can often be resolved at a brief magistrate hearing rather than a full judge hearing.",
    ],
    keyForms: [
      {
        name: "MPC 150 — Petition for Informal Probate",
        description: "Standard path for uncontested estates with a will.",
      },
      {
        name: "MPC 170 — Voluntary Administration",
        description: "Small-estate path under $25,000.",
      },
      {
        name: "Estate Tax Return (Form M-706)",
        description: "Required if estate exceeds $2 million.",
      },
    ],
    authoritativeSources: [
      {
        label: "Massachusetts Courts — Probate forms",
        url: "https://www.mass.gov/info-details/probate-and-family-court-departmental-forms",
      },
      {
        label: "MGL Chapter 190B — Massachusetts Uniform Probate Code",
        url: "https://malegislature.gov/Laws/GeneralLaws/PartII/TitleII/Chapter190B",
      },
    ],
    isCommunityPropertyState: false,
  },
  {
    slug: "tennessee",
    name: "Tennessee",
    abbr: "TN",
    smallEstateThresholdUSD: 50_000,
    smallEstateProcess:
      "Tennessee's Small Estate Affidavit covers personal property up to $50,000 (Tenn. Code §30-4-101). Wait 45 days after death. Filed with the probate court of the county where the deceased lived.",
    typicalTimelineMonths: { low: 6, high: 12 },
    informalProbateAvailable: true,
    attorneyRequiredForProbate: false,
    notableQuirks: [
      "Tennessee has no state estate tax (repealed 2016) and no inheritance tax (repealed 2016).",
      "Probate is heard by the County Probate Court or Chancery Court depending on the county.",
      "Most counties have informal procedures for uncontested estates.",
      "Tennessee allows transfer-on-death (TOD) registration for real estate — recorded deed with TOD designation bypasses probate.",
    ],
    keyForms: [
      {
        name: "Petition to Probate Will",
        description: "Opens probate when there's a will.",
      },
      {
        name: "Small Estate Affidavit",
        description: "Personal property up to $50,000.",
      },
      {
        name: "Notice to Creditors",
        description: "Published; cuts creditor claim window to 4 months.",
      },
    ],
    authoritativeSources: [
      {
        label: "TN Courts — Probate",
        url: "https://www.tncourts.gov/help-center/legal-forms",
      },
      {
        label: "Tennessee Code Title 30 — Administration of Estates",
        url: "https://advance.lexis.com/container/?pdmfid=1000516&crid=&config=014CJAA5ZGVhZjA3NS02MmMzLTRlZWQtOGJjNC00YzQ1MmZlNzc2YWYKAFBvZENhdGFsb2e9zYpNUjTRaIWVfyrur9ud&pddocfullpath=%2Fshared%2Fdocument%2Fstatutes-legislation",
      },
    ],
    isCommunityPropertyState: false,
  },
  {
    slug: "indiana",
    name: "Indiana",
    abbr: "IN",
    smallEstateThresholdUSD: 100_000,
    smallEstateProcess:
      "Indiana's Small Estate Affidavit (IC 29-1-8) covers estates of $100,000 or less — raised from $50,000 in 2022. Wait 45 days after death. The successor presents the affidavit directly to whoever holds the asset, no probate court required.",
    typicalTimelineMonths: { low: 6, high: 12 },
    informalProbateAvailable: true,
    attorneyRequiredForProbate: false,
    notableQuirks: [
      "Indiana has no state estate tax (repealed 2013) and no inheritance tax (phased out by 2022).",
      "Indiana has 'unsupervised administration' as the default for most estates — the executor handles things with minimal court oversight when the will allows it.",
      "Transfer-on-death deeds are recognized for real estate.",
      "Indiana's small-estate threshold of $100,000 is among the most generous in the country.",
    ],
    keyForms: [
      {
        name: "Petition for Probate (with or without will)",
        description: "Opens probate.",
      },
      {
        name: "Small Estate Affidavit",
        description: "Personal and real property up to $100,000.",
      },
      {
        name: "Inventory and Appraisement",
        description: "Filed within 60 days of letters being issued.",
      },
    ],
    authoritativeSources: [
      {
        label: "Indiana Courts — Probate self-help",
        url: "https://www.in.gov/courts/iocs/2493.htm",
      },
      {
        label: "Indiana Code Title 29 — Probate",
        url: "https://iga.in.gov/laws/2024/ic/titles/29",
      },
    ],
    isCommunityPropertyState: false,
  },
  {
    slug: "maryland",
    name: "Maryland",
    abbr: "MD",
    smallEstateThresholdUSD: 50_000,
    smallEstateProcess:
      "Maryland has a Small Estate procedure for estates of $50,000 or less ($100,000 if everything passes to the surviving spouse). It's a formal court process — quicker than regular estate administration but still filed with the Register of Wills.",
    typicalTimelineMonths: { low: 9, high: 14 },
    informalProbateAvailable: false,
    attorneyRequiredForProbate: false,
    notableQuirks: [
      "Maryland has BOTH a state estate tax AND a state inheritance tax — one of the few states with both. Inheritance tax exempts close relatives but charges 10% on others.",
      "Probate is handled by the Register of Wills in each county — separate from the courts.",
      "Maryland uses a personal-representative system rather than executor/administrator distinctions.",
      "Modified Administration is available when all heirs and creditors agree — faster than regular administration.",
      "The Register of Wills office is unusually helpful with self-represented executors compared to most states.",
    ],
    keyForms: [
      {
        name: "Regular Estate Petition",
        description: "Opens probate for estates over $50,000.",
      },
      {
        name: "Small Estate Petition",
        description: "Estates $50,000 or less ($100k spouse-only).",
      },
      {
        name: "Modified Administration Election",
        description: "Faster path when heirs and creditors all agree.",
      },
    ],
    authoritativeSources: [
      {
        label: "Maryland Register of Wills",
        url: "https://registers.maryland.gov/",
      },
      {
        label: "Maryland Estates and Trusts Code",
        url: "https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=get&section=1-101&enactments=false",
      },
    ],
    isCommunityPropertyState: false,
  },
  {
    slug: "missouri",
    name: "Missouri",
    abbr: "MO",
    smallEstateThresholdUSD: 40_000,
    smallEstateProcess:
      "Missouri's Small Estate Affidavit (R.S.Mo. §473.097) handles estates of $40,000 or less (excluding exempt property). Wait 30 days after death. Filed with the probate division of the circuit court.",
    typicalTimelineMonths: { low: 9, high: 14 },
    informalProbateAvailable: true,
    attorneyRequiredForProbate: false,
    notableQuirks: [
      "Missouri has no state estate tax and no inheritance tax.",
      "Probate is heard by the Probate Division of the Circuit Court in each county.",
      "Missouri offers 'Refusal of Letters' for very small estates — surviving spouse or unpaid creditors can collect assets directly without opening any administration.",
      "Independent administration is available when all interested parties consent — minimizes court involvement.",
      "Beneficiary deeds are valid for real estate (transfer-on-death).",
    ],
    keyForms: [
      {
        name: "Petition for Letters Testamentary or of Administration",
        description: "Opens probate.",
      },
      {
        name: "Small Estate Affidavit",
        description: "Estates up to $40,000.",
      },
      {
        name: "Refusal of Letters",
        description: "Smallest estates — surviving spouse / creditor path.",
      },
    ],
    authoritativeSources: [
      {
        label: "Missouri Courts — Probate forms",
        url: "https://www.courts.mo.gov/page.jsp?id=525",
      },
      {
        label: "Missouri Revised Statutes Chapter 473 — Probate Code",
        url: "https://revisor.mo.gov/main/OneChapter.aspx?chapter=473",
      },
    ],
    isCommunityPropertyState: false,
  },
  {
    slug: "wisconsin",
    name: "Wisconsin",
    abbr: "WI",
    smallEstateThresholdUSD: 50_000,
    smallEstateProcess:
      "Wisconsin's Transfer by Affidavit (Wis. Stat. §867.03) handles estates of $50,000 or less. Wait 30 days after death. The successor presents the affidavit directly to whoever holds the asset, no court filing required.",
    typicalTimelineMonths: { low: 6, high: 12 },
    informalProbateAvailable: true,
    attorneyRequiredForProbate: false,
    notableQuirks: [
      "Wisconsin is a marital-property state (its version of community property — adopted 1986). Property acquired during marriage is generally split 50/50.",
      "Wisconsin has no state estate tax and no inheritance tax.",
      "Wisconsin offers 'Summary Settlement' for estates up to $50,000 in net value when the surviving spouse or minor children inherit — even faster than informal probate.",
      "Informal probate (uncontested cases handled by court Register in Probate without hearings) is the default.",
      "Transfer-on-death deeds are recognized for real estate.",
    ],
    keyForms: [
      {
        name: "PR-1801 — Application for Informal Administration",
        description: "Opens probate for uncontested estates.",
      },
      {
        name: "Transfer by Affidavit (PR-1831)",
        description: "Estates up to $50,000.",
      },
      {
        name: "Summary Settlement Petition",
        description: "Spouse / minor children path under $50,000.",
      },
    ],
    authoritativeSources: [
      {
        label: "Wisconsin Courts — Probate forms",
        url: "https://www.wicourts.gov/forms1/circuit/index.htm",
      },
      {
        label: "Wisconsin Statutes Chapters 851–882 — Probate",
        url: "https://docs.legis.wisconsin.gov/statutes/statutes/",
      },
    ],
    isCommunityPropertyState: true,
  },
  {
    slug: "colorado",
    name: "Colorado",
    abbr: "CO",
    smallEstateThresholdUSD: 80_000,
    smallEstateProcess:
      "Colorado's Collection of Personal Property by Affidavit (C.R.S. §15-12-1201) handles estates of $80,000 or less in personal property. Wait 10 days after death. The successor presents the affidavit directly to whoever holds the asset.",
    typicalTimelineMonths: { low: 6, high: 12 },
    informalProbateAvailable: true,
    attorneyRequiredForProbate: false,
    notableQuirks: [
      "Colorado has no state estate tax and no inheritance tax.",
      "Colorado adopted the Uniform Probate Code — informal probate (no hearing, just paperwork) is the default for uncontested estates with a valid will.",
      "Independent administration (executor handles things without court supervision) is the norm.",
      "Beneficiary deeds for real estate are recognized.",
      "The 10-day waiting period before using a small-estate affidavit is among the shortest in the country.",
    ],
    keyForms: [
      {
        name: "JDF 906 — Application for Informal Probate",
        description: "Standard path for uncontested wills.",
      },
      {
        name: "JDF 998 — Collection of Personal Property by Affidavit",
        description: "Small-estate path under $80,000.",
      },
      {
        name: "JDF 940 — Inventory of Estate",
        description: "Filed within 3 months of appointment.",
      },
    ],
    authoritativeSources: [
      {
        label: "Colorado Courts — Probate self-help",
        url: "https://www.courts.state.co.us/Forms/SubCategory.cfm?Category=Probate",
      },
      {
        label: "Colorado Revised Statutes Title 15 — Probate, Trusts, and Fiduciaries",
        url: "https://leg.colorado.gov/sites/default/files/images/olls/crs2023-title-15.pdf",
      },
    ],
    isCommunityPropertyState: false,
  },
  {
    slug: "minnesota",
    name: "Minnesota",
    abbr: "MN",
    smallEstateThresholdUSD: 75_000,
    smallEstateProcess:
      "Minnesota's Affidavit for Collection of Personal Property (Minn. Stat. §524.3-1201) handles estates of $75,000 or less in personal property. Wait 30 days after death. The successor presents the affidavit directly to whoever holds the asset, no court filing required.",
    typicalTimelineMonths: { low: 6, high: 12 },
    informalProbateAvailable: true,
    attorneyRequiredForProbate: false,
    notableQuirks: [
      "Minnesota has its own state estate tax — kicks in at $3 million (2024) with rates up to 16%. Lower threshold than federal.",
      "Minnesota adopted the Uniform Probate Code — informal probate is the default for uncontested cases.",
      "Probate is handled by district court, but the Registrar (a court clerk) approves informal applications without a judge.",
      "Transfer-on-death deeds are recognized for real estate.",
      "Summary closing is available — when small estates are closed quickly without supervised administration.",
    ],
    keyForms: [
      {
        name: "Application for Informal Probate of Will and Appointment of Personal Representative",
        description: "Standard path for uncontested wills.",
      },
      {
        name: "Affidavit for Collection of Personal Property",
        description: "Small-estate path under $75,000.",
      },
      {
        name: "Inventory and Appraisement",
        description: "Filed within 6 months.",
      },
    ],
    authoritativeSources: [
      {
        label: "Minnesota Judicial Branch — Probate forms",
        url: "https://www.mncourts.gov/Help-Topics/Probate.aspx",
      },
      {
        label: "Minnesota Statutes Chapter 524 — Uniform Probate Code",
        url: "https://www.revisor.mn.gov/statutes/cite/524",
      },
    ],
    isCommunityPropertyState: false,
  },
  {
    slug: "south-carolina",
    name: "South Carolina",
    abbr: "SC",
    smallEstateThresholdUSD: 25_000,
    smallEstateProcess:
      "South Carolina's Small Estate Affidavit handles estates of $25,000 or less in personal property (S.C. Code §62-3-1201). Wait 30 days after death. Filed with the probate court.",
    typicalTimelineMonths: { low: 9, high: 14 },
    informalProbateAvailable: true,
    attorneyRequiredForProbate: false,
    notableQuirks: [
      "South Carolina has no state estate tax (repealed 2005) and no inheritance tax.",
      "Probate Court is its own court system in SC, separate from Circuit Court.",
      "Summary administration is available when one heir is the only beneficiary and there are no debts.",
      "South Carolina's $25,000 threshold is on the lower end nationally — many estates won't qualify for the simplified path.",
    ],
    keyForms: [
      {
        name: "Application for Informal Probate (Form 300)",
        description: "Standard path for uncontested wills.",
      },
      {
        name: "Small Estate Affidavit",
        description: "Personal property up to $25,000.",
      },
      {
        name: "Inventory and Appraisement (Form 350)",
        description: "Filed within 90 days of appointment.",
      },
    ],
    authoritativeSources: [
      {
        label: "South Carolina Probate Court forms",
        url: "https://www.sccourts.org/forms/indexProbate.cfm",
      },
      {
        label: "South Carolina Code Title 62 — Probate Code",
        url: "https://www.scstatehouse.gov/code/title62.php",
      },
    ],
    isCommunityPropertyState: false,
  },
  {
    slug: "alabama",
    name: "Alabama",
    abbr: "AL",
    smallEstateThresholdUSD: 32_071,
    smallEstateProcess:
      "Alabama's Summary Distribution (Ala. Code §43-2-690) handles estates of $32,071 or less (the threshold is indexed annually). Wait 30 days after death. Filed with probate court.",
    typicalTimelineMonths: { low: 6, high: 12 },
    informalProbateAvailable: true,
    attorneyRequiredForProbate: false,
    notableQuirks: [
      "Alabama has no state estate tax (repealed 2002) and no inheritance tax.",
      "Probate is heard by the elected Probate Judge in each county — Alabama is one of the few states with elected probate judges.",
      "The small-estate threshold is indexed for inflation each year, so it increases over time.",
      "Letters of administration are typically required even for very small estates with real property.",
    ],
    keyForms: [
      {
        name: "Petition for Probate of Will",
        description: "Opens probate when there's a will.",
      },
      {
        name: "Petition for Summary Distribution",
        description: "Small-estate path under the indexed threshold.",
      },
      {
        name: "Inventory of Estate",
        description: "Filed within 2 months of letters.",
      },
    ],
    authoritativeSources: [
      {
        label: "Alabama Courts — Probate (varies by county)",
        url: "https://judicial.alabama.gov/",
      },
      {
        label: "Alabama Code Title 43 — Wills and Decedents' Estates",
        url: "https://alison.legislature.state.al.us/code-of-alabama",
      },
    ],
    isCommunityPropertyState: false,
  },
  {
    slug: "louisiana",
    name: "Louisiana",
    abbr: "LA",
    smallEstateThresholdUSD: 125_000,
    smallEstateProcess:
      "Louisiana calls it 'Small Succession' (rather than probate). Estates of $125,000 or less can use the Small Succession Affidavit. The process is filed with the district court of the parish where the deceased lived.",
    typicalTimelineMonths: { low: 6, high: 12 },
    informalProbateAvailable: true,
    attorneyRequiredForProbate: true,
    notableQuirks: [
      "Louisiana is the ONLY US state that uses civil-law (Napoleonic Code) for probate — everything else uses common law. Terms like 'probate' and 'executor' don't apply; Louisiana uses 'succession' and 'executor of will.'",
      "Louisiana is a community-property state with strong forced-heirship rules — children under 24 (or with permanent disabilities) are 'forced heirs' who must receive a minimum share of the estate, regardless of what the will says.",
      "There is no probate court — successions go to district courts.",
      "Independent administration (no court supervision after appointment) is available when all heirs consent.",
      "Most successions in Louisiana require an attorney — the procedural rules are specialized and unfamiliar to lawyers from other states.",
    ],
    keyForms: [
      {
        name: "Petition for Possession",
        description: "Opens succession for transfer of assets.",
      },
      {
        name: "Small Succession Affidavit",
        description: "Estates under $125,000.",
      },
      {
        name: "Detailed Descriptive List",
        description: "Inventory of estate assets and debts.",
      },
    ],
    authoritativeSources: [
      {
        label: "Louisiana State Bar Association — Successions",
        url: "https://www.lsba.org/Public/PamphletInfo.aspx?Article=Wills",
      },
      {
        label: "Louisiana Civil Code — Successions (Books III)",
        url: "https://www.legis.la.gov/legis/Laws_Toc.aspx?folder=72&title=Civil%20Code",
      },
    ],
    isCommunityPropertyState: true,
  },
];

export function getStateGuide(slug: string): StateProbateGuide | undefined {
  return STATE_GUIDES.find((s) => s.slug === slug);
}

export function listStateSlugs(): string[] {
  return STATE_GUIDES.map((s) => s.slug);
}
