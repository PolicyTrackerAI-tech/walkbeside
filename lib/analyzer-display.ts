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
}

export interface DisplayFlag {
  severity: "violation" | "suspicious" | "info";
  evidence?: string;
}

/**
 * How many cents this line is over the fair midpoint — but ONLY for items
 * actually above the fair range (classified "high"/"predatory"). An item within
 * range returns 0, so we never show "$X above fair" on a price that isn't.
 * Midpoint basis matches the summary's potential-savings figure.
 */
export function overchargeCents(it: DisplayItem): number {
  if (it.classification !== "high" && it.classification !== "predatory") {
    return 0;
  }
  if (it.fairCentsLow == null || it.fairCentsHigh == null) return 0;
  const fairMid = Math.round((it.fairCentsLow + it.fairCentsHigh) / 2);
  return Math.max(0, it.cents - fairMid);
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
  out.push(r.sourceNote, "", "LINE ITEMS");

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
