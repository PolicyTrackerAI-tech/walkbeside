import { LINE_ITEMS, type LineItem } from "@/lib/pricing-data";

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
 */
export function matchLineItem(name: string): LineItem | undefined {
  const n = name.toLowerCase();
  return LINE_ITEMS.find((it) => {
    const synonyms = it.name
      .toLowerCase()
      .split("/")
      .map((s) => s.split(/[—(]/)[0].trim())
      .filter(Boolean);
    return synonyms.some((key) => {
      const re = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
      if (re.test(n)) return true;
      const words = key.split(/\s+/);
      return words.length > 1 && words.every((w) => n.includes(w));
    });
  });
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
