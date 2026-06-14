/**
 * Bundling and FTC violation detection rules.
 *
 * Margaret refactor — the moat. /analyzer already flags individual
 * line items as good/fair/high/predatory by comparing against regional
 * fair-price ranges. The detection rules in this file go further:
 * they look at the FULL price list (text + parsed items) and flag
 * specific FTC Funeral Rule violations and known bundling tricks.
 *
 * Why this matters: the FTC Funeral Rule (16 CFR Part 453) has been in
 * effect since 1984. It requires itemized General Price Lists, prohibits
 * bundling, and forbids requiring caskets for direct cremation. It is
 * widely violated. Most families don't know their rights. We do.
 *
 * Each rule has a severity:
 * - "violation": we believe this violates the FTC Funeral Rule.
 *   Surface with statute reference and a script the family can use.
 * - "suspicious": legal but a known upsell trick.
 * - "info": worth noting but not actionable.
 *
 * Sister will extend this file as she sees patterns in the wild.
 */

export type Severity = "violation" | "suspicious" | "info";

export interface AnalyzedItem {
  name: string;
  cents: number;
  matchedItemId?: string;
  classification?: "good" | "fair" | "high" | "predatory";
  fairCentsLow?: number;
  fairCentsHigh?: number;
}

export interface DetectionContext {
  /** Original GPL text the family pasted. */
  rawText: string;
  /** Parsed line items with classifications. */
  items: AnalyzedItem[];
  /** Optional service-type hint from /decide. */
  serviceTypeHint?: string;
  /** Total quoted (cents). */
  totalCents: number;
}

export interface Detection {
  ruleId: string;
  severity: Severity;
  title: string;
  description: string;
  /** Statute citation when applicable. */
  ftcReference?: string;
  /** The line of text or item name that triggered the rule. */
  evidence?: string;
  /** Short script the family can quote back to the funeral home. */
  whatToSay?: string;
}

export interface Rule {
  id: string;
  detect: (ctx: DetectionContext) => Detection | null;
}

// ---------------------------------------------------------------------------
// Helpers used by multiple rules.
// ---------------------------------------------------------------------------

const CASKET_KEYWORDS = ["casket", "coffin"];
const EMBALMING_KEYWORDS = ["embalm"];
const VAULT_KEYWORDS = ["vault", "burial vault", "outer burial container"];
// "Casket coach" is a funeral term for the hearse — it contains the word
// "casket" but is NOT casket merchandise. Guard the casket rules against it.
const HEARSE_KEYWORDS = ["hearse", "coach"];
const CASH_ADVANCE_KEYWORDS = [
  "cash advance",
  "death certificate",
  "obituary",
  "clergy honorarium",
  "newspaper notice",
  "flowers",
  "hairdresser",
  "cosmetician",
  "pallbearers",
];

function lower(s: string): string {
  return s.toLowerCase();
}

function itemMentions(item: AnalyzedItem, kws: string[]): boolean {
  const n = lower(item.name);
  return kws.some((k) => n.includes(k));
}

// True only for actual casket merchandise — excludes the hearse ("casket
// coach"), which contains the word "casket" but is a vehicle, not a casket.
function mentionsCasket(item: AnalyzedItem): boolean {
  return (
    itemMentions(item, CASKET_KEYWORDS) && !itemMentions(item, HEARSE_KEYWORDS)
  );
}

function findItem(
  ctx: DetectionContext,
  predicate: (item: AnalyzedItem) => boolean,
): AnalyzedItem | undefined {
  return ctx.items.find(predicate);
}

function isDirectCremation(ctx: DetectionContext): boolean {
  if (
    ctx.serviceTypeHint === "direct-cremation" ||
    ctx.serviceTypeHint === "body-donation"
  ) {
    return true;
  }
  return /direct cremation|immediate cremation/i.test(ctx.rawText);
}

function isCremationOnly(ctx: DetectionContext): boolean {
  if (
    ctx.serviceTypeHint?.includes("cremation") ||
    ctx.serviceTypeHint === "body-donation"
  ) {
    return true;
  }
  return (
    /cremation/i.test(ctx.rawText) && !/burial|interment/i.test(ctx.rawText)
  );
}

// ---------------------------------------------------------------------------
// The rules themselves.
// ---------------------------------------------------------------------------

export const RULES: Rule[] = [
  // -------------------------------------------------------------------------
  // FTC violations
  // -------------------------------------------------------------------------
  {
    id: "casket-required-for-direct-cremation",
    detect(ctx) {
      if (!isDirectCremation(ctx)) return null;
      const casket = findItem(ctx, (i) => mentionsCasket(i));
      if (!casket) return null;
      // Direct cremation needs only an "alternative container" — typically <$200.
      // A casket on a direct-cremation quote is either an FTC violation (if required)
      // or a steered upsell (if pretended optional). Either way, flag it.
      return {
        ruleId: "casket-required-for-direct-cremation",
        severity: "violation",
        title: "Casket on a direct-cremation quote",
        description:
          "The FTC Funeral Rule prohibits requiring a casket for direct cremation. Funeral homes must offer an unfinished wood box or 'alternative container' (typically under $200). If this casket is being presented as required, it is a violation. If it is being upsold as optional, decline it.",
        ftcReference: "16 CFR §453.4(a)(2)",
        evidence: casket.name,
        whatToSay:
          "I'm choosing direct cremation. Please remove the casket from this quote and replace it with the alternative container required by the FTC Funeral Rule.",
      };
    },
  },
  {
    id: "embalming-no-disclosure",
    detect(ctx) {
      const embalming = findItem(ctx, (i) =>
        itemMentions(i, EMBALMING_KEYWORDS),
      );
      if (!embalming) return null;
      // Look for any mention of "not required" / "optional" / "you authorized" /
      // "your authorization" near embalming. Embalming requires written
      // authorization from the family per the FTC.
      const txt = lower(ctx.rawText);
      const hasAuthorizationLanguage =
        /not required|optional|you (did )?authoriz|your authoriz|family authoriz|written authoriz/i.test(
          ctx.rawText,
        );
      // If the GPL just lists embalming as a charged item with no mention that
      // it's optional or that the family authorized it, that's a disclosure
      // violation. Also flag if the GPL claims state law requires it (almost
      // always false).
      if (
        /required by (state )?law|state law requires/.test(txt) &&
        /embalm/.test(txt)
      ) {
        return {
          ruleId: "embalming-no-disclosure",
          severity: "violation",
          title: "Embalming claimed to be required by state law",
          description:
            "Embalming is not legally required in any state. Some states require embalming OR refrigeration after a time window for body holding — the family always has the option to refrigerate instead. A funeral home claiming 'state law requires embalming' is making a misrepresentation prohibited by the FTC Funeral Rule.",
          ftcReference: "16 CFR §453.5(a)(2)",
          evidence: embalming.name,
          whatToSay:
            "Please point to the specific state statute requiring embalming. I'd like to choose refrigeration instead — that satisfies any state holding-period rule.",
        };
      }
      if (!hasAuthorizationLanguage) {
        return {
          ruleId: "embalming-no-disclosure",
          severity: "suspicious",
          title: "Embalming charged without authorization disclosure",
          description:
            "FTC rules require funeral homes to obtain written authorization before embalming and to disclose in writing that embalming is not required by law. The lack of any 'authorized' or 'optional' language near the embalming charge here is a yellow flag — confirm with the home in writing.",
          ftcReference: "16 CFR §453.5",
          evidence: embalming.name,
          whatToSay:
            "I don't see written authorization for embalming on this quote. Did the family authorize it in writing? If not, please remove the charge.",
        };
      }
      return null;
    },
  },
  {
    id: "vault-required-for-cremation",
    detect(ctx) {
      if (!isCremationOnly(ctx)) return null;
      const vault = findItem(ctx, (i) => itemMentions(i, VAULT_KEYWORDS));
      if (!vault) return null;
      return {
        ruleId: "vault-required-for-cremation",
        severity: "violation",
        title: "Burial vault on a cremation quote",
        description:
          "Burial vaults / outer burial containers are only relevant for ground burial. Charging one on a cremation-only arrangement is either an FTC misrepresentation (if required) or a clear upsell (if pretended optional).",
        ftcReference: "16 CFR §453.5(b)",
        evidence: vault.name,
        whatToSay:
          "We're not having a ground burial — please remove the burial vault from this quote.",
      };
    },
  },
  {
    id: "cash-advance-no-disclosure",
    detect(ctx) {
      // Cash advance items (clergy honorarium, death certificates, paid obit,
      // flowers, hairdresser, etc.) must be disclosed in writing as cash
      // advances and the funeral home cannot mark them up without disclosure.
      const cashItem = findItem(ctx, (i) => itemMentions(i, CASH_ADVANCE_KEYWORDS));
      if (!cashItem) return null;
      const hasDisclosure = /cash advance/i.test(ctx.rawText);
      if (!hasDisclosure) {
        return {
          ruleId: "cash-advance-no-disclosure",
          severity: "violation",
          title: "Pass-through item not disclosed as cash advance",
          description:
            "Death certificates, clergy honoraria, paid newspaper obituaries, and similar items the funeral home pays on your behalf are 'cash advance items' under the FTC Funeral Rule. They must be disclosed as such in writing, and any markup must also be disclosed. The lack of 'cash advance' language anywhere on this list is a violation.",
          ftcReference: "16 CFR §453.3(d)",
          evidence: cashItem.name,
          whatToSay:
            "Is this a cash advance item? I'd like the actual cost the funeral home pays the third party, in writing. The Funeral Rule requires that disclosure.",
        };
      }
      return null;
    },
  },
  {
    id: "service-charge-bundled",
    detect(ctx) {
      // The basic services fee is the only legally non-declinable charge.
      // It should be ONE clearly-itemized line. If the GPL bundles service
      // charges into a "package" without showing components, that's
      // non-itemization — a Funeral Rule violation.
      const txt = lower(ctx.rawText);
      const hasPackage = /package|bundle/.test(txt);
      const hasItemizedBasicService = ctx.items.some((i) =>
        /basic services? (fee|charge)|services? of (the )?funeral director/i.test(
          i.name,
        ),
      );
      if (hasPackage && !hasItemizedBasicService) {
        return {
          ruleId: "service-charge-bundled",
          severity: "violation",
          title: "Services bundled into a package without itemization",
          description:
            "The FTC Funeral Rule requires every funeral home to provide a fully itemized General Price List on request, with each service or merchandise item listed separately with its individual price. Selling a 'package' or 'bundle' without showing the underlying line items is non-compliance — and almost always means you're paying for things you don't need.",
          ftcReference: "16 CFR §453.2(b)(4)",
          whatToSay:
            "Per the FTC Funeral Rule, please send me an itemized General Price List with each service and merchandise item priced individually. I'm not buying a package.",
        };
      }
      return null;
    },
  },
  // -------------------------------------------------------------------------
  // Suspicious upsells (legal, but families often overpay)
  // -------------------------------------------------------------------------
  {
    id: "basic-services-fee-high",
    detect(ctx) {
      const basic = findItem(ctx, (i) =>
        /basic services? (fee|charge)|services? of (the )?funeral director/i.test(
          i.name,
        ),
      );
      if (!basic) return null;
      // Fair range for basic services fee is roughly $1,500–$2,500. Above
      // $3,500 is a red flag — it suggests the home is loading other margin
      // into this non-declinable item.
      if (basic.cents > 3_500_00) {
        return {
          ruleId: "basic-services-fee-high",
          severity: "suspicious",
          title: "Basic services fee above market",
          description:
            "The basic services fee is the only charge a funeral home cannot itemize away. Fair national range is $1,500–$2,500. Anything above $3,500 typically means the home is loading hidden margin into this non-declinable line. Worth pushing back on, even though it's legal.",
          evidence: basic.name,
          whatToSay:
            "Your basic services fee is significantly above the fair regional range. Is there a breakdown of what's included? I'd like to understand what justifies the price.",
        };
      }
      return null;
    },
  },
  {
    id: "protective-casket-pitched",
    detect(ctx) {
      const txt = lower(ctx.rawText);
      if (
        /protective|seal(er|ed|ing)|gasketed|rubber gasket|copper|bronze/.test(
          txt,
        ) &&
        /casket|coffin/.test(txt)
      ) {
        return {
          ruleId: "protective-casket-pitched",
          severity: "suspicious",
          title: "'Protective' or 'sealing' casket pitched",
          description:
            "Funeral homes have historically marketed 'protective' or 'sealing' caskets as preserving the body longer. This claim is not supported by science — the gasketing has minimal effect on decomposition. The FTC has issued guidance discouraging this language. The premium is typically $1,000–$3,000 over a comparable non-sealing casket.",
          whatToSay:
            "We're not interested in the protective or sealed casket option. Please show me your simplest comparable casket without the gasket upcharge.",
        };
      }
      return null;
    },
  },
  {
    id: "predatory-line-items",
    detect(ctx) {
      const predatoryItems = ctx.items.filter(
        (i) => i.classification === "predatory",
      );
      if (predatoryItems.length === 0) return null;
      const names = predatoryItems.map((i) => i.name).slice(0, 5).join("; ");
      return {
        ruleId: "predatory-line-items",
        severity: "suspicious",
        title: `${predatoryItems.length} line item${predatoryItems.length === 1 ? "" : "s"} priced in the predatory range`,
        description:
          "These items are priced significantly above the fair regional range. Each one alone might be negotiable; together they're a pattern. A funeral home with multiple predatory line items often has more we haven't flagged here — request a fully itemized General Price List and compare against the regional ranges in our /prices lookup.",
        evidence: names,
        whatToSay:
          "These specific line items are far above what I've seen in regional fair-price data. Can you walk me through what justifies these prices, and what your simplest comparable option looks like for each?",
      };
    },
  },
  // -------------------------------------------------------------------------
  // Informational
  // -------------------------------------------------------------------------
  {
    id: "third-party-merchandise-rights",
    detect(ctx) {
      const item = findItem(ctx, (i) =>
        mentionsCasket(i) || itemMentions(i, [...VAULT_KEYWORDS, "urn"]),
      );
      if (!item) return null;
      return {
        ruleId: "third-party-merchandise-rights",
        severity: "info",
        title:
          "You can buy the casket, vault, or urn from a third party — usually the biggest saving",
        description:
          "Under the FTC Funeral Rule, you may buy a casket, outer burial container (vault), or urn from any outside seller — and the funeral home must accept it without charging a handling fee, and can't require you to be there when it's delivered. Funeral-home caskets are commonly marked up 300-500%; comparable caskets from Costco, Amazon, or a dedicated online seller routinely cost 50-80% less. For most families this is the single largest saving available.",
        ftcReference: "16 CFR §453.4(b)(1)",
        evidence: item.name,
        whatToSay:
          "I plan to purchase the casket/urn from an outside seller and have it delivered to you. Per the FTC Funeral Rule you can't charge a handling fee or require me to be present — please confirm in writing.",
      };
    },
  },
  {
    id: "no-gpl-attestation",
    detect(ctx) {
      // The Funeral Rule requires the GPL to identify itself as a General
      // Price List with the funeral home name and effective date.
      const hasGplLanguage =
        /general price list|gpl|effective (date|as of)|price list/i.test(
          ctx.rawText,
        );
      if (hasGplLanguage) return null;
      return {
        ruleId: "no-gpl-attestation",
        severity: "info",
        title: "Document doesn't identify itself as a General Price List",
        description:
          "FTC-compliant General Price Lists identify themselves as such, name the funeral home, and have an effective date. If this document is missing those, it may be a quote rather than the formal GPL — which is what you're entitled to under the Funeral Rule. Worth confirming you have the actual GPL in hand.",
        ftcReference: "16 CFR §453.2(b)(4)",
        whatToSay:
          "Could you send me your formal General Price List (the document that identifies itself as such, with your effective date)? I want to make sure I'm comparing across homes consistently.",
      };
    },
  },
];

/** Run every rule and return the firing detections. */
export function runRules(ctx: DetectionContext): Detection[] {
  return RULES.map((r) => r.detect(ctx)).filter(
    (d): d is Detection => d != null,
  );
}
