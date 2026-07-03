import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";
import { requireAdminApi } from "@/lib/admin-auth";

/**
 * Admin write endpoint for the outcomes instrumentation view (/admin/outcomes).
 * Gated by the session-based admin allowlist (requireAdminApi — same as the
 * other /admin/* tools) and backed by the service-role key (bypasses RLS).
 * Mutations only — the page reads via service role.
 *
 * Records the outcome fields that the family-facing flow can't capture on its
 * own (which home was chosen, negotiated figures, hidden fees, amount paid).
 * Touches NO Stripe / payment code. The generated savings_vs_listed_cents is
 * never written here — Postgres derives it.
 */

const CENTS = z.number().int().nonnegative().max(100_000_00);

/**
 * True only when the request carries a REAL outcome field. Drives whether
 * outcome_recorded_at is stamped — which in turn drives what counts as a
 * completed case on a partner's report. Tagging a partner alone (the "Referred
 * by" selector) must never, by itself, mark a case "resolved."
 */
export function hasRealOutcomeField(body: {
  negotiatedPriceCents?: number | null;
  amountPaidCents?: number | null;
  satisfactionScore?: number | null;
  benefitDollarsRecoveredCents?: number | null;
}): boolean {
  return (
    body.negotiatedPriceCents !== undefined ||
    body.amountPaidCents !== undefined ||
    body.satisfactionScore !== undefined ||
    body.benefitDollarsRecoveredCents !== undefined
  );
}

const CaseBody = z.object({
  scope: z.literal("case"),
  negotiationId: z.string().uuid(),
  negotiatedPriceCents: CENTS.nullable().optional(),
  amountPaidCents: CENTS.nullable().optional(),
  satisfactionScore: z.number().int().min(1).max(5).nullable().optional(),
  // Pilot metric: benefit dollars the family actually recovered (VA/SSA/
  // insurance/county) — admin-entered; aggregate-only on partner surfaces.
  benefitDollarsRecoveredCents: CENTS.nullable().optional(),
  // Referring partner (hospice) for the partner report. Set AFTER the family
  // chose — a reporting label only, never read by selection/outreach.
  partnerId: z.string().uuid().nullable().optional(),
});

const HiddenFee = z.object({
  label: z.string().min(1).max(120),
  cents: z.number().int().nonnegative().max(100_000_00),
  note: z.string().max(300).optional(),
});

const HomeBody = z.object({
  scope: z.literal("home"),
  negotiationId: z.string().uuid(),
  outreachId: z.string().uuid(),
  chosen: z.boolean().optional(),
  listedPriceCents: CENTS.nullable().optional(),
  negotiatedPriceCents: CENTS.nullable().optional(),
  hiddenFees: z.array(HiddenFee).max(50).nullable().optional(),
});

const Body = z.discriminatedUnion("scope", [CaseBody, HomeBody]);

const NEG_COLS =
  "id, zip, service_type, status, target_home_estimate_cents, best_quote_cents, negotiated_price_cents, amount_paid_cents, satisfaction_score, benefit_dollars_recovered_cents, savings_vs_listed_cents, outcome_recorded_at, created_at";
const OUTREACH_COLS =
  "id, negotiation_id, home_name, quote_cents, chosen, listed_price_cents, negotiated_price_cents, hidden_fees, status";

export async function PATCH(req: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }
  const body = parsed.data;
  const now = new Date().toISOString();

  const admin = createServiceClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );

  if (body.scope === "case") {
    const patch: Record<string, unknown> = { updated_at: now };
    // Caught in the 2026-07-01 readout audit: tagging partnerId alone must not
    // mark a case "resolved" with $0 savings on a partner's real report.
    if (hasRealOutcomeField(body)) {
      patch.outcome_recorded_at = now;
    }
    if (body.negotiatedPriceCents !== undefined) {
      patch.negotiated_price_cents = body.negotiatedPriceCents;
    }
    if (body.amountPaidCents !== undefined) {
      patch.amount_paid_cents = body.amountPaidCents;
    }
    if (body.satisfactionScore !== undefined) {
      patch.satisfaction_score = body.satisfactionScore;
    }
    if (body.benefitDollarsRecoveredCents !== undefined) {
      patch.benefit_dollars_recovered_cents = body.benefitDollarsRecoveredCents;
    }
    if (body.partnerId !== undefined) {
      patch.partner_id = body.partnerId;
    }

    const { data, error } = await admin
      .from("negotiations")
      .update(patch)
      .eq("id", body.negotiationId)
      .select(NEG_COLS)
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, negotiation: data });
  }

  // scope === "home"
  const patch: Record<string, unknown> = { updated_at: now };
  if (body.chosen !== undefined) patch.chosen = body.chosen;
  if (body.listedPriceCents !== undefined) {
    patch.listed_price_cents = body.listedPriceCents;
  }
  if (body.negotiatedPriceCents !== undefined) {
    patch.negotiated_price_cents = body.negotiatedPriceCents;
  }
  if (body.hiddenFees !== undefined) patch.hidden_fees = body.hiddenFees;

  // A case has exactly one chosen home — clear the siblings first.
  if (body.chosen === true) {
    const { error: clearErr } = await admin
      .from("negotiation_outreach")
      .update({ chosen: false, updated_at: now })
      .eq("negotiation_id", body.negotiationId)
      .neq("id", body.outreachId);
    if (clearErr) {
      return NextResponse.json({ error: clearErr.message }, { status: 500 });
    }
  }

  const { data, error } = await admin
    .from("negotiation_outreach")
    .update(patch)
    .eq("id", body.outreachId)
    .eq("negotiation_id", body.negotiationId)
    .select(OUTREACH_COLS)
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, outreach: data });
}
