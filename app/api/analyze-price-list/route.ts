import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { client as anthropic, MODEL, claudeAvailable } from "@/lib/claude";
import {
  priceListAnalysisSystem,
  priceListAdvocacySummarySystem,
} from "@/lib/negotiation/prompts";
import {
  classifyAgainst,
  adjustedRange,
  regionMultiplier,
} from "@/lib/pricing-data";
import {
  matchLineItem,
  naiveExtract,
  stripCodeFence,
  type RawItem,
} from "@/lib/negotiation/price-list-parse";
import { runRules } from "@/lib/bundling-detection/rules";
import { FEATURES } from "@/lib/env";
import { readLimitedJson } from "@/lib/http-guards";

const Body = z.object({
  text: z.string().min(20).max(20000),
  zip: z.string().min(3).max(10).optional(),
  serviceTypeHint: z.string().max(64).optional(),
});

interface ItemOut {
  name: string;
  cents: number;
  matchedItemId?: string;
  classification?: "good" | "fair" | "high" | "predatory";
  fairCentsLow?: number;
  fairCentsHigh?: number;
  /** Selection-range item (caskets, vaults, urns shown as $low-$high). */
  isRange?: boolean;
  centsLow?: number;
  centsHigh?: number;
}

interface AdvocacyMove {
  title: string;
  detail: string;
}

interface AdvocacySummary {
  bottomLine: string;
  moves: AdvocacyMove[];
  reassurance: string;
}

export async function POST(req: Request) {
  const limited = await readLimitedJson(req, 200);
  if (!limited.ok)
    return NextResponse.json({ error: limited.error }, { status: limited.status });
  const parsed = Body.safeParse(limited.data);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

  const { text, zip, serviceTypeHint } = parsed.data;

  let extracted: { items: RawItem[]; total_cents?: number } = {
    items: [],
  };

  if (claudeAvailable()) {
    try {
      const msg = await anthropic().messages.create({
        model: MODEL,
        max_tokens: 1500,
        system: priceListAnalysisSystem(),
        messages: [{ role: "user", content: text }],
      });
      const out = msg.content
        .filter((b) => b.type === "text")
        .map((b) => (b as { text: string }).text)
        .join("");
      extracted = JSON.parse(stripCodeFence(out));
    } catch {
      extracted = naiveExtract(text);
    }
  } else {
    extracted = naiveExtract(text);
  }

  const items: ItemOut[] = extracted.items.map((raw) => {
    // Selection-range item (caskets, vaults, urns): keep the range and don't
    // classify it against a single fair price — the family hasn't picked one.
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
    // Classify against the SAME zip-adjusted thresholds we display, including
    // an adjusted predatory cutoff — otherwise the verdict can contradict the
    // shown range (e.g. "$300, fair range $143–$285, verdict: Fair").
    const m = regionMultiplier(zip ?? "");
    const [lo, hi] = adjustedRange(matched.fairLow, matched.fairHigh, zip);
    const predatory = Math.round(matched.predatoryAt * m);
    return {
      name: raw.name,
      cents,
      matchedItemId: matched.id,
      classification: classifyAgainst(cents / 100, lo, hi, predatory),
      fairCentsLow: lo * 100,
      fairCentsHigh: hi * 100,
    };
  });

  // Range/selection items (caskets, vaults, urns) are excluded from the quoted
  // subtotal and savings math — there's no single price to sum or benchmark
  // until the family picks one. They surface in the item table with their
  // range, alongside the third-party-purchase-rights flag from runRules.
  const priced = items.filter((i) => !i.isRange);

  const totalQuoted =
    extracted.total_cents ?? priced.reduce((s, i) => s + (i.cents || 0), 0);

  const totalFairLow = priced.reduce(
    (s, i) => s + (i.fairCentsLow ?? i.cents),
    0,
  );
  const totalFairHigh = priced.reduce(
    (s, i) => s + (i.fairCentsHigh ?? i.cents),
    0,
  );
  const totalFairMid = Math.round((totalFairLow + totalFairHigh) / 2);
  const potentialSavings = Math.max(totalQuoted - totalFairMid, 0);

  // Run the bundling-detection rules engine against the raw text + parsed
  // items. Returns FTC violations, suspicious upsells, and informational
  // flags. Margaret refactor — the moat.
  const violations = runRules({
    rawText: text,
    items,
    serviceTypeHint,
    totalCents: totalQuoted,
  });

  // Optional: persist if logged in
  if (FEATURES.supabase()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("price_list_analyses").insert({
        user_id: user.id,
        raw_text: text.slice(0, 5000),
        total_quoted_cents: totalQuoted,
        total_fair_cents: totalFairMid,
        potential_savings_cents: potentialSavings,
        items,
      });
    }
  }

  // Advocacy synthesis — turn the deterministic findings into a calm,
  // prioritized "what we'd do" for the family. Grounded ONLY in the findings
  // (no invented prices). Best-effort: if Claude is down or returns malformed
  // JSON, summary is undefined and the table/cards still render.
  const summary = await buildAdvocacySummary({
    items,
    violations,
    totalQuoted,
    potentialSavings,
  });

  return NextResponse.json({
    items,
    totalQuoted,
    totalFairLow,
    totalFairHigh,
    totalFairMid,
    potentialSavings,
    violations,
    summary,
  });
}

async function buildAdvocacySummary(input: {
  items: ItemOut[];
  violations: { title: string; severity: string }[];
  totalQuoted: number;
  potentialSavings: number;
}): Promise<AdvocacySummary | undefined> {
  if (!claudeAvailable()) return undefined;

  // Compact, structured findings — the ONLY ground truth the summary may use.
  const findings = {
    items: input.items.map((i) =>
      i.isRange && i.centsLow != null && i.centsHigh != null
        ? {
            name: i.name,
            range: [i.centsLow / 100, i.centsHigh / 100],
            verdict: "selection-range",
          }
        : {
            name: i.name,
            price: i.cents / 100,
            verdict: i.classification ?? "unbenchmarked",
            fairRange:
              i.fairCentsLow != null && i.fairCentsHigh != null
                ? [i.fairCentsLow / 100, i.fairCentsHigh / 100]
                : null,
          },
    ),
    ftcFindings: input.violations.map((v) => ({
      title: v.title,
      severity: v.severity,
    })),
    fixedItemsSubtotal: Math.round(input.totalQuoted / 100),
    potentialSavingsOnFixedItems: Math.round(input.potentialSavings / 100),
    hasSelectionRanges: input.items.some((i) => i.isRange),
  };

  try {
    const msg = await anthropic().messages.create({
      model: MODEL,
      max_tokens: 700,
      system: priceListAdvocacySummarySystem(),
      messages: [{ role: "user", content: JSON.stringify(findings) }],
    });
    const out = msg.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("");
    const parsed = JSON.parse(stripCodeFence(out)) as {
      bottomLine?: unknown;
      moves?: unknown;
      reassurance?: unknown;
    };
    if (typeof parsed.bottomLine !== "string" || !Array.isArray(parsed.moves)) {
      return undefined;
    }
    const moves: AdvocacyMove[] = (parsed.moves as unknown[])
      .map((m) => {
        const mm = m as { title?: unknown; detail?: unknown };
        return {
          title: typeof mm.title === "string" ? mm.title : "",
          detail: typeof mm.detail === "string" ? mm.detail : "",
        };
      })
      .filter((m) => m.title)
      .slice(0, 5);
    return {
      bottomLine: parsed.bottomLine,
      moves,
      reassurance:
        typeof parsed.reassurance === "string" ? parsed.reassurance : "",
    };
  } catch {
    return undefined;
  }
}
