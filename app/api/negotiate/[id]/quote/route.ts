import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

/**
 * Family records a manual quote received from a specific funeral home.
 * (Inbound email parsing is V2; for V1 we let the family forward/copy quotes.)
 */
const Body = z.object({
  outreachId: z.string().uuid(),
  quoteCents: z.number().int().nonnegative(),
  notes: z.string().max(2000).optional(),
});

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

  // Verify ownership of negotiation
  const { data: neg, error: negErr } = await supabase
    .from("negotiations")
    .select("id, user_id, target_home_estimate_cents, status")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (negErr || !neg)
    return NextResponse.json({ error: "not_found" }, { status: 404 });

  await supabase
    .from("negotiation_outreach")
    .update({
      quote_cents: parsed.data.quoteCents,
      notes: parsed.data.notes,
      status: "replied",
    })
    .eq("id", parsed.data.outreachId)
    .eq("negotiation_id", id);

  // Recompute best quote across all outreach for this negotiation
  const { data: all } = await supabase
    .from("negotiation_outreach")
    .select("quote_cents")
    .eq("negotiation_id", id)
    .not("quote_cents", "is", null);

  const quotes = (all ?? [])
    .map((r) => r.quote_cents as number)
    .filter((n) => Number.isFinite(n) && n > 0);
  const best = quotes.length ? Math.min(...quotes) : null;
  const baseline = neg.target_home_estimate_cents ?? null;
  const savings =
    best !== null && baseline !== null && baseline > best ? baseline - best : null;

  await supabase
    .from("negotiations")
    .update({
      best_quote_cents: best,
      savings_cents: savings,
      status: "received",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  return NextResponse.json({ best_quote_cents: best, savings_cents: savings });
}
