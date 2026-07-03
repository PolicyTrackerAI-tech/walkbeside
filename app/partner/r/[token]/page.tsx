import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";
import {
  aggregateCohort,
  rowToCohortRecord,
  type OutcomeRow,
} from "@/lib/partner-report";
import { ProofSheet } from "@/components/partner/ProofSheet";

export const metadata: Metadata = {
  title: "Partner report — Honest Funeral",
  // Never index a bearer-token report URL.
  robots: { index: false, follow: false },
};

/**
 * The REAL partner proof report, behind an unguessable report_token. Possession
 * of the token authorizes a read-only, AGGREGATE-ONLY view of the partner's
 * referred families (no per-family detail ever reaches the markup). Reads via
 * the service-role key with an explicit partner_id filter — the same pattern as
 * /admin/outcomes. Degrades to a calm empty state (and notFound on a bad token,
 * or before the partners/outcomes migrations are applied). Design:
 * docs/P3_PARTNER_LAYER.md.
 */
export default async function PartnerTokenReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!token || token.length < 16) notFound();

  const admin = createServiceClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );

  // Resolve the token → partner. A bad token, or the table not existing yet
  // (migration unapplied), both 404 — we never confirm the route to a guesser.
  let partner: { id: string; name: string; active: boolean } | null = null;
  try {
    const { data } = await admin
      .from("partners")
      .select("id, name, active")
      .eq("report_token", token)
      .single();
    partner = data ?? null;
  } catch {
    partner = null;
  }
  if (!partner || partner.active === false) notFound();

  // Real aggregates for this partner's referred + completed cases. Any error
  // (e.g. the outcomes migration not yet applied) degrades to the empty state.
  let records: ReturnType<typeof rowToCohortRecord>[] = [];
  try {
    const { data: negs } = await admin
      .from("negotiations")
      .select("id, savings_vs_listed_cents, satisfaction_score, created_at, outcome_recorded_at")
      .eq("partner_id", partner.id)
      .not("outcome_recorded_at", "is", null);

    const cases = (negs ?? []) as (OutcomeRow & { id: string })[];

    // Hidden-fee findings per case (FTC proxy) from the case's outreach rows.
    const feeCount = new Map<string, number>();
    if (cases.length) {
      const { data: outreach } = await admin
        .from("negotiation_outreach")
        .select("negotiation_id, hidden_fees")
        .in("negotiation_id", cases.map((c) => c.id));
      for (const row of (outreach ?? []) as {
        negotiation_id: string;
        hidden_fees: unknown;
      }[]) {
        const n = Array.isArray(row.hidden_fees) ? row.hidden_fees.length : 0;
        feeCount.set(
          row.negotiation_id,
          (feeCount.get(row.negotiation_id) ?? 0) + n,
        );
      }
    }

    records = cases.map((c) =>
      rowToCohortRecord({ ...c, hidden_fees_count: feeCount.get(c.id) ?? 0 }),
    );
  } catch {
    records = [];
  }

  return (
    <>
      <ProofSheet name={partner.name} stats={aggregateCohort(records)} live />
      <div className="max-w-2xl mx-auto px-5 pb-10 print:hidden">
        <p className="text-sm text-ink-soft">
          Coordinators:{" "}
          <a
            href={`/partner/r/${token}/links`}
            className="text-primary-deep underline"
          >
            create and manage your referral links
          </a>{" "}
          — each one opens our free planning tools with your name on them, and
          cases started through them count toward this report.
        </p>
      </div>
    </>
  );
}
