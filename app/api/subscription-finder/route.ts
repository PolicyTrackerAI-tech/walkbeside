import { NextResponse } from "next/server";
import { z } from "zod";
import { client as anthropic, MODEL, textOf, claudeAvailable } from "@/lib/claude";
import { readLimitedJson } from "@/lib/http-guards";

const Body = z.object({
  text: z.string().min(20).max(50_000),
});

const SYSTEM = `You extract recurring subscriptions and recurring charges from a bank or credit card statement. The user pastes their statement; you return a structured list of every recurring charge you can identify.

Return ONLY valid JSON in this shape, no preamble, no markdown:

{
  "charges": [
    {
      "merchant": "Netflix",
      "amountCents": 1599,
      "frequency": "monthly" | "annual" | "unknown",
      "category": "streaming" | "software" | "gym" | "subscription-box" | "membership" | "utility" | "insurance" | "donation" | "other",
      "lastSeen": "2026-04-15"
    }
  ]
}

Rules:
- Only include things that recur (appear monthly or yearly).
- Skip one-time purchases.
- If the same merchant appears 2+ times in the statement, include it once with the most recent date.
- amountCents is the integer cents (e.g. 15.99 → 1599).
- If you can't determine frequency, use "unknown".
- Be generous about including — we'd rather flag something the family can ignore than miss a real subscription.
- If no recurring charges are found, return { "charges": [] }.`;

export async function POST(req: Request) {
  const limited = await readLimitedJson(req, 60);
  if (!limited.ok)
    return NextResponse.json({ error: limited.error }, { status: limited.status });
  const parsed = Body.safeParse(limited.data);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

  const { text } = parsed.data;

  if (!claudeAvailable()) {
    return NextResponse.json(
      {
        charges: [],
        warning:
          "AI extraction is not configured. Try entering subscriptions manually below.",
      },
      { status: 200 },
    );
  }

  try {
    const msg = await anthropic().messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: SYSTEM,
      messages: [{ role: "user", content: text }],
    });
    const out = textOf(msg);
    const cleaned = out
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    const data = JSON.parse(cleaned);
    if (!Array.isArray(data?.charges)) {
      return NextResponse.json(
        { charges: [], warning: "Couldn't parse the statement. Try a different format." },
        { status: 200 },
      );
    }
    return NextResponse.json({ charges: data.charges });
  } catch (e) {
    return NextResponse.json(
      {
        charges: [],
        warning:
          e instanceof Error
            ? `Extraction failed: ${e.message}`
            : "Extraction failed. Try entering subscriptions manually below.",
      },
      { status: 200 },
    );
  }
}
