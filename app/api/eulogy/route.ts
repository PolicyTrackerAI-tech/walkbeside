import { NextResponse } from "next/server";
import { z } from "zod";
import { callClaude, claudeAvailable } from "@/lib/claude";
import { eulogySystem } from "@/lib/negotiation/prompts";
import { readLimitedJson } from "@/lib/http-guards";

const Body = z.object({
  inputs: z.record(z.string(), z.string().max(1500)),
  durationMinutes: z.number().min(1).max(15).default(5),
  tone: z.enum(["reflective", "warm", "solemn"]).default("reflective"),
});

export async function POST(req: Request) {
  const limited = await readLimitedJson(req, 40);
  if (!limited.ok)
    return NextResponse.json({ error: limited.error }, { status: limited.status });
  const parsed = Body.safeParse(limited.data);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

  const { inputs, durationMinutes, tone } = parsed.data;

  let draft = "";
  if (claudeAvailable()) {
    const lines = Object.entries(inputs)
      .filter(([, v]) => v && v.trim())
      .map(([k, v]) => `${k}: ${v.trim()}`)
      .join("\n");
    // Rough word-count target: ~140 words per minute spoken.
    const wordTarget = durationMinutes * 140;
    // eulogySystem(tone) has three byte-stable variants (one per tone) — each
    // gets its own cache entry, which is fine. A Claude failure must never
    // 500 a grieving family — fall back to the same deterministic draft the
    // Claude-off branch uses.
    try {
      draft = await callClaude({
        feature: "eulogy",
        system: eulogySystem(tone),
        user: `Write a eulogy for the speaker to read aloud. Plain prose. Aim for ~${wordTarget} words (about ${durationMinutes} minute${durationMinutes === 1 ? "" : "s"} when spoken).\n\nFacts and stories the speaker shared:\n${lines}`,
        // Sized to the LONGEST request the UI allows, not the average: 15
        // minutes × 140 wpm = 2100 words ≈ ~3,600 sonnet-5 tokens. The old
        // 1600 cap (and 1200 before it) silently cut every eulogy ≥ ~7
        // minutes mid-sentence; callClaude now throws on that truncation
        // (→ deterministic fallback), so the cap must clear the real range.
        maxTokens: 3800,
        cacheSystem: true,
      });
    } catch {
      draft = fallbackEulogy(inputs);
    }
  } else {
    draft = fallbackEulogy(inputs);
  }

  return NextResponse.json({ draft });
}

function fallbackEulogy(inputs: Record<string, string>): string {
  const name = inputs.name?.trim() || "[their name]";
  return `When I think about ${name}, I think about [a specific moment or trait the speaker remembers]. ${name} was the kind of person who [characteristic]. Anyone who knew them remembers [story]. We loved them, and they loved us back, and that was enough.

[NOTE: This is a placeholder draft because our AI provider isn't reachable right now. Refresh and try again, or use this skeleton as a starting point.]`;
}
