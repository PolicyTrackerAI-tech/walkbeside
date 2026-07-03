import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import { sendSms } from "@/lib/sms";
import {
  dueMilestone,
  emailFor,
  smsFor,
  markSent,
  MILESTONE_DAYS,
} from "@/lib/anniversary-emails";
import { logEvent, captureError, sendAlert } from "@/lib/observability";

export const runtime = "nodejs";
// Vercel cron may take longer than the default Edge function limit.
// Allow up to 60 seconds for the daily batch.
export const maxDuration = 60;

/**
 * Daily cron — sends bereavement check-in emails, anchored on the DATE OF
 * DEATH the family explicitly gave us at intake (profiles.date_of_death).
 * Families who never provided a date get no cadence — deliberately no proxy
 * anchor (signup/negotiation date), because a mis-anchored condolence email
 * (e.g. to a plan-ahead user whose person has not died) is the worst possible
 * failure mode.
 *
 * Previously anchored on profiles.paid_at, which nothing writes since the
 * family charge was decommissioned — so this cron matched zero users and the
 * bereavement touchpoint engine silently sent nothing. Requires the
 * 2026-07-01-bereavement-cadence migration (adds date_of_death).
 *
 * Schedule (in vercel.json): every day at 14:00 UTC (around 9–10am ET).
 *
 * Security: Vercel cron jobs include an Authorization header with
 * CRON_SECRET. Reject requests without it in production.
 *
 * Logic, per opted-in profile with a date_of_death ≥30 days ago:
 *   dueMilestone() picks the LATEST due, unsent milestone (1mo/3mo/6mo/1yr/
 *   13mo) — one email per user per run — and markSent() records it PLUS every
 *   earlier milestone, so a late joiner gets only the latest applicable
 *   check-in and a stale early one can never fire out of order afterward.
 */
export async function GET(req: Request) {
  // Vercel sets this header on cron invocations.
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${requireServer("CRON_SECRET")}`;
  if (auth !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Kill-switch: when ANNIVERSARY_EMAILS_ENABLED is anything other than
  // "true", the cron short-circuits — no DB read, no email sent.
  // Default = disabled. Flip to "true" in Vercel env when ready.
  if (process.env.ANNIVERSARY_EMAILS_ENABLED !== "true") {
    return NextResponse.json({
      disabled: true,
      reason: "ANNIVERSARY_EMAILS_ENABLED is not set to 'true'",
    });
  }

  const admin = createClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );

  // Candidates: opted in, gave us a date of death, and that date is at least
  // the shortest milestone (30 days) in the past. date_of_death is a DATE
  // column, so compare against a YYYY-MM-DD string.
  const earliestCutoff = new Date(
    Date.now() - MILESTONE_DAYS["1mo"] * 24 * 3600 * 1000,
  )
    .toISOString()
    .slice(0, 10);

  const { data: candidates, error } = await admin
    .from("profiles")
    .select("id, date_of_death, anniversary_emails_sent, anniversary_emails_opt_in")
    .eq("anniversary_emails_opt_in", true)
    .not("date_of_death", "is", null)
    .lte("date_of_death", earliestCutoff)
    .order("date_of_death", { ascending: true });

  if (error) {
    // Most likely cause pre-launch: the bereavement-cadence migration hasn't
    // been applied yet (date_of_death column missing). Alert once, fail clean.
    await captureError("cron.anniversary.query_failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // SMS channel (opt-in; separate migration): fetched best-effort so the
  // email cadence never depends on the SMS columns existing.
  const smsById = new Map<
    string,
    { phone: string; smsSent: string[] }
  >();
  if (process.env.BEREAVEMENT_SMS_ENABLED === "true" && (candidates ?? []).length) {
    const { data: smsRows } = await admin
      .from("profiles")
      .select("id, bereavement_sms_phone, bereavement_sms_opt_in, anniversary_sms_sent")
      .in("id", (candidates ?? []).map((c) => c.id as string))
      .eq("bereavement_sms_opt_in", true)
      .not("bereavement_sms_phone", "is", null);
    for (const r of (smsRows ?? []) as {
      id: string;
      bereavement_sms_phone: string;
      anniversary_sms_sent: unknown;
    }[]) {
      smsById.set(r.id, {
        phone: r.bereavement_sms_phone,
        smsSent: Array.isArray(r.anniversary_sms_sent)
          ? (r.anniversary_sms_sent as string[])
          : [],
      });
    }
  }

  const now = Date.now();
  let sentCount = 0;
  let smsCount = 0;
  const errors: { id: string; reason: string }[] = [];

  for (const profile of candidates ?? []) {
    if (!profile.date_of_death) continue;
    const sent: string[] = Array.isArray(profile.anniversary_emails_sent)
      ? (profile.anniversary_emails_sent as string[])
      : [];
    // A bare YYYY-MM-DD parses as midnight UTC — fine for day-granularity
    // milestones.
    const anchorMs = new Date(profile.date_of_death).getTime();
    if (!Number.isFinite(anchorMs)) continue;

    const toSend = dueMilestone(anchorMs, sent, now);
    if (!toSend) continue;

    // Look up the user's email (Supabase auth.users) using admin RPC.
    // Avoid loading every user's email up front for privacy.
    const { data: userResult } = await admin.auth.admin.getUserById(
      profile.id as string,
    );
    const recipient = userResult?.user?.email;
    if (!recipient) {
      errors.push({ id: profile.id as string, reason: "no email" });
      continue;
    }

    const unsubscribeUrl = `${
      process.env.NEXT_PUBLIC_APP_URL ?? "https://honestfuneral.co"
    }/preferences/${profile.id}`;
    const content = emailFor(toSend, unsubscribeUrl);

    try {
      await sendEmail({
        to: recipient,
        subject: content.subject,
        text: content.text,
      });
      await admin
        .from("profiles")
        .update({ anniversary_emails_sent: markSent(sent, toSend) })
        .eq("id", profile.id);
      sentCount++;

      // Same milestone via SMS, when the family opted in. Its own try —
      // an SMS failure never marks the email un-sent or vice versa.
      const sms = smsById.get(profile.id as string);
      if (sms && !sms.smsSent.includes(toSend)) {
        try {
          await sendSms({ to: sms.phone, body: smsFor(toSend, unsubscribeUrl) });
          await admin
            .from("profiles")
            .update({ anniversary_sms_sent: markSent(sms.smsSent, toSend) })
            .eq("id", profile.id);
          smsCount++;
        } catch (e) {
          errors.push({
            id: profile.id as string,
            reason: `sms: ${e instanceof Error ? e.message : "send failed"}`,
          });
        }
      }
    } catch (e) {
      errors.push({
        id: profile.id as string,
        reason: e instanceof Error ? e.message : "send failed",
      });
    }
  }

  logEvent("cron.anniversary", {
    candidates: candidates?.length ?? 0,
    sent: sentCount,
    sms: smsCount,
    errorCount: errors.length,
  });
  if (errors.length) {
    await sendAlert("warn", "Anniversary cron had failures", {
      errorCount: errors.length,
      sent: sentCount,
    });
  }

  return NextResponse.json({
    candidates: candidates?.length ?? 0,
    sent: sentCount,
    errors,
  });
}
