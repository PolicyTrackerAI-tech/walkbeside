import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import { requireAdminApi } from "@/lib/admin-auth";
import {
  aggregateCohort,
  rowToCohortRecord,
  type OutcomeRow,
} from "@/lib/partner-report";
import { buildOutcomesDigest } from "@/lib/partner-report-digest";
import {
  buildPartnerDigest,
  shouldSendDigest,
  type DigestInput,
} from "@/lib/partner-digest";

export const runtime = "nodejs";
export const maxDuration = 60;

type PartnerRow = {
  id: string;
  name: string;
  active: boolean;
  contact_email: string | null;
  notification_email: string | null;
  partner_type: string | null;
  report_token: string;
};

const PARTNER_COLUMNS =
  "id, name, active, contact_email, notification_email, partner_type, report_token";

/** The month the digest reports on, plus the boundary its counts start from. */
function digestPeriod(): { periodStart: Date; periodLabel: string } {
  const periodStart = new Date();
  // Anchor to the 1st BEFORE subtracting a month: setUTCMonth on the 29th–31st
  // rolls over short months (Mar 31 − 1 month → "March", not February). A
  // no-op for the real cron (it runs on the 1st), but the admin dry-run can
  // render on any day.
  periodStart.setUTCDate(1);
  periodStart.setUTCMonth(periodStart.getUTCMonth() - 1);
  return {
    periodStart,
    periodLabel: periodStart.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }),
  };
}

/** Owners can set a dedicated digest recipient in /portal/settings. */
function digestRecipient(partner: PartnerRow): string | null {
  return partner.notification_email ?? partner.contact_email;
}

/**
 * The single source of a partner's DigestInput. The cron send loop and the
 * admin dry-run both call this, so what the dry-run renders is exactly what
 * the cron would send — the two can never drift.
 *
 * The AI outcomes paragraph is fetched here, only when there is a completed
 * cohort to summarise. buildOutcomesDigest handles both suppression states
 * internally (small sample -> the static forward-looking line) and falls back
 * to deterministic text on any Claude failure, so suppression travels with
 * the paragraph by construction.
 */
async function buildDigestInputForPartner(
  admin: SupabaseClient,
  partner: PartnerRow,
  period: { periodStart: Date; periodLabel: string },
): Promise<DigestInput> {
  const { count: started } = await admin
    .from("negotiations")
    .select("id", { count: "exact", head: true })
    .eq("partner_id", partner.id)
    .gte("created_at", period.periodStart.toISOString());

  const { data: negs } = await admin
    .from("negotiations")
    .select("savings_vs_listed_cents, satisfaction_score, created_at, outcome_recorded_at")
    .eq("partner_id", partner.id)
    .not("outcome_recorded_at", "is", null);
  const cohort = aggregateCohort(
    ((negs as OutcomeRow[] | null) ?? []).map((r) => rowToCohortRecord(r)),
  );

  const partnerType: "hospice" | "employer" =
    partner.partner_type === "employer" ? "employer" : "hospice";

  // Bounded: this runs once per partner, sequentially, under maxDuration —
  // a slow Claude call must degrade to the deterministic fallback, never eat
  // the remaining partners' slot.
  const outcomesDigest =
    cohort.familiesHelped > 0
      ? await buildOutcomesDigest(partner.name, cohort, partnerType, {
          timeoutMs: 15_000,
        })
      : undefined;

  return {
    partnerName: partner.name,
    partnerType,
    periodLabel: period.periodLabel,
    familiesStartedInPeriod: started ?? 0,
    cohort,
    outcomesDigest,
    reportUrl: `${PUBLIC.appUrl}/partner/r/${partner.report_token}`,
  };
}

/**
 * Monthly cron (vercel.json: 1st of the month, 15:00 UTC) — the aggregate
 * partner activity digest. Same discipline as the live report: counts and
 * suppression-gated totals only; a partner with nothing to report gets no
 * email. Kill-switch: PARTNER_DIGEST_ENABLED must be "true".
 *
 * `?test=<partnerId>` is the admin dry-run: it RENDERS the digest for one
 * partner and returns it as JSON. It sends nothing, and is handled before the
 * bearer check because an admin's browser GET carries no bearer.
 */
export async function GET(req: Request) {
  const testPartnerId = new URL(req.url).searchParams.get("test");

  // --- Admin dry-run ------------------------------------------------------
  // Deliberately ABOVE the cron bearer check, and gated by the session-based
  // admin allowlist instead (lib/admin-auth.ts). It returns before
  // requireServer("CRON_SECRET") is ever evaluated — dev may not set it. It
  // ignores PARTNER_DIGEST_ENABLED on purpose: this is a render, not a send,
  // so it must stay usable while the kill switch is off. It must never reach
  // the send path below.
  if (testPartnerId) {
    const denied = await requireAdminApi();
    if (denied) return denied;

    const admin = createClient(
      PUBLIC.supabaseUrl,
      requireServer("SUPABASE_SERVICE_ROLE_KEY"),
    );
    const { data, error } = await admin
      .from("partners")
      .select(PARTNER_COLUMNS)
      .eq("id", testPartnerId)
      .maybeSingle();
    if (error) {
      return NextResponse.json(
        { error: "partner_query_failed" },
        { status: 500 },
      );
    }
    if (!data) {
      return NextResponse.json({ error: "partner_not_found" }, { status: 404 });
    }

    const partner = data as unknown as PartnerRow;
    const input = await buildDigestInputForPartner(
      admin,
      partner,
      digestPeriod(),
    );
    const { subject, text } = buildPartnerDigest(input);
    return NextResponse.json({
      dryRun: true,
      partnerId: partner.id,
      partnerName: partner.name,
      active: partner.active,
      // Who it WOULD go to — never contacted from this branch.
      recipient: digestRecipient(partner),
      // Mirrors the send loop's actual decision order: the loop only sees
      // active partners, skips the address-less, then checks activity — so
      // wouldSend must gate on all three or the dry-run overstates.
      wouldSend:
        partner.active &&
        digestRecipient(partner) != null &&
        shouldSendDigest(input),
      subject,
      text,
    });
  }

  const auth = req.headers.get("authorization");
  const expected = `Bearer ${requireServer("CRON_SECRET")}`;
  if (auth !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (process.env.PARTNER_DIGEST_ENABLED !== "true") {
    return NextResponse.json({
      disabled: true,
      reason: "PARTNER_DIGEST_ENABLED is not set to 'true'",
    });
  }

  const admin = createClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );

  let partners: PartnerRow[] = [];
  const { data, error } = await admin
    .from("partners")
    .select(PARTNER_COLUMNS)
    .eq("active", true);
  if (error) {
    // The 2026-07-13 portal-identity migration (notification_email,
    // partner_type) is applied in prod, verified live. The legacy-column
    // retry that lived here tolerated a pre-migration schema; audit A9
    // removed it — a select failing against today's schema should fail
    // loudly, not silently degrade to a reduced column set.
    return NextResponse.json({ sent: 0, error: "partners_query_failed" });
  }
  partners = (data as unknown as PartnerRow[] | null) ?? [];

  const period = digestPeriod();

  let sent = 0;
  for (const partner of partners) {
    try {
      // No address at all → skip before doing any work for them.
      const recipient = digestRecipient(partner);
      if (!recipient) continue;

      const input = await buildDigestInputForPartner(admin, partner, period);
      if (!shouldSendDigest(input)) continue;

      const { subject, text } = buildPartnerDigest(input);
      await sendEmail({ to: recipient, subject, text });
      sent++;
    } catch {
      // one partner's failure never blocks the rest
    }
  }

  return NextResponse.json({ sent, partners: partners.length });
}
