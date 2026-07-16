import { NextResponse } from "next/server";
import { z } from "zod";
import { callClaude, claudeAvailable, CLASSIFIER_MODEL } from "@/lib/claude";
import { redactContact } from "@/lib/redact";
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
    // The statement text carries account numbers, card digits, and contact
    // details Claude doesn't need to spot recurring merchants — redact before
    // it leaves our server (dollar amounts and merchant names survive).
    // Classification-shaped (recurring-charge list from a statement), not the
    // benchmarked GPL pipeline — runs on the cheap classifier tier (D3).
    const out = await callClaude({
      feature: "subscription-finder",
      model: CLASSIFIER_MODEL,
      system: SYSTEM,
      user: redactContact(text),
      maxTokens: 2000,
    });
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
