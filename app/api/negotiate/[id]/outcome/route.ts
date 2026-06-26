import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

/**
 * Family-facing outcome recording for a negotiation case. Captures the
 * post-case satisfaction score (and, optionally, what the family ended up
 * paying the funeral home) as the case closes.
 *
 * Private by construction: uses the user's RLS-scoped client and an explicit
 * user_id filter, so a family can only write their OWN case. This endpoint has
 * nothing to do with the Stripe $199 advocate fee — amountPaidCents is the
 * price paid to the funeral home, an analytics figure only.
 */

const Body = z
  .object({
    satisfactionScore: z.number().int().min(1).max(5).optional(),
    // What the family paid the funeral home (cents). Optional; capped at $1M.
    amountPaidCents: z.number().int().nonnegative().max(100_000_00).optional(),
  })
  .refine(
    (b) => b.satisfactionScore !== undefined || b.amountPaidCents !== undefined,
    { message: "nothing to record" },
  );

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

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  // Ownership check — fail fast with a clean 404. RLS enforces this too.
  const { data: neg, error: negErr } = await supabase
    .from("negotiations")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (negErr || !neg) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    updated_at: now,
    outcome_recorded_at: now,
  };
  if (parsed.data.satisfactionScore !== undefined) {
    patch.satisfaction_score = parsed.data.satisfactionScore;
  }
  if (parsed.data.amountPaidCents !== undefined) {
    patch.amount_paid_cents = parsed.data.amountPaidCents;
  }

  const { error } = await supabase
    .from("negotiations")
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
