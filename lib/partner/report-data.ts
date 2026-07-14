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
  /**
   * Analyses stamped with this partner's id at check time. A non-identifying
   * tool-usage count (no dollars, no satisfaction, no identities), so it is
   * deliberately outside aggregateCohort and its n≥5 suppression — the same
   * posture as familiesHelped. Dollar/satisfaction fields stay
   * suppression-gated.
   */
  priceListChecks: number;
}

/**
 * Union of the two checker-engagement signals: the legacy user-existence join
 * (any saved analysis by a cohort family, pre-attribution rows included) and
 * users whose analyses were stamped with the partner's id directly. Either
 * signal alone marks a family as having used the checker; the union dedupes a
 * family present in both.
 */
export function mergeCheckerUsers(
  legacy: Set<string>,
  attributed: Set<string>,
): Set<string> {
  return new Set([...legacy, ...attributed]);
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

  // Direct attribution — analyses stamped with this partner's id at check
  // time, including referred families who checked a quote but never started a
  // case. Its OWN try/catch: the partner_id column ships in a founder-applied
  // migration, and a missing column must degrade to zero checks, never zero
  // the whole report below.
  // Head-count query (mirrors activeCodeCount) — a row fetch would silently
  // cap at PostgREST's max-rows (1000) and freeze the number there.
  let priceListChecks = 0;
  try {
    const { count, error: countError } = await admin
      .from("price_list_analyses")
      .select("id", { count: "exact", head: true })
      .eq("partner_id", partner.id);
    if (!countError && typeof count === "number") {
      priceListChecks = count;
    }
  } catch {
    // degrade to zero checks
  }

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

    // Cohort-bounded direct-attribution set (own try/catch — the partner_id
    // column ships in a founder-applied migration, and a missing column must
    // degrade to the legacy join, never zero the whole report).
    let attributedCheckerUsers = new Set<string>();
    if (userIds.length) {
      try {
        const { data: attributed, error: attributedError } = await admin
          .from("price_list_analyses")
          .select("user_id")
          .eq("partner_id", partner.id)
          .in("user_id", userIds);
        if (!attributedError) {
          attributedCheckerUsers = new Set(
            ((attributed ?? []) as { user_id: string }[]).map(
              (r) => r.user_id,
            ),
          );
        }
      } catch {
        // legacy join already covers cohort families
      }
    }

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

    // The legacy user-existence join stays as the pre-migration fallback;
    // directly-attributed analyses are merged in on top.
    const allCheckerUsers = mergeCheckerUsers(
      checkerUsers,
      attributedCheckerUsers,
    );
    records = cases.map((c) => ({
      ...rowToCohortRecord({
        ...c,
        hidden_fees_count: feeCount.get(c.id) ?? 0,
        quote_count: quoteCount.get(c.id) ?? 0,
        metro_median_cents: metroMedianCents(c.service_type, c.zip),
      }),
      usedChecker: allCheckerUsers.has(c.user_id),
      usedCertTracker: certUsers.has(c.user_id),
      usedObituary: obitUsers.has(c.user_id),
      bereavementReminded: remindedUsers.has(c.user_id),
    }));
  } catch {
    records = [];
  }

  const stats = aggregateCohort(records);
  const digest = await buildOutcomesDigest(partner.name, stats, partnerType);
  return { stats, digest, priceListChecks };
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
