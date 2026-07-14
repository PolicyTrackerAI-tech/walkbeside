import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

/**
 * Family-facing outcome recording for a negotiation case. Captures the
 * post-case satisfaction score (and, optionally, what the family ended up
 * paying the funeral home and any fees that surprised them) as the case
 * closes.
 *
 * Private by construction: uses the user's RLS-scoped client and an explicit
 * user_id filter, so a family can only write their OWN case. amountPaidCents is
 * the price the family paid the FUNERAL HOME — an analytics figure only. The
 * product is free to families; there is no advocate fee.
 */

const Body = z
  .object({
    satisfactionScore: z.number().int().min(1).max(5).optional(),
    // What the family paid the funeral home (cents). Optional; capped at $100,000.
    amountPaidCents: z.number().int().nonnegative().max(100_000_00).optional(),
    surpriseFees: z.string().trim().max(1000).optional(),
  })
  .refine(
    (b) =>
      b.satisfactionScore !== undefined ||
      b.amountPaidCents !== undefined ||
      // .trim() runs before this refine, so require real content — an empty
      // string must not count as "something to record".
      (b.surpriseFees !== undefined && b.surpriseFees.length > 0),
    { message: "nothing to record" },
  );

/**
 * Builds the negotiations update payload. Only the fields the family actually
 * sent are written; savings_vs_listed_cents is a GENERATED column and must
 * never appear here — Postgres rejects any write to it.
 *
 * outcome_recorded_at marks a REAL outcome field (score or paid amount) —
 * the partner-report cohort filters on it, so a surprise-fees-only note must
 * never stamp it (it would pull an all-null record into aggregate counts).
 */
export function buildOutcomePatch(
  body: { satisfactionScore?: number; amountPaidCents?: number },
  nowIso: string,
): Record<string, unknown> {
  const patch: Record<string, unknown> = { updated_at: nowIso };
  if (body.satisfactionScore !== undefined) {
    patch.satisfaction_score = body.satisfactionScore;
    patch.outcome_recorded_at = nowIso;
  }
  if (body.amountPaidCents !== undefined) {
    patch.amount_paid_cents = body.amountPaidCents;
    patch.outcome_recorded_at = nowIso;
  }
  return patch;
}

// Marks the surprise-fees section on the chosen outreach row's notes so a
// resubmission replaces the earlier answer instead of appending a duplicate.
const SURPRISE_FEES_MARKER = "Fees that surprised the family (recorded after close): ";

/**
 * Appends (or replaces) the surprise-fees line on existing notes. Pure so it
 * can be unit-tested; capped at 2000 chars to stay within the quote route's
 * notes limit so later quote edits keep working.
 */
export function mergeSurpriseFees(
  existingNotes: string | null,
  surpriseFees: string,
): string {
  const markerAt = (existingNotes ?? "").indexOf(SURPRISE_FEES_MARKER);
  const base =
    markerAt >= 0
      ? (existingNotes ?? "").slice(0, markerAt).replace(/\n+$/, "")
      : (existingNotes ?? "");
  const prefix = base ? `${base}\n\n` : "";
  return `${prefix}${SURPRISE_FEES_MARKER}${surpriseFees}`.slice(0, 2000);
}

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

  const patch = buildOutcomePatch(parsed.data, new Date().toISOString());

  const { error } = await supabase
    .from("negotiations")
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // negotiations has no free-text column, so surprise-fee text lives on the
  // chosen home's outreach row — its notes column is the family's existing
  // free-text surface for that quote (the family choose route stamps
  // chosen=true). Best-effort: a case with no chosen row or a failed write
  // silently skips; the outcome above already saved.
  if (parsed.data.surpriseFees) {
    try {
      const { data: chosenRow } = await supabase
        .from("negotiation_outreach")
        .select("id, notes")
        .eq("negotiation_id", id)
        .eq("chosen", true)
        .limit(1)
        .maybeSingle();
      if (chosenRow) {
        await supabase
          .from("negotiation_outreach")
          .update({
            notes: mergeSurpriseFees(chosenRow.notes, parsed.data.surpriseFees),
          })
          .eq("id", chosenRow.id);
      }
    } catch {
      // Never fail the family's own outcome recording over an optional note.
    }
  }

  return NextResponse.json({ ok: true });
}
