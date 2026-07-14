import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import {
  aggregateCohort,
  rowToCohortRecord,
  type OutcomeRow,
} from "@/lib/partner-report";
import {
  buildPartnerDigest,
  shouldSendDigest,
} from "@/lib/partner-digest";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Monthly cron (vercel.json: 1st of the month, 15:00 UTC) — the aggregate
 * partner activity digest. Same discipline as the live report: counts and
 * suppression-gated totals only; a partner with nothing to report gets no
 * email. Kill-switch: PARTNER_DIGEST_ENABLED must be "true".
 */
export async function GET(req: Request) {
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

  type PartnerRow = {
    id: string;
    name: string;
    contact_email: string | null;
    notification_email: string | null;
    partner_type: string | null;
    report_token: string;
  };
  let partners: PartnerRow[] = [];
  const { data, error } = await admin
    .from("partners")
    .select(
      "id, name, contact_email, notification_email, partner_type, report_token",
    )
    .eq("active", true);
  if (error) {
    // notification_email/partner_type arrive in a Day-1 migration; against a
    // database that hasn't applied it the select above errors, so retry with
    // the legacy column set rather than silently reporting sent: 0.
    const legacy = await admin
      .from("partners")
      .select("id, name, contact_email, report_token")
      .eq("active", true)
      .not("contact_email", "is", null);
    if (legacy.error) {
      return NextResponse.json({ sent: 0, error: "partners_query_failed" });
    }
    partners = (
      (legacy.data as Omit<
        PartnerRow,
        "notification_email" | "partner_type"
      >[] | null) ?? []
    ).map((p) => ({ ...p, notification_email: null, partner_type: "hospice" }));
  } else {
    partners = (data as PartnerRow[] | null) ?? [];
  }

  const periodStart = new Date();
  periodStart.setUTCMonth(periodStart.getUTCMonth() - 1);
  const periodLabel = periodStart.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  let sent = 0;
  for (const partner of partners) {
    try {
      // Owners can set a dedicated digest recipient in /portal/settings;
      // fall back to the application contact. No address at all → skip.
      const recipient = partner.notification_email ?? partner.contact_email;
      if (!recipient) continue;

      const { count: started } = await admin
        .from("negotiations")
        .select("id", { count: "exact", head: true })
        .eq("partner_id", partner.id)
        .gte("created_at", periodStart.toISOString());

      const { data: negs } = await admin
        .from("negotiations")
        .select("savings_vs_listed_cents, satisfaction_score, created_at, outcome_recorded_at")
        .eq("partner_id", partner.id)
        .not("outcome_recorded_at", "is", null);
      const cohort = aggregateCohort(
        ((negs as OutcomeRow[] | null) ?? []).map((r) => rowToCohortRecord(r)),
      );

      const input = {
        partnerName: partner.name,
        partnerType: (partner.partner_type === "employer"
          ? "employer"
          : "hospice") as "hospice" | "employer",
        periodLabel,
        familiesStartedInPeriod: started ?? 0,
        cohort,
        reportUrl: `https://honestfuneral.co/partner/r/${partner.report_token}`,
      };
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
