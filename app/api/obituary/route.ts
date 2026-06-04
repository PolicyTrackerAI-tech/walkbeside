import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { client as anthropic, MODEL, textOf, claudeAvailable } from "@/lib/claude";
import { obituarySystem } from "@/lib/negotiation/prompts";
import { FEATURES } from "@/lib/env";

const Body = z.object({
  inputs: z.record(z.string(), z.string().max(1000)),
  length: z.enum(["short", "standard", "full"]).default("standard"),
});

const WORD_TARGET: Record<"short" | "standard" | "full", number> = {
  short: 75,
  standard: 150,
  full: 260,
};

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

  const { inputs, length } = parsed.data;
  const words = WORD_TARGET[length];

  let draft = "";
  if (claudeAvailable()) {
    const lines = Object.entries(inputs)
      .filter(([, v]) => v && v.trim())
      .map(([k, v]) => `${k}: ${v.trim()}`)
      .join("\n");
    const shape =
      length === "short"
        ? "A tight funeral-notice version: just the essential facts and one line of who they were."
        : length === "full"
          ? "Room for a story or two and a real sense of their personality."
          : "A warm, standard-length obituary.";
    const msg = await anthropic().messages.create({
      model: MODEL,
      max_tokens: 800,
      system: obituarySystem(),
      messages: [
        {
          role: "user",
          content: `Write the obituary using these facts. Plain text, single paragraph, about ${words} words. ${shape}\n\n${lines}`,
        },
      ],
    });
    draft = textOf(msg);
  } else {
    draft = fallbackObituary(inputs);
  }

  if (FEATURES.supabase()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("obituaries").insert({
        user_id: user.id,
        inputs,
        draft,
      });
    }
  }

  return NextResponse.json({ draft });
}

function fallbackObituary(i: Record<string, string>): string {
  const name = i.fullName || "[Name]";
  const nick = i.nickname ? `, known to family and friends as ${i.nickname},` : "";
  const born = i.born ? ` born ${i.born}` : "";
  const died = i.died ? `, passed away on ${i.died}` : "";
  const family = i.family ? ` They are survived by ${i.family}.` : "";
  const career = i.career ? ` ${i.career}.` : "";
  const passions = i.passions
    ? ` They were known for ${i.passions}.`
    : "";
  const service = i.service ? ` ${i.service}.` : "";
  return `${name}${nick}${born}${died}.${career}${passions}${family}${service}`.trim();
}
