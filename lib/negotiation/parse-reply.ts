import { callClaude, claudeAvailable } from "@/lib/claude";
import { summarizeQuoteSystem } from "@/lib/negotiation/prompts";
import { stripCodeFence } from "@/lib/negotiation/price-list-parse";
import { reconcileTotalQuoted } from "@/lib/analyzer-totals";
import { extractionConfidence } from "@/lib/extraction-confidence";

/**
 * Best-effort AI parse of a funeral home's email reply into a PROPOSED quote
 * (product week Day 4, P7). The result is stored on the message row's ai_*
 * columns and rendered as a one-click confirm on the family's status page —
 * it is never ground truth until a human confirms through the existing
 * /api/negotiate/[id]/quote route.
 *
 * Failure philosophy: silence is fine, wrong is not. Anything questionable —
 * malformed JSON, non-USD, an implausible total, low confidence — returns
 * null and the family simply types the quote in as before.
 */

export interface ParsedInboundQuote {
  /** All-in proposed quote, reconciled against the itemization. */
  cents: number;
  items: { name: string; cents: number }[];
  /** 0-1 — item count + stated-total consistency (lib/extraction-confidence). */
  confidence: number;
}

// A real all-in funeral quote sits comfortably inside these bounds; anything
// outside is more likely a parse artifact (a phone number, a date, a deposit
// line) than a quote we should propose to a grieving family.
const MIN_PLAUSIBLE_CENTS = 20_000; // $200
const MAX_PLAUSIBLE_CENTS = 10_000_000; // $100,000
const MIN_CONFIDENCE = 0.35;
const MAX_ITEMS = 40;

/**
 * Pure interpretation of the model's JSON payload — exported for tests.
 * Accepts the summarizeQuoteSystem() shape ({ items, total_cents, currency })
 * with every field treated as untrusted.
 */
export function interpretQuotePayload(raw: unknown): ParsedInboundQuote | null {
  if (typeof raw !== "object" || raw === null) return null;
  const obj = raw as {
    items?: unknown;
    total_cents?: unknown;
    currency?: unknown;
  };

  // Non-USD is rare and we can't benchmark it — decline rather than guess.
  if (
    typeof obj.currency === "string" &&
    obj.currency.trim() !== "" &&
    obj.currency.trim().toUpperCase() !== "USD"
  ) {
    return null;
  }

  const items = (Array.isArray(obj.items) ? obj.items : [])
    .map((it) => {
      const entry = it as { name?: unknown; cents?: unknown };
      const name = typeof entry.name === "string" ? entry.name.trim() : "";
      const cents =
        typeof entry.cents === "number" && Number.isFinite(entry.cents)
          ? Math.round(entry.cents)
          : NaN;
      return { name: name.slice(0, 200), cents };
    })
    .filter((it) => it.name && Number.isInteger(it.cents) && it.cents > 0)
    .slice(0, MAX_ITEMS);

  const statedTotal =
    typeof obj.total_cents === "number" && Number.isFinite(obj.total_cents)
      ? Math.round(obj.total_cents)
      : null;

  const itemSum = items.reduce((s, it) => s + it.cents, 0);
  if (itemSum <= 0 && (statedTotal == null || statedTotal <= 0)) return null;

  // Same hallucinated-total defense the analyzer uses: a stated total below
  // the item sum or wildly above it is replaced by the item sum.
  const cents = reconcileTotalQuoted(statedTotal, itemSum);
  if (cents < MIN_PLAUSIBLE_CENTS || cents > MAX_PLAUSIBLE_CENTS) return null;

  const confidence = extractionConfidence({
    itemCount: items.length,
    statedTotalCents: statedTotal,
    itemSumCents: itemSum,
  });
  if (confidence < MIN_CONFIDENCE) return null;

  return { cents, items, confidence };
}

/**
 * Parse an inbound reply body with Claude. Time-bounded (the caller is the
 * Postmark webhook, which must answer fast) and null on any failure.
 */
export async function parseInboundQuote(
  body: string,
  negotiationId?: string,
): Promise<ParsedInboundQuote | null> {
  if (!claudeAvailable()) return null;
  try {
    const out = await callClaude({
      feature: "inbound-quote-parse",
      system: summarizeQuoteSystem(),
      user: body.slice(0, 6000),
      maxTokens: 1000,
      negotiationId,
      timeoutMs: 15_000,
    });
    return interpretQuotePayload(JSON.parse(stripCodeFence(out)));
  } catch {
    return null;
  }
}
