/**
 * Faith tradition profiles — used by the /decide flow to weight a service-type
 * recommendation, and by per-faith /faith/[tradition] pages.
 *
 * Notes are deliberately practical, not theological. Goal is to help a family
 * make a fair-priced decision quickly, not to teach religion. When a tradition
 * is divided (Reform vs Orthodox Jewish, Sunni vs Shia, etc.) the top-level
 * entry captures the most common modern American practice; sub-profiles in
 * FAITH_SUB_PROFILES carry the denominational specifics.
 *
 * Every faith claim in this file is tagged `// TODO-FD:` for licensed
 * funeral director cofounder review. Sources cited inline + in `sources[]`
 * arrays per profile.
 */

import type { ServiceType } from "./pricing-data";

/** Top-level dropdown options shown on /decide Q2. */
export type FaithKey =
  | "secular"
  | "christian-protestant"
  | "christian-catholic"
  | "christian-orthodox"
  | "lds-mormon"
  | "jewish"
  | "muslim"
  | "hindu"
  | "buddhist"
  | "sikh"
  | "other";

/** Sub-profile keys for traditions with meaningful denominational variation. */
export type FaithSubKey =
  | "jewish-orthodox"
  | "jewish-conservative"
  | "jewish-reform"
  | "jewish-reconstructionist"
  | "muslim-sunni"
  | "muslim-shia";

/** Free-form denomination strings persisted from /decide for traditions without distinct sub-profiles (e.g. Protestant). */
export type ProtestantDenomination =
  | "evangelical"
  | "mainline"
  | "non-denominational"
  | "pentecostal"
  | "baptist"
  | "not-sure";

export type DispositionNorm =
  | "burial-required"
  | "burial-preferred"
  | "cremation-required"
  | "cremation-preferred"
  | "either";

export type EmbalmingNorm = "common" | "uncommon" | "discouraged" | "forbidden";

export interface FaithCheatsheetExtras {
  /** Tradition-specific question to lead with at the funeral home (overrides the standard "Can I see your GPL?" prompt when set, but the GPL question still appears below). */
  openingQuestion?: string;
  /** Faith-specific things to ask about that the standard cheat sheet doesn't cover. */
  extraQuestions: string[];
  /** Faith-specific upsells or services to decline that aren't in the standard sheet. */
  extraDeclines: { upsell: string; script: string }[];
  /** Plain-English notes on community / clergy coordination. */
  communityNotes: string;
}

export interface FaithTradition {
  /** Stable enum key. */
  key: FaithKey | FaithSubKey;
  /** Alias for `key` — kept for the spec's `id` field naming. */
  readonly id?: string;
  label: string;
  /** Alias for `label` — spec's `displayName`. Kept as getter via property. */
  readonly displayName?: string;
  /** Set on sub-profiles to point at parent (e.g. "jewish-orthodox" → "jewish"). */
  parentId?: FaithKey;
  /** Disposition expectation in mainstream American practice (single hint, used by decide-engine). */
  dispositionNorm: DispositionNorm;
  /** Service types permitted by the tradition. New field per spec — additive to dispositionNorm. */
  dispositionAllowed?: ServiceType[];
  /** Plain-English timeline expectation (e.g. "within 24 hours"). */
  timelineNorm: string;
  /** Spec alias for timelineNorm. */
  readonly timingConstraints?: string;
  /** Embalming custom. */
  embalmingNorm: EmbalmingNorm;
  /** One paragraph a family can act on without a chaplain. */
  notes: string;
  /** Default service-type recommendation when the family has no other preference. */
  defaultServiceType: ServiceType;
  /** Optional cheat-sheet customization. Secular / "other" omit this. */
  cheatsheet?: FaithCheatsheetExtras;
  /** Line item ids (from lib/pricing-data.ts) the family can confidently decline. */
  whatYouCanDecline?: string[];
  /** 3–5 specific questions to ask the funeral home. */
  whatToAskTheFH?: string[];
  /** 3–5 things funeral homes commonly get wrong for this tradition. */
  commonPitfalls?: string[];
  /** Keyed copy replacements for specific cheat-sheet sections. */
  cheatSheetOverrides?: Record<string, string>;
  /** URLs cited during research. */
  sources?: string[];
}

// ---------------------------------------------------------------------------
// Top-level traditions (drive /decide dropdown + /faith/[key] pages).
// ---------------------------------------------------------------------------

export const FAITH_TRADITIONS: FaithTradition[] = [
  // -------------------------------------------------------------------------
  // TODO-FD: verify all secular content. No religious authority — sister to
  // confirm the secular default still tracks what families actually pick.
  // -------------------------------------------------------------------------
  {
    key: "secular",
    label: "Secular / None of the above",
    dispositionNorm: "either", // TODO-FD: verify
    dispositionAllowed: [
      "direct-cremation",
      "cremation-with-service",
      "traditional-burial",
      "graveside-burial",
      "green-burial",
      "aquamation",
      "body-donation",
      "memorial-no-body",
    ],
    timelineNorm: "Whatever timeline works for the family. Most families hold a service within 1–2 weeks.",
    embalmingNorm: "uncommon",
    notes:
      "No tradition is dictating the choice — it's about what the family wants and can afford. Direct cremation is the lowest-cost path; a memorial service can happen weeks later wherever you want.",
    defaultServiceType: "direct-cremation",
    sources: [],
  },

  // -------------------------------------------------------------------------
  // TODO-FD: verify Catholic content against current USCCB pastoral guidance.
  // Cremation rules tightened in Vatican guidance (Ad resurgendum cum Christo,
  // 2016) — ashes must be interred, not scattered or kept at home.
  // -------------------------------------------------------------------------
  {
    key: "christian-catholic",
    label: "Catholic",
    dispositionNorm: "burial-preferred", // TODO-FD: verify — burial preferred but cremation permitted
    dispositionAllowed: [
      "traditional-burial",
      "graveside-burial",
      "cremation-with-service",
      "memorial-no-body",
    ],
    timelineNorm: "Funeral Mass typically within 3–7 days.",
    embalmingNorm: "common",
    notes:
      "Catholic teaching permits cremation but requires that cremated remains be buried or entombed in consecrated ground — not scattered or kept at home. A funeral Mass with the body present remains the preferred form. If choosing cremation, plan for a cemetery niche or grave.",
    defaultServiceType: "traditional-burial",
    whatYouCanDecline: [
      "service-facility", // service is at the parish, not the funeral home chapel
      "embalming", // not required if Mass is within a few days
      "limo", // optional
      "flowers-fh", // family florist or parish committee handles
    ],
    whatToAskTheFH: [
      "Will you transport the body to and from our parish for the Mass? What is that fee?",
      "If we choose cremation, do you offer a niche in a Catholic cemetery, or coordinate with our diocese's cemetery?",
      "Do you have a vigil/wake space, or should we plan that at the church or home?",
      "Do you charge a clergy honorarium fee on top of what we give the priest directly?",
    ],
    commonPitfalls: [
      "Charging a chapel facility fee when the funeral Mass is at the parish.",
      "Selling an urn package when the diocesan cemetery offers cheaper niches.",
      "Recommending a commercial cemetery without mentioning the diocesan cemetery option.",
    ],
    cheatsheet: {
      openingQuestion:
        "We're holding the funeral Mass at our parish. Can we coordinate the timing with our pastor before signing anything?",
      extraQuestions: [
        "Will you transport the body to and from the church for the Mass? What's that fee?",
        "If we choose cremation, do you offer a niche in a Catholic cemetery, or coordinate with our diocese's cemetery?",
        "Do you have a vigil/wake space, or should we plan that at the church or home?",
      ],
      extraDeclines: [
        {
          upsell: "In-house chapel for the funeral service",
          script:
            "The funeral Mass will be at our parish — please remove the chapel facility fee.",
        },
      ],
      communityNotes:
        "Call the parish before the funeral home. The pastor coordinates the Mass schedule, vigil, and rosary. Catholic cemeteries (often diocesan) frequently have lower per-niche or per-plot pricing than commercial cemeteries — ask the parish office for the diocesan cemetery contact.",
    },
    sources: [
      "https://www.usccb.org/prayer-and-worship/bereavement-and-funerals",
      "https://www.vatican.va/roman_curia/congregations/cfaith/documents/rc_con_cfaith_doc_20160815_ad-resurgendum-cum-christo_en.html",
    ],
  },

  // -------------------------------------------------------------------------
  // TODO-FD: verify Protestant content. Practice varies enormously across
  // denominations — Baptist/Pentecostal lean traditional burial, mainline
  // (Methodist, Lutheran, Presbyterian, Episcopal) accepts cremation widely,
  // non-denominational follows whatever the family chooses.
  // -------------------------------------------------------------------------
  {
    key: "christian-protestant",
    label: "Protestant",
    dispositionNorm: "either", // TODO-FD: verify across major Protestant denominations
    dispositionAllowed: [
      "traditional-burial",
      "graveside-burial",
      "cremation-with-service",
      "direct-cremation",
      "memorial-no-body",
      "green-burial",
    ],
    timelineNorm: "Service typically within 3–7 days. No strict requirement.",
    embalmingNorm: "common",
    notes:
      "Both burial and cremation are accepted across Protestant denominations. A church service with the body present is the most traditional pattern, but cremation followed by a memorial is increasingly common and meaningfully cheaper. Practice ranges from formal liturgical (Episcopal, Lutheran) to plain-spoken (Baptist, non-denominational) — your pastor sets the tone.",
    defaultServiceType: "traditional-burial",
    whatYouCanDecline: [
      "service-facility", // service is at the church
      "embalming", // not required for a quick service
      "limo",
      "flowers-fh",
    ],
    whatToAskTheFH: [
      "Is the funeral service at our church or your chapel? If our church, what does your fee cover?",
      "Will the pastor be welcomed to lead the service? Do you charge a clergy honorarium fee?",
      "If we choose cremation, can we still hold a viewing first?",
      "Will our church's memorial committee be allowed to handle reception, programs, music — and what items will you remove from the bill if so?",
    ],
    commonPitfalls: [
      "Charging chapel fees when the service is at the church.",
      "Bundling 'pastor coordination' fees on top of the church's own honorarium.",
      "Pushing premium caskets without acknowledging cremation as an equally accepted option.",
    ],
    cheatsheet: {
      extraQuestions: [
        "Is the funeral service at our church or your chapel? If our church, what does your fee cover?",
        "Will the pastor be welcomed to lead the service? Do you charge a clergy honorarium fee?",
        "If we choose cremation, can we still hold a viewing first?",
      ],
      extraDeclines: [
        {
          upsell: "Chapel facility fee when the service is at our church",
          script:
            "We'll be holding the service at our church, not your chapel. Please remove the facility fee.",
        },
      ],
      communityNotes:
        "Coordinate with your pastor before the arrangement meeting. Many Protestant churches will hold the service at no charge to members and may have a memorial committee that handles food, programs, and music — items the funeral home would otherwise charge for.",
    },
    sources: [
      "https://www.elca.org/Faith/Faith-and-Society/Faith-Reflections/Funeral-Practices",
      "https://www.umc.org/en/content/ask-the-umc-what-do-united-methodists-believe-about-cremation",
      "https://www.episcopalchurch.org/glossary/burial-of-the-dead/",
    ],
  },

  // -------------------------------------------------------------------------
  // TODO-FD: verify Eastern Orthodox content. Cremation is forbidden in
  // mainstream Orthodox practice (Greek Orthodox Archdiocese of America,
  // OCA, Antiochian, Russian Orthodox all align). Open casket is standard.
  // Embalming is generally accepted for practical reasons.
  // -------------------------------------------------------------------------
  {
    key: "christian-orthodox",
    label: "Eastern Orthodox",
    dispositionNorm: "burial-required", // TODO-FD: verify — cremation forbidden in mainstream Orthodox
    dispositionAllowed: ["traditional-burial", "graveside-burial"],
    timelineNorm: "Funeral typically within 2–3 days. Trisagion service the night before.",
    embalmingNorm: "common", // TODO-FD: verify — accepted but not required
    notes:
      "Eastern Orthodox practice requires ground burial — cremation is not permitted. The Trisagion (a brief prayer service) is held the evening before the funeral. The funeral itself takes place at the parish church with an open casket. The body is buried facing east.",
    defaultServiceType: "traditional-burial",
    whatYouCanDecline: [
      "service-facility", // funeral is at the church
      "limo",
      "flowers-fh",
    ],
    whatToAskTheFH: [
      "Will you transport the body to our parish for the Trisagion service the night before, and again for the funeral?",
      "Do you have experience coordinating with Orthodox priests? Will you accommodate the open-casket tradition?",
      "Can you ensure the casket is oriented with the feet facing the priest during the service, per Orthodox practice?",
      "Will you allow the family to dress the deceased in the chosen burial clothing?",
    ],
    commonPitfalls: [
      "Pushing cremation as a cost-saving option (it's not permitted).",
      "Charging chapel fees when the service is at the parish.",
      "Closing the casket prematurely — Orthodox practice is open casket through the funeral.",
    ],
    cheatsheet: {
      openingQuestion:
        "We need a traditional Orthodox burial — open casket, no cremation, services at our parish. Can you coordinate with our priest?",
      extraQuestions: [
        "Do you have experience with Orthodox funerals? Have you worked with our parish before?",
        "Will you transport the body for both the Trisagion (night before) and the funeral?",
        "Can the casket be left open through the entire funeral service per Orthodox custom?",
      ],
      extraDeclines: [
        {
          upsell: "Cremation",
          script:
            "Cremation is not permitted in our tradition. We need ground burial only.",
        },
        {
          upsell: "Chapel facility for the funeral",
          script:
            "The funeral will be at our parish church — please remove any chapel fees.",
        },
      ],
      communityNotes:
        "Call your parish priest before the funeral home. The priest coordinates both the Trisagion (typically the evening before, often at the funeral home or church) and the funeral itself. Greek, Russian, Antiochian, OCA, and Serbian Orthodox parishes all follow broadly similar practice — your priest will guide the specifics.",
    },
    sources: [
      "https://www.goarch.org/-/funeral-services",
      "https://www.oca.org/questions/funerals",
    ],
  },

  // -------------------------------------------------------------------------
  // TODO-FD: verify LDS / Mormon content. The Church of Jesus Christ of
  // Latter-day Saints permits both burial and cremation, though burial is
  // strongly preferred. Members who received their endowment are typically
  // dressed in temple clothing for burial — funeral home should know.
  // -------------------------------------------------------------------------
  {
    key: "lds-mormon",
    label: "LDS / Mormon",
    dispositionNorm: "burial-preferred", // TODO-FD: verify — burial strongly preferred but cremation not forbidden
    dispositionAllowed: [
      "traditional-burial",
      "graveside-burial",
      "cremation-with-service",
    ],
    timelineNorm: "Funeral typically within 5–10 days. Held at the local meetinghouse (chapel).",
    embalmingNorm: "common",
    notes:
      "Burial is strongly preferred over cremation, though cremation is not forbidden. Endowed members (those who have participated in temple ordinances) are typically dressed in temple clothing for burial — coordinate this with the bishop and the Relief Society. The funeral itself is held at the local ward meetinghouse, conducted by the bishop, and is not a temple ordinance.",
    defaultServiceType: "traditional-burial",
    whatYouCanDecline: [
      "service-facility", // funeral is at the meetinghouse
      "body-prep", // Relief Society / family typically dresses the deceased
      "flowers-fh", // ward members coordinate
    ],
    whatToAskTheFH: [
      "Will you allow the Relief Society and family to dress the deceased in temple clothing in private?",
      "Will you transport the body to our meetinghouse for the funeral?",
      "Do you have experience with LDS funerals? Will you coordinate timing with our bishop?",
      "If we choose cremation, can we still hold a viewing beforehand?",
    ],
    commonPitfalls: [
      "Dressing the deceased before the family arrives — temple clothing is private and arranged by the family/Relief Society.",
      "Charging chapel fees when the funeral is at the ward meetinghouse.",
      "Treating the funeral as a temple ordinance — it's not. The bishop conducts a chapel service.",
    ],
    cheatsheet: {
      openingQuestion:
        "We need to coordinate the funeral with our ward meetinghouse and our bishop. Can the Relief Society and family dress the deceased in temple clothing in private?",
      extraQuestions: [
        "Will the Relief Society be allowed to dress the deceased in temple clothing in a private space?",
        "Will you transport the body to our meetinghouse and back to the cemetery?",
        "Have you worked with our local stake or ward before?",
      ],
      extraDeclines: [
        {
          upsell: "Body preparation / cosmetology by funeral home staff",
          script:
            "The Relief Society and family will dress the deceased in temple clothing. We don't need cosmetology or formal dressing services.",
        },
        {
          upsell: "Chapel facility fee",
          script:
            "The funeral will be at our ward meetinghouse — please remove the chapel fee.",
        },
      ],
      communityNotes:
        "Call your bishop first. The ward Relief Society typically coordinates the family's needs — meals, dressing the deceased in temple clothing if applicable, and reception logistics. The funeral is held at the meetinghouse and conducted by the bishop, not at the temple.",
    },
    sources: [
      "https://www.churchofjesuschrist.org/study/manual/general-handbook/29-meetings-in-the-church?lang=eng#title_number32",
      "https://newsroom.churchofjesuschrist.org/article/funerals-mormon",
    ],
  },

  // -------------------------------------------------------------------------
  // TODO-FD: verify Jewish content carefully. Practice varies dramatically by
  // denomination — Orthodox and most Conservative require traditional burial
  // within 24–48 hours with no embalming and no viewing; Reform sometimes
  // permits cremation; Reconstructionist varies widely. The top-level entry
  // captures the most stringent (Orthodox/Conservative) defaults; sub-profiles
  // adjust per denomination.
  // -------------------------------------------------------------------------
  {
    key: "jewish",
    label: "Jewish",
    dispositionNorm: "burial-required", // TODO-FD: verify — Orthodox/Conservative required, Reform varies
    dispositionAllowed: ["graveside-burial", "traditional-burial", "green-burial"],
    timelineNorm: "Burial within 24–48 hours when possible. Sabbath and holidays may delay by a day.",
    embalmingNorm: "forbidden", // TODO-FD: verify
    notes:
      "Traditional Jewish practice requires prompt burial in a simple wood casket, no embalming, no viewing. Reform congregations sometimes accept cremation; Conservative and Orthodox do not. Ask your rabbi if you're uncertain — and pick the appropriate sub-tradition on /decide so the recommendation matches your community's practice.",
    defaultServiceType: "graveside-burial",
    whatYouCanDecline: [
      "embalming",
      "body-prep", // chevra kadisha performs tahara
      "viewing",
      "casket-metal",
      "casket-wood", // unless plain pine kosher aron
      "flowers-fh", // not customary at Jewish funerals
    ],
    whatToAskTheFH: [
      "Do you offer a plain pine kosher casket (aron)? What does it cost?",
      "Will you allow our chevra kadisha to perform tahara (ritual washing) at your facility?",
      "Can you skip embalming and refrigerate instead until burial?",
      "Do you have experience with our Jewish cemetery (or cemetery section)? Will you coordinate with them on timing?",
    ],
    commonPitfalls: [
      "Embalming without explicit permission — never appropriate in Jewish practice.",
      "Selling premium caskets when a plain pine aron is the only correct option.",
      "Including cosmetology, viewing, or visitation fees that have no place in the tradition.",
      "Missing the burial window because of a slow paperwork or transport process.",
    ],
    cheatsheet: {
      openingQuestion:
        "We need a Jewish-tradition burial within 24–48 hours. Can you coordinate with our chevra kadisha and rabbi?",
      extraQuestions: [
        "Do you offer a plain pine kosher casket (aron)? What does it cost?",
        "Will you allow our chevra kadisha to perform tahara (ritual washing) at your facility?",
        "Can you skip embalming and refrigerate instead until burial?",
        "Do you have experience with our Jewish cemetery (or cemetery section)? Will you coordinate with them on timing?",
      ],
      extraDeclines: [
        {
          upsell: "Embalming",
          script:
            "Embalming is contrary to Jewish law. Please do not embalm — refrigeration is fine.",
        },
        {
          upsell: "Metal or expensive wood casket",
          script:
            "Tradition calls for a plain pine kosher aron. Please use that, not a metal casket or premium wood.",
        },
        {
          upsell: "Viewing or open casket",
          script:
            "There will be no viewing — that's not part of the tradition. Please remove any viewing-related fees.",
        },
        {
          upsell: "Cosmetology / body preparation",
          script:
            "Our chevra kadisha will handle tahara. No cosmetology or preparation by your staff is needed.",
        },
      ],
      communityNotes:
        "Call your synagogue first. Most communities have a chevra kadisha (volunteer burial society) that handles tahara, dressing in tachrichim (white shrouds), and shemira (watching the body). Their involvement is free and removes most of what a funeral home would charge for. The synagogue can also recommend funeral homes that work regularly with the Jewish community.",
    },
    sources: [
      "https://www.ou.org/judaism-101/lifecycle/death-and-mourning/",
      "https://reformjudaism.org/jewish-life/death-mourning",
      "https://www.chabad.org/library/article_cdo/aid/281588/jewish/Jewish-Funeral.htm",
    ],
  },

  // -------------------------------------------------------------------------
  // TODO-FD: verify Muslim content. Sunni and Shia practice are largely
  // similar at the funeral home — both require ghusl, kafan, and prompt
  // ground burial without embalming. Differences (specific prayers, period
  // of mourning) appear after burial, not at the funeral home.
  // -------------------------------------------------------------------------
  {
    key: "muslim",
    label: "Muslim",
    dispositionNorm: "burial-required", // TODO-FD: verify
    dispositionAllowed: ["graveside-burial", "green-burial"],
    timelineNorm: "Burial within 24 hours when possible.",
    embalmingNorm: "forbidden", // TODO-FD: verify
    notes:
      "Islamic practice requires prompt burial without embalming or cremation. The body is washed and shrouded (ghusl and kafan), placed in a simple coffin or directly in the grave depending on local law, and buried facing Mecca. Coordinate with your local mosque — many have a burial committee that handles ghusl and arrangements.",
    defaultServiceType: "graveside-burial",
    whatYouCanDecline: [
      "embalming",
      "body-prep", // ghusl is performed by the burial committee
      "viewing",
      "casket-metal",
      "vault", // unless cemetery requires
      "flowers-fh",
    ],
    whatToAskTheFH: [
      "Will you allow our mosque's burial committee to perform ghusl (washing) and kafan (shrouding) at your facility?",
      "Do you have a Muslim section, or do you work with a cemetery that does? Can the grave be oriented toward Mecca?",
      "Can the burial happen the same day or next morning?",
      "Will you skip embalming entirely?",
    ],
    commonPitfalls: [
      "Embalming despite explicit family wishes — never appropriate in Islamic practice.",
      "Selling expensive caskets when a plain wood box (or no casket where law permits) is correct.",
      "Including cosmetology, viewing, or visitation fees that have no place in the tradition.",
      "Failing to coordinate burial within the 24-hour window.",
    ],
    cheatsheet: {
      openingQuestion:
        "We need an Islamic burial within 24 hours. Will you coordinate with our mosque and burial committee?",
      extraQuestions: [
        "Will you allow our mosque's burial committee to perform ghusl (washing) and kafan (shrouding) at your facility?",
        "Do you have a Muslim section, or do you work with a cemetery that does? Can the grave be oriented toward Mecca?",
        "Can the burial happen the same day or next morning?",
        "Will you skip embalming entirely?",
      ],
      extraDeclines: [
        {
          upsell: "Embalming",
          script:
            "Embalming is not permitted. Please do not embalm under any circumstances.",
        },
        {
          upsell: "Cremation",
          script:
            "Cremation is forbidden in Islam. We need ground burial only.",
        },
        {
          upsell: "Metal casket or vault",
          script:
            "Islamic practice calls for the simplest possible casket — many communities use an unfinished plain wood box or no casket at all where law permits. We don't need a vault unless the cemetery requires it.",
        },
        {
          upsell: "Cosmetology, viewing, or visitation",
          script:
            "Our burial committee handles preparation. No cosmetology or extended visitation is needed.",
        },
      ],
      communityNotes:
        "Call your imam or mosque office first. Most U.S. mosques have an Islamic Funeral Services or Janazah committee that handles ghusl, kafan, the janazah prayer, and burial coordination — often at minimal cost or as a community service. They will know which local funeral homes and cemeteries work respectfully with Muslim families.",
    },
    sources: [
      "https://www.icna.org/islamic-funeral-services/",
      "https://www.isna.net/funeral-services/",
    ],
  },

  // -------------------------------------------------------------------------
  // TODO-FD: verify Hindu content. Cremation is the standard practice across
  // virtually all Hindu traditions. Pre-cremation rites (antyesti / antim
  // sanskar) are typically led by the eldest son or a male family member.
  // Ashes (asthi) are immersed in moving water — sacred rivers preferred,
  // but local rivers and oceans are accepted alternatives in the diaspora.
  // -------------------------------------------------------------------------
  {
    key: "hindu",
    label: "Hindu",
    dispositionNorm: "cremation-required", // TODO-FD: verify
    dispositionAllowed: ["cremation-with-service", "direct-cremation", "aquamation"],
    timelineNorm: "Cremation typically within 24 hours.",
    embalmingNorm: "discouraged", // TODO-FD: verify
    notes:
      "Cremation is the standard practice. A short pre-cremation viewing or ceremony at the funeral home is typical, often led by the eldest son or another close family member. Ashes are usually scattered in moving water, ideally a sacred river.",
    defaultServiceType: "cremation-with-service",
    whatYouCanDecline: [
      "embalming",
      "vault",
      "plot",
      "headstone", // burial-related upsells don't apply
    ],
    whatToAskTheFH: [
      "Do you have a space where family can perform last rites and a short ceremony before cremation?",
      "Can you skip embalming? We need the body in as natural a state as possible.",
      "Will you allow the family to be present for the cremation, or close to it (e.g. push the button)?",
      "What is the soonest cremation slot you can schedule?",
    ],
    commonPitfalls: [
      "Embalming despite the family's wishes.",
      "Pushing burial-related upsells (vault, plot, headstone) when the family is cremating.",
      "Selling an expensive cremation casket when only a basic combustible container is needed.",
      "Refusing or charging extra to allow family presence at the cremation.",
    ],
    cheatsheet: {
      openingQuestion:
        "We need cremation within 24 hours and a short pre-cremation ceremony space. Can you accommodate that timing?",
      extraQuestions: [
        "Do you have a space where family can perform last rites and a short ceremony before cremation?",
        "Can you skip embalming? We need the body in as natural a state as possible.",
        "Will you allow the family to be present for the cremation, or close to it (e.g. push the button)?",
        "What is the soonest cremation slot you can schedule?",
      ],
      extraDeclines: [
        {
          upsell: "Embalming",
          script:
            "Embalming is contrary to our tradition. Please do not embalm.",
        },
        {
          upsell: "Expensive cremation casket",
          script:
            "We only need the simplest combustible container required by law. Please use the lowest-cost option.",
        },
        {
          upsell: "Burial-related upsells (vault, plot, headstone)",
          script:
            "We're cremating. Please remove anything related to burial.",
        },
      ],
      communityNotes:
        "Coordinate with your local Hindu temple or community priest before the funeral home. They can lead the pre-cremation rites (antyesti / antim sanskar) and advise on timing, dress, and rituals. After cremation, ashes (asthi) are typically immersed in a sacred river — many families travel to do this, but local rivers and oceans are accepted alternatives.",
    },
    sources: [
      "https://www.hinduamerican.org/projects/sevadeath",
      "https://www.hafsite.org/",
    ],
  },

  // -------------------------------------------------------------------------
  // TODO-FD: verify Buddhist content. Practice varies enormously across
  // Theravada (Thai, Burmese, Sri Lankan), Mahayana (Chinese, Vietnamese,
  // Korean, Japanese Pure Land/Zen), and Vajrayana (Tibetan) lineages.
  // Common across most: cremation, body undisturbed for some hours after
  // death, chanting, and memorial observances at intervals (7, 49, 100 days).
  // -------------------------------------------------------------------------
  {
    key: "buddhist",
    label: "Buddhist",
    dispositionNorm: "cremation-preferred", // TODO-FD: verify
    dispositionAllowed: [
      "cremation-with-service",
      "direct-cremation",
      "aquamation",
      "graveside-burial", // permitted in some lineages
      "green-burial",
    ],
    timelineNorm: "Service often held 3–7 days after death; some traditions wait up to 49 days for full memorial rites.",
    embalmingNorm: "uncommon", // TODO-FD: verify per lineage
    notes:
      "Cremation is most common across Buddhist traditions, following the example of the Buddha. Practices vary widely between Theravada, Mahayana, and Vajrayana lineages — your local sangha or temple can guide specifics.",
    defaultServiceType: "cremation-with-service",
    whatYouCanDecline: [
      "embalming",
      "body-prep", // simple natural dressing only
    ],
    whatToAskTheFH: [
      "Some traditions ask that the body remain undisturbed for 8–24 hours after death. Will you accommodate a delay before transfer?",
      "Do you have space for chanting and a service led by monks or a teacher before the cremation?",
      "Will you allow simple, unbleached cotton dressing rather than formal embalming and cosmetology?",
    ],
    commonPitfalls: [
      "Transferring the body too quickly when the tradition asks for an undisturbed period.",
      "Pushing embalming and cosmetology when simple natural dressing is appropriate.",
      "Failing to accommodate the temple's preferred timing.",
    ],
    cheatsheet: {
      extraQuestions: [
        "Some traditions ask that the body remain undisturbed for 8–24 hours after death. Will you accommodate a delay before transfer?",
        "Do you have space for chanting and a service led by monks or a teacher before the cremation?",
        "Will you allow simple, unbleached cotton dressing rather than formal embalming and cosmetology?",
      ],
      extraDeclines: [
        {
          upsell: "Embalming",
          script:
            "Our tradition asks that the body be undisturbed. Please refrigerate instead of embalming.",
        },
        {
          upsell: "Heavy cosmetology / formal dressing",
          script:
            "Simple natural dressing is appropriate. No cosmetology needed.",
        },
      ],
      communityNotes:
        "Practice varies enormously across Theravada (Thai, Burmese, Sri Lankan), Mahayana (Chinese, Vietnamese, Korean, Japanese Pure Land/Zen), and Vajrayana (Tibetan) lineages. Your sangha or temple can advise on specifics: how long the body should remain undisturbed, what scriptures are chanted, what kind of altar is set up, and the timing of memorial observances at 7, 49, and 100 days.",
    },
    sources: [
      "https://buddhistchurchesofamerica.org/",
      "https://tricycle.org/",
    ],
  },

  // -------------------------------------------------------------------------
  // TODO-FD: verify Sikh content. Cremation is the standard practice across
  // Sikhism — burial is generally discouraged. The funeral (Antam Sanskar)
  // includes recitation from the Guru Granth Sahib. Ashes are immersed in
  // moving water (river, sea) — no headstones or memorials are erected.
  // -------------------------------------------------------------------------
  {
    key: "sikh",
    label: "Sikh",
    dispositionNorm: "cremation-required", // TODO-FD: verify
    dispositionAllowed: ["cremation-with-service", "direct-cremation", "aquamation"],
    timelineNorm: "Cremation typically within 1–3 days. Antam Sanskar service at the gurdwara.",
    embalmingNorm: "discouraged", // TODO-FD: verify
    notes:
      "Sikh practice calls for cremation, generally within a few days of death. The Antam Sanskar (final rites) include recitation from the Guru Granth Sahib at the gurdwara. Mourners dress in plain clothing, often white. After cremation, ashes are immersed in flowing water; Sikhs traditionally do not erect headstones or memorials.",
    defaultServiceType: "cremation-with-service",
    whatYouCanDecline: [
      "embalming",
      "vault",
      "plot",
      "headstone",
      "casket-metal",
    ],
    whatToAskTheFH: [
      "Will you transport the body to our gurdwara for the Antam Sanskar service before cremation?",
      "Can you skip embalming?",
      "Will you allow family to be present for the cremation?",
      "What is the soonest cremation slot you can schedule?",
    ],
    commonPitfalls: [
      "Pushing burial-related upsells (vault, plot, headstone) — none apply.",
      "Embalming despite the family's wishes.",
      "Selling an expensive cremation casket when a basic combustible container is correct.",
      "Failing to remove the kara (steel bracelet) and other articles of faith respectfully when preparing the body.",
    ],
    cheatsheet: {
      openingQuestion:
        "We need cremation within a few days, with a service at our gurdwara before cremation. Can you coordinate with us?",
      extraQuestions: [
        "Will you transport the body to our gurdwara for the Antam Sanskar service before cremation?",
        "Can you skip embalming?",
        "Will you allow family to be present for the cremation?",
        "What is the soonest cremation slot you can schedule?",
      ],
      extraDeclines: [
        {
          upsell: "Embalming",
          script:
            "Embalming is contrary to our tradition. Please do not embalm.",
        },
        {
          upsell: "Burial-related upsells (vault, plot, headstone)",
          script:
            "We're cremating. Sikh practice does not include headstones or grave markers. Please remove anything related to burial.",
        },
        {
          upsell: "Expensive cremation casket",
          script:
            "We only need the simplest combustible container. Please use the lowest-cost option.",
        },
      ],
      communityNotes:
        "Call your gurdwara first. The granthi (priest) will lead the Antam Sanskar (final rites) and read from the Guru Granth Sahib. Mourners typically wear plain clothing, often white. The five articles of faith (kesh, kangha, kara, kachera, kirpan) should be left in place when preparing the body — coordinate this with the granthi if the funeral home staff are unfamiliar.",
    },
    sources: [
      "https://www.sikhcoalition.org/",
      "https://www.sgpc.net/sikhism/sikh-rehat-maryada/",
    ],
  },

  {
    key: "other",
    label: "Other (please specify)",
    dispositionNorm: "either",
    timelineNorm: "Depends on tradition.",
    embalmingNorm: "uncommon",
    notes:
      "If your tradition isn't listed, the recommendation below is based purely on the practical questions — body present, budget, and disposition preference. Your community or clergy can advise on customs.",
    defaultServiceType: "direct-cremation",
    sources: [],
  },
];

// ---------------------------------------------------------------------------
// Sub-profiles for traditions with meaningful denominational variation.
// Kept OUT of FAITH_TRADITIONS so /sitemap.ts and /faith/[tradition] don't
// auto-generate routes for them. Surfaced via FAITH_PROFILES below for
// callers that need the full list.
// ---------------------------------------------------------------------------

export const FAITH_SUB_PROFILES: FaithTradition[] = [
  // -------------------------------------------------------------------------
  // TODO-FD: verify all four Jewish sub-profiles against current practice in
  // each movement. Orthodox: strictest — burial only, no embalming, no
  // viewing, plain pine aron, within 24–48 hours. Conservative: same as
  // Orthodox in practice for most communities. Reform: most flexible —
  // cremation increasingly accepted, viewing sometimes permitted, timing
  // less strict. Reconstructionist: varies widely by community, generally
  // permits cremation.
  // -------------------------------------------------------------------------
  {
    key: "jewish-orthodox",
    parentId: "jewish",
    label: "Jewish — Orthodox",
    dispositionNorm: "burial-required", // TODO-FD: verify
    dispositionAllowed: ["graveside-burial", "traditional-burial"],
    timelineNorm: "Burial within 24 hours when possible. Sabbath and major holidays may delay by a day.",
    embalmingNorm: "forbidden",
    notes:
      "Orthodox practice is the most stringent: prompt ground burial in a plain pine kosher casket (aron), no embalming, no viewing, tahara performed by the chevra kadisha, dressed in white tachrichim. Coordinate with your synagogue's chevra kadisha immediately.",
    defaultServiceType: "graveside-burial",
    sources: [
      "https://www.ou.org/judaism-101/lifecycle/death-and-mourning/",
      "https://www.chabad.org/library/article_cdo/aid/281588/jewish/Jewish-Funeral.htm",
    ],
  },
  {
    key: "jewish-conservative",
    parentId: "jewish",
    label: "Jewish — Conservative",
    dispositionNorm: "burial-required", // TODO-FD: verify
    dispositionAllowed: ["graveside-burial", "traditional-burial", "green-burial"],
    timelineNorm: "Burial within 24–48 hours when possible.",
    embalmingNorm: "forbidden",
    notes:
      "Conservative practice closely tracks Orthodox at the funeral home: prompt burial, plain pine aron, no embalming, no viewing, tahara by the chevra kadisha. Some Conservative congregations have begun accepting more flexibility around timing and viewing — ask your rabbi.",
    defaultServiceType: "graveside-burial",
    sources: [
      "https://www.rabbinicalassembly.org/",
    ],
  },
  {
    key: "jewish-reform",
    parentId: "jewish",
    label: "Jewish — Reform",
    dispositionNorm: "burial-preferred", // TODO-FD: verify — Reform increasingly accepts cremation
    dispositionAllowed: [
      "graveside-burial",
      "traditional-burial",
      "green-burial",
      "cremation-with-service",
      "direct-cremation",
    ],
    timelineNorm: "Burial within a few days; less strict than Orthodox/Conservative.",
    embalmingNorm: "discouraged",
    notes:
      "Reform Judaism permits a wider range of practice than Orthodox or Conservative. Cremation is increasingly accepted; embalming and viewing are sometimes permitted; timing is less strict. Many Reform congregations still prefer traditional burial — ask your rabbi about the local norm.",
    defaultServiceType: "graveside-burial",
    sources: [
      "https://reformjudaism.org/jewish-life/death-mourning",
      "https://www.ccarnet.org/",
    ],
  },
  {
    key: "jewish-reconstructionist",
    parentId: "jewish",
    label: "Jewish — Reconstructionist",
    dispositionNorm: "either", // TODO-FD: verify — Reconstructionist varies widely
    dispositionAllowed: [
      "graveside-burial",
      "traditional-burial",
      "green-burial",
      "cremation-with-service",
      "direct-cremation",
    ],
    timelineNorm: "Varies by community.",
    embalmingNorm: "discouraged",
    notes:
      "Reconstructionist practice varies widely by congregation and family. Both burial and cremation are commonly accepted. Coordinate with your rabbi for community norms — there is no single doctrinal answer.",
    defaultServiceType: "graveside-burial",
    sources: [
      "https://www.reconstructingjudaism.org/",
    ],
  },

  // -------------------------------------------------------------------------
  // TODO-FD: verify Sunni vs Shia funeral practice differences. Both require
  // ghusl, kafan, janazah prayer, and prompt ground burial without embalming.
  // Differences are mostly in specific prayer wording and post-burial
  // mourning observances, not at the funeral home itself.
  // -------------------------------------------------------------------------
  {
    key: "muslim-sunni",
    parentId: "muslim",
    label: "Muslim — Sunni",
    dispositionNorm: "burial-required",
    dispositionAllowed: ["graveside-burial", "green-burial"],
    timelineNorm: "Burial within 24 hours when possible.",
    embalmingNorm: "forbidden",
    notes:
      "Sunni practice requires prompt ground burial without embalming or cremation. Ghusl (washing) and kafan (shrouding) are typically performed by the mosque's burial committee. The janazah prayer is held before burial.",
    defaultServiceType: "graveside-burial",
    sources: [
      "https://www.icna.org/islamic-funeral-services/",
      "https://www.isna.net/funeral-services/",
    ],
  },
  {
    key: "muslim-shia",
    parentId: "muslim",
    label: "Muslim — Shia",
    dispositionNorm: "burial-required",
    dispositionAllowed: ["graveside-burial", "green-burial"],
    timelineNorm: "Burial within 24 hours when possible.",
    embalmingNorm: "forbidden",
    notes:
      "Shia practice requires prompt ground burial without embalming or cremation. Ghusl and kafan follow specific Shia rites. Differences from Sunni practice are largely in prayer wording and post-burial mourning, not in funeral home logistics. Coordinate with your local Shia mosque or community center.",
    defaultServiceType: "graveside-burial",
    sources: [
      "https://www.al-islam.org/death-and-resurrection",
    ],
  },
];

/** Convenience union: top-level + sub-profiles. */
export const FAITH_PROFILES: FaithTradition[] = [
  ...FAITH_TRADITIONS,
  ...FAITH_SUB_PROFILES,
];

export const FAITH_BY_KEY: Record<string, FaithTradition> = Object.fromEntries(
  FAITH_PROFILES.map((t) => [t.key, t]),
);

export function getFaith(key: FaithKey | FaithSubKey): FaithTradition {
  return FAITH_BY_KEY[key];
}

/** True for entries that are top-level dropdown options (not sub-profiles). */
export function isTopLevelFaith(key: string): key is FaithKey {
  return FAITH_TRADITIONS.some((t) => t.key === key);
}

// ---------------------------------------------------------------------------
// Denomination metadata for /decide Q2 follow-up sub-questions.
// ---------------------------------------------------------------------------

export interface DenominationOption {
  value: string;
  label: string;
  /** Sub-profile key to resolve to, if one exists. Otherwise null — UI persists the string only. */
  subProfileKey: FaithSubKey | null;
}

export const JEWISH_DENOMINATIONS: DenominationOption[] = [
  { value: "orthodox", label: "Orthodox", subProfileKey: "jewish-orthodox" },
  { value: "conservative", label: "Conservative", subProfileKey: "jewish-conservative" },
  { value: "reform", label: "Reform", subProfileKey: "jewish-reform" },
  { value: "reconstructionist", label: "Reconstructionist", subProfileKey: "jewish-reconstructionist" },
  { value: "not-sure", label: "Not sure", subProfileKey: null },
];

export const MUSLIM_DENOMINATIONS: DenominationOption[] = [
  { value: "sunni", label: "Sunni", subProfileKey: "muslim-sunni" },
  { value: "shia", label: "Shia", subProfileKey: "muslim-shia" },
  { value: "not-sure", label: "Not sure", subProfileKey: null },
];

// TODO-FD: verify Protestant denomination labels. We persist the string only;
// no sub-profiles are created since funeral practice is broadly similar
// across these denominations at the funeral-home level.
export const PROTESTANT_DENOMINATIONS: DenominationOption[] = [
  { value: "evangelical", label: "Evangelical", subProfileKey: null },
  {
    value: "mainline",
    label: "Mainline (Methodist, Lutheran, Presbyterian, Episcopal, etc.)",
    subProfileKey: null,
  },
  { value: "non-denominational", label: "Non-denominational", subProfileKey: null },
  { value: "pentecostal", label: "Pentecostal", subProfileKey: null },
  { value: "baptist", label: "Baptist", subProfileKey: null },
  { value: "not-sure", label: "Not sure", subProfileKey: null },
];

/** Returns the denomination option list for a faith, or null if no follow-up question applies. */
export function denominationsFor(
  key: FaithKey,
): DenominationOption[] | null {
  if (key === "jewish") return JEWISH_DENOMINATIONS;
  if (key === "muslim") return MUSLIM_DENOMINATIONS;
  if (key === "christian-protestant") return PROTESTANT_DENOMINATIONS;
  return null;
}
