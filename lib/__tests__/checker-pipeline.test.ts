import { describe, it, expect } from "vitest";
import { naiveExtract, matchLineItem } from "@/lib/negotiation/price-list-parse";
import {
  classifyAgainst,
  adjustedRange,
  regionMultiplier,
  fmtUSD,
} from "@/lib/pricing-data";
import { runRules, type AnalyzedItem } from "@/lib/bundling-detection/rules";
import {
  overchargeCents,
  ftcFlagFor,
  savingsBreakdown,
  fallbackAdvocacySummary,
  type DisplayItem,
} from "@/lib/analyzer-display";

/**
 * End-to-end pipeline mirror of /api/analyze-price-list (deterministic path,
 * no Claude) so we can exercise — and see — the full result the demo renders.
 */
type PItem = DisplayItem & {
  matchedItemId?: string;
  isRange?: boolean;
  centsLow?: number;
  centsHigh?: number;
};

function analyze(text: string, zip: string) {
  const extracted = naiveExtract(text);
  const items = extracted.items.map((raw): PItem => {
    if (raw.cents_low != null && raw.cents_high != null) {
      return {
        name: raw.name,
        cents: raw.cents_low,
        isRange: true,
        centsLow: raw.cents_low,
        centsHigh: raw.cents_high,
      };
    }
    const cents = raw.cents ?? 0;
    const matched = matchLineItem(raw.name);
    if (!matched) return { name: raw.name, cents };
    const m = regionMultiplier(zip);
    const [lo, hi, predatory] = matched.perUnit
      ? [matched.fairLow, matched.fairHigh, matched.predatoryAt]
      : [
          ...adjustedRange(matched.fairLow, matched.fairHigh, zip),
          Math.round(matched.predatoryAt * m),
        ];
    const qty = matched.perUnit && raw.qty && raw.qty > 1 ? raw.qty : undefined;
    const perUnitDollars = (qty ? cents / qty : cents) / 100;
    return {
      name: raw.name,
      cents,
      matchedItemId: matched.id,
      classification: classifyAgainst(perUnitDollars, lo, hi, predatory),
      fairCentsLow: lo * 100,
      fairCentsHigh: hi * 100,
      ...(qty ? { qty } : {}),
    };
  });
  const priced = items.filter((i) => !i.isRange);
  const totalQuoted =
    extracted.total_cents ?? priced.reduce((s, i) => s + (i.cents || 0), 0);
  // Headline must equal the sum of the per-item overcharge badges — NOT
  // totalQuoted - totalFairMid (which would charge un-benchmarked lines, ranges,
  // padded totals, and per-copy death-cert quantities as overcharge).
  const potentialSavings = savingsBreakdown(items, []).negotiateCents;
  const totalFairMid = Math.max(0, totalQuoted - potentialSavings);
  const violations = runRules({
    rawText: text,
    items: items as AnalyzedItem[],
    totalCents: totalQuoted,
  });
  const breakdown = savingsBreakdown(items, violations);
  const summary = fallbackAdvocacySummary({ items, violations, potentialSavings });
  return { items, totalQuoted, totalFairMid, potentialSavings, violations, breakdown, summary };
}

const SAMPLE = `Direct cremation arrangement
Basic services fee $4,200
Embalming $1,400
Metal casket $3,800
Death certificates (10) $250
Urns $200-$2,000`;

describe("checker pipeline (end-to-end, deterministic)", () => {
  const r = analyze(SAMPLE, "94110");

  it("produces a demo-grade result and prints it", () => {
    const usd = (c: number) => fmtUSD(c / 100);
    const lines: string[] = [];
    lines.push(
      `\n  HERO  →  ${usd(r.potentialSavings)} estimated above fair  (quoted ${usd(r.totalQuoted)} · fair ${usd(r.totalFairMid)})`,
    );
    lines.push("  TABLE:");
    for (const it of r.items) {
      if (it.isRange) {
        lines.push(`    ${it.name.padEnd(22)} ${usd(it.cents)}–${usd(it.centsHigh!)}  ·  Selection (buy 3rd-party)`);
        continue;
      }
      const over = overchargeCents(it);
      const flag = ftcFlagFor(it, r.violations);
      lines.push(
        `    ${it.name.padEnd(22)} ${usd(it.cents).padStart(8)}  ·  ${(it.classification ?? "—").padEnd(9)}` +
          (over > 0 ? `  +${usd(over)} above fair` : "") +
          (flag ? `  ⚑ ${flag.severity}` : ""),
      );
    }
    lines.push("  WHERE IT COMES FROM:");
    if (r.breakdown.negotiateCount)
      lines.push(`    negotiate ${r.breakdown.negotiateCount} services → ~${usd(r.breakdown.negotiateCents)}`);
    if (r.breakdown.thirdPartyCount)
      lines.push(`    buy ${r.breakdown.thirdPartyCount} item(s) third-party → 50–80% less`);
    if (r.breakdown.declineCount)
      lines.push(`    question/remove ${r.breakdown.declineCount} flagged item(s)`);
    lines.push(`  FTC FINDINGS: ${r.violations.length}`);
    for (const v of r.violations) lines.push(`    [${v.severity}] ${v.title}`);
    lines.push(`  WHAT WE'D DO: ${r.summary.bottomLine}`);
    for (const m of r.summary.moves) lines.push(`    • ${m.title}`);
    // Print the rendered result on demand:
    //   PIPELINE_DEBUG=1 npx vitest run lib/__tests__/checker-pipeline.test.ts --disableConsoleIntercept
    if (process.env.PIPELINE_DEBUG) {
      // eslint-disable-next-line no-console
      console.log(lines.join("\n"));
    }

    // Assertions: the demo's load-bearing facts.
    expect(r.potentialSavings).toBeGreaterThan(0);
    expect(r.violations.length).toBeGreaterThan(0);
    expect(r.violations.some((v) => v.severity === "violation")).toBe(true);
    expect(r.breakdown.thirdPartyCount).toBe(1); // the urn range
    expect(r.breakdown.negotiateCount).toBeGreaterThan(0);
    expect(r.summary.bottomLine).toMatch(/\$|fair/);
    expect(r.summary.moves.length).toBeGreaterThan(0);

    // Quantity-aware: 10 death certificates at $250 ($25 each) reads as fair,
    // NOT a predatory "+$224 above fair" (the bug this guards against).
    const certs = r.items.find(
      (i) => (i as { matchedItemId?: string }).matchedItemId === "death-cert",
    ) as (DisplayItem & { qty?: number }) | undefined;
    expect(certs?.qty).toBe(10);
    expect(
      certs?.classification === "high" || certs?.classification === "predatory",
    ).toBe(false);
    expect(overchargeCents(certs!)).toBe(0);

    // The headline "above fair" equals the sum of the per-item overcharge
    // badges — never the inflated totalQuoted - totalFairMid. The fair
    // death-cert line contributes $0, not a phantom per-each overcharge, and
    // the three summary stats reconcile.
    const badgeSum = r.items.reduce(
      (s, it) => s + overchargeCents(it as DisplayItem),
      0,
    );
    expect(r.potentialSavings).toBe(badgeSum);
    expect(r.totalQuoted - r.potentialSavings).toBe(r.totalFairMid);
  });

  it("never shows an overcharge on an item classified within range", () => {
    for (const raw of r.items) {
      const it = raw as DisplayItem & { isRange?: boolean };
      if (it.isRange) continue;
      if (it.classification === "good" || it.classification === "fair") {
        expect(overchargeCents(it)).toBe(0);
      }
    }
  });

  it("does not COLA-penalize per-unit state fees in a low-cost metro", () => {
    // Salt Lake City (84101, COLA < 1). A death certificate is a fixed state
    // fee, so $25 each must read fair against the national $10–$25 range — not
    // "high" because the metro multiplier shrank the top to $24.
    const low = analyze("Death certificates (10) $250", "84101");
    const certs = low.items.find(
      (i) => (i as { matchedItemId?: string }).matchedItemId === "death-cert",
    ) as (DisplayItem & { qty?: number }) | undefined;
    expect(certs?.qty).toBe(10);
    expect(certs?.fairCentsHigh).toBe(2500); // national $25, not COLA-shrunk
    expect(
      certs?.classification === "high" || certs?.classification === "predatory",
    ).toBe(false);
    expect(overchargeCents(certs!)).toBe(0);
  });
});
