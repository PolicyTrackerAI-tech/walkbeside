/**
 * Pure display helpers for the price-list checker result. Kept out of the
 * React component so the numbers we show a grieving family are unit-tested.
 */
import { fmtUSD } from "./pricing-data";

export interface DisplayItem {
  name: string;
  cents: number;
  classification?: "good" | "fair" | "high" | "predatory";
  fairCentsLow?: number;
  fairCentsHigh?: number;
  /** Quantity for per-unit items (cents is the total; fair range is per-each). */
  qty?: number;
}

export interface DisplayFlag {
  severity: "violation" | "suspicious" | "info";
  evidence?: string;
}

/**
 * How many cents this line is over fair — but ONLY for items actually above the
 * fair range (classified "high"/"predatory"). An item within range returns 0, so
 * we never show "$X above fair" on a price that isn't. For per-unit items (e.g.
 * death certificates) the fair range is per-each and `cents` is the total, so we
 * compare the per-unit price to the per-each midpoint and scale by quantity —
 * 10 certificates at $25 each reads as $0 over, not a $225 overcharge.
 */
export function overchargeCents(it: DisplayItem): number {
  if (it.classification !== "high" && it.classification !== "predatory") {
    return 0;
  }
  if (it.fairCentsLow == null || it.fairCentsHigh == null) return 0;
  const qty = it.qty && it.qty > 1 ? it.qty : 1;
  const fairMid = (it.fairCentsLow + it.fairCentsHigh) / 2;
  const perUnit = it.cents / qty;
  return Math.max(0, Math.round((perUnit - fairMid) * qty));
}

/**
 * The FTC/upsell finding that points at this exact line item, if any. Rules set
 * `evidence` to the name of the item they fired on, so we join on that. Info
 * tips (e.g. "you can buy third-party") are opportunities, not problems, so they
 * never flag a row red.
 */
export function ftcFlagFor<T extends DisplayFlag>(
  it: DisplayItem,
  flags: T[] | undefined,
): T | undefined {
  return flags?.find(
    (f) =>
      (f.severity === "violation" || f.severity === "suspicious") &&
      f.evidence === it.name,
  );
}

export interface RangeAwareItem extends DisplayItem {
  /** Selection-range merchandise (caskets/urns/vaults shown as a $low–$high). */
  isRange?: boolean;
}

export interface SavingsBreakdown {
  /** Dollars over fair on negotiable, fixed-price, overpriced services. */
  negotiateCents: number;
  negotiateCount: number;
  /** Selection merchandise (casket/urn/vault) you can buy third-party. */
  thirdPartyCount: number;
  /** Fixed items carrying a likely-FTC-violation flag — candidates to remove. */
  declineCount: number;
}

/**
 * Split the total opportunity into the three honest levers a family can pull:
 * negotiate overpriced services down to fair (a hard, benchmark-based dollar
 * figure), buy selection merchandise third-party, and decline/question items
 * that carry a likely FTC violation. An item can count toward more than one
 * lever (e.g. overpriced AND flagged). No fabricated third-party totals — only
 * the negotiate figure is a dollar amount, because it's the only one we can
 * defend from our benchmarks.
 */
export function savingsBreakdown(
  items: RangeAwareItem[],
  flags: DisplayFlag[] | undefined,
): SavingsBreakdown {
  let negotiateCents = 0;
  let negotiateCount = 0;
  let thirdPartyCount = 0;
  let declineCount = 0;
  for (const it of items) {
    if (it.isRange) {
      thirdPartyCount++;
      continue;
    }
    if (ftcFlagFor(it, flags)?.severity === "violation") declineCount++;
    const over = overchargeCents(it);
    if (over > 0) {
      negotiateCents += over;
      negotiateCount++;
    }
  }
  return { negotiateCents, negotiateCount, thirdPartyCount, declineCount };
}

export interface AdvocacyMoveOut {
  title: string;
  detail: string;
}

export interface AdvocacySummaryOut {
  bottomLine: string;
  moves: AdvocacyMoveOut[];
  reassurance: string;
}

interface FallbackFinding {
  title: string;
  severity: DisplayFlag["severity"];
  whatToSay?: string;
}

/**
 * A deterministic "what we'd do" summary built entirely from the findings —
 * the safety net when the Claude-written summary is unavailable or fails. The
 * checker must never show a blank "what to do" mid-demo (or to a grieving
 * family). Grounded only in the parsed items + rule findings; invents nothing.
 */
export function fallbackAdvocacySummary(input: {
  items: RangeAwareItem[];
  violations: FallbackFinding[];
  potentialSavings: number;
}): AdvocacySummaryOut {
  const { items, violations, potentialSavings } = input;
  const usd = (cents: number) => fmtUSD(Math.round(cents) / 100);
  const realViolations = violations.filter((v) => v.severity === "violation");
  const suspicious = violations.filter((v) => v.severity === "suspicious");

  const overpriced = items
    .filter((it) => !it.isRange)
    .map((it) => ({ it, over: overchargeCents(it) }))
    .filter((x) => x.over > 0)
    .sort((a, b) => b.over - a.over);
  const hasThirdParty = items.some((it) => it.isRange);

  const moves: AdvocacyMoveOut[] = [];
  for (const v of realViolations) {
    moves.push({
      title: v.title,
      detail:
        v.whatToSay ??
        "Ask the funeral home to justify or remove this — it may not be permitted under the FTC Funeral Rule.",
    });
  }
  for (const { it, over } of overpriced.slice(0, 2)) {
    moves.push({
      title: `Push back on ${it.name}`,
      detail: `They quoted ${usd(it.cents)} — about ${usd(over)} above the fair price for your region. Ask them to match fair market.`,
    });
  }
  if (hasThirdParty) {
    moves.push({
      title: "Buy the casket, urn, or vault from a third party",
      detail:
        "Funeral-home merchandise is commonly marked up 300–500%. Under the FTC Funeral Rule you can buy these elsewhere and the home must accept them with no handling fee.",
    });
  }
  for (const v of suspicious) {
    if (moves.length >= 5) break;
    moves.push({
      title: v.title,
      detail: v.whatToSay ?? "Worth questioning before you agree to it.",
    });
  }

  const vCount = realViolations.length;
  const vNote = `${vCount} item${vCount === 1 ? "" : "s"}`;
  const bottomLine =
    potentialSavings > 0
      ? vCount > 0
        ? `This quote runs about ${usd(potentialSavings)} above fair, and we flagged ${vNote} that may not be allowed under the FTC Funeral Rule.`
        : `This quote runs about ${usd(potentialSavings)} above fair for your region — most of it is negotiable.`
      : vCount > 0
        ? `The pricing is close to fair, but we flagged ${vNote} worth questioning under the FTC Funeral Rule.`
        : "This quote is in line with fair pricing for your region.";

  return {
    bottomLine,
    moves: moves.slice(0, 5),
    reassurance:
      "Every point here comes straight from the price list they gave you. You're allowed to decline anything you don't want, and to compare other homes.",
  };
}

/**
 * How much of the bill we can stand behind. The checker's headline number
 * ("$X above fair") is only as trustworthy as the read it's built on — if OCR
 * dropped half the lines, or matched items we don't benchmark, a confident
 * total would be a lie. This assesses, deterministically, two honest gaps:
 *
 *  1. MISSED — priced lines in the source we didn't turn into items (a bad
 *     photo, a column we couldn't read). The estimate is built on a partial
 *     read; the family must compare against the copy in their hand.
 *  2. UNBENCHMARKED — lines we parsed but have no fair-price reference for, so
 *     we passed them through at face value. They don't inflate the estimate
 *     (conservative by design), but the family should know they weren't checked.
 *
 * Returns a calm, specific note only when confidence is below "high" — silence
 * when we read the whole bill.
 */
export interface CoverageReport {
  /** Source lines that carry a price (a "total" line is excluded). */
  pricedLines: number;
  /** Items we parsed out of the source. */
  parsedItems: number;
  /** Parsed items we matched to a benchmark (classified) or recognized merchandise (range). */
  benchmarked: number;
  /** Parsed items with no benchmark — passed through at face value. */
  unbenchmarked: number;
  /** Priced source lines that never became an item (likely an OCR/read gap). */
  missed: number;
  level: "high" | "partial" | "low";
  /** Family-facing caveat; empty string when level is "high". */
  note: string;
}

const PRICE_ON_LINE = /\$\s?\d/;
const TOTAL_LINE = /\b(total|subtotal|balance|amount\s+due|grand\s+total)\b/i;

export function assessCoverage(
  rawText: string,
  items: { classification?: string; isRange?: boolean }[],
): CoverageReport {
  const pricedLines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => PRICE_ON_LINE.test(l) && !TOTAL_LINE.test(l)).length;
  const parsedItems = items.length;
  // Nothing parsed, but the page clearly has money on it (a bare "Total $X", or
  // lines we couldn't turn into items) — we can't stand behind any number, so
  // never let this read as full-coverage "high".
  if (parsedItems === 0) {
    const hasMoney = rawText.split(/\r?\n/).some((l) => PRICE_ON_LINE.test(l));
    return {
      pricedLines,
      parsedItems: 0,
      benchmarked: 0,
      unbenchmarked: 0,
      missed: pricedLines,
      level: hasMoney ? "low" : "high",
      note: hasMoney
        ? "We couldn't read any individual line items here — please paste or photograph the itemized list (each service with its own price) so we can check it."
        : "",
    };
  }
  const benchmarked = items.filter(
    (i) => i.isRange || i.classification != null,
  ).length;
  const unbenchmarked = parsedItems - benchmarked;
  const missed = Math.max(0, pricedLines - parsedItems);

  const missRatio = pricedLines > 0 ? missed / pricedLines : 0;
  let level: CoverageReport["level"] = "high";
  if (missed >= 2 || missRatio > 0.34) level = "low";
  else if (missed === 1 || unbenchmarked > 0) level = "partial";

  let note = "";
  if (missed >= 1) {
    note =
      `Your price list looks like it has about ${pricedLines} priced lines, but we could ` +
      `only read ${parsedItems} of them clearly. Compare this against the copy in your hand ` +
      `— and try a sharper, straight-on photo if any lines are missing — before you rely on the total.`;
  } else if (unbenchmarked > 0) {
    const s = unbenchmarked === 1 ? "" : "s";
    const them = unbenchmarked === 1 ? "it" : "them";
    const isnt = unbenchmarked === 1 ? "it isn't" : "they aren't";
    note =
      `We checked ${benchmarked} of ${parsedItems} line items against fair-price data. ` +
      `The other ${unbenchmarked} item${s} aren't in our reference set yet, so we left ${them} ` +
      `at face value — ${isnt} part of the overcharge estimate.`;
  }

  return { pricedLines, parsedItems, benchmarked, unbenchmarked, missed, level, note };
}

/**
 * A deterministic, ready-to-send message FROM the family TO the funeral home,
 * built entirely from the findings — the safety net when the Claude-written
 * letter is unavailable. Leads with the strongest lever (an FTC violation or a
 * third-party right), then the biggest overcharges with their fair range, then
 * a clear ask for a revised itemized statement. Invents nothing; uses bracketed
 * placeholders only for what we can't know.
 */
export function fallbackPushbackLetter(input: {
  items: RangeAwareItem[];
  violations: FallbackFinding[];
  potentialSavings: number;
}): string {
  const { items, violations, potentialSavings } = input;
  const usd = (cents: number) => fmtUSD(Math.round(cents) / 100);
  const realViolations = violations.filter((v) => v.severity === "violation");
  const overpriced = items
    .filter((it) => !it.isRange)
    .map((it) => ({ it, over: overchargeCents(it) }))
    .filter((x) => x.over > 0)
    .sort((a, b) => b.over - a.over);
  const hasThirdParty = items.some((it) => it.isRange);

  const points: string[] = [];
  for (const v of realViolations.slice(0, 2)) {
    points.push(
      `- ${v.title}. ${v.whatToSay ?? "We'd ask you to review and correct this under the FTC Funeral Rule."}`,
    );
  }
  for (const { it } of overpriced.slice(0, 3)) {
    const range =
      it.fairCentsLow != null && it.fairCentsHigh != null
        ? ` — above the fair range of ${usd(it.fairCentsLow)}–${usd(it.fairCentsHigh)} for our area`
        : "";
    points.push(
      `- ${it.name}: you quoted ${usd(it.cents)}${range}. We'd ask you to bring this in line with fair pricing.`,
    );
  }
  if (hasThirdParty) {
    points.push(
      "- We plan to provide the casket, urn, or vault from an outside seller. Under the FTC Funeral Rule there is no handling fee for that — please confirm in writing.",
    );
  }
  if (points.length === 0) {
    points.push(
      "- We'd appreciate a clear, itemized breakdown so we can be sure each charge is one we've chosen.",
    );
  }

  const savingsLine =
    potentialSavings > 0
      ? `Altogether this is roughly ${usd(potentialSavings)} above what we'd expect for our area. `
      : "";

  return [
    "To [the funeral home],",
    "",
    "Thank you for the itemized price list. We want to move forward with you, and we're writing because a few items need to be revisited first.",
    "",
    points.join("\n"),
    "",
    `${savingsLine}Could you please send a revised, itemized statement of goods and services that reflects these points?`,
    "",
    "Thank you for your understanding at a difficult time.",
    "",
    "[Your name]",
  ].join("\n");
}

export interface ShareItem extends RangeAwareItem {
  centsLow?: number;
  centsHigh?: number;
}

export interface ShareResult {
  items: ShareItem[];
  totalQuoted: number;
  totalFairMid: number;
  potentialSavings: number;
  violations?: {
    title: string;
    severity: DisplayFlag["severity"];
    whatToSay?: string;
  }[];
  summary?: { bottomLine: string; moves: { title: string; detail: string }[] };
  sourceNote: string;
  coverage?: CoverageReport;
}

/**
 * Render the result as a clean plain-text summary a bereavement coordinator can
 * paste into an email or text to the family. The handoff artifact — every line
 * traces to the analysis, nothing invented.
 */
export function buildShareText(r: ShareResult): string {
  const usd = (c: number) => fmtUSD(Math.round(c) / 100);
  const out: string[] = ["Honest Funeral — price-list check", ""];

  if (r.potentialSavings > 0) {
    out.push(`ESTIMATED ${usd(r.potentialSavings)} ABOVE FAIR`);
  } else {
    out.push("This quote is in line with fair pricing for your region.");
  }
  out.push(`Quoted ${usd(r.totalQuoted)} · Fair midpoint ${usd(r.totalFairMid)}`);
  out.push(r.sourceNote);
  if (r.coverage && r.coverage.level !== "high" && r.coverage.note) {
    out.push(`Note on coverage: ${r.coverage.note}`);
  }
  out.push("", "LINE ITEMS");

  for (const it of r.items) {
    if (it.isRange && it.centsLow != null && it.centsHigh != null) {
      out.push(
        `- ${it.name}: ${usd(it.centsLow)}–${usd(it.centsHigh)} — buy third-party (often 50–80% less)`,
      );
      continue;
    }
    const fair =
      it.fairCentsLow != null && it.fairCentsHigh != null
        ? ` (fair ${usd(it.fairCentsLow)}–${usd(it.fairCentsHigh)})`
        : "";
    const verdict = it.classification ? ` — ${it.classification}` : "";
    const over = overchargeCents(it);
    const overTxt = over > 0 ? `, +${usd(over)} above fair` : "";
    out.push(`- ${it.name}: ${usd(it.cents)}${fair}${verdict}${overTxt}`);
  }

  const findings = r.violations ?? [];
  if (findings.length) {
    out.push("", "FTC / UPSELL FINDINGS");
    for (const v of findings) {
      const tag =
        v.severity === "violation"
          ? "Possible FTC issue"
          : v.severity === "suspicious"
            ? "Worth pushing back"
            : "Note";
      out.push(`- [${tag}] ${v.title}`);
      if (v.whatToSay) out.push(`  What to say: "${v.whatToSay}"`);
    }
  }

  if (r.summary) {
    out.push("", "WHAT WE'D DO", r.summary.bottomLine);
    r.summary.moves.forEach((m, i) =>
      out.push(`${i + 1}. ${m.title}${m.detail ? ` — ${m.detail}` : ""}`),
    );
  }

  out.push(
    "",
    "Free and neutral. Honest Funeral takes no money from funeral homes or insurers.",
    "honestfuneral.co",
  );
  return out.join("\n");
}
