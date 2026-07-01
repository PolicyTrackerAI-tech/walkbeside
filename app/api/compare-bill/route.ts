import { NextResponse } from "next/server";
import { z } from "zod";
import { client as anthropic, MODEL, claudeAvailable } from "@/lib/claude";
import { priceListAnalysisSystem } from "@/lib/negotiation/prompts";
import {
  naiveExtract,
  stripCodeFence,
  type RawItem,
} from "@/lib/negotiation/price-list-parse";
import { diffBillAgainstQuote } from "@/lib/bill-drift";
import { readLimitedJson } from "@/lib/http-guards";

/**
 * Final-bill-vs-original-quote drift check. The family pastes (or OCRs, via
 * the existing /api/extract-price-list-image endpoint) BOTH documents; each is
 * parsed with the same extraction pipeline the analyzer uses, then diffed by
 * pure arithmetic (lib/bill-drift.ts). No benchmarks, no fair-range judgment —
 * every finding derives from the family's own two documents, so each claim is
 * provable rather than estimated. Free, like everything family-facing.
 */

const Body = z.object({
  quoteText: z.string().min(20).max(20000),
  billText: z.string().min(20).max(20000),
});

async function parseDoc(text: string): Promise<RawItem[]> {
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
      const parsed = JSON.parse(stripCodeFence(out)) as { items?: RawItem[] };
      if (Array.isArray(parsed.items)) return parsed.items;
    } catch {
      // fall through to the deterministic parser
    }
  }
  return naiveExtract(text).items;
}

export async function POST(req: Request) {
  const limited = await readLimitedJson(req, 200);
  if (!limited.ok)
    return NextResponse.json({ error: limited.error }, { status: limited.status });
  const parsed = Body.safeParse(limited.data);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

  const { quoteText, billText } = parsed.data;

  // Parse the two documents in parallel — same pipeline, independent docs.
  const [quoteItems, billItems] = await Promise.all([
    parseDoc(quoteText),
    parseDoc(billText),
  ]);

  if (quoteItems.length === 0 || billItems.length === 0) {
    return NextResponse.json(
      {
        error:
          quoteItems.length === 0
            ? "couldnt_read_quote"
            : "couldnt_read_bill",
      },
      { status: 422 },
    );
  }

  const result = diffBillAgainstQuote(quoteItems, billItems);
  return NextResponse.json(result);
}
