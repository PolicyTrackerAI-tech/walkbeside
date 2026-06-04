import { NextResponse } from "next/server";
import { z } from "zod";
import { client as anthropic, MODEL, textOf, claudeAvailable } from "@/lib/claude";
import { eulogySystem } from "@/lib/negotiation/prompts";

const Body = z.object({
  inputs: z.record(z.string(), z.string().max(1500)),
  durationMinutes: z.number().min(1).max(15).default(5),
  tone: z.enum(["reflective", "warm", "solemn"]).default("reflective"),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
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
    const msg = await anthropic().messages.create({
      model: MODEL,
      max_tokens: 1200,
      system: eulogySystem(tone),
      messages: [
        {
          role: "user",
          content: `Write a eulogy for the speaker to read aloud. Plain prose. Aim for ~${wordTarget} words (about ${durationMinutes} minute${durationMinutes === 1 ? "" : "s"} when spoken).\n\nFacts and stories the speaker shared:\n${lines}`,
        },
      ],
    });
    draft = textOf(msg);
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
