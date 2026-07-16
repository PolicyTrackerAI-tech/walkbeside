import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import {
  matchLineItem,
  cleanItemName,
} from "@/lib/negotiation/price-list-parse";
import { reconcileTotalQuoted } from "@/lib/analyzer-totals";
import { runRules } from "@/lib/bundling-detection/rules";
import { LINE_ITEMS, classifyAgainst, adjustedRange, regionMultiplier } from "@/lib/pricing-data";

/**
 * Deterministic self-test for the eval golden fixtures (test/evals/gpl/).
 *
 * The eval harness itself (scripts/eval-analyzer.mjs) costs API cents and is
 * NOT part of CI — but the golden files must stay consistent with
 * checker-correctness law as the rules and benchmarks evolve. This suite pins
 * the deterministic half of every expectation without any API call:
 *   - every matchedItemId claim (including explicit nulls) against the real
 *     matchLineItem(cleanItemName(...)) — the exact mapping the route applies;
 *   - every mustFlag / mustNotFlag rule id against the real runRules() run on
 *     the golden items + raw fixture text (no zip → national ranges, same as
 *     the eval harness's POSTs);
 *   - stated totals against reconcileTotalQuoted;
 *   - shape/uniqueness invariants the scorer depends on.
 *
 * A failure here means a fixture's golden data is wrong (or a rule/benchmark
 * change legitimately shifted behavior — update the fixture deliberately).
 */

const FIXTURE_DIR = path.join(process.cwd(), "test", "evals", "gpl");

interface ExpectedItem {
  match: string;
  /**
   * Full expected FINAL item name (post cleanItemName/header-folding). Only
   * required when `match` alone is not enough to reproduce the benchmark
   * mapping or rule keywords — e.g. a folded variant whose match is "Type A"
   * but whose name is "Acknowledgement cards — Type A (per 25)". The
   * deterministic checks below use `name ?? match`.
   */
  name?: string;
  matchedItemId: string | null;
  cents?: number;
  qty?: number;
  isRange?: boolean;
  centsLow?: number;
  centsHigh?: number;
}

interface Expected {
  description: string;
  post?: { serviceTypeHint?: string };
  items: ExpectedItem[];
  statedTotalCents?: number;
  mustFlagRuleIds?: string[];
  mustNotFlagRuleIds?: string[];
}

function loadFixtures(): { name: string; text: string; expected: Expected }[] {
  let files: string[];
  try {
    files = readdirSync(FIXTURE_DIR);
  } catch {
    return [];
  }
  return files
    .filter((f) => f.endsWith(".txt"))
    .map((f) => f.replace(/\.txt$/, ""))
    .sort()
    .map((name) => ({
      name,
      text: readFileSync(path.join(FIXTURE_DIR, `${name}.txt`), "utf8"),
      expected: JSON.parse(
        readFileSync(path.join(FIXTURE_DIR, `${name}.expected.json`), "utf8"),
      ) as Expected,
    }));
}

/** The full expected item name for deterministic checks. */
function nameOf(item: ExpectedItem): string {
  return item.name ?? item.match;
}

function benchmarkFor(item: ExpectedItem): string | null {
  return matchLineItem(cleanItemName(nameOf(item)))?.id ?? null;
}

/** Mirror of the route's item mapping (app/api/analyze-price-list/route.ts:123-192)
 * for the deterministic rules run: no zip → national ranges, no overrides.
 * Deliberately minimal — classification is only needed because a handful of
 * rules key off it (e.g. predatory-line-items). */
function goldenToAnalyzedItems(expected: Expected) {
  const m = regionMultiplier("");
  return expected.items.map((i) => {
    if (i.isRange) {
      return {
        name: nameOf(i),
        cents: i.centsLow ?? 0,
        isRange: true,
        centsLow: i.centsLow,
        centsHigh: i.centsHigh,
      };
    }
    const cents = i.cents ?? 0;
    const matched = i.matchedItemId
      ? LINE_ITEMS.find((li) => li.id === i.matchedItemId)
      : undefined;
    if (!matched) return { name: nameOf(i), cents };
    const [lo, hi] = matched.perUnit
      ? [matched.fairLow, matched.fairHigh]
      : adjustedRange(matched.fairLow, matched.fairHigh, "");
    const predatory = matched.perUnit
      ? matched.predatoryAt
      : Math.round(matched.predatoryAt * m);
    const qty = matched.perUnit && i.qty && i.qty > 1 ? i.qty : undefined;
    const perUnitDollars = (qty ? cents / qty : cents) / 100;
    return {
      name: nameOf(i),
      cents,
      matchedItemId: matched.id,
      classification: classifyAgainst(perUnitDollars, lo, hi, predatory),
      fairCentsLow: lo * 100,
      fairCentsHigh: hi * 100,
      ...(qty ? { qty } : {}),
    };
  });
}

const fixtures = loadFixtures();

describe("eval golden fixtures", () => {
  it("exist (12–15 fixtures expected)", () => {
    expect(fixtures.length).toBeGreaterThanOrEqual(12);
    expect(fixtures.length).toBeLessThanOrEqual(16);
  });

  describe.each(fixtures.map((f) => [f.name, f] as const))("%s", (_name, f) => {
    it("has a valid shape", () => {
      expect(f.text.length).toBeGreaterThanOrEqual(20);
      expect(f.text.length).toBeLessThanOrEqual(20000);
      expect(f.expected.description).toBeTruthy();
      expect(Array.isArray(f.expected.items)).toBe(true);
      expect(f.expected.items.length).toBeGreaterThan(0);
      for (const item of f.expected.items) {
        expect(item.match, "every item needs a match substring").toBeTruthy();
        expect(
          item.matchedItemId !== undefined,
          `"${item.match}": matchedItemId must be present (string or explicit null)`,
        ).toBe(true);
        if (item.isRange) {
          expect(item.centsLow, `"${item.match}": range needs centsLow`).toBeTypeOf("number");
          expect(item.centsHigh, `"${item.match}": range needs centsHigh`).toBeTypeOf("number");
          expect(item.cents, `"${item.match}": range items carry no cents`).toBeUndefined();
        } else {
          expect(item.cents, `"${item.match}": needs integer cents`).toBeTypeOf("number");
        }
        if (item.qty != null) expect(item.qty).toBeGreaterThan(1);
      }
    });

    it("match substrings are unique and non-overlapping", () => {
      const matches = f.expected.items.map((i) => i.match.toLowerCase());
      expect(new Set(matches).size).toBe(matches.length);
      // A match that is a substring of another expected match can claim the
      // wrong response item in the scorer's greedy pass.
      for (const a of matches) {
        for (const b of matches) {
          if (a !== b) {
            expect(
              b.includes(a),
              `match "${a}" is a substring of match "${b}" — ambiguous claim`,
            ).toBe(false);
          }
        }
      }
    });

    it("matchedItemId claims agree with matchLineItem(cleanItemName(...))", () => {
      for (const item of f.expected.items) {
        if (item.isRange) {
          // Route invariant: selection-range items return early without ever
          // calling matchLineItem — they can never carry a benchmark id.
          expect(
            item.matchedItemId,
            `"${item.match}" is a range item — matchedItemId must be null`,
          ).toBeNull();
          continue;
        }
        expect(
          benchmarkFor(item),
          `"${item.match}" → expected benchmark ${item.matchedItemId ?? "null"}`,
        ).toBe(item.matchedItemId);
      }
    });

    it("qty is only claimed on perUnit benchmark items", () => {
      for (const item of f.expected.items) {
        if (item.qty != null) {
          const li = LINE_ITEMS.find((l) => l.id === item.matchedItemId);
          expect(
            li?.perUnit,
            `"${item.match}" claims qty but ${item.matchedItemId} is not perUnit — the route drops qty for non-perUnit matches`,
          ).toBe(true);
        }
      }
    });

    it("stated total reconciles the way the route will", () => {
      const goldenSum = f.expected.items
        .filter((i) => !i.isRange)
        .reduce((s, i) => s + (i.cents ?? 0), 0);
      const reconciled = reconcileTotalQuoted(
        f.expected.statedTotalCents ?? null,
        goldenSum,
      );
      // Sanity: the reconciled expected total must be derivable — this guards
      // fixtures whose stated total accidentally lands in the "rejected" band
      // while the author believed it would be kept (or vice versa).
      expect(reconciled).toBeGreaterThan(0);
      if (f.expected.statedTotalCents != null) {
        const kept = reconciled === f.expected.statedTotalCents;
        const rejected = reconciled === goldenSum;
        expect(
          kept || rejected,
          "stated total neither kept nor replaced by item sum — impossible",
        ).toBe(true);
      }
    });

    it("mustFlag / mustNotFlag rule ids fire exactly as pinned", () => {
      const detections = runRules({
        rawText: f.text,
        items: goldenToAnalyzedItems(f.expected),
        serviceTypeHint: f.expected.post?.serviceTypeHint,
        totalCents: reconcileTotalQuoted(
          f.expected.statedTotalCents ?? null,
          f.expected.items
            .filter((i) => !i.isRange)
            .reduce((s, i) => s + (i.cents ?? 0), 0),
        ),
      });
      const fired = new Set(detections.map((d) => d.ruleId));
      for (const id of f.expected.mustFlagRuleIds ?? []) {
        expect(fired.has(id), `expected rule to fire: ${id} (fired: ${[...fired].join(", ") || "none"})`).toBe(true);
      }
      for (const id of f.expected.mustNotFlagRuleIds ?? []) {
        expect(fired.has(id), `pinned mustNot rule fired: ${id}`).toBe(false);
      }
    });
  });
});

describe("eval harness scorer assumptions", () => {
  it("scripts/eval-analyzer.mjs's reconcile duplicate matches lib/analyzer-totals.ts", () => {
    // The .mjs can't import TS, so it carries a 5-line duplicate. Pin the
    // real function's behavior on the exact cases the duplicate encodes so
    // drift in either direction fails loudly here.
    expect(reconcileTotalQuoted(null, 0)).toBe(0);
    expect(reconcileTotalQuoted(5000, 0)).toBe(5000);
    expect(reconcileTotalQuoted(null, 1000)).toBe(1000);
    expect(reconcileTotalQuoted(900, 1000)).toBe(1000); // stated below sum → sum
    expect(reconcileTotalQuoted(3001, 1000)).toBe(1000); // stated > 3× sum → sum
    expect(reconcileTotalQuoted(2900, 1000)).toBe(2900); // consistent → stated
  });
});
