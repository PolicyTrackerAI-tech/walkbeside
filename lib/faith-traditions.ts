/**
 * Faith tradition profiles — used by the /decide flow to weight a service-type
 * recommendation, and (in a later session) by per-faith /faith/[tradition] pages.
 *
 * Notes are deliberately practical, not theological. Goal is to help a family
 * make a fair-priced decision quickly, not to teach religion. When a tradition
 * is divided (Reform vs Orthodox Jewish, Sunni vs Shia, etc.) we pick the most
 * common modern American practice and acknowledge the divergence in `notes`.
 */

import type { ServiceType } from "./pricing-data";

export type FaithKey =
  | "secular"
  | "christian-protestant"
  | "christian-catholic"
  | "jewish"
  | "muslim"
  | "hindu"
  | "buddhist"
  | "other";

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
  key: FaithKey;
  label: string;
  /** Disposition expectation in mainstream American practice. */
  dispositionNorm: DispositionNorm;
  /** Plain-English timeline expectation (e.g. "within 24 hours"). */
  timelineNorm: string;
  /** Embalming custom. */
  embalmingNorm: EmbalmingNorm;
  /** One paragraph a family can act on without a chaplain. */
  notes: string;
  /** Default service-type recommendation when the family has no other preference. */
  defaultServiceType: ServiceType;
  /** Optional cheat-sheet customization. Secular / "other" omit this. */
  cheatsheet?: FaithCheatsheetExtras;
}

export const FAITH_TRADITIONS: FaithTradition[] = [
  {
    key: "secular",
    label: "No religious preference / secular",
    dispositionNorm: "either",
    timelineNorm: "Whatever timeline works for the family. Most families hold a service within 1–2 weeks.",
    embalmingNorm: "uncommon",
    notes:
      "No tradition is dictating the choice — it's about what the family wants and can afford. Direct cremation is the lowest-cost path; a memorial service can happen weeks later wherever you want.",
    defaultServiceType: "direct-cremation",
  },
  {
    key: "christian-protestant",
    label: "Christian — Protestant",
    dispositionNorm: "either",
    timelineNorm: "Service typically within 3–7 days. No strict requirement.",
    embalmingNorm: "common",
    notes:
      "Both burial and cremation are accepted across Protestant denominations. A church service with the body present is the most traditional pattern, but cremation followed by a memorial is increasingly common and meaningfully cheaper.",
    defaultServiceType: "traditional-burial",
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
  },
  {
    key: "christian-catholic",
    label: "Christian — Catholic",
    dispositionNorm: "burial-preferred",
    timelineNorm: "Funeral Mass typically within 3–7 days.",
    embalmingNorm: "common",
    notes:
      "Catholic teaching permits cremation but requires that cremated remains be buried or entombed in consecrated ground — not scattered or kept at home. A funeral Mass with the body present remains the preferred form. If choosing cremation, plan for a cemetery niche or grave.",
    defaultServiceType: "traditional-burial",
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
  },
  {
    key: "jewish",
    label: "Jewish",
    dispositionNorm: "burial-required",
    timelineNorm: "Burial within 24–48 hours when possible. Sabbath and holidays may delay by a day.",
    embalmingNorm: "forbidden",
    notes:
      "Traditional Jewish practice requires prompt burial in a simple wood casket, no embalming, no viewing. Reform congregations sometimes accept cremation; Conservative and Orthodox do not. Ask your rabbi if you're uncertain.",
    defaultServiceType: "graveside-burial",
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
  },
  {
    key: "muslim",
    label: "Muslim",
    dispositionNorm: "burial-required",
    timelineNorm: "Burial within 24 hours when possible.",
    embalmingNorm: "forbidden",
    notes:
      "Islamic practice requires prompt burial without embalming or cremation. The body is washed and shrouded (ghusl and kafan), placed in a simple coffin or directly in the grave depending on local law, and buried facing Mecca. Coordinate with your local mosque — many have a burial committee that handles ghusl and arrangements.",
    defaultServiceType: "graveside-burial",
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
  },
  {
    key: "hindu",
    label: "Hindu",
    dispositionNorm: "cremation-required",
    timelineNorm: "Cremation typically within 24 hours.",
    embalmingNorm: "discouraged",
    notes:
      "Cremation is the standard practice. A short pre-cremation viewing or ceremony at the funeral home is typical, often led by the eldest son or another close family member. Ashes are usually scattered in moving water, ideally a sacred river.",
    defaultServiceType: "cremation-with-service",
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
  },
  {
    key: "buddhist",
    label: "Buddhist",
    dispositionNorm: "cremation-preferred",
    timelineNorm: "Service often held 3–7 days after death; some traditions wait up to 49 days for full memorial rites.",
    embalmingNorm: "uncommon",
    notes:
      "Cremation is most common across Buddhist traditions, following the example of the Buddha. Practices vary widely between Theravada, Mahayana, and Vajrayana lineages — your local sangha or temple can guide specifics.",
    defaultServiceType: "cremation-with-service",
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
  },
  {
    key: "other",
    label: "Other / not listed",
    dispositionNorm: "either",
    timelineNorm: "Depends on tradition.",
    embalmingNorm: "uncommon",
    notes:
      "If your tradition isn't listed, the recommendation below is based purely on the practical questions — body present, budget, and disposition preference. Your community or clergy can advise on customs.",
    defaultServiceType: "direct-cremation",
  },
];

export const FAITH_BY_KEY: Record<FaithKey, FaithTradition> = Object.fromEntries(
  FAITH_TRADITIONS.map((t) => [t.key, t]),
) as Record<FaithKey, FaithTradition>;

export function getFaith(key: FaithKey): FaithTradition {
  return FAITH_BY_KEY[key];
}
