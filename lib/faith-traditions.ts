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
