import "server-only";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";
import {
  aggregateCohort,
  rowToCohortRecord,
  metroMedianCents,
  type CohortStats,
  type OutcomeRow,
} from "@/lib/partner-report";
import { buildOutcomesDigest } from "@/lib/partner-report-digest";

/**
 * The one place partner report aggregates are assembled. Extracted verbatim
 * from app/partner/r/[token]/page.tsx so the token report and the signed-in
 * /portal overview can never drift — both render exactly this data.
 *
 * Reads via the service role with an explicit partner_id filter (the same
 * pattern as /admin/outcomes). AGGREGATE-ONLY by construction: user_id keys
 * the tool-engagement lookups and never reaches the returned data
 * (rowToCohortRecord takes booleans, not identities). Any error — e.g. the
 * outcomes migration not applied yet — degrades to the empty cohort.
 */

export interface PartnerReportData {
  stats: CohortStats;
  digest: string;
}

export async function buildPartnerReportData(partner: {
  id: string;
  name: string;
  /** partners.partner_type — anything but "employer" reads as "hospice". */
  partner_type?: string;
}): Promise<PartnerReportData> {
  const partnerType: "hospice" | "employer" =
    partner.partner_type === "employer" ? "employer" : "hospice";
  const admin = createServiceClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );

  let records: ReturnType<typeof rowToCohortRecord>[] = [];
  try {
    const { data: negs } = await admin
      .from("negotiations")
      .select(
        "id, user_id, zip, service_type, savings_vs_listed_cents, satisfaction_score, amount_paid_cents, benefit_dollars_recovered_cents, created_at, outcome_recorded_at",
      )
      .eq("partner_id", partner.id)
      .not("outcome_recorded_at", "is", null);

    const cases = (negs ?? []) as (OutcomeRow & {
      id: string;
      user_id: string;
      zip: string;
      service_type: string;
    })[];

    // Hidden-fee findings (FTC proxy) + quotes-received per case, from the
    // case's outreach rows in one pass.
    const feeCount = new Map<string, number>();
    const quoteCount = new Map<string, number>();
    if (cases.length) {
      const { data: outreach } = await admin
        .from("negotiation_outreach")
        .select("negotiation_id, hidden_fees, quote_cents")
        .in("negotiation_id", cases.map((c) => c.id));
      for (const row of (outreach ?? []) as {
        negotiation_id: string;
        hidden_fees: unknown;
        quote_cents: number | null;
      }[]) {
        const n = Array.isArray(row.hidden_fees) ? row.hidden_fees.length : 0;
        feeCount.set(
          row.negotiation_id,
          (feeCount.get(row.negotiation_id) ?? 0) + n,
        );
        if (typeof row.quote_cents === "number") {
          quoteCount.set(
            row.negotiation_id,
            (quoteCount.get(row.negotiation_id) ?? 0) + 1,
          );
        }
      }
    }

    // Tool engagement — existence joins on the family's own saved artifacts.
    // user_id is used ONLY to key these lookups; it never reaches the
    // aggregate (rowToCohortRecord takes booleans, not identities).
    const userIds = [...new Set(cases.map((c) => c.user_id))];
    const usedBy = async (table: string): Promise<Set<string>> => {
      if (!userIds.length) return new Set();
      const { data } = await admin
        .from(table)
        .select("user_id")
        .in("user_id", userIds);
      return new Set(((data ?? []) as { user_id: string }[]).map((r) => r.user_id));
    };
    const [checkerUsers, certUsers, obitUsers] = await Promise.all([
      usedBy("price_list_analyses"),
      usedBy("cert_trackers"),
      usedBy("obituaries"),
    ]);

    // Families who received at least one bereavement check-in (the cron
    // records milestones on profiles.anniversary_emails_sent).
    let remindedUsers = new Set<string>();
    if (userIds.length) {
      const { data: profs } = await admin
        .from("profiles")
        .select("id, anniversary_emails_sent")
        .in("id", userIds);
      remindedUsers = new Set(
        ((profs ?? []) as { id: string; anniversary_emails_sent: unknown }[])
          .filter(
            (p) =>
              Array.isArray(p.anniversary_emails_sent) &&
              p.anniversary_emails_sent.length > 0,
          )
          .map((p) => p.id),
      );
    }

    records = cases.map((c) => ({
      ...rowToCohortRecord({
        ...c,
        hidden_fees_count: feeCount.get(c.id) ?? 0,
        quote_count: quoteCount.get(c.id) ?? 0,
        metro_median_cents: metroMedianCents(c.service_type, c.zip),
      }),
      usedChecker: checkerUsers.has(c.user_id),
      usedCertTracker: certUsers.has(c.user_id),
      usedObituary: obitUsers.has(c.user_id),
      bereavementReminded: remindedUsers.has(c.user_id),
    }));
  } catch {
    records = [];
  }

  const stats = aggregateCohort(records);
  const digest = await buildOutcomesDigest(partner.name, stats, partnerType);
  return { stats, digest };
}

/**
 * How many active referral links the org has — drives the /portal first-run
 * checklist. Degrades to 0 on any error (e.g. migration not applied).
 */
export async function activeCodeCount(partnerId: string): Promise<number> {
  const admin = createServiceClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );
  try {
    const { count } = await admin
      .from("partner_codes")
      .select("code", { count: "exact", head: true })
      .eq("partner_id", partnerId)
      .eq("active", true);
    return count ?? 0;
  } catch {
    return 0;
  }
}
