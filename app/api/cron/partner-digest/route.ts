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

  let partners: {
    id: string;
    name: string;
    contact_email: string | null;
    report_token: string;
  }[] = [];
  try {
    const { data } = await admin
      .from("partners")
      .select("id, name, contact_email, report_token")
      .eq("active", true)
      .not("contact_email", "is", null);
    partners = (data as typeof partners | null) ?? [];
  } catch {
    return NextResponse.json({ sent: 0, reason: "partners unavailable" });
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
        periodLabel,
        familiesStartedInPeriod: started ?? 0,
        cohort,
        reportUrl: `https://honestfuneral.co/partner/r/${partner.report_token}`,
      };
      if (!shouldSendDigest(input)) continue;

      const { subject, text } = buildPartnerDigest(input);
      await sendEmail({ to: partner.contact_email as string, subject, text });
      sent++;
    } catch {
      // one partner's failure never blocks the rest
    }
  }

  return NextResponse.json({ sent, partners: partners.length });
}
