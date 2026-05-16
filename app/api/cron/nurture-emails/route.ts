import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import { buildNurtureEmail } from "@/lib/nurture-email";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Daily cron — advances nurture-email recipients through their
 * 2-step sequence after the initial welcome email.
 *
 * Schedule (vercel.json): once daily at 14:00 UTC (matches the
 * anniversary cron's slot, low-traffic for most US time zones).
 *
 * Logic:
 *   step 0 → step 1 when created_at < now - 7 days
 *   step 1 → step 2 when last_nurture_sent_at < now - 14 days
 *   (step 2 is the final email; the row stays at nurture_step=2)
 *
 * Idempotent: only rows under the thresholds get picked up; on
 * successful send the row advances to the next step.
 *
 * Kill-switch: NURTURE_ENABLED env var. Default = off. Flip to
 * "true" in Vercel env when ready to go live.
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${requireServer("CRON_SECRET")}`;
  if (auth !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (process.env.NURTURE_ENABLED !== "true") {
    return NextResponse.json({
      disabled: true,
      reason: "NURTURE_ENABLED is not set to 'true'",
    });
  }

  const admin = createClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();

  // Pull both buckets in parallel.
  const [step1Result, step2Result] = await Promise.all([
    admin
      .from("planning_signups")
      .select("email, source")
      .eq("nurture_step", 0)
      .lt("created_at", sevenDaysAgo)
      .is("unsubscribed_at", null)
      .limit(50),
    admin
      .from("planning_signups")
      .select("email, source")
      .eq("nurture_step", 1)
      .lt("last_nurture_sent_at", fourteenDaysAgo)
      .is("unsubscribed_at", null)
      .limit(50),
  ]);

  if (step1Result.error || step2Result.error) {
    return NextResponse.json(
      {
        error:
          step1Result.error?.message ??
          step2Result.error?.message ??
          "query failed",
      },
      { status: 500 },
    );
  }

  const errors: { email: string; step: number; reason: string }[] = [];
  let sentCount = 0;

  // Step 1 sends.
  for (const row of step1Result.data ?? []) {
    const email = row.email as string;
    const source = (row.source as string) ?? "cheatsheet";
    try {
      const { subject, html, text } = buildNurtureEmail(1, source, email);
      await sendEmail({ to: email, subject, html, text });
      await admin
        .from("planning_signups")
        .update({
          nurture_step: 1,
          last_nurture_sent_at: now.toISOString(),
        })
        .eq("email", email);
      sentCount++;
    } catch (e) {
      errors.push({
        email,
        step: 1,
        reason: e instanceof Error ? e.message : "send failed",
      });
    }
  }

  // Step 2 sends.
  for (const row of step2Result.data ?? []) {
    const email = row.email as string;
    const source = (row.source as string) ?? "cheatsheet";
    try {
      const { subject, html, text } = buildNurtureEmail(2, source, email);
      await sendEmail({ to: email, subject, html, text });
      await admin
        .from("planning_signups")
        .update({
          nurture_step: 2,
          last_nurture_sent_at: now.toISOString(),
        })
        .eq("email", email);
      sentCount++;
    } catch (e) {
      errors.push({
        email,
        step: 2,
        reason: e instanceof Error ? e.message : "send failed",
      });
    }
  }

  return NextResponse.json({
    step1Pending: step1Result.data?.length ?? 0,
    step2Pending: step2Result.data?.length ?? 0,
    sent: sentCount,
    errors,
  });
}
