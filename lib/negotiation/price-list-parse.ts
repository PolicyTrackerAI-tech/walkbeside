import { LINE_ITEMS, type LineItem } from "@/lib/pricing-data";
import { outsideCasketFee, outsideUrnOrVaultFee } from "@/lib/outside-merchandise";

/**
 * A single line item as extracted from a funeral home's General Price List,
 * before it is benchmarked. Either a single `cents` price, or a selection
 * range (`cents_low`/`cents_high`) for items like caskets/vaults/urns.
 */
export interface RawItem {
  name: string;
  cents?: number;
  cents_low?: number;
  cents_high?: number;
  /** Count, for per-unit items priced as a total (e.g. 10 death certificates). */
  qty?: number;
}

/**
 * Pull a quantity out of a line-item name written by a family or OCR'd from a
 * GPL — "Death certificates (10)", "Death certificates x10", "10 certified
 * copies", "qty: 10". Returns the cleaned name plus the quantity (undefined if
 * none / 1). This is what lets a $250 line for 10 death certificates be judged
 * per-certificate ($25 each) instead of as a single $250 item.
 */
export function extractQty(name: string): { name: string; qty?: number } {
  const patterns: RegExp[] = [
    /\((\d{1,3})\)\s*$/, //               "Death certificates (10)"
    /\s*[x×]\s*(\d{1,3})\b/i, //          "Death certificates x10"
    /\bqty\.?\s*[:=]?\s*(\d{1,3})\b/i, // "qty: 10"
    /\bquantity\s*[:=]?\s*(\d{1,3})\b/i,
    /\b(\d{1,3})\s*(?:copies|certified copies|certificates|each|count|ct)\b/i,
    // Per-day items (refrigeration / sheltering): "(5 days)", "5 days", "3 nights".
    // Optional surrounding parens are consumed so no orphan "( )" is left in the
    // name. qty is only USED downstream when the matched item is perUnit, so this
    // is inert for non-per-day items even if a stray "N day(s)" appears in a name.
    /\(?\s*\b(\d{1,3})\s*(?:days?|nights?)\b\s*\)?/i,
  ];
  for (const re of patterns) {
    const m = re.exec(name);
    if (m) {
      const qty = Number(m[1]);
      if (Number.isFinite(qty) && qty > 1) {
        return { name: name.replace(re, "").replace(/\s{2,}/g, " ").trim(), qty };
      }
    }
  }
  return { name };
}

/** Strip a leading/trailing ```json … ``` fence from an LLM response. */
export function stripCodeFence(s: string): string {
  return s.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
}

/**
 * Tidy an OCR'd item name: drop the dot/colon/underscore/dash "leaders" and
 * stray range lead-ins ("between", "from") that get glued to a name, WITHOUT
 * eating real word hyphens (Set-up, 24-hour, Co-op) — those are never preceded
 * by whitespace, so the whitespace-led hyphen rule can't touch them.
 */
function cleanName(s: string): string {
  return s
    .replace(/[\s.:_–—]*[.:_–—][\s.:_–—]*$/u, "") // trailing dot/colon/underscore/en–em-dash leaders
    .replace(/\s+-+\s*$/, "") //                     trailing ASCII hyphen only when whitespace-led
    .replace(/^(?:between|from|starting at|priced from|as low as)\s+/i, "") // leading range/floor lead-in
    .replace(/\s+(?:between|from|starting at|priced from|as low as)$/i, "") // trailing ("Caskets starting at")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// A *qualifying* money token: $-led, comma-grouped (1,234), or decimal-cents
// (24.00). Used so we only strip a trailing marker that follows real money —
// a bare integer ("Established 1962*") is left alone and stays skippable.
const MONEY = String.raw`(?:\$[\d,]+(?:\.\d{2})?|\d{1,3}(?:,\d{3})+(?:\.\d{2})?|\d+\.\d{2})`;
const reTrailingMarker = new RegExp(
  `(${MONEY})\\s*(?:[*+†★✦¹²³⁰⁴⁵⁶⁷⁸⁹]|\\((?:\\d{1,2}|[a-z])\\)|(?:and|&)\\s*up|or more)\\s*$`,
  "iu",
);

/**
 * Drop ONE trailing footnote/qualifier marker that directly follows a real
 * price — "$895*", "$1,295†", "$895 (1)", "$895 and up", "$895+". Run before
 * any range/single match so "Caskets $800-$10,000*" keeps its full range and an
 * "and up" floor collapses to a single conservative value. Guarded on a
 * qualifying money token so bare years/counts keep their markers (and stay
 * skipped). Single-pass — a rare "$895*(1)" only loses one marker, which is a
 * safe floor (the line may then simply skip).
 */
function stripTrailingMarker(line: string): string {
  return line.replace(reTrailingMarker, "$1");
}

const SEP = String.raw`[\s.:_–—]+`; // pre-price separator: spaces/leaders, but NOT an ASCII hyphen
const NUM = String.raw`[\d,]+(?:\.\d{2})?`;
const reRange = new RegExp(
  `^(.+?)${SEP}(\\$?)(${NUM})\\s*[-–—]\\s*(\\$?)(${NUM})\\s*$`,
);
const reWordRange = new RegExp(
  `^(.+?)\\s+\\$(${NUM})\\s+(?:to|and)\\s+\\$(${NUM})\\s*$`,
  "i",
);
const reSingle = new RegExp(`^(.+?)${SEP}(\\$?)(${NUM})\\s*$`);
// Single price carrying a trailing unit — "$25 each", "$25/copy", "$150 per
// hour". $ is REQUIRED so a bare "25 miles"/"3 nights" can't become a price.
const reUnit = new RegExp(
  `^(.+?)\\s+\\$(${NUM})\\s*(?:\\/\\s*)?(?:each|ea\\.?|apiece|copy|certificate|per\\s+\\w+)\\s*$`,
  "i",
);
// Accounting / payment lines that look priced but are not GPL items. Anchored
// at the start so a real charge that merely contains a word (Tax preparation,
// Paid notice) is preserved.
const NOISE_LEAD =
  /^(?:balance due|amount due|sub-?total|sales tax|deposit|gratuity|credit card|payment|finance charge)\b/i;

const numOf = (s: string): number => Number(s.replace(/,/g, ""));

// --- Quantity columns --------------------------------------------------------
// A count can sit in a LEADING or MIDDLE column that the trailing-name
// extractQty() never sees: "10  Death certificates  $250", "Death certificates
// 10  $250", "Certified copies  2 @ $125". HARD-gated on a death-cert/copy noun
// so a leading/middle number in "24 hour visitation", "8 x 10 photo", "1 hour
// viewing", or "Suite 200" is never mistaken for a quantity. `cents` is kept as
// the line TOTAL (qty × unit for the "N @ $unit" form, where the stated price is
// per-copy) so the downstream per-unit math (total ÷ qty, judged against the
// national flat range) still holds — never store the per-unit price where the
// total belongs, or the subtotal breaks.
const CERT_NOUN = /\b(?:death certificates?|certified copies|copies)\b/i;
const reQtyLead = new RegExp(`^(\\d{1,3})\\s+(.+?)\\s+\\$(${NUM})\\s*$`);
const reQtyAt = new RegExp(`^(.+?)\\s+(\\d{1,3})\\s*@\\s*\\$(${NUM})\\s*$`);
const reQtyMid = new RegExp(`^(.+?)\\s+(\\d{1,3})\\s+\\$(${NUM})\\s*$`);

function extractQtyColumn(
  line: string,
): { name: string; cents: number; qty: number } | null {
  // Leading qty column — "10  Death certificates  $250".
  const lead = reQtyLead.exec(line);
  if (lead) {
    const qty = Number(lead[1]);
    const name = cleanName(lead[2]);
    const total = numOf(lead[3]);
    if (qty > 1 && CERT_NOUN.test(name) && Number.isFinite(total))
      return { name, cents: Math.round(total * 100), qty };
  }
  // "N @ $unit" — the stated price is PER-UNIT, so the line total is qty × unit.
  const at = reQtyAt.exec(line);
  if (at) {
    const qty = Number(at[2]);
    const name = cleanName(at[1]);
    const unit = numOf(at[3]);
    if (qty > 1 && CERT_NOUN.test(name) && Number.isFinite(unit))
      return { name, cents: Math.round(unit * qty * 100), qty };
  }
  // Middle/trailing qty column — "Death certificates  10  $250".
  const mid = reQtyMid.exec(line);
  if (mid) {
    const qty = Number(mid[2]);
    const name = cleanName(mid[1]);
    const total = numOf(mid[3]);
    if (qty > 1 && CERT_NOUN.test(name) && Number.isFinite(total))
      return { name, cents: Math.round(total * 100), qty };
  }
  return null;
}

// --- Two-column OCR collapse -------------------------------------------------
// A two-column GPL photographed and OCR'd can fold two priced items onto one
// text line: "Embalming  $895    Dressing  $250". Split it deterministically,
// but stay conservative (this is the fallback path): require EXACTLY two
// $-prices and a ≥2-space column gap between the first price and the second
// name, so a single item whose name merely contains a "$" figure ("Casket up to
// $2,000 value $1,500", single-spaced) is never split. A reference/sale price
// ("Casket retail $2,000  sale $1,500") is rejected by the qualifier guard.
// Returns the two reconstructed "name $price" halves, or null when it isn't
// confidently two items (the line then parses normally; coverage flags a miss).
const reTwoItems = new RegExp(
  `^(.+?)${SEP}\\$(${NUM})\\s{2,}(.+?)${SEP}\\$(${NUM})\\s*$`,
);
const PRICE_QUALIFIER_HEAD =
  /^(?:sale|save|now|net|less|off|reg\.?|regular|retail|value|msrp|list|disc(?:ount)?|special|reduced|plus|and|or|each|total|sub-?total)\b/i;
const PRICE_QUALIFIER_TAIL =
  /\b(?:retail|reg\.?|regular|was|list|msrp|value|orig(?:inal)?)$/i;

function splitTwoColumn(line: string): [string, string] | null {
  if ((line.match(/\$\s?[\d,]/g) ?? []).length !== 2) return null;
  const m = reTwoItems.exec(line);
  if (!m) return null;
  const name1 = cleanName(m[1]);
  const name2 = cleanName(m[3]);
  if (!/[a-z]/i.test(name1) || !/[a-z]/i.test(name2)) return null;
  if (PRICE_QUALIFIER_TAIL.test(name1) || PRICE_QUALIFIER_HEAD.test(name2))
    return null;
  return [`${name1} $${m[2]}`, `${name2} $${m[4]}`];
}

/**
 * Deterministic fallback parser, used when Claude is unavailable or returns
 * output we can't parse. Per line: strip a trailing marker, split a two-column
 * OCR collapse into its two items, then (most-specific match first) try a
 * dash-range, a $-stated word-range, a leading/middle quantity column, a single
 * price, and a single price with a trailing unit. Names are cleaned of OCR
 * leaders; a stated "total"/"grand total" sets the total (a subtotal only if no
 * total is seen); accounting noise, bare years/addresses, and price-less lines
 * are skipped.
 */
export function naiveExtract(text: string): {
  items: RawItem[];
  total_cents?: number;
} {
  const items: RawItem[] = [];
  let total: number | undefined;

  // Push a single-price item (or route a total / skip noise). Returns true if
  // the line was consumed (item, total, or recognized-and-skipped noise).
  const pushSingle = (rawName: string, token: string, hadDollar: boolean): boolean => {
    const dollars = numOf(token);
    if (!Number.isFinite(dollars)) return false;
    // Bare integer with no $, comma, or cents is almost always a year, address,
    // suite, or count — not a price. Skip rather than fabricate an item.
    const bareInteger =
      !hadDollar && !/\.\d{2}$/.test(token) && !token.includes(",") && /^\d{1,4}$/.test(token);
    if (bareInteger) return false;
    const name = cleanName(rawName);
    if (!name || !/[a-z]/i.test(name)) return false; // e.g. "2 @"
    const cents = Math.round(dollars * 100);
    if (/^(?:grand\s+)?total\b/i.test(name)) {
      total = cents;
      return true;
    }
    if (/^sub-?total\b/i.test(name)) {
      if (total == null) total = cents; // a subtotal never overwrites a total
      return true;
    }
    if (NOISE_LEAD.test(name)) return true; // recognized, not an item
    const { name: cleaned, qty } = extractQty(name);
    items.push(qty ? { name: cleaned, cents, qty } : { name: cleaned, cents });
    return true;
  };

  // Parse one already-trimmed, marker-stripped line as a range, a quantity
  // column, a single price, or a unit-priced item. Returns true if the line was
  // consumed (item pushed, total routed, or recognized-and-skipped noise).
  const consumeLine = (line: string): boolean => {
    // Closed dash-range (caskets/urns/vaults). Require real money on a side so
    // "Open 9-5" / "Visitation 2-4" never become a bogus $9–$5 range.
    const mr = reRange.exec(line);
    if (mr && (mr[2] === "$" || mr[4] === "$" || /\.\d{2}/.test(mr[3] + mr[5]))) {
      const low = numOf(mr[3]);
      const high = numOf(mr[5]);
      const name = cleanName(mr[1]);
      if (Number.isFinite(low) && Number.isFinite(high) && /[a-z]/i.test(name)) {
        items.push({
          name,
          cents_low: Math.round(low * 100),
          cents_high: Math.round(high * 100),
        });
        return true;
      }
    }

    // Closed range stated in words: "$95 to $1,200", "between $800 and $10,000".
    // $ required on both bounds so "Lots 100 to 200" / "Sections 1 and 2" skip.
    const mw = reWordRange.exec(line);
    if (mw) {
      const low = numOf(mw[2]);
      const high = numOf(mw[3]);
      const name = cleanName(mw[1]);
      if (Number.isFinite(low) && Number.isFinite(high) && /[a-z]/i.test(name)) {
        items.push({
          name,
          cents_low: Math.round(low * 100),
          cents_high: Math.round(high * 100),
        });
        return true;
      }
    }

    // Quantity in a leading/middle column or "N @ $unit" — gated on a
    // death-cert/copy noun; cents stays the line TOTAL for the per-unit math.
    const qc = extractQtyColumn(line);
    if (qc) {
      items.push({ name: qc.name, cents: qc.cents, qty: qc.qty });
      return true;
    }

    // Single price — also catches a floor ("from $1,295") as one value.
    const ms = reSingle.exec(line);
    if (ms && pushSingle(ms[1], ms[3], ms[2] === "$")) return true;

    // Single price with a trailing unit ("$25 each", "$150 per hour").
    const mu = reUnit.exec(line);
    if (mu && pushSingle(mu[1], mu[2], true)) return true;

    return false;
  };

  for (const rawLine of text.split(/\r?\n/)) {
    let line = rawLine.trim();
    if (!line) continue;
    line = stripTrailingMarker(line);

    // Two "name $price" columns collapsed onto one OCR line — parse each half
    // through the normal pipeline (so a qty column inside a half still works).
    const halves = splitTwoColumn(line);
    if (halves) {
      consumeLine(halves[0]);
      consumeLine(halves[1]);
      continue;
    }

    consumeLine(line);
  }

  return { items, total_cents: total };
}

/**
 * Match a free-text line-item name to a benchmarked LINE_ITEM.
 *
 * Synonyms within a LINE_ITEM name are separated by "/" (e.g. "Family car /
 * limousine", "Grave liner / burial vault"). Within each synonym we drop
 * trailing qualifiers in parentheses or after an em-dash ("(each)",
 * "— newspaper") so generic words like "each" / "basic" / "local" can't cause
 * false hits. A synonym matches if it appears as a whole word ("urn" hits
 * "urn" but not "return"), or — for multi-word synonyms — if every word
 * appears somewhere in the name.
 *
 * A direct-cremation package line is matched as the package, and a burial
 * package or a cremation package with services is never benchmarked (see
 * packageKind); nor is a casket add-on such as a handling fee or an upgrade
 * (see isCasketAddOn), nor a fee for an urn or vault bought elsewhere (see
 * outsideUrnOrVaultFee).
 */
export function matchLineItem(name: string): LineItem | undefined {
  const n = name.toLowerCase();
  // "Washing and disinfecting remains (no embalming)" named embalming only
  // to rule it out, and was judged against embalming's range. Drop the
  // negated mention before the synonym pass ("Refrigeration of un-embalmed
  // remains" still reads as refrigeration).
  const m = n.replace(NEGATED_EMBALMING, " ");
  const pkg = packageKind(n);
  if (pkg === "direct-cremation") return LINE_ITEMS.find((it) => it.id === "direct-cremation-fee");
  if (pkg === "unbenchmarked") return undefined;
  // An emblem, applique or personalization for an urn is priced on top of
  // the urn ("Urn Emblems" $45 on the J.B. Jenkins 2024 GPL read as a $45
  // urn and would pull the urn benchmark down).
  if (/\burns?\b/.test(n) && /\b(?:emblems?|appliques?|personaliz\w*)\b/.test(n)) return undefined;
  if (isCasketAddOn(n)) return undefined;
  // The same fee for an urn or a vault bought elsewhere (lib/outside-merchandise.ts):
  // "Handling fee for urn provided by the family" used to hit the "urn"
  // synonym and read against an urn's price range.
  if (outsideUrnOrVaultFee(n)) return undefined;
  const direct = LINE_ITEMS.find((it) => {
    const synonyms = it.name
      .toLowerCase()
      .split("/")
      .map((s) => s.split(/[—(]/)[0].trim())
      .filter(Boolean);
    return synonyms.some((key) => {
      const re = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
      if (re.test(m)) return true;
      const words = key.split(/\s+/);
      return words.length > 1 && words.every((w) => m.includes(w));
    });
  });
  // Both casket items reduce to the bare synonym "casket", so every casket
  // matched the metal one first, and a wood casket was judged against the
  // 18-gauge steel range. A casket named as wood (and not as metal) is wood.
  if (direct?.id === "casket-metal" && WOOD_CASKET.test(m) && !METAL_CASKET.test(m))
    return LINE_ITEMS.find((it) => it.id === "casket-wood");
  if (direct) return direct;
  const alias = WORDING_ALIASES.find(([re]) => re.test(m));
  return alias ? LINE_ITEMS.find((it) => it.id === alias[1]) : undefined;
}

// Standard GPL wordings the synonym pass can't reach. The FTC Funeral Rule's
// own label for the non-declinable fee is "Basic services of funeral
// director and staff". It has no "fee" in it, so the "Basic services fee"
// synonym missed the most common line on real price lists and left the one
// charge no family can decline out of the savings total. Checked only after
// the synonym pass, so a package line that mentions basic services ("Direct
// cremation, includes basic services of funeral director…") keeps its
// package match.
//
// Added from the DC harvest (John T. Rhines, 2026): "Prof. Services of
// Funeral Director, Staff, and Overhead" is the same non-declinable fee;
// "Cosmetics, Dressing, and Hairstyling" is the FTC "other preparation"
// line (but "Dressing and casketing" alone stays unbenchmarked: the
// dressing-casketing-billed-on-top-of-prep rule treats it as an add-on); "Funeral Director for Committal Service" is the graveside service;
// and a singular certified death certificate priced per copy is the
// death-certificate benchmark. Each is narrow on purpose: "Coloring of hair"
// alone is an add-on, not body preparation, and "filing of death
// certificate" inside a package description is not a per-copy price.
//
// From the DC fh-content harvest (Stewart, 2024; Tri-State): a "Daily
// storage fee" for the remains is the per-day shelter fee. Storage of
// cremains is not.
//
// From the Maryland harvest (J.B. Jenkins, 2024): "Holding remains in
// facility after 7 days" is the same per-day fee after a grace period;
// "Professional/Basic Service Fee" (singular, slashed) is the basic services
// fee; "Funeral Ceremony" is the use of staff for the ceremony, unless the
// line is a cremation or burial package; and "Maryland Certified Copies"
// under a death-certificates header are death certificates.
const WORDING_ALIASES: ReadonlyArray<readonly [RegExp, string]> = [
  [/\b(?:basic|professional|prof\.?)\s+services of (?:the )?(?:funeral director|staff)\b/, "basic-services"],
  [/\bnon-?declinable basic services\b/, "basic-services"],
  [/\bcosmet\w*\b.*\b(?:dressing|hair\s?styling)\b|\bdressing\b.*\bcosmet\w*/, "body-prep"],
  [/\bcommittal service\b/, "graveside"],
  [/\bcertified (?:copies of )?death certificates?\b|\bdeath certificates?\b.*\b(?:each|per copy|copies)\b/, "death-cert"],
  [/^(?!.*\b(?:cremains|cremated|ashes)\b).*\b(?:storage (?:fee|charge|of (?:the )?(?:remains|body|deceased))|holding (?:of )?(?:the )?remains)\b/, "refrigeration-shelter"],
  [/\b(?:basic|professional)(?:\s*\/\s*(?:basic|professional))?\s+services?\s+(?:fee|charge)\b/, "basic-services"],
  [/^(?!.*\b(?:cremation|burial|package|caskets?)\b).*\bfuneral ceremony\b/, "service-facility"],
  [/\bcertified copies\b/, "death-cert"],
];

const WOOD_CASKET =
  /\b(?:wood(?:en)?|hardwood|oak|poplar|cherry|mahogany|maple|pine|walnut|birch|ash|elm|cedar|veneer)\b/;
const METAL_CASKET = /\b(?:steel|metal|copper|bronze|stainless|\d+[- ]?(?:ga|gauge)|gauge)\b/;

const NEGATED_EMBALMING = /\(?\b(?:no|without|non|un)[\s-]?embalm\w*\)?/g;

// Lines that name a casket but price something else: a fee for handling one
// bought elsewhere, or an upgrade/add-on charged on top of one. The synonym
// pass reduces "Casket — 18-gauge metal" to a bare "casket", so without this
// guard a $625 "Outside casket handling fee" was judged against a casket's
// range and read "good" (and the wrapped "…not purchased from Canyon Rim
// Memorial Chapel" variant hit the "chapel" synonym instead). The FTC Funeral
// Rule bars that fee outright; the casket-handling-fee rule flags it, and
// protective-casket-pitched flags the sealer pitch. Checked before the
// synonym pass. Rental and ceremonial caskets, and protective or sealer
// caskets themselves, carry none of these words and keep their match.
const CASKET_NOUN = /\b(?:caskets?|coffins?)\b/;
const OUTSIDE_PURCHASE =
  /\boutside\b|\bthird[- ]party\b|\belsewhere\b|\bnot (?:purchased|bought)\b/;

function isCasketAddOn(n: string): boolean {
  if (!CASKET_NOUN.test(n)) return false;
  // Hardware sold for a casket, not the casket ("Casket Panel Inserts" $200
  // on the Rhines 2026 GPL read as a $200 casket).
  if (/\b(?:panels?|inserts?|corners?|engrav\w*|appliques?|personaliz\w*)\b/.test(n)) return true;
  if (/\bhandling\b/.test(n)) return true;
  if (/\b(?:upgrade|add-?on)\b/.test(n)) return true;
  if (OUTSIDE_PURCHASE.test(n) && /\b(?:fee|charge|surcharge)\b/.test(n)) return true;
  // "Acceptance charge for customer-provided casket", "Fee for casket
  // provided by the purchaser": the wider bought-elsewhere phrasings
  // (lib/outside-merchandise.ts), which used to fall through to casket-metal.
  return outsideCasketFee(n);
}

// The FTC Funeral Rule makes every GPL price its direct cremations and
// immediate burials as whole packages, one line per variant: "Direct
// cremation with container provided by purchaser", "Direct cremation with
// alternative container", "Immediate burial with minimum casket". The
// synonym pass read the merchandise named after "with": "cremation container"
// matches any name holding both words, and bare "casket" swallows a burial
// package, so a $1,790 package was judged against a $100–$300 container range
// and read "predatory". Checked before the synonym pass. A package line leads
// with the package and then names its variant ("with", "without", "where",
// "w/", a parenthesis or a comma), or says the purchaser provides the
// merchandise. A header folded over its own item ("Direct cremation — Basic
// services fee", "Direct cremation arrangement — Basic services fee") and a
// container sold for cremation ("Direct cremation container") are not
// package lines and fall through, which is why direct-cremation-fee still
// sits last in LINE_ITEMS.
//
// Only a cremation package with no viewing or ceremony and no casket in its
// price is benchmarked, as direct-cremation-fee. There is no immediate-burial
// benchmark. A "Direct cremation with private family viewing" or "…with
// memorial service" line is a cremation with services, which the FTC's
// definition of direct cremation excludes, and "Direct cremation with
// hardwood casket" prices the casket too; the direct-cremation range would
// call either predatory. All three are left unbenchmarked. A service the line
// rules out ("no service or viewing", "without ceremony") does not count, and
// neither does a casket the purchaser provides or that costs extra ("plus
// cost of casket").
const PACKAGE_LEAD =
  /^[^a-z0-9]*(?:[a-z0-9]{1,2}[.)]\s*)?(?:an?\s+)?(?:direct|immediate)\s+(cremation|burial)s?\b(.*)$/;
// "Direct Cremation Package (minimum alternative container)" (J.B. Jenkins,
// 2024) names the package before its variant; without the optional noun it
// fell through to the synonym pass and was judged as a $2,700 cremation
// container.
const PACKAGE_VARIANT =
  /^\s*(?:(?:package|option|plan)s?\b\s*)?(?:[.:]?\s*$|[(,/]|(?:[—–:-]\s*)?(?:(?:with|without|where|using|including|includes?)\b|w\/))/;
const PURCHASER_PROVIDES =
  /\b(?:provided|supplied|furnished)\s+by\s+(?:the\s+)?(?:purchaser|consumer|customer|client|buyer|family)\b|\b(?:purchaser|consumer|customer|client|buyer|family)\s+(?:provides|supplies|furnishes)\b/;
const WITH_SERVICE =
  /\b(?:viewings?|visitation|embalm(?:ing|ed)?|ceremon(?:y|ies)|wake|memorial|chapel|church|(?:funeral|graveside|committal)\s+services?)\b|\bwith\s+(?:a\s+)?services?\b/;
// "no service or viewing", "without ceremony, viewing, or embalming", "with
// no other services/merchandise". "of" is in the list because real price
// lists print "no service of viewing".
const RULED_OUT =
  /\b(?:no|without|w\/o|excluding)\s+(?:(?:other|additional|any)\s+)?[a-z-]+(?:(?:\s*[,/]\s*(?:or\s+|and\s+)?|\s+(?:or|and|of|&)\s+)[a-z-]+)*/g;
const PRICED_EXTRA = /\b(?:plus|add|in addition to|additional|not included)\b/;

function packageKind(n: string): "direct-cremation" | "unbenchmarked" | undefined {
  let pkg = PACKAGE_LEAD.exec(n);
  if (pkg && !PACKAGE_VARIANT.test(pkg[2]) && !PURCHASER_PROVIDES.test(pkg[2])) pkg = null;
  if (!pkg) {
    // A header folded over a full package line ("Cremation options — Direct
    // cremation with alternative container"). The folded part must name its
    // variant: a bare "Transfer of remains — Direct cremation" is the transfer.
    const fold = HEADER_SEPARATOR.exec(n);
    const inner = fold ? PACKAGE_LEAD.exec(fold[2].trim()) : null;
    const tail = inner ? inner[2].replace(/[\s.:]+$/, "") : "";
    if (inner && tail && PACKAGE_VARIANT.test(tail)) pkg = inner;
  }
  if (!pkg) return undefined;
  const variant = pkg[2].replace(RULED_OUT, " ");
  if (pkg[1] === "burial" || WITH_SERVICE.test(variant)) return "unbenchmarked";
  const casketInPrice =
    CASKET_NOUN.test(variant) && !PURCHASER_PROVIDES.test(variant) && !PRICED_EXTRA.test(variant);
  return casketInPrice ? "unbenchmarked" : "direct-cremation";
}

// Header separators the Claude extractor uses to glue a non-priced section
// header onto the following item's name: " — " / " – " / " - " (a dash with
// surrounding spaces) or ": " (colon + space). The surrounding spaces matter —
// they keep intra-word hyphens like "18-gauge" and "drive-through" from being
// mistaken for a separator. The non-greedy prefix splits on the FIRST separator,
// so a leading header is peeled off even when the item's own name has an em-dash.
const HEADER_SEPARATOR = /^(.+?)(?:\s+[—–-]\s+|:\s+)(.+)$/;

/**
 * Strip a leading section-header prefix that the extractor folded into an item
 * name.
 *
 * The extraction prompt is deliberately told to fold a non-priced section
 * header into the following item so bare variants ("Type A", "With picture")
 * stay self-describing. But when the line under the header is ALREADY a
 * benchmarked, self-describing item ("Basic services fee"), that folding
 * produces a sloppy "Direct cremation arrangement — Basic services fee". Real
 * GPLs carry section headers ("PROFESSIONAL SERVICES", "CASH ADVANCE ITEMS")
 * that trip the same way.
 *
 * This is a cosmetic-only cleanup: it strips the prefix ONLY when the trailing
 * part alone matches the SAME benchmarked line item the full name matches —
 * which guarantees the strip can never change which benchmark an item maps to.
 * A meaningful fold like "Acknowledgement cards — Type A (per 25)" is left
 * untouched because its trailing part isn't a benchmarked item.
 */
export function cleanItemName(name: string): string {
  const trimmed = name.trim();
  const m = HEADER_SEPARATOR.exec(trimmed);
  if (!m) return trimmed;
  const rest = m[2].trim();
  const restMatch = matchLineItem(rest);
  if (restMatch && matchLineItem(trimmed)?.id === restMatch.id) {
    return rest;
  }
  return trimmed;
}
