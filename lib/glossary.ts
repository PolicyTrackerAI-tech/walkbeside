/**
 * Plain-language glossary of funeral, body-disposition, and after-death
 * terms. Written for grieving families and the curious, not for industry
 * insiders.
 *
 * Each entry is its own SEO surface (/glossary/[slug]). Add new entries
 * here and the index page + sitemap pick them up automatically.
 *
 * Voice rules:
 *   - Plain language, third-person, no claim of personal experience.
 *   - State the gotcha when there is one.
 *   - Money numbers when they help (US ranges, 2026).
 *   - No padding, no "we're so sorry" filler.
 */

export type GlossaryCategory =
  | "services"
  | "body"
  | "paperwork"
  | "money"
  | "items"
  | "timing"
  | "after"
  | "people";

export interface GlossaryEntry {
  slug: string;
  term: string;
  alsoKnownAs?: string[];
  category: GlossaryCategory;
  /** One- or two-sentence definition. Shown on the index page. */
  short: string;
  /** Longer explanation. Each string renders as its own paragraph. */
  paragraphs: string[];
  /** Common gotcha, scam, or upsell to watch for. Optional. */
  watchOut?: string;
  /** Slugs of related entries. */
  related?: string[];
}

export const CATEGORY_LABELS: Record<GlossaryCategory, string> = {
  services: "Services and ceremonies",
  body: "Care of the body",
  paperwork: "Paperwork and authority",
  money: "Pricing and consumer rights",
  items: "Caskets, urns, and vaults",
  timing: "Planning timing",
  after: "After the funeral",
  people: "People and roles",
};

export const GLOSSARY: GlossaryEntry[] = [
  // ---------------- Services and ceremonies ----------------
  {
    slug: "direct-cremation",
    term: "Direct cremation",
    alsoKnownAs: ["Simple cremation"],
    category: "services",
    short:
      "Cremation with no viewing, no embalming, and no formal service at the funeral home. The body goes from the place of death to the crematory. The family gets the ashes back later.",
    paragraphs: [
      "Direct cremation is the cheapest legal way to handle a body in the United States. Typical price in 2026: $800–$3,000 depending on city and provider. The funeral home transports the body, files the death certificate, performs the cremation, and returns the ashes — usually within one to three weeks.",
      "Choosing direct cremation does not mean skipping a memorial. Most families who pick direct cremation still hold a memorial service later, on their own timeline, anywhere they want, without the funeral home involved. The body is not present at the service because it has already been cremated.",
      "If a funeral home offers cremation, the FTC Funeral Rule requires it to list direct cremation as a separately-priced option — without making you buy a casket — and to make a plain alternative container available. Homes must also quote prices clearly over the phone. If a home won't give you a direct cremation price by phone, call somewhere else.",
    ],
    watchOut:
      "Some funeral homes quote direct cremation at $1,500 but then add a 'cremation container,' 'crematory fee,' and 'transportation surcharge' that double the bill. Ask for the all-in price before you commit.",
    related: ["cremation", "memorial-service", "gpl"],
  },
  {
    slug: "traditional-funeral",
    term: "Traditional funeral",
    alsoKnownAs: ["Full-service funeral"],
    category: "services",
    short:
      "A funeral with embalming, viewing, a formal service at a funeral home or place of worship, and burial in a cemetery. The most expensive of the common options.",
    paragraphs: [
      "A traditional funeral typically includes: embalming and cosmetic preparation, use of the funeral home's viewing room for one or more visitation periods, a casket, a hearse, a graveside service, and burial in a cemetery plot with an outer burial container (vault). National median cost in 2026 runs $9,000–$15,000 before cemetery charges. Cemetery charges (plot, opening and closing, marker) add another $2,000–$8,000.",
      "Nothing in this list is legally required. Embalming is not required by law in any US state except in specific edge cases (long delays, certain communicable diseases, transport across some state lines). Vaults are not required by state law but most cemeteries require them. Viewing is optional. The casket can be bought from a third party.",
    ],
    watchOut:
      "Funeral homes often present 'traditional' as the default and quote it as a single 'package' price. Federal law requires them to itemize. Ask for the General Price List and pick services individually if you want to.",
    related: ["embalming", "viewing", "gpl", "ftc-funeral-rule", "vault"],
  },
  {
    slug: "memorial-service",
    term: "Memorial service",
    category: "services",
    short:
      "A service to honor the person held without the body present — typically after cremation, direct burial, or body donation.",
    paragraphs: [
      "A memorial service can be held anywhere — a home, a park, a place of worship, a restaurant, a beach — and at any time after death. There is no rule that it must happen within a week or even a month. Many families wait until family can travel, until weather improves, or until they feel ready.",
      "Because the body is not present, families do not need to rent a funeral home's facility, buy a casket for display, or pay for embalming. This is the path most families take when they choose direct cremation.",
    ],
    related: ["direct-cremation", "viewing", "graveside-service"],
  },
  {
    slug: "graveside-service",
    term: "Graveside service",
    category: "services",
    short:
      "A short ceremony held at the cemetery plot, before or during burial. Often the only service when families want something simple but in-person.",
    paragraphs: [
      "A graveside service typically lasts 15–30 minutes and is led by clergy, a celebrant, or a family member. It can be the entire ceremony, or it can follow a longer service held earlier at a funeral home or place of worship.",
      "Graveside-only is one of the lowest-cost ways to have an in-person ceremony. It skips the rental of the funeral home's viewing or chapel space, and limits the use of a hearse to the cemetery trip itself.",
    ],
    related: ["traditional-funeral", "memorial-service"],
  },
  {
    slug: "viewing",
    term: "Viewing",
    alsoKnownAs: ["Visitation", "Wake"],
    category: "services",
    short:
      "Time at the funeral home when family and friends gather around the body before the funeral. Can be open-casket (body visible) or closed-casket.",
    paragraphs: [
      "Viewing is typically held the evening before a funeral, or in the hours just before. Length varies — two hours is common, all-day is not unusual for large families or close-knit communities. The body has usually been embalmed and cosmetically prepared, though refrigeration plus skilled preparation can also support a short viewing without embalming.",
      "An open-casket viewing means the upper half of the casket is open and the body is visible. Closed-casket viewings happen when the family prefers privacy, when the death involved trauma, or when too much time has passed since death for the body to be presentable.",
      "Some traditions distinguish between a 'wake' (held at home or in a private space, sometimes for multiple days, with food and storytelling) and a 'visitation' (held at the funeral home in a defined window). The words are often used interchangeably today.",
    ],
    related: ["embalming", "traditional-funeral", "casket"],
  },

  // ---------------- Care of the body ----------------
  {
    slug: "embalming",
    term: "Embalming",
    category: "body",
    short:
      "A chemical process that temporarily preserves the body, used mainly to allow a viewing several days after death. Not required by law in most situations.",
    paragraphs: [
      "Embalming replaces the body's blood with a formaldehyde-based solution and applies cosmetics to the visible skin. The goal is short-term preservation — enough time for a viewing, a service, and burial. Embalming does not preserve the body indefinitely.",
      "Federal law (FTC Funeral Rule) prohibits funeral homes from claiming that embalming is required when it isn't. It is not required by any US state for cremation. It is not required for a private viewing held shortly after death. It is required only in specific edge cases such as long shipping delays or certain communicable diseases.",
      "Typical 2026 price: $500–$1,200. Some funeral homes price a 'preparation of the body' bundle that includes embalming, cosmetics, and hairstyling — break this apart on the GPL if you only want one piece of it.",
    ],
    watchOut:
      "If a funeral home says embalming is 'required by law' or 'required for health reasons,' that is almost always false. Ask which specific law or regulation requires it for your situation.",
    related: ["viewing", "refrigeration", "ftc-funeral-rule"],
  },
  {
    slug: "cremation",
    term: "Cremation",
    category: "body",
    short:
      "Reducing the body to bone fragments and ash using high heat (about 1,400–1,800 °F) over two to three hours. The resulting 'cremated remains' weigh 4–8 pounds for an adult.",
    paragraphs: [
      "After cremation, the bone fragments are processed in a machine called a cremulator into a uniform, sand-like consistency. The remains are returned to the family in a temporary plastic container or, if the family bought one, an urn.",
      "Cremation accounts for about 60% of US dispositions and is rising. It is legal in every US state. Costs range from $800 for direct cremation to $4,000+ when bundled with viewing and a formal service.",
      "Religious rules vary. Catholic Church permits cremation but prefers the body be present at the funeral mass; Jewish and Muslim traditions generally prohibit cremation; most Protestant, Buddhist, and Hindu traditions permit or prefer it. Check the specific tradition before assuming.",
    ],
    related: ["direct-cremation", "urn", "aquamation"],
  },
  {
    slug: "green-burial",
    term: "Green burial",
    alsoKnownAs: ["Natural burial"],
    category: "body",
    short:
      "Burial without embalming, without a metal or hardwood casket, and without a concrete vault — designed to let the body decompose into the soil naturally.",
    paragraphs: [
      "Green burial is legal in all 50 US states, but most conventional cemeteries require vaults that defeat the point. About 350 US cemeteries are certified as green or hybrid (allowing green burials in a defined section). The Green Burial Council maintains the certification list.",
      "A green burial uses a biodegradable container — a plain pine box, a wicker casket, a cotton shroud — and skips embalming. Refrigeration handles preservation between death and burial. Graves are usually shallower than conventional graves to support decomposition.",
      "Typical 2026 cost: $1,500–$4,000 all-in, depending on the cemetery and whether a memorial service is included. Less than half the cost of a traditional funeral.",
    ],
    related: ["embalming", "vault", "home-funeral"],
  },
  {
    slug: "aquamation",
    term: "Aquamation",
    alsoKnownAs: ["Alkaline hydrolysis", "Water cremation"],
    category: "body",
    short:
      "An alternative to flame cremation that uses heated water and lye to break the body down to bone fragments. Same result as cremation, less energy, no emissions.",
    paragraphs: [
      "Aquamation places the body in a pressurized chamber with water and a small amount of potassium or sodium hydroxide. Over three to four hours, soft tissue dissolves into a sterile liquid. Bone is left intact and is processed the same way as after flame cremation, returned to the family as ash.",
      "Aquamation is legal in about half of US states as of 2026 and the list is growing. It typically costs slightly more than direct flame cremation ($1,500–$3,500), but uses about one-eighth the energy and produces no airborne emissions.",
      "Faith traditions that allow flame cremation generally also allow aquamation. Those that prohibit cremation generally prohibit aquamation as well.",
    ],
    related: ["cremation", "direct-cremation"],
  },

  // ---------------- Paperwork and authority ----------------
  {
    slug: "death-certificate",
    term: "Death certificate",
    category: "paperwork",
    short:
      "The official government document recording the death. Required for almost everything that comes after — bank accounts, insurance, Social Security, probate, transferring property.",
    paragraphs: [
      "A death certificate has two parts: a medical section (cause and manner of death, signed by a physician, hospice nurse, or medical examiner) and a personal section (filled out by the funeral home or the family). The completed certificate is filed with the county vital records office, which then issues certified copies.",
      "Most families need 10–15 certified copies. Banks, brokerage firms, pension administrators, life insurance companies, the Social Security Administration, the IRS, and the county recorder's office (for any real estate transfer) each want an original. Photocopies are not accepted.",
      "Certified copies cost $5–$30 each depending on state. Order extras at the time of filing — going back later costs the same per copy plus a return trip to the county office.",
    ],
    related: ["next-of-kin", "burial-transit-permit", "probate"],
  },
  {
    slug: "burial-transit-permit",
    term: "Burial-transit permit",
    alsoKnownAs: ["Disposition permit"],
    category: "paperwork",
    short:
      "The county-issued permit that authorizes moving the body and completing burial, cremation, or other disposition. Required in every US state.",
    paragraphs: [
      "The burial-transit permit is issued by the county vital records office (or equivalent), usually at the same time as the death certificate is filed. Without it, the crematory cannot legally cremate the body and the cemetery cannot legally bury it.",
      "Funeral homes handle the permit as part of their basic services fee. Families doing a home funeral file for the permit themselves at the county office. Either way, the permit is given to whoever takes physical custody of the body for final disposition.",
    ],
    related: ["death-certificate", "home-funeral"],
  },
  {
    slug: "next-of-kin",
    term: "Next of kin",
    category: "paperwork",
    short:
      "The person legally authorized to make decisions about the body, burial, and arrangements. Order is set by state law, not by who was emotionally closest.",
    paragraphs: [
      "State law sets a strict order of priority: a designated agent (if the deceased filled out a 'designation of agent' form), then the surviving spouse, then adult children (by majority), then parents, then adult siblings, and outward from there. An unmarried partner has no legal standing in most states unless a designation form was completed.",
      "Disputes are common when adult children disagree about cremation versus burial, when an estranged spouse outranks an adult child who actually provided care, or when chosen family is excluded by the legal hierarchy. The funeral home will follow the legal order unless there is a notarized designation form or a court order.",
    ],
    watchOut:
      "If the person who died was in an unmarried relationship, was estranged from family, or had any nontraditional family structure, a 'designation of agent' form filed in advance is the only reliable way to give the right person decision-making authority.",
    related: ["right-of-disposition", "death-certificate"],
  },
  {
    slug: "right-of-disposition",
    term: "Right of disposition",
    category: "paperwork",
    short:
      "The legal right to decide what happens to a body after death — cremation versus burial, where, and when. Follows the same hierarchy as next of kin.",
    paragraphs: [
      "Most US states have a specific 'right of disposition' statute that names who can make these decisions and in what order. The right can be assigned in advance using a designation of agent form (sometimes called a 'declaration of disposition' or 'appointment of designated agent'), which most states recognize.",
      "Funeral homes will not proceed with cremation or burial without a signature from someone with this right. If the right-holder is unreachable, or if there is a dispute, the funeral home will hold the body until the question is resolved — sometimes through a court order.",
    ],
    related: ["next-of-kin"],
  },

  // ---------------- Pricing and consumer rights ----------------
  {
    slug: "gpl",
    term: "GPL (General Price List)",
    category: "money",
    short:
      "The itemized price list every funeral home in the US is legally required to give you on request — in person, by phone, or by email.",
    paragraphs: [
      "The Federal Trade Commission's Funeral Rule requires every funeral home to maintain a current General Price List and to give it to anyone who asks. It must include the price of each service and product the home offers, individually — not just packages.",
      "Funeral homes are required to quote prices over the phone if asked. They are required to provide the GPL in writing to anyone who walks in and discusses arrangements, before discussing prices verbally. Many homes resist this. Insisting on the written GPL is your right.",
      "Comparing GPLs from three to five homes in the same city is the single most effective way to avoid being overcharged. Prices for identical services often vary by 200–400% between neighboring funeral homes.",
    ],
    watchOut:
      "If a funeral home will not provide its GPL in writing, will not quote direct cremation by phone, or pressures you to discuss arrangements before you see the prices — these are violations of federal law. Report to the FTC at reportfraud.ftc.gov.",
    related: ["ftc-funeral-rule", "basic-services-fee", "cash-advance"],
  },
  {
    slug: "ftc-funeral-rule",
    term: "FTC Funeral Rule",
    category: "money",
    short:
      "The federal regulation governing what funeral homes can and cannot do. In effect since 1984. Enforced by the Federal Trade Commission.",
    paragraphs: [
      "The Funeral Rule requires funeral homes to: provide a written General Price List on request, quote prices over the phone, allow families to buy a casket from a third party without charging a handling fee, itemize every charge, and not require embalming when state law does not require it.",
      "The Rule does not apply to cemeteries, crematories that don't deal directly with families, or third-party casket sellers. It also does not regulate prices themselves — only disclosure and itemization.",
      "Families who believe a funeral home has violated the Rule can report it to the FTC at reportfraud.ftc.gov. The FTC also maintains a consumer guide at ftc.gov/funerals.",
    ],
    related: ["gpl", "basic-services-fee", "casket-handling-fee"],
  },
  {
    slug: "basic-services-fee",
    term: "Non-declinable basic services fee",
    alsoKnownAs: ["Basic services fee", "Professional services fee"],
    category: "money",
    short:
      "The one fee a funeral home is allowed to charge every family regardless of what services they pick. Covers overhead — facility, staff time, paperwork.",
    paragraphs: [
      "Typical 2026 range: $1,500–$4,500 depending on region and home. The fee covers the funeral home's general operating costs (rent, staff, filing the death certificate, coordinating with the crematory or cemetery). It is the primary non-declinable item under the FTC Funeral Rule — the one fee every family pays regardless of the services they choose.",
      "This fee varies more between funeral homes than almost any other line item. A neighborhood independent might charge $1,800; a national chain in the same zip code might charge $3,800 for the same service. Always check this number first when comparing GPLs.",
    ],
    related: ["gpl", "ftc-funeral-rule"],
  },
  {
    slug: "cash-advance",
    term: "Cash advance items",
    category: "money",
    short:
      "Charges the funeral home pays to a third party on the family's behalf and passes through — death certificates, clergy honoraria, obituary placement, flowers.",
    paragraphs: [
      "By federal law, the funeral home cannot mark up cash advance items without disclosing the markup in writing. In practice, most homes do mark them up — typically 10–30% — and the disclosure is buried in small print. Families can almost always pay these third parties directly and skip the markup.",
      "Common cash advance items: certified death certificates ($5–$30 each in 2026, varies by county), clergy or celebrant honorarium ($150–$500), obituary placement in a newspaper ($100–$1,500 depending on paper and length), flowers, musicians, and police escort for the funeral procession.",
    ],
    related: ["gpl", "death-certificate"],
  },
  {
    slug: "casket-handling-fee",
    term: "Casket handling fee",
    category: "money",
    short:
      "A fee some funeral homes try to charge when a family buys a casket from a third party (Costco, Amazon, an online supplier). Illegal under federal law.",
    paragraphs: [
      "The FTC Funeral Rule explicitly prohibits funeral homes from charging a 'casket handling fee' or any equivalent surcharge for accepting a casket the family bought elsewhere. The home must accept delivery and use the casket without penalty.",
      "Third-party caskets typically cost 40–70% less than the same casket bought through a funeral home. A casket the home prices at $3,000 often sells for $900–$1,200 online. This is the largest single area of savings for families who choose burial.",
    ],
    watchOut:
      "Some homes rebrand the handling fee as a 'casket inspection charge,' a 'storage fee,' or an 'increased basic services fee.' All of these are illegal. Report to the FTC at reportfraud.ftc.gov.",
    related: ["gpl", "ftc-funeral-rule", "casket"],
  },

  // ---------------- Caskets, urns, and vaults ----------------
  {
    slug: "casket",
    term: "Casket",
    category: "items",
    short:
      "The container the body is placed in for viewing and burial. Required for traditional funerals; optional for direct cremation (a cardboard 'alternative container' suffices).",
    paragraphs: [
      "Caskets range from $400 cardboard 'alternative containers' (used for cremation) to $20,000+ hardwood caskets with bronze hardware. Most funeral home displays start at $2,500 and run up to about $10,000. The same casket bought from a third party — Costco, Walmart, online dealers — typically costs less than half.",
      "Federal law requires funeral homes to display a casket price list and to use any casket the family provides, with no extra fee. Families are not required to buy the casket from the funeral home.",
      "'Protective' or 'sealed' caskets — usually metal with a rubber gasket — are commonly upsold at $1,000–$3,000 above an equivalent non-sealed model. There is no consumer or scientific evidence that sealing meaningfully slows decomposition or improves preservation.",
    ],
    related: ["casket-handling-fee", "vault", "urn"],
  },
  {
    slug: "urn",
    term: "Urn",
    category: "items",
    short:
      "The container that holds cremated remains. Required only if the family wants something more permanent than the temporary plastic container the crematory provides.",
    paragraphs: [
      "Urns range from free (the basic plastic container) to $5,000+ (custom-crafted ceramics, hand-carved wood). The crematory always returns the ashes in a temporary container regardless of what else the family buys.",
      "Urns are not required for scattering. They are required for placement in a columbarium niche or cemetery urn garden, where the specific size is dictated by the niche dimensions.",
    ],
    related: ["cremation", "casket"],
  },
  {
    slug: "vault",
    term: "Vault",
    alsoKnownAs: ["Burial vault", "Outer burial container", "Grave liner"],
    category: "items",
    short:
      "A concrete or metal box placed in the grave around the casket. Required by most cemeteries (not by state law) to keep the ground from settling as the casket decomposes.",
    paragraphs: [
      "Most US cemeteries require an outer burial container — either a 'vault' (concrete, sealed, more expensive) or a 'grave liner' (concrete, open-bottom, less expensive). The reason is operational: vaults prevent the ground from collapsing into the casket over time, which would make mowing and grounds upkeep difficult.",
      "Vaults are not required by any state law. The cemetery's contract is the reason. Some cemeteries — usually older, smaller, or specifically green — do not require any outer container.",
      "Typical 2026 prices: basic concrete grave liner $700–$1,500; sealed concrete vault $1,500–$3,500; bronze or copper vault $5,000–$15,000. Like caskets, vaults can be bought third-party at significant savings, though fewer families know this is an option.",
    ],
    watchOut:
      "Funeral homes sometimes describe vaults as 'protective' or 'guaranteeing eternal protection.' These are sales claims, not facts. The mechanical purpose is to keep the cemetery's grounds level.",
    related: ["casket", "traditional-funeral"],
  },

  // ---------------- Planning timing ----------------
  {
    slug: "pre-need",
    term: "Pre-need",
    alsoKnownAs: ["Pre-arrangement", "Pre-planning"],
    category: "timing",
    short:
      "Arrangements made before death — picking services, choosing a casket or urn, sometimes paying in advance. Done by the person who will die or by family on their behalf.",
    paragraphs: [
      "Pre-need planning takes pressure off the family at the moment of death and lets the dying person say what they want. It can be as simple as writing preferences down, or as formal as a signed contract with a specific funeral home and money paid in advance.",
      "Pre-paying for a funeral has real risks. Funeral homes change ownership, close, or refuse to honor contracts decades later. Money put into a 'pre-need trust' or 'pre-need insurance' is sometimes recoverable and sometimes not, depending on state law and the contract's fine print. Many consumer advocates recommend pre-planning the choices but not pre-paying — keep the money in a separate account earmarked for funeral costs instead.",
    ],
    related: ["at-need"],
  },
  {
    slug: "at-need",
    term: "At-need",
    category: "timing",
    short:
      "Arrangements made after the death has occurred. The opposite of pre-need. The vast majority of funeral arrangements happen this way.",
    paragraphs: [
      "At-need arrangements happen in a window of urgency — usually 24 to 72 hours after death — and that pressure is what funeral home upselling exploits. Going in with a written GPL, a budget, and a clear sense of what services the family actually wants is the single biggest defense against being overcharged.",
    ],
    related: ["pre-need", "gpl"],
  },

  // ---------------- After the funeral ----------------
  {
    slug: "probate",
    term: "Probate",
    category: "after",
    short:
      "The court-supervised process of validating a will (if there is one), paying debts, and transferring the deceased's property to heirs. Required in most cases, though some assets bypass it.",
    paragraphs: [
      "Probate happens in the county where the deceased lived. The executor named in the will (or an administrator appointed by the court if there's no will) files paperwork, notifies creditors, inventories assets, pays debts and taxes, and distributes what's left. The process typically takes six months to two years.",
      "Some assets bypass probate: jointly-owned property with right of survivorship, retirement accounts with named beneficiaries, life insurance, and anything in a living trust. A 'small estate' (defined by state — usually under $50,000–$200,000) often qualifies for a simplified process.",
    ],
    related: ["death-certificate", "next-of-kin"],
  },

  // ---------------- People and roles ----------------
  {
    slug: "death-doula",
    term: "Death doula",
    alsoKnownAs: ["End-of-life doula", "Home funeral guide"],
    category: "people",
    short:
      "A non-licensed support person who helps families through the end of life, the moment of death, and immediate aftercare — washing the body, holding a vigil, filing paperwork.",
    paragraphs: [
      "Death doulas are not regulated and not licensed. The field is similar to birth doulas: training programs exist, certifications exist, but there is no government license required to practice. Quality varies widely.",
      "Typical 2026 fees: $500–$1,500 to walk a family through a home funeral end-to-end, $50–$150 per hour for shorter engagements such as planning conversations or hospice support.",
      "Two national directories: the National End-of-Life Doula Alliance (nedalliance.org) and the International End-of-Life Doula Association (inelda.org). The National Home Funeral Alliance (homefuneralalliance.org) maintains a separate list of home-funeral guides specifically focused on family-led care of the body.",
    ],
    related: ["home-funeral"],
  },
  {
    slug: "coroner-medical-examiner",
    term: "Coroner / Medical examiner",
    category: "people",
    short:
      "The official who investigates deaths that did not happen under medical supervision — sudden deaths, accidents, suspicious deaths, deaths of unknown cause. The body stays in their custody until the investigation releases it.",
    paragraphs: [
      "A medical examiner is a physician (usually a board-certified forensic pathologist) appointed to investigate deaths. A coroner is an elected or appointed official who may or may not be a physician, depending on state. About half of US states use medical examiners, the rest use coroners, and a few use a mix.",
      "Their jurisdiction is set by state law. They take custody of the body in: sudden or unexpected deaths, deaths within 24 hours of hospital admission with no diagnosis, deaths from accident or trauma, deaths under suspicious circumstances, deaths of people in custody, and deaths where no physician will sign the certificate.",
      "Bodies under their custody are usually released within 24–72 hours unless an autopsy is performed. Autopsy results — and therefore the final cause-of-death entry on the certificate — can take 4 to 12 weeks. Funeral homes can usually proceed without waiting; the certificate is filed with cause 'pending' and amended later.",
    ],
    related: ["death-certificate", "autopsy"],
  },

  // ---------------- More care of the body ----------------
  {
    slug: "refrigeration",
    term: "Refrigeration",
    category: "body",
    short:
      "Storing the body in a cooled facility (typically 36–40 °F) to slow decomposition. The legal alternative to embalming in every US state.",
    paragraphs: [
      "Refrigeration is how most bodies in the US are held between death and final disposition. Funeral homes, hospital morgues, and crematories all have refrigeration. It is included in the funeral home's basic services fee and does not appear as a separate line item in most cases.",
      "Refrigeration is sufficient for a short viewing held within a few days of death, particularly when the family handles the body and dresses it themselves. It does not allow for the cosmetic preparation that embalming does, so it is not the right choice when the family wants the body to look as it did in life for an open-casket viewing held a week later.",
      "States that require either embalming or refrigeration after a defined time (typically 24–48 hours) include all major US states. Refrigeration always satisfies these rules.",
    ],
    related: ["embalming", "viewing"],
  },
  {
    slug: "autopsy",
    term: "Autopsy",
    category: "body",
    short:
      "A medical examination of the body, internal and external, to determine cause of death. Ordered by a medical examiner or requested by the family in some cases.",
    paragraphs: [
      "Autopsies fall into two categories: forensic (ordered by a medical examiner or coroner to investigate the death) and medical (requested by the family or treating physician to understand a disease or unexplained death). Forensic autopsies are free to the family. Medical autopsies cost $3,000–$5,000 unless performed at the hospital where the person died, in which case some are covered by insurance.",
      "The procedure typically takes 2–4 hours and involves opening the chest, abdomen, and (in most cases) the skull to examine the organs. The body is closed and sutured afterward; visible incisions are placed where clothing would cover them. An open-casket viewing remains possible after an autopsy, though some funeral homes pass through a small additional preparation fee.",
      "Full autopsy results take 6 to 12 weeks. The death certificate is usually filed before results are final, with the cause listed as 'pending' and amended later.",
    ],
    related: ["coroner-medical-examiner", "death-certificate"],
  },
  {
    slug: "columbarium",
    term: "Columbarium",
    category: "body",
    short:
      "A structure with small niches for holding urns. Found in cemeteries and inside some places of worship. The cremation equivalent of a burial plot.",
    paragraphs: [
      "Niches are typically 8–12 inches per side and accommodate a single urn or sometimes two. Many have glass fronts so the urn is visible; others are sealed with a stone or bronze plate engraved with the name and dates.",
      "Costs vary by location and tier (eye-level rows cost more than top or bottom rows). 2026 ranges: $700–$3,000 for the niche itself, plus $200–$600 for the engraved plate, plus opening/closing fees of $200–$500.",
      "A columbarium niche is one of several options for cremated remains — others are scattering, burial (in a cemetery plot, often shallower than a casket plot), home keeping, or splitting the remains across multiple destinations. There is no single legally required option.",
    ],
    related: ["cremation", "urn", "scattering"],
  },
  {
    slug: "scattering",
    term: "Scattering",
    category: "body",
    short:
      "Releasing cremated remains in a chosen location — sea, mountain, forest, garden, sports field. Legal in most situations with a few specific rules.",
    paragraphs: [
      "Federal law allows scattering at sea more than three nautical miles from shore, with notification to the EPA within 30 days. Inland waters require state permits; most national parks require a free permit; private land requires the owner's permission; public land varies by jurisdiction.",
      "Cemeteries often have scattering gardens — designated areas inside the cemetery where ashes can be scattered for a modest fee, with the option of a small marker. This is the legally simplest option for families who want a specific named location to visit but don't want a full burial plot or columbarium niche.",
      "Aircraft scattering is legal under FAA rules with a few conditions (no large containers, no human remains in dense urban airspace). Several companies will scatter on the family's behalf at a designated location, usually for $200–$1,000.",
    ],
    related: ["cremation", "columbarium"],
  },

  // ---------------- More money ----------------
  {
    slug: "funeral-insurance",
    term: "Funeral insurance",
    alsoKnownAs: ["Burial insurance", "Final expense insurance"],
    category: "money",
    short:
      "A small whole-life insurance policy ($5,000–$25,000) marketed to cover funeral costs. Often expensive relative to the payout. A separate savings account usually outperforms it.",
    paragraphs: [
      "Funeral insurance is sold heavily to people over 50 through TV, direct mail, and senior-focused marketing. It is structured as whole life insurance with a small face value. Premiums are level for life. There is usually no medical exam, which is the main selling point.",
      "The economics are usually bad for the buyer. Premiums for a $10,000 policy purchased at age 65 commonly total $15,000–$25,000 over the policyholder's expected lifetime. A separate savings account funded with the same monthly amount would be worth more by the time it is needed, and is fully accessible for any purpose.",
      "The product makes the most sense for buyers with serious health conditions who cannot qualify for term life and who genuinely cannot or will not save the money in another account. For everyone else, a savings account labeled 'funeral fund' is the better choice.",
    ],
    watchOut:
      "Funeral insurance is different from pre-need contracts. Pre-need is a contract with a specific funeral home, locking in services and (sometimes) prices. Funeral insurance is a check from an insurance company that the family can use anywhere. Salespeople sometimes blur the two.",
    related: ["pre-need"],
  },
  {
    slug: "third-party-casket",
    term: "Third-party casket",
    category: "money",
    short:
      "A casket bought from a source other than the funeral home — Costco, Walmart, online dealers, local casket stores. Federal law requires the funeral home to accept it without a handling fee.",
    paragraphs: [
      "Funeral home casket markups commonly run 300–500% above wholesale. The identical casket the home shows in its selection room for $4,000 typically retails online for $1,000–$1,400, delivered to the home within 2–3 business days. For traditional burials, third-party caskets are the single largest cost-savings opportunity.",
      "The FTC Funeral Rule explicitly requires funeral homes to accept caskets bought elsewhere and prohibits any handling fee, inspection fee, or surcharge tied to a third-party casket. Homes that resist or invent fees are violating federal law.",
      "Practical tips: order the casket as early as practical (delivery is 1–3 business days from most vendors), confirm delivery to the funeral home before the service, and bring the receipt to the arrangement meeting so there is no ambiguity that the casket is yours.",
    ],
    related: ["casket", "casket-handling-fee", "ftc-funeral-rule"],
  },

  // ---------------- After / estate ----------------
  {
    slug: "executor",
    term: "Executor",
    alsoKnownAs: ["Personal representative", "Administrator"],
    category: "after",
    short:
      "The person legally responsible for settling a deceased person's estate — paying debts, filing taxes, distributing assets per the will. Named in the will, or appointed by the court if there is none.",
    paragraphs: [
      "If the deceased had a will, it names an executor. The court formally appoints that person and issues 'letters testamentary' authorizing them to act. If there is no will, the court appoints an administrator (usually a close family member) and issues 'letters of administration.' Both roles are functionally the same job.",
      "The executor inventories all assets, opens an estate bank account, notifies creditors, pays valid debts, files the deceased's final income tax return and the estate's tax return, sells or transfers property, and distributes what remains to beneficiaries. The process typically takes 6 months to 2 years.",
      "Most US states allow executors to take a fee for the work (typically 2–5% of the estate value), though family executors often waive it. The executor is personally liable for mistakes — paying creditors out of order, missing the tax deadline, distributing assets too soon — so larger or complicated estates often justify hiring a probate attorney.",
    ],
    related: ["probate", "letters-testamentary", "intestate"],
  },
  {
    slug: "intestate",
    term: "Intestate",
    category: "after",
    short:
      "Dying without a valid will. State law (the 'intestate succession statute') determines who inherits what — usually spouse and children first, then parents, siblings, and outward.",
    paragraphs: [
      "Roughly 60% of US adults die intestate. The state's intestate succession statute is a default; it cannot be changed after death. Each state's rules differ in detail, particularly for blended families: a surviving spouse and the deceased's children from a prior marriage often split assets in specific shares set by state law, regardless of what the deceased would have wanted.",
      "Probate is required for intestate estates in most cases. The court appoints an administrator (functionally an executor, but called administrator when there's no will). The administrator follows the intestate statute in distributing assets.",
      "Assets with named beneficiaries (life insurance, retirement accounts, payable-on-death bank accounts) and jointly-owned property pass outside the intestate process. They go to the named beneficiary or surviving joint owner regardless of state law. This is why a will alone is not a complete estate plan; the beneficiary designations on accounts matter as much or more.",
    ],
    related: ["probate", "executor", "beneficiary-designation"],
  },
  {
    slug: "letters-testamentary",
    term: "Letters testamentary",
    alsoKnownAs: ["Letters of administration"],
    category: "after",
    short:
      "The court document that proves the executor has legal authority to act on behalf of the estate. Required to access the deceased's bank accounts, sell property, and most other estate business.",
    paragraphs: [
      "Banks, brokerages, real estate offices, and the IRS will not deal with an executor without seeing letters testamentary (or letters of administration for no-will cases). The document is issued by the probate court after the will is admitted and the executor is appointed, typically 2–6 weeks after the initial filing.",
      "Most institutions want a certified copy issued within the last 30, 60, or 90 days. Order 5–10 certified copies from the court at the time of issuance; they cost $5–$15 each and going back later for more is a delay you may not have.",
    ],
    related: ["executor", "probate"],
  },
  {
    slug: "beneficiary-designation",
    term: "Beneficiary designation",
    category: "after",
    short:
      "A named recipient for a specific account — life insurance, 401(k), IRA, payable-on-death bank accounts. Overrides the will. Passes outside probate.",
    paragraphs: [
      "Beneficiary designations are set with the financial institution on a separate form, not in the will. They are legally controlling: a will that says 'leave my IRA to my son' is overridden by the IRA's beneficiary form that names a previous spouse from 20 years ago.",
      "This is the single most common estate-planning failure. People update their will and forget to update beneficiary designations on retirement accounts and life insurance, sometimes resulting in major assets going to an ex-spouse or to a deceased family member.",
      "After a death, beneficiaries on these accounts claim them directly with the institution, with the death certificate and a claim form. The money usually arrives in 2–6 weeks. The funds do not pass through probate and are not subject to the will's distribution.",
    ],
    watchOut:
      "Common failure mode: a beneficiary form names a person who has predeceased the account holder, and there is no contingent beneficiary. In that case the account falls back to the estate, joins probate, and may be subject to creditor claims it would have escaped.",
    related: ["payable-on-death", "intestate", "probate"],
  },
  {
    slug: "payable-on-death",
    term: "Payable on death (POD) / Transfer on death (TOD)",
    category: "after",
    short:
      "A simple way to pass a bank account, brokerage account, or vehicle title to a named person at death without going through probate. Set with the institution on a form.",
    paragraphs: [
      "POD designations work on bank accounts; TOD on brokerage accounts; TOD on vehicle titles in about half of US states. The named beneficiary has no rights to the account during the owner's lifetime — they cannot withdraw or even see balances. At death, with a death certificate, the beneficiary takes ownership without court involvement.",
      "POD/TOD is the cheapest and simplest probate-avoidance tool. It does not replace a will (it only covers the specific accounts named) but it can move a substantial portion of an estate outside the probate process.",
    ],
    related: ["beneficiary-designation", "probate"],
  },
  // ---------------- More services and ceremonies ----------------
  {
    slug: "celebration-of-life",
    term: "Celebration of life",
    category: "services",
    short:
      "An informal gathering focused on the person's life rather than their death. Usually no body present, no set script, and held wherever the family likes — a backyard, a bar, a park.",
    paragraphs: [
      "A celebration of life is a memorial service stripped of formality. There is rarely a casket or urn on display, the dress code is whatever the family wants, and the tone leans toward storytelling, music, and food over ritual. It can happen days or months after the death, which removes the time pressure that drives so much funeral spending.",
      "Because it does not require a funeral home's chapel, casket, or staff, the cost is whatever the venue and catering run — often a few hundred dollars, sometimes nothing. Families who choose direct cremation frequently pair it with a celebration of life weeks later.",
    ],
    related: ["memorial-service", "direct-cremation", "celebrant"],
  },
  {
    slug: "immediate-burial",
    term: "Immediate burial",
    category: "services",
    short:
      "Burial shortly after death with no embalming, no viewing, and no formal service at the funeral home. The burial equivalent of direct cremation.",
    paragraphs: [
      "Immediate burial is one of the lowest-cost burial options and, like direct cremation, must appear as its own line on every funeral home's General Price List under the FTC Funeral Rule. It includes basic services, transfer of the body, a simple container, and the burial itself — but skips embalming, cosmetic preparation, viewing, and a chapel ceremony.",
      "Expect roughly $1,500–$5,000 to the funeral home, plus separate cemetery costs for the plot, opening and closing, and any required liner or vault. Families can still hold a graveside gathering or a memorial later without paying for the funeral home's full service package.",
    ],
    related: ["direct-cremation", "graveside-service", "cemetery-plot"],
  },
  {
    slug: "home-funeral",
    term: "Home funeral",
    category: "services",
    short:
      "The family cares for the body and holds the wake at home rather than handing everything to a funeral home. Legal in most of the US, with a few states requiring a funeral director for specific tasks.",
    paragraphs: [
      "In a home funeral the family washes and dresses the body, keeps it cool with dry ice or refrigeration, and holds visitation at home before burial or cremation. It is the way nearly all funerals were handled before the 20th century, and it remains legal across most states. Supporters say it slows the process down and lets people grieve on their own terms.",
      "A handful of states require a licensed funeral director to file the death certificate, obtain the burial-transit permit, or transport the body — so the family does the caregiving while a professional handles certain paperwork. A death doula or home-funeral guide can walk a family through the legal steps in their state.",
    ],
    watchOut:
      "About eight to nine states require some involvement of a licensed funeral director (for filing paperwork or transport). Check your state's rule before assuming you can do everything yourselves.",
    related: ["death-doula", "refrigeration", "burial-transit-permit"],
  },

  // ---------------- Even more care of the body ----------------
  {
    slug: "human-composting",
    term: "Human composting",
    alsoKnownAs: ["natural organic reduction", "terramation"],
    category: "body",
    short:
      "The body is gently transformed into soil over several weeks inside a vessel with wood chips, straw, and alfalfa. Legal in a growing number of states, starting with Washington in 2020.",
    paragraphs: [
      "Also called natural organic reduction, human composting places the body in a reusable vessel with plant material. Microbial activity, warmth, and airflow break everything down — including bones, which are processed after — into roughly a cubic yard of soil over about 30 to 60 days. Families can take some or all of the soil; the rest is often used for land conservation.",
      "It costs roughly $5,000–$7,000, comparable to a modest burial and well below a traditional funeral. As of the mid-2020s it is legal in a slowly expanding list of states; families outside those states sometimes ship the body to a licensed facility.",
    ],
    related: ["green-burial", "aquamation", "cremated-remains"],
  },
  {
    slug: "body-donation",
    term: "Whole-body donation",
    category: "body",
    short:
      "Donating the entire body to medical schools or research programs. Usually free to the family, and many programs cover transport and return the cremated remains afterward.",
    paragraphs: [
      "Whole-body donation supports anatomy education, surgical training, and medical research. Legitimate programs — typically run by universities or established nonprofits — accept the body at no cost, handle transport, and after the study cremate the remains and return them to the family, often within a year.",
      "This is different from organ donation for transplant, which happens immediately and does not rule out a funeral. Whole-body donation generally rules out an open-casket viewing because the body is needed promptly and is not returned intact.",
    ],
    watchOut:
      "Vet the program. Some for-profit “body brokers” have sold donated remains for parts. Stick with university medical schools or accredited nonprofit programs, and get the terms in writing, including whether they can decline the body (for example after an autopsy or certain infections).",
    related: ["cremation", "autopsy"],
  },
  {
    slug: "cremated-remains",
    term: "Cremated remains",
    alsoKnownAs: ["ashes", "cremains"],
    category: "body",
    short:
      "What is returned after cremation: dry, ground bone fragments weighing roughly 3 to 9 pounds. Despite the nickname, they are not ash in the everyday sense.",
    paragraphs: [
      "After cremation, what remains is bone, which is then processed into a uniform, sand-like consistency. An adult typically yields about 3 to 9 pounds. The remains are inert, sterile, and safe to handle, which is why families can keep them, divide them, scatter them, or bury them.",
      "Remains come back in a plain plastic or cardboard container unless you buy an urn. There is no legal requirement to buy an urn from the funeral home — any container works, and urns are widely available for far less elsewhere.",
    ],
    related: ["cremation", "urn", "scattering", "columbarium"],
  },
  {
    slug: "interment",
    term: "Interment",
    category: "body",
    short:
      "The act of placing remains in their final resting place — burial in the ground, or placement in a crypt or niche. Placing cremated remains specifically is called inurnment.",
    paragraphs: [
      "Interment is the umbrella word for the final placement of a body or remains. Ground burial, entombment in a mausoleum crypt, and placement of an urn in a columbarium niche are all forms of interment. Cemeteries usually charge an opening-and-closing or interment fee separate from the plot itself.",
      "You will see the word on cemetery contracts and price lists. “Inurnment” is the narrower term for interring cremated remains; “entombment” refers to placement in an above-ground crypt.",
    ],
    related: ["cemetery-plot", "mausoleum", "columbarium"],
  },
  {
    slug: "mausoleum",
    term: "Mausoleum",
    category: "body",
    short:
      "An above-ground building that holds caskets in sealed chambers called crypts. An alternative to in-ground burial.",
    paragraphs: [
      "A mausoleum entombs a casket in a crypt rather than burying it in the earth. Some families prefer it for tradition, to avoid in-ground burial, or for the appearance of the structure. Community mausoleums hold many crypts; private mausoleums are built for one family and cost far more.",
      "Entombment in a community mausoleum typically runs $4,000–$12,000 or more for the crypt, plus opening-and-closing and the engraving of the crypt front. A private family mausoleum can run into six figures.",
    ],
    related: ["crypt", "interment", "cemetery-plot"],
  },
  {
    slug: "crypt",
    term: "Crypt",
    category: "body",
    short:
      "A single chamber within a mausoleum that holds one casket. The above-ground equivalent of a grave.",
    paragraphs: [
      "A crypt is the individual sealed space a casket is entombed in inside a mausoleum. Crypts are priced by location within the building — eye-level “heart level” crypts cost more than those near the floor or high up. Couples sometimes buy companion crypts side by side or a double-depth crypt.",
      "The price covers the space; expect separate charges for opening and closing the crypt and for engraving the granite or marble front.",
    ],
    related: ["mausoleum", "interment"],
  },

  // ---------------- More caskets, urns, and vaults ----------------
  {
    slug: "coffin",
    term: "Coffin",
    category: "items",
    short:
      "A tapered, six-sided body container, wider at the shoulders and narrow at the feet. In the US the rectangular “casket” has largely replaced it, and people often use the two words interchangeably.",
    paragraphs: [
      "Technically a coffin is the older, body-shaped six-sided form, while a casket is the four-sided rectangular box that dominates the American market. The distinction is mostly historical now; many people say “coffin” to mean any burial container.",
      "Coffin- or casket-style containers are the single most marked-up item in the funeral business. The Funeral Rule gives you the right to buy one from any third party and requires the funeral home to use it without charging a handling fee.",
    ],
    related: ["casket", "third-party-casket", "casket-handling-fee"],
  },
  {
    slug: "alternative-container",
    term: "Alternative container",
    category: "items",
    short:
      "An unfinished, often cardboard or fiberboard box used for cremation in place of a casket. Crematories require a rigid, combustible container — not a casket.",
    paragraphs: [
      "For a direct cremation you do not need a casket. An alternative container — typically heavy cardboard, pressed wood, or fiberboard — satisfies the crematory's requirement for a rigid, combustible enclosure. They cost roughly $50–$150 versus hundreds or thousands for a casket.",
      "The FTC Funeral Rule requires funeral homes to tell you alternative containers are available for direct cremation and to list one on the price list. Some staff skip mentioning it, steering families toward a casket they do not need.",
    ],
    watchOut:
      "If a funeral home says you must buy a casket for cremation, that is false. Ask for the alternative container — they are legally required to offer one for direct cremation.",
    related: ["direct-cremation", "casket", "ftc-funeral-rule"],
  },
  {
    slug: "grave-liner",
    term: "Grave liner",
    category: "items",
    short:
      "A concrete or composite box that lines the grave and supports the soil above the casket so the ground does not sink. A cheaper, unsealed alternative to a burial vault.",
    paragraphs: [
      "Most cemeteries require either a grave liner or a vault so that heavy maintenance equipment can drive over graves without the ground caving in as a casket deteriorates. A liner covers the top and sides but is not sealed, which makes it the budget option — typically $700–$1,500 versus $1,000–$10,000 for a vault.",
      "No state law requires a liner or vault; it is a cemetery rule, not a legal one. If a cemetery requires outer burial containment, the liner is the minimum that satisfies it — the funeral home cannot require you to upgrade to a sealed vault.",
    ],
    watchOut:
      "Funeral homes profit more on sealed vaults and often present them as standard. If the cemetery only requires a liner, you can decline the vault and the “protective” sealing upgrade, which has no proven benefit.",
    related: ["vault", "cemetery-plot"],
  },
  {
    slug: "headstone",
    term: "Headstone",
    alsoKnownAs: ["grave marker", "monument", "gravestone"],
    category: "items",
    short:
      "The stone that marks a grave and carries the inscription. Often dramatically cheaper bought from an independent monument dealer than from the cemetery or funeral home.",
    paragraphs: [
      "Markers range from a flat granite or bronze plaque set flush with the ground to a full upright monument. Flat markers typically run $500–$1,500; upright monuments $1,000–$5,000 and well beyond for large or custom stones. The price depends on stone, size, and the amount of engraving.",
      "Independent monument companies usually beat cemetery and funeral-home pricing by a wide margin for the same stone. You buy direct and have it installed at the grave.",
    ],
    watchOut:
      "Cemeteries may charge a “setting” or “foundation” fee to install a marker you bought elsewhere, and some try to require you to buy through them. They can charge a reasonable installation fee, but watch for rules designed to block outside purchases.",
    related: ["cemetery-plot", "perpetual-care"],
  },
  {
    slug: "shroud",
    term: "Burial shroud",
    category: "items",
    short:
      "A simple cloth used to wrap the body for burial instead of a casket. Standard in Jewish and Muslim practice and common in green burial.",
    paragraphs: [
      "A shroud wraps the body in natural fabric — often linen, cotton, or wool — for direct, biodegradable burial. It is required or traditional in several faiths and is a natural fit for green burial, where the goal is for everything to decompose. Many natural-burial grounds allow a shroud with no casket at all, sometimes on a rigid board for lowering.",
      "Shrouds cost from very little for a plain cloth to a few hundred dollars for a purpose-made burial shroud with handles. They are among the least expensive ways to bury someone.",
    ],
    related: ["green-burial", "home-funeral"],
  },
  {
    slug: "cemetery-plot",
    term: "Cemetery plot",
    alsoKnownAs: ["burial plot", "grave space"],
    category: "items",
    short:
      "The piece of ground you buy for a burial. Paid to the cemetery, entirely separate from funeral-home charges.",
    paragraphs: [
      "Buying a plot purchases the right to be buried in that space, not the land itself. Prices swing enormously by location: rural and small-town plots may run $1,000–$3,000, while plots in major metro cemeteries can be $5,000 to well over $20,000. On top of the plot you pay an opening-and-closing fee, usually $1,000–$3,000.",
      "Plots can often be bought ahead of need, and many cemeteries sell companion or family plots. Some families resell unused plots, though cemeteries frequently restrict or take a cut of resales.",
    ],
    related: ["interment", "perpetual-care", "grave-liner"],
  },

  // ---------------- More paperwork and authority ----------------
  {
    slug: "cremation-authorization",
    term: "Cremation authorization",
    category: "paperwork",
    short:
      "The signed form, completed by the legal next of kin or named agent, that authorizes the crematory to proceed. Because cremation is irreversible, states require explicit written consent.",
    paragraphs: [
      "No crematory will proceed without a signed cremation authorization from the person with the legal right to make the decision. The form identifies the deceased, names the authorizing agent and their relationship, and often directs what happens to the remains. Many states also impose a waiting period — commonly 24 to 48 hours after death — and require the medical examiner or coroner to sign off first.",
      "Disputes among family members can stall a cremation, because the funeral home needs a clear authorizing agent under the state's right-of-disposition order. Naming an agent in advance, in writing, prevents this.",
    ],
    related: ["cremation", "right-of-disposition", "next-of-kin"],
  },

  // ---------------- People and roles ----------------
  {
    slug: "funeral-director",
    term: "Funeral director",
    alsoKnownAs: ["mortician", "undertaker"],
    category: "people",
    short:
      "The licensed professional who coordinates arrangements, files the paperwork, oversees care of the body, and runs the service. Also called a mortician or undertaker.",
    paragraphs: [
      "A funeral director is licensed by the state and handles the logistics families rarely want to think about: transporting the body, filing the death certificate, securing permits, coordinating with the cemetery or crematory, and directing the service. In smaller firms the same person may also be the embalmer; in larger ones the roles are separate.",
      "A good director lays out options and prices plainly and respects the choices you make, including the cheaper ones. The Funeral Rule requires them to give you an itemized price list and to let you choose only the goods and services you want.",
    ],
    related: ["embalmer", "basic-services-fee", "gpl"],
  },
  {
    slug: "embalmer",
    term: "Embalmer",
    category: "people",
    short:
      "The licensed professional who performs embalming — the chemical preservation of a body. May or may not be the same person as the funeral director.",
    paragraphs: [
      "Embalming is a separate license and skill from funeral directing, though many professionals hold both. The embalmer disinfects and temporarily preserves the body and sets the features for a viewing. Their work is what makes an open-casket service with a delay possible.",
      "Embalming is almost never required by law. If there is no public viewing, refrigeration is a legal alternative in every state, and you can decline embalming to save the fee.",
    ],
    related: ["embalming", "refrigeration", "funeral-director"],
  },
  {
    slug: "celebrant",
    term: "Celebrant",
    category: "people",
    short:
      "A trained officiant — usually non-religious — who writes and leads a personalized ceremony. An alternative to clergy for families who want a service without a religious framework.",
    paragraphs: [
      "A funeral celebrant meets with the family, learns the person's story, and crafts a ceremony around it rather than following a set liturgy. They are a natural fit for people who were not religious, for blended-faith families, or for anyone who wants the focus on the individual life.",
      "Celebrants typically charge $250–$1,000, with most around $300–$500 for a funeral service. Funeral homes can refer one, or families can hire independently. Many were trained through programs run by celebrant institutes.",
    ],
    related: ["celebration-of-life", "memorial-service"],
  },
  {
    slug: "pallbearer",
    term: "Pallbearer",
    category: "people",
    short:
      "One of the people who carry or escort the casket. Usually six, given the weight. Honorary pallbearers walk alongside without lifting.",
    paragraphs: [
      "Pallbearers carry the casket from the service to the hearse and to the graveside. Because a casket with a body can weigh several hundred pounds, there are typically six, chosen from close friends and family as a mark of honor. Funeral homes can also provide staff to carry if the family prefers.",
      "Honorary pallbearers are named to recognize a relationship but do not physically carry the casket — useful for those who are older, frail, or simply many. There is no rule about gender or number.",
    ],
    related: ["graveside-service", "traditional-funeral"],
  },

  // ---------------- Even more money ----------------
  {
    slug: "final-expense-insurance",
    term: "Final expense insurance",
    alsoKnownAs: ["burial insurance", "funeral insurance policy"],
    category: "money",
    short:
      "A small whole-life policy, usually $5,000–$25,000, marketed to cover funeral costs. Easy to qualify for, but expensive per dollar of coverage.",
    paragraphs: [
      "Final expense insurance is permanent life insurance in a small face amount, sold specifically as a way to leave money for a funeral. It is easy to get — often with few or no health questions — and the payout goes to a named beneficiary, not locked to any funeral home, so the family keeps whatever is left over.",
      "The trade-off is cost. Premiums are high relative to the benefit, and “guaranteed issue” policies usually carry a graded death benefit: if you die within the first two to three years, the policy pays back only your premiums plus interest, not the full amount.",
    ],
    watchOut:
      "If you live long enough, you can pay more in premiums than the policy ever pays out. For many people a payable-on-death savings account earmarked for the funeral is cheaper and more flexible.",
    related: ["funeral-insurance", "payable-on-death", "pre-need"],
  },
  {
    slug: "perpetual-care",
    term: "Perpetual care",
    alsoKnownAs: ["endowment care"],
    category: "money",
    short:
      "A fund that pays for the ongoing upkeep of a cemetery — mowing, landscaping, repairs. Financed by setting aside a portion of every plot sale, and often charged as a separate fee.",
    paragraphs: [
      "When you buy a plot at a perpetual-care (or endowment-care) cemetery, a slice of the price goes into a trust whose earnings fund maintenance in perpetuity. It is why well-kept cemeteries stay that way long after their plots are sold out. Many states regulate these trusts.",
      "Perpetual care usually covers general grounds upkeep, not the cleaning or repair of an individual headstone, which remains the family's responsibility. Watch for it as a separate line on a cemetery contract.",
    ],
    related: ["cemetery-plot", "headstone"],
  },

  // ---------------- More after the funeral / estate ----------------
  {
    slug: "will",
    term: "Last will and testament",
    alsoKnownAs: ["will"],
    category: "after",
    short:
      "The legal document that says who gets what and names an executor. It still goes through probate — it does not avoid it. Without one, state intestacy law decides.",
    paragraphs: [
      "A will directs how a person's probate property is distributed, names the executor who carries it out, and — critically for parents — can name a guardian for minor children. To be valid it must meet the state's signing and witnessing rules. It can be updated any time before death.",
      "A common misconception is that having a will avoids probate. It does not; it guides the probate court. Tools like payable-on-death accounts, beneficiary designations, and living trusts are what actually move assets outside probate.",
    ],
    related: ["executor", "probate", "intestate", "estate"],
  },
  {
    slug: "estate",
    term: "Estate",
    category: "after",
    short:
      "Everything a person owns at death — real estate, accounts, vehicles, and belongings — minus their debts. The estate is what gets settled and distributed.",
    paragraphs: [
      "The estate is the total of a person's assets and liabilities at death. Settling it means inventorying what they owned, paying valid debts and taxes, and distributing what is left to heirs or beneficiaries. Some assets are part of the probate estate; others — like payable-on-death accounts and life insurance with a living beneficiary — pass outside it.",
      "Whether an estate needs full probate depends on its size and what it holds. Many small estates qualify for a simplified process or a small-estate affidavit instead of a full court proceeding.",
    ],
    related: ["probate", "executor", "small-estate-affidavit", "will"],
  },
  {
    slug: "small-estate-affidavit",
    term: "Small estate affidavit",
    category: "after",
    short:
      "A sworn form that lets heirs collect a modest estate's assets without full probate, when the estate falls under the state's dollar threshold.",
    paragraphs: [
      "Most states offer a simplified path for small estates. The heir signs an affidavit — under oath, often after a short waiting period — and presents it with a death certificate to banks or other holders to release the assets, skipping a full probate case. Thresholds vary widely, roughly $20,000 to $200,000 depending on the state, and some states exclude real estate.",
      "It is the cheapest, fastest way to settle a modest estate. The court forms are usually free or low-cost, and many people complete the process without a lawyer.",
    ],
    related: ["probate", "executor", "estate"],
  },
  {
    slug: "power-of-attorney",
    term: "Power of attorney",
    category: "after",
    short:
      "Authority to act for someone while they are alive — signing documents, managing money, making decisions. It ends the moment they die.",
    paragraphs: [
      "A power of attorney lets a named agent act on someone's behalf during life: a financial POA handles money and property, a medical or healthcare POA makes care decisions if the person cannot. A durable POA stays in effect even after the person becomes incapacitated, which is the whole point for end-of-life planning.",
      "The crucial limit: a power of attorney dies with the person. The moment they die, the agent's authority ends and the executor named in the will (or appointed by the court) takes over.",
    ],
    watchOut:
      "A common and costly mistake is assuming a POA lets you handle a bank account or sign documents after death. It does not. After death you need the executor's authority — Letters Testamentary — not a power of attorney.",
    related: ["executor", "will", "letters-testamentary"],
  },
];

// ---- helpers ----

export function getEntry(slug: string): GlossaryEntry | undefined {
  return GLOSSARY.find((e) => e.slug === slug);
}

export function listSlugs(): string[] {
  return GLOSSARY.map((e) => e.slug);
}

export function groupByCategory(): Record<GlossaryCategory, GlossaryEntry[]> {
  const out = {} as Record<GlossaryCategory, GlossaryEntry[]>;
  for (const cat of Object.keys(CATEGORY_LABELS) as GlossaryCategory[]) {
    out[cat] = [];
  }
  for (const e of GLOSSARY) out[e.category].push(e);
  for (const cat of Object.keys(out) as GlossaryCategory[]) {
    out[cat].sort((a, b) => a.term.localeCompare(b.term));
  }
  return out;
}

export function getRelated(entry: GlossaryEntry): GlossaryEntry[] {
  if (!entry.related) return [];
  return entry.related.map(getEntry).filter((e): e is GlossaryEntry => !!e);
}
