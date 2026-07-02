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

import { detectDocScope } from "./doc-scope";

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
  if (!/cremation/i.test(ctx.rawText)) return false;
  // The merchandise names "burial vault" / "outer burial container" contain the
  // word "burial" but do NOT indicate a ground-burial SERVICE — they're exactly
  // the upsell we're trying to flag on a cremation. Strip those names before
  // testing for an actual burial choice, or the rule never fires on the most
  // common vault naming (which contains "burial").
  const withoutVaultNames = ctx.rawText.replace(
    /(outer\s+)?burial\s+(vault|container)|burial\s+container/gi,
    "",
  );
  return !/burial|interment/i.test(withoutVaultNames);
}

// A negated requirement, e.g. "state law does NOT require...", "a casket is not
// required", "no vault needed". NON-NEGOTIABLE guard for the "required by law"
// rules: the FTC Funeral Rule's OWN mandated disclosures literally contain
// "state or local law does not require that you buy a container" and "a casket
// is not required for direct cremation" — without this guard those COMPLIANT
// lines would fire a false "violation", the single worst false positive.
const NEGATED_REQUIRE =
  /\b(?:no|not|never|n't|isn't|aren't|doesn't|does not|do not|no longer|cannot|can't)\b[^.;\n]{0,20}?(?:requir|mandat|necessary|need)/i;

/**
 * Return the first SINGLE LINE of `text` that contains both the funeral-noun
 * `keyword` and the `trigger` (mandate) phrase, is NOT negated, and carries no
 * `excludeInWindow` term. Per-LINE (not a cross-line character window) on
 * purpose: a vault's "required by law" on one line must NOT bleed into an
 * adjacent casket line and false-fire that casket's "violation" (caught live,
 * deploy #20). The real claim — "A casket is required by law" — is on one line,
 * so per-line still catches it; missing a footnote-style split is the safe
 * (under-claiming) direction. Shared by the four "required by law" rules.
 */
function windowedClaim(opts: {
  text: string;
  keyword: RegExp;
  trigger: RegExp;
  excludeInWindow?: RegExp;
}): string | null {
  const { text, keyword, trigger, excludeInWindow } = opts;
  const kw = new RegExp(keyword.source, "i");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!kw.test(line)) continue;
    if (!trigger.test(line)) continue;
    if (NEGATED_REQUIRE.test(line)) continue;
    if (excludeInWindow && excludeInWindow.test(line)) continue;
    return line.replace(/\s+/g, " ").trim();
  }
  return null;
}

// Mandate phrases that assert a LEGAL requirement (not a cemetery policy).
const LAW_MANDATE =
  /required by (?:state |local )?law|state law requires|legally (?:required|mandated)|required by statute|mandated by law|the law requires/i;

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
      const hasAuthorizationLanguage =
        /not required|optional|you (did )?authoriz|your authoriz|family authoriz|written authoriz/i.test(
          ctx.rawText,
        );
      // If the GPL claims state law requires embalming (almost always false),
      // that's a misrepresentation — but only when the claim is AFFIRMATIVE.
      // windowedClaim's negation guard is load-bearing here: the FTC-compliant
      // disclosure itself reads "embalming is NOT required by state law", and a
      // bare substring match on "required by state law" would false-fire
      // "violation" on a home that disclosed correctly (caught live 2026-07-01 —
      // the AI summary escalated it into "this funeral home is misrepresenting
      // state law... a federal violation" against a fully compliant quote).
      const win = windowedClaim({
        text: ctx.rawText,
        keyword: /embalm/i,
        trigger: LAW_MANDATE,
      });
      if (win) {
        return {
          ruleId: "embalming-no-disclosure",
          severity: "violation",
          title: "Embalming claimed to be required by state law",
          description:
            "Embalming is not legally required in any state. Some states require embalming OR refrigeration after a time window for body holding — the family always has the option to refrigerate instead. A funeral home claiming 'state law requires embalming' is making a misrepresentation prohibited by the FTC Funeral Rule.",
          ftcReference: "16 CFR §453.5(a)(2)",
          evidence: win,
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
      // advances, and any markup disclosed. But we only see the lines the family
      // showed us — the disclosure may be elsewhere on the GPL, or worded as
      // "disbursements"/"advance items"/"accommodations" rather than the literal
      // "cash advance." Death certificates alone appear on nearly every price
      // list, so asserting a confident "violation" here would cry wolf on the
      // majority of real quotes. We instead PROMPT the family to confirm — a
      // claim we can stand behind even from a partial photo. (suspicious, not
      // violation: we can't prove non-disclosure from the price list alone.)
      const cashItem = findItem(ctx, (i) => itemMentions(i, CASH_ADVANCE_KEYWORDS));
      if (!cashItem) return null;
      const hasDisclosure =
        /cash advance|advance item|disbursement|accommodation|paid on (your|the family'?s) behalf|third[\s-]?party (charge|item|fee|payment)|pass[\s-]?through/i.test(
          ctx.rawText,
        );
      if (hasDisclosure) return null;
      return {
        ruleId: "cash-advance-no-disclosure",
        severity: "suspicious",
        title: "Confirm pass-through items are disclosed as cash advances",
        description:
          "Death certificates, clergy honoraria, paid newspaper obituaries, and flowers are typically 'cash advance items' under the FTC Funeral Rule — things the funeral home pays a third party for on your behalf. The home must disclose them as cash advances in writing and disclose any markup over what they actually paid. We don't see that disclosure on what you shared (it may be elsewhere on the price list). Worth confirming — and asking for the actual third-party cost. If you have the vendor's own receipt, honestfuneral.co/cash-advance-check turns the two numbers into the exact documented difference.",
        ftcReference: "16 CFR §453.3(d)",
        evidence: cashItem.name,
        whatToSay:
          "Are these cash advance items? Please put in writing the actual amount you pay the third party for each, plus any markup. The Funeral Rule requires that disclosure.",
      };
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
  // =========================================================================
  // Expansion (2026-06-26): sourced + adversarially verified against the
  // verbatim text of 16 CFR Part 453 (law.cornell.edu). Only 3 carry
  // "violation" severity — all self-proving from the GPL text and gated by the
  // mandatory negation guard (windowedClaim/NEGATED_REQUIRE). When unsure, the
  // grading is "suspicious"/"info" — a false "FTC VIOLATION" is the worst case.
  // =========================================================================
  {
    id: "embalming-on-no-viewing-arrangement",
    detect(ctx) {
      const noViewing =
        isDirectCremation(ctx) ||
        /immediate burial|direct burial/i.test(ctx.rawText) ||
        ctx.serviceTypeHint === "body-donation";
      if (!noViewing) return null;
      // A family may lawfully authorize embalming for a viewing held BEFORE
      // cremation — we can't disprove that, so don't fire if a viewing is shown.
      if (/view(?:ing)?|visitation|open[\s-]?casket/i.test(ctx.rawText)) return null;
      const embalming = findItem(ctx, (i) => itemMentions(i, EMBALMING_KEYWORDS));
      if (!embalming || embalming.cents <= 0) return null; // $0/declined line is the main FP
      return {
        ruleId: "embalming-on-no-viewing-arrangement",
        severity: "suspicious",
        title: "Embalming charged on a no-viewing arrangement",
        description:
          "On a direct cremation or immediate burial with no viewing, embalming is almost never needed. The FTC Funeral Rule's required itemized-statement notice says you do not have to pay for embalming you did not approve when you select arrangements like direct cremation or immediate burial. If no one signed off on it here, you can have it removed.",
        ftcReference: "16 CFR §453.5(b)",
        evidence: embalming.name,
        whatToSay:
          "I selected a no-viewing arrangement. Did the family authorize embalming in writing? If not, please remove it — under the Funeral Rule I don't have to pay for embalming I didn't approve on a direct cremation or immediate burial.",
      };
    },
  },
  {
    id: "vault-required-by-law-claim",
    detect(ctx) {
      const win = windowedClaim({
        text: ctx.rawText,
        keyword: /vault|grave liner|outer burial container|burial container/i,
        trigger: LAW_MANDATE,
      });
      if (!win) return null;
      return {
        ruleId: "vault-required-by-law-claim",
        severity: "violation",
        title: "Vault claimed to be required by law",
        description:
          "No U.S. state law requires a burial vault or grave liner. A cemetery may require one as its own policy — but that is the cemetery's rule, not state law. The FTC Funeral Rule makes it a deceptive act to represent that state or local law requires an outer burial container when that isn't the case.",
        ftcReference: "16 CFR §453.3(c)(1)",
        evidence: win,
        whatToSay:
          "Your price list says a vault is required by law. No state law requires a vault — a cemetery can require one as policy, but that's not the law. Please correct that statement, and tell me whether this is actually the cemetery's policy.",
      };
    },
  },
  {
    id: "casket-required-by-law-claim",
    detect(ctx) {
      const win = windowedClaim({
        text: ctx.rawText,
        keyword: /casket|coffin/i,
        trigger: LAW_MANDATE,
        excludeInWindow: /casket coach|hearse|coach/i,
      });
      if (!win) return null;
      const directCremation =
        isDirectCremation(ctx) && /direct cremation|immediate cremation/i.test(win);
      return {
        ruleId: "casket-required-by-law-claim",
        severity: "violation",
        title: "Casket claimed to be required by law",
        description:
          "No law requires a casket. The FTC Funeral Rule prohibits a funeral home from representing that any federal, state, or local law (or a cemetery or crematory) requires you to buy a casket when that isn't true. For direct cremation specifically, the Rule also bars claiming a casket is required at all.",
        ftcReference: directCremation
          ? "16 CFR §453.3(d)(1); §453.3(b)(1) for direct cremation"
          : "16 CFR §453.3(d)(1)",
        evidence: win,
        whatToSay:
          "Your price list states a casket is required by law. No law requires a casket — for direct cremation I'm entitled to use an alternative container. Please correct that and remove any forced casket charge.",
      };
    },
  },
  {
    id: "declinable-item-required-by-law-claim",
    detect(ctx) {
      const win = windowedClaim({
        text: ctx.rawText,
        keyword:
          /register book|guest book|memorial folder|memorial card|prayer card|\burn\b|keepsake|limousine|flowers|obituary|use of (?:the )?(?:facilities|chapel)|facilities fee/i,
        trigger: LAW_MANDATE,
        // Exclusion set: defer to the dedicated vault/casket/embalming rules.
        excludeInWindow:
          /casket|coffin|vault|outer burial container|grave liner|embalm|basic services|services of (?:the )?funeral director/i,
      });
      if (!win) return null;
      return {
        ruleId: "declinable-item-required-by-law-claim",
        severity: "suspicious",
        title: "An optional item claimed to be required by law",
        description:
          "Things like a register book, prayer cards, an urn, a limousine, or use of the chapel are optional purchases — no law requires them. The FTC Funeral Rule prohibits representing that a law (or a cemetery/crematory) requires any funeral good or service when it doesn't. Worth confirming with the home.",
        ftcReference: "16 CFR §453.3(d)(1)",
        evidence: win,
        whatToSay:
          "Your price list suggests this item is required by law. As far as I know it's optional — can you point to the specific law? If there isn't one, I'd like to decline it.",
      };
    },
  },
  {
    id: "cremation-casket-asserted-required",
    detect(ctx) {
      if (!isDirectCremation(ctx)) return null;
      const win = windowedClaim({
        text: ctx.rawText,
        keyword: /casket|coffin/i,
        trigger: /required|mandatory|must (?:have|purchase|buy)|you (?:must|need)/i,
        // Hearse guard + don't fire when the casket is tied to a (lawful)
        // viewing or where an alternative container is already offered.
        excludeInWindow:
          /casket coach|hearse|coach|alternative container|view(?:ing)?|visitation/i,
      });
      if (!win) return null;
      return {
        ruleId: "cremation-casket-asserted-required",
        severity: "violation",
        title: "Casket asserted as required for direct cremation",
        description:
          "For a direct cremation, the FTC Funeral Rule specifically prohibits a funeral home from representing that a casket is required — by law or otherwise. You are entitled to use an inexpensive alternative container instead.",
        ftcReference: "16 CFR §453.3(b)(1)",
        evidence: win,
        whatToSay:
          "Your price list says a casket is required for direct cremation. That's prohibited by the Funeral Rule — please remove it and provide the alternative container you're required to make available.",
      };
    },
  },
  {
    id: "alternative-container-not-offered",
    detect(ctx) {
      if (!isDirectCremation(ctx)) return null;
      const ALT =
        /alternative container|unfinished wood|fiberboard|cardboard|pressed[\s-]?wood|composition (?:material|box)|cremation container|minimum container|non-metal (?:receptacle|container)/i;
      if (ALT.test(ctx.rawText) || ctx.items.some((i) => ALT.test(i.name))) return null;
      return {
        ruleId: "alternative-container-not-offered",
        severity: "suspicious",
        title: "No alternative container shown on a direct-cremation quote",
        description:
          "If a funeral home arranges direct cremations, the FTC Funeral Rule requires it to make an inexpensive 'alternative container' (an unfinished wood or fiberboard box) available. I don't see one on what you shared — it may be on their separate casket price list, but it's worth confirming so you aren't pushed toward a casket you don't need.",
        ftcReference: "16 CFR §453.4(a)(2)",
        whatToSay:
          "I don't see an alternative container listed for direct cremation. The Funeral Rule requires you to make one available — please send me its price.",
      };
    },
  },
  {
    id: "alternative-container-overpriced",
    detect(ctx) {
      const ALT =
        /alternative container|unfinished wood|fiberboard|cardboard|pressed[\s-]?wood|composition|cremation container|minimum container/i;
      const item = findItem(
        ctx,
        (i) => ALT.test(i.name) && !itemMentions(i, CASKET_KEYWORDS),
      );
      if (!item) return null;
      const over =
        item.classification === "predatory" ||
        item.classification === "high" ||
        item.cents > 300_00;
      if (!over) return null;
      return {
        ruleId: "alternative-container-overpriced",
        severity: "suspicious",
        title: "Alternative container priced like a casket",
        description:
          "An 'alternative container' is, by FTC definition, an unfinished, non-metal box with no ornamentation or fixed lining — it should be inexpensive (commonly around $50–$150). This one is priced far above that, which usually means you're being steered toward casket-level pricing for a basic cremation box.",
        ftcReference: "16 CFR §453.1(a)",
        evidence: item.name,
        whatToSay:
          "An alternative container is just an unfinished box — this price looks like a casket. What's your least expensive alternative container for direct cremation?",
      };
    },
  },
  {
    id: "rental-casket-sold-as-purchase",
    detect(ctx) {
      if (!(isCremationOnly(ctx) || /cremation/i.test(ctx.rawText))) return null;
      if (/rental casket|ceremonial casket|rent(?:al)? (?:a )?casket/i.test(ctx.rawText))
        return null;
      const casket = findItem(
        ctx,
        (i) =>
          mentionsCasket(i) &&
          (i.cents > 1_500_00 ||
            i.classification === "high" ||
            i.classification === "predatory"),
      );
      if (!casket) return null;
      return {
        // No ftcReference — there is no Part 453 provision requiring a rental
        // casket; this is a pure cost-saving nudge, graded info-grade suspicious.
        ruleId: "rental-casket-sold-as-purchase",
        severity: "suspicious",
        title: "Consider a rental casket for the viewing",
        description:
          "For a cremation with a viewing, many funeral homes offer a 'rental' (ceremonial) casket — the body is presented in it for the service, then cremated in an inexpensive insert. That can cost far less than buying a casket outright for a cremation. It's worth asking about.",
        evidence: casket.name,
        whatToSay:
          "We're doing a cremation. Do you offer a rental or ceremonial casket for the viewing instead of buying one outright? I'd like to compare the cost.",
      };
    },
  },
  {
    id: "viewing-witness-id-fee-tied-to-cremation",
    detect(ctx) {
      if (!isCremationOnly(ctx)) return null;
      const win = windowedClaim({
        text: ctx.rawText,
        keyword:
          /identification (?:viewing|fee)|witness(?:ed)? cremation|viewing (?:prior to|before) cremation|ID viewing|positive identification/i,
        trigger: /required|mandatory|non-?optional|must|not optional/i,
      });
      if (!win) return null;
      return {
        ruleId: "viewing-witness-id-fee-tied-to-cremation",
        severity: "suspicious",
        title: "Confirm a viewing/ID fee on a cremation quote is optional",
        description:
          "Some cremation quotes attach a viewing or identification/witness fee. If it's presented as required, the FTC Funeral Rule prohibits conditioning one service on the purchase of another. If it's genuinely optional you can decline it — but a crematory may require positive ID as a lawful safety step, so it's worth confirming.",
        ftcReference: "16 CFR §453.4(b)(1)(i)",
        evidence: win,
        whatToSay:
          "Is this identification/viewing fee optional? If I can decline it, please remove it — and if it's required, tell me whether that's your policy or a state requirement.",
      };
    },
  },
  {
    id: "non-declinable-prep-fee",
    detect(ctx) {
      const PREP =
        /dressing|casketing|cosmetolog|cosmetic|restorative art|preparation of (?:the )?(?:body|remains)|sanitary care|washing and disinfect|setting features/i;
      const item = findItem(
        ctx,
        (i) =>
          PREP.test(i.name) &&
          !/basic services? (?:fee|charge)|services? of (?:the )?funeral director/i.test(
            i.name,
          ),
      );
      if (!item) return null;
      // Require a non-declinability token in proximity to a prep keyword — NOT
      // anywhere in rawText (the FTC boilerplate contains "required").
      const win = windowedClaim({
        text: ctx.rawText,
        keyword: PREP,
        trigger: /non-?declinable|mandatory|required|cannot be declined|not optional/i,
      });
      if (!win) return null;
      if (/optional|you may decline|may be declined|can be declined/i.test(win)) return null;
      return {
        ruleId: "non-declinable-prep-fee",
        severity: "suspicious",
        title: "A prep service charged as non-declinable",
        description:
          "Other than the single basic services fee, the FTC Funeral Rule says a funeral home cannot make any fee non-declinable. A body-preparation service (dressing, casketing, cosmetology, restorative art) listed as mandatory is a yellow flag — these are optional, especially with no open-casket viewing.",
        ftcReference: "16 CFR §453.2(b)(4)(iv)",
        evidence: item.name,
        whatToSay:
          "This preparation charge looks non-declinable. Other than your basic services fee, the Funeral Rule says nothing can be mandatory — can I decline this?",
      };
    },
  },
  {
    id: "dressing-casketing-billed-on-top-of-prep",
    detect(ctx) {
      const prep = findItem(
        ctx,
        (i) =>
          itemMentions(i, EMBALMING_KEYWORDS) ||
          /preparation of (?:the )?(?:body|remains)/i.test(i.name),
      );
      const dressing = findItem(ctx, (i) =>
        /dressing|casketing|cosmetolog|cosmetic|restorative art|hairdress|hair styling/i.test(
          i.name,
        ),
      );
      if (!prep || !dressing) return null;
      return {
        ruleId: "dressing-casketing-billed-on-top-of-prep",
        severity: "info",
        title: "Dressing/casketing and embalming both billed",
        description:
          "Dressing, casketing, cosmetology, and restorative art are separate, declinable services — distinct from embalming or basic preparation. With no open-casket viewing you can decline the ones you don't need. The FTC Funeral Rule lets you select these individually rather than as a bundle.",
        ftcReference: "16 CFR §453.4(b)(1)",
        evidence: dressing.name,
        whatToSay:
          "I see preparation plus separate dressing/cosmetology charges. Which of these are optional? With no open-casket viewing I'd like to decline what isn't needed.",
      };
    },
  },
  {
    id: "duplicate-nondeclinable-fee",
    detect(ctx) {
      const isBasic = (n: string) =>
        /basic services? (?:fee|charge)|services? of (?:the )?funeral director/i.test(n);
      if (!ctx.items.some((i) => isBasic(i.name))) return null;
      const DUP =
        /facilit(?:y|ies) fee|administrative fee|admin fee|coordination fee|overhead fee|preparation room fee/i;
      const FACILITY_USE = /use of (?:the )?(?:facilit|staff|chapel|viewing room)/i;
      const second = findItem(
        ctx,
        (i) => DUP.test(i.name) && !FACILITY_USE.test(i.name) && !isBasic(i.name),
      );
      if (!second) return null;
      return {
        ruleId: "duplicate-nondeclinable-fee",
        severity: "suspicious",
        title: "A second overhead fee stacked on the basic services fee",
        description:
          "The FTC Funeral Rule allows exactly one non-declinable overhead charge: the basic services fee. A second mandatory-looking overhead fee — a facility fee, administrative fee, or coordination fee stacked on top — may be double-charging you for overhead the basic fee is supposed to cover.",
        ftcReference: "16 CFR §453.2(b)(4)(iv)",
        evidence: second.name,
        whatToSay:
          "You already charge a basic services fee, the only non-declinable overhead fee allowed. What does this additional fee cover that isn't already in the basic fee?",
      };
    },
  },
  {
    id: "after-hours-surcharge-on-basic-fee",
    detect(ctx) {
      const win = windowedClaim({
        text: ctx.rawText,
        keyword: /after[\s-]?hours|weekend|holiday|evening|overnight|night(?:time)?/i,
        trigger: /fee|surcharge|charge|premium/i,
        excludeInWindow: /\b(?:no|not|never|waived|included|free)\b/i,
      });
      if (!win) return null;
      return {
        ruleId: "after-hours-surcharge-on-basic-fee",
        severity: "suspicious",
        title: "After-hours / weekend surcharge as a separate overhead fee",
        description:
          "The FTC Funeral Rule requires a home's unallocated overhead — including coordinating at off-hours — to be inside the single basic services fee. A separate after-hours, weekend, or holiday surcharge added as its own mandatory line may be a second overhead charge the Rule doesn't permit.",
        ftcReference: "16 CFR §453.2(b)(4)(iii)(C)",
        evidence: win,
        whatToSay:
          "Is this after-hours surcharge mandatory? Overhead is supposed to be inside your basic services fee — if this is general overhead, it shouldn't be a separate required charge.",
      };
    },
  },
  {
    id: "single-professional-services-no-itemization",
    detect(ctx) {
      if (/package|bundle/i.test(ctx.rawText)) return null; // defer to service-charge-bundled
      const lump = findItem(ctx, (i) =>
        /professional services|service charge|funeral services?(?! of (?:the )?funeral director)/i.test(
          i.name,
        ),
      );
      if (!lump || ctx.totalCents <= 0 || lump.cents <= ctx.totalCents * 0.5) return null;
      if (isDirectCremation(ctx) && /direct cremation|immediate cremation/i.test(lump.name))
        return null;
      const CATS = [
        /forwarding|receiving/i,
        /direct cremation|immediate cremation/i,
        /immediate burial/i,
        /transfer of remains/i,
        /embalm/i,
        /preparation/i,
        /use of (?:facilit|staff)|viewing|visitation|ceremony|graveside/i,
        /hearse/i,
        /limousine|family car/i,
      ];
      if (CATS.filter((re) => re.test(ctx.rawText)).length > 2) return null;
      return {
        ruleId: "single-professional-services-no-itemization",
        severity: "suspicious",
        title: "One lump 'professional services' line, not itemized",
        description:
          "The FTC Funeral Rule requires a General Price List to price each service category separately. This quote looks like one lump 'professional services' charge with the itemized breakdown missing. You're entitled to the fully itemized list.",
        ftcReference: "16 CFR §453.2(b)(4)(ii)",
        evidence: lump.name,
        whatToSay:
          "This looks like one lump service charge. Under the Funeral Rule I'm entitled to a fully itemized General Price List with each category priced separately — please send that.",
      };
    },
  },
  {
    id: "death-certificate-marked-up",
    detect(ctx) {
      const cert = findItem(
        ctx,
        (i) =>
          (i.matchedItemId?.includes("death-cert") ?? false) ||
          /death certificate|certified cop(?:y|ies) of (?:the )?death/i.test(i.name),
      );
      if (!cert) return null;
      if (cert.classification !== "high" && cert.classification !== "predatory") return null;
      return {
        ruleId: "death-certificate-marked-up",
        severity: "suspicious",
        title: "Death certificates priced above the state's per-copy fee",
        description:
          "Death certificates are a cash advance item — the funeral home pays the state's set per-copy fee and passes it to you. The FTC Funeral Rule requires the home to disclose any markup over what it actually pays. This line is priced above the typical per-copy state fee, so it's worth asking what the state charges and how many copies you're getting.",
        ftcReference: "16 CFR §453.3(f)(2)",
        evidence: cert.name,
        whatToSay:
          "How many death certificates is this, and what does the state charge per copy? The Funeral Rule requires you to disclose any markup over the actual government fee.",
      };
    },
  },
  {
    id: "duplicate-permit-filing-fee",
    detect(ctx) {
      const basicPresent = ctx.items.some((i) =>
        /basic services? (?:fee|charge)|services? of (?:the )?funeral director/i.test(i.name),
      );
      if (!basicPresent) return null;
      const permit = findItem(ctx, (i) =>
        /permit|filing fee|file the (?:death )?certificate|documentation fee|paperwork fee|recording fee/i.test(
          i.name,
        ),
      );
      if (!permit) return null;
      return {
        ruleId: "duplicate-permit-filing-fee",
        severity: "suspicious",
        title: "A separate permit/filing fee on top of basic services",
        description:
          "The FTC Funeral Rule's definition of the basic services fee already includes obtaining necessary permits. A separate permit or filing fee on top of the basic fee may be charging you twice for the same work — unless it's a government permit cost the home is passing straight through. Worth asking which it is.",
        ftcReference: "16 CFR §453.1(p)",
        evidence: permit.name,
        whatToSay:
          "Your basic services fee is supposed to include obtaining permits. Is this separate permit/filing fee a government cost you're passing through, or work already covered by the basic fee?",
      };
    },
  },
  {
    id: "cash-advance-item-above-benchmark",
    detect(ctx) {
      const item = findItem(
        ctx,
        (i) =>
          /paid obituary|newspaper (?:notice|obituary|ad)|obituary (?:placement|notice)|flowers|floral/i.test(
            i.name,
          ) &&
          (i.classification === "high" || i.classification === "predatory"),
      );
      if (!item) return null;
      return {
        ruleId: "cash-advance-item-above-benchmark",
        severity: "suspicious",
        title: "A third-party cash advance item priced above benchmark",
        description:
          "Items like a paid newspaper obituary or flowers are usually cash advances — the funeral home pays an outside vendor and passes the cost to you. If that's the case here, the FTC Funeral Rule requires the home to disclose any markup over what it actually paid. This line is above benchmark, so it's worth asking for the vendor's real charge.",
        ftcReference: "16 CFR §453.3(f)(2)",
        evidence: item.name,
        whatToSay:
          "If this is a third-party cost you pay on our behalf, what does the vendor actually charge? The Funeral Rule requires you to disclose any markup over that amount.",
      };
    },
  },
];

/** Run every rule and return the firing detections. */
export function runRules(ctx: DetectionContext): Detection[] {
  // Scope gate first: the FTC Funeral Rule covers funeral providers, not
  // cemeteries or monument dealers. When the document is confidently a
  // cemetery/monument list (cemetery concepts present, zero funeral-home
  // signals), every Rule-based flag would cite a regulation that doesn't
  // govern the seller — replace the whole run with one honest info card.
  // Ties go to the status quo: "unknown" and mixed lists get full checking.
  const scope = detectDocScope(
    ctx.rawText,
    ctx.items.map((i) => i.name),
  );
  if (scope.scope === "cemetery-monument") {
    return [
      {
        ruleId: "cemetery-scope-notice",
        severity: "info",
        title: "This looks like a cemetery or monument price list",
        description:
          "The federal FTC Funeral Rule — the rule behind our violation checks — covers funeral homes, but generally does not cover cemeteries or monument dealers. So we don't flag Funeral Rule violations on this list. Price comparison still applies: cemetery and monument prices vary widely and are negotiable, and you can usually buy a marker or monument from an outside dealer, not just the cemetery.",
        evidence: `Cemetery/monument terms found: ${scope.cemeteryHits.join(", ")}`,
        whatToSay:
          "Ask the cemetery for its full price list in writing, and compare at least one other cemetery or monument dealer before signing — the same grave space, liner, or marker can differ by thousands nearby.",
      },
    ];
  }
  const all = RULES.map((r) => r.detect(ctx)).filter(
    (d): d is Detection => d != null,
  );
  return suppress(all);
}

/**
 * Drop overlapping detections so the family never sees two or three flags on the
 * same line. The item-based casket rule wins over the textual casket claims; the
 * specific death-cert markup rule wins over the generic cash-advance flags.
 */
function suppress(detections: Detection[]): Detection[] {
  const ids = new Set(detections.map((d) => d.ruleId));
  const cad = detections.find((d) => d.ruleId === "cash-advance-no-disclosure");
  return detections.filter((d) => {
    if (
      (d.ruleId === "casket-required-by-law-claim" ||
        d.ruleId === "cremation-casket-asserted-required") &&
      ids.has("casket-required-for-direct-cremation")
    ) {
      return false;
    }
    if (
      d.ruleId === "cash-advance-no-disclosure" &&
      ids.has("death-certificate-marked-up") &&
      d.evidence &&
      /death cert/i.test(d.evidence)
    ) {
      return false;
    }
    if (
      d.ruleId === "cash-advance-item-above-benchmark" &&
      cad &&
      cad.evidence &&
      d.evidence &&
      cad.evidence === d.evidence
    ) {
      return false;
    }
    return true;
  });
}
