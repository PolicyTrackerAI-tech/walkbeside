import { NextResponse } from "next/server";
import { z } from "zod";
import { callClaude, claudeAvailable } from "@/lib/claude";
import { priceListPushbackLetterSystem } from "@/lib/negotiation/prompts";
import { fallbackPushbackLetter, type RangeAwareItem } from "@/lib/analyzer-display";
import { readLimitedJson } from "@/lib/http-guards";

/**
 * Turn a completed price-list analysis into a short, sendable message FROM the
 * family TO the funeral home — the bridge from "you're overcharged" to actually
 * fixing it. Grounded ONLY in the findings the client already has (no new
 * prices, no new claims). Always returns a letter: a deterministic fallback is
 * built from the findings if Claude is unavailable or returns nothing usable.
 */
const cents = z.number().finite().nonnegative();
const Item = z.object({
  name: z.string().max(200),
  cents,
  classification: z.enum(["good", "fair", "high", "predatory"]).optional(),
  fairCentsLow: cents.optional(),
  fairCentsHigh: cents.optional(),
  isRange: z.boolean().optional(),
  centsLow: cents.optional(),
  centsHigh: cents.optional(),
  qty: z.number().finite().nonnegative().optional(),
});

const Body = z.object({
  items: z.array(Item).max(60),
  violations: z
    .array(
      z.object({
        title: z.string().max(300),
        severity: z.string().max(20),
        whatToSay: z.string().max(600).optional(),
      }),
    )
    .max(30)
    .optional(),
  potentialSavings: cents.optional(),
  totalQuoted: cents.optional(),
});

export async function POST(req: Request) {
  const limited = await readLimitedJson(req, 200);
  if (!limited.ok)
    return NextResponse.json({ error: limited.error }, { status: limited.status });
  const parsed = Body.safeParse(limited.data);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const { items, violations = [], potentialSavings = 0, totalQuoted } = parsed.data;

  const normViolations = violations.map((v) => ({
    title: v.title,
    severity: v.severity as "violation" | "suspicious" | "info",
    whatToSay: v.whatToSay,
  }));
  const fallback = () =>
    fallbackPushbackLetter({
      items: items as RangeAwareItem[],
      violations: normViolations,
      potentialSavings,
    });

  if (!claudeAvailable()) return NextResponse.json({ letter: fallback() });

  // Compact findings — the ONLY ground truth the letter may use.
  const findings = {
    items: items.map((i) =>
      i.isRange && i.centsLow != null && i.centsHigh != null
        ? { name: i.name, range: [i.centsLow / 100, i.centsHigh / 100], verdict: "selection-range" }
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
    ftcFindings: normViolations.map((v) => ({
      title: v.title,
      severity: v.severity,
      whatToSay: v.whatToSay,
    })),
    totalQuoted: totalQuoted != null ? Math.round(totalQuoted / 100) : undefined,
    estimatedAboveFair: Math.round(potentialSavings / 100),
  };

  try {
    const out = await callClaude({
      feature: "draft-letter",
      system: priceListPushbackLetterSystem(),
      user: JSON.stringify(findings),
      maxTokens: 700,
    });
    if (out.length < 40) return NextResponse.json({ letter: fallback() });
    return NextResponse.json({ letter: out });
  } catch {
    return NextResponse.json({ letter: fallback() });
  }
}
