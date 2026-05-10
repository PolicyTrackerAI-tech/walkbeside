import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import {
  emailFor,
  MILESTONE_DAYS,
  type Milestone,
} from "@/lib/anniversary-emails";

export const runtime = "nodejs";
// Vercel cron may take longer than the default Edge function limit.
// Allow up to 60 seconds for the daily batch.
export const maxDuration = 60;

/**
 * Daily cron — sends anniversary check-in emails to paid users.
 *
 * Schedule (in vercel.json): every day at 14:00 UTC (around 9–10am ET).
 *
 * Security: Vercel cron jobs include an Authorization header with
 * CRON_SECRET. Reject requests without it in production.
 *
 * Logic:
 *   for each profile where opt_in = true and paid_at is not null:
 *     for each milestone in [1yr, 6mo, 1mo]:  (descending — send latest first)
 *       if paid_at is older than MILESTONE_DAYS days
 *       AND milestone not in anniversary_emails_sent:
 *         send the email
 *         append milestone to anniversary_emails_sent
 *         break  (one email per user per cron run)
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

  // Look back at the longest milestone window (1yr) to find every paid user
  // who could potentially be due for an email.
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString();

  const { data: candidates, error } = await admin
    .from("profiles")
    .select(
      "id, paid_at, anniversary_emails_sent, anniversary_emails_opt_in",
    )
    .eq("anniversary_emails_opt_in", true)
    .not("paid_at", "is", null)
    .lte("paid_at", new Date(Date.now() - MILESTONE_DAYS["1mo"] * 24 * 3600 * 1000).toISOString())
    .order("paid_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 },
    );
  }

  // Try newest milestone first so users only get the most-recent due email.
  const milestoneOrder: Milestone[] = ["1yr", "6mo", "1mo"];
  const now = Date.now();
  let sentCount = 0;
  const errors: { id: string; reason: string }[] = [];

  for (const profile of candidates ?? []) {
    if (!profile.paid_at) continue;
    const sent: string[] = Array.isArray(profile.anniversary_emails_sent)
      ? (profile.anniversary_emails_sent as string[])
      : [];
    const paidAtMs = new Date(profile.paid_at).getTime();

    let toSend: Milestone | null = null;
    for (const m of milestoneOrder) {
      if (sent.includes(m)) continue;
      const cutoff = MILESTONE_DAYS[m] * 24 * 3600 * 1000;
      if (now - paidAtMs >= cutoff) {
        toSend = m;
        break;
      }
    }
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
      const updatedSent = [...sent, toSend];
      await admin
        .from("profiles")
        .update({ anniversary_emails_sent: updatedSent })
        .eq("id", profile.id);
      sentCount++;
    } catch (e) {
      errors.push({
        id: profile.id as string,
        reason: e instanceof Error ? e.message : "send failed",
      });
    }
  }

  return NextResponse.json({
    candidates: candidates?.length ?? 0,
    sent: sentCount,
    errors,
  });
}
