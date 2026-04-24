import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { client as anthropic, MODEL, claudeAvailable } from "@/lib/claude";
import { priceListAnalysisSystem } from "@/lib/negotiation/prompts";
import { LINE_ITEMS, classifyPrice, adjustedRange } from "@/lib/pricing-data";
import { FEATURES } from "@/lib/env";

const Body = z.object({
  text: z.string().min(20).max(20000),
  zip: z.string().min(3).max(10).optional(),
});

interface ItemOut {
  name: string;
  cents: number;
  matchedItemId?: string;
  classification?: "good" | "fair" | "high" | "predatory";
  fairCentsLow?: number;
  fairCentsHigh?: number;
}

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

  const { text, zip } = parsed.data;

  let extracted: { items: { name: string; cents: number }[]; total_cents?: number } = {
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
    const matched = matchLineItem(raw.name);
    if (!matched) return { name: raw.name, cents: raw.cents };
    const [lo, hi] = adjustedRange(matched.fairLow, matched.fairHigh, zip);
    return {
      name: raw.name,
      cents: raw.cents,
      matchedItemId: matched.id,
      classification: classifyPrice(matched, raw.cents / 100),
      fairCentsLow: lo * 100,
      fairCentsHigh: hi * 100,
    };
  });

  const totalQuoted =
    extracted.total_cents ??
    items.reduce((s, i) => s + (i.cents || 0), 0);

  const totalFairLow = items.reduce(
    (s, i) => s + (i.fairCentsLow ?? i.cents),
    0,
  );
  const totalFairHigh = items.reduce(
    (s, i) => s + (i.fairCentsHigh ?? i.cents),
    0,
  );
  const totalFairMid = Math.round((totalFairLow + totalFairHigh) / 2);
  const potentialSavings = Math.max(totalQuoted - totalFairMid, 0);

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

  return NextResponse.json({
    items,
    totalQuoted,
    totalFairLow,
    totalFairHigh,
    totalFairMid,
    potentialSavings,
  });
}

function stripCodeFence(s: string): string {
  return s.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
}

function naiveExtract(text: string): {
  items: { name: string; cents: number }[];
  total_cents?: number;
} {
  // Fallback: line-by-line "name ... $1,234" pattern.
  const items: { name: string; cents: number }[] = [];
  const re = /^(.+?)\s+\$?([\d,]+(?:\.\d{2})?)\s*$/;
  let total: number | undefined;
  for (const line of text.split(/\r?\n/)) {
    const m = re.exec(line.trim());
    if (!m) continue;
    const name = m[1].trim();
    const dollars = Number(m[2].replace(/,/g, ""));
    if (!Number.isFinite(dollars)) continue;
    const cents = Math.round(dollars * 100);
    if (/total/i.test(name)) total = cents;
    else items.push({ name, cents });
  }
  return { items, total_cents: total };
}

function matchLineItem(name: string): (typeof LINE_ITEMS)[number] | undefined {
  const n = name.toLowerCase();
  return LINE_ITEMS.find((it) => {
    const key = it.name.toLowerCase().split(/[—()/]/)[0].trim();
    return n.includes(key) || key.split(" ").every((w) => n.includes(w));
  });
}
