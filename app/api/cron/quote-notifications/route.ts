import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import { fmtCents } from "@/lib/stripe";
import { logEvent, captureError, sendAlert } from "@/lib/observability";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Hourly cron — notifies users when a funeral home has responded
 * with a quote.
 *
 * Schedule (vercel.json): every hour at :15 past.
 *
 * Logic:
 *   for each outreach row where:
 *     quote_cents is not null AND notified_at is null
 *   look up the user (negotiations.user_id → auth.users.email)
 *   send notification email
 *   set notified_at = now()
 *
 * Safe to re-run; partial-index + filter prevents double-send.
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${requireServer("CRON_SECRET")}`;
  if (auth !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Kill-switch: when OUTREACH_NOTIFICATIONS_ENABLED is anything other
  // than "true", the cron short-circuits without reading the database
  // or sending email. Lets us deploy the route + register the schedule
  // without risking a real send while the flow is still being tested.
  // Default = disabled. Flip to "true" in Vercel env when ready to go
  // live.
  if (process.env.OUTREACH_NOTIFICATIONS_ENABLED !== "true") {
    return NextResponse.json({
      disabled: true,
      reason: "OUTREACH_NOTIFICATIONS_ENABLED is not set to 'true'",
    });
  }

  const admin = createClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );

  // Find newly-arrived quotes that haven't been emailed yet.
  const { data: pending, error } = await admin
    .from("negotiation_outreach")
    .select(
      "id, negotiation_id, home_name, quote_cents, quote_items, created_at",
    )
    .not("quote_cents", "is", null)
    .is("notified_at", null)
    .order("created_at", { ascending: true })
    .limit(50);

  if (error) {
    await captureError("cron.quote_notifications.query_failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!pending || pending.length === 0) {
    return NextResponse.json({ pending: 0, sent: 0 });
  }

  // Group by negotiation so a single user gets one email when multiple
  // quotes arrived in the same hour.
  const byNeg = new Map<
    string,
    Array<{
      id: string;
      home_name: string;
      quote_cents: number;
    }>
  >();
  for (const row of pending) {
    if (!row.negotiation_id) continue;
    const list = byNeg.get(row.negotiation_id as string) ?? [];
    list.push({
      id: row.id as string,
      home_name: (row.home_name as string) ?? "a funeral home",
      quote_cents: row.quote_cents as number,
    });
    byNeg.set(row.negotiation_id as string, list);
  }

  const errors: { negotiationId: string; reason: string }[] = [];
  let sentCount = 0;

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://honestfuneral.co";

  for (const [negotiationId, quotes] of byNeg.entries()) {
    // Look up the user.
    const { data: neg } = await admin
      .from("negotiations")
      .select("user_id, zip, service_type")
      .eq("id", negotiationId)
      .maybeSingle();
    if (!neg?.user_id) {
      errors.push({ negotiationId, reason: "no user_id" });
      continue;
    }

    const { data: userResult } = await admin.auth.admin.getUserById(
      neg.user_id as string,
    );
    const recipient = userResult?.user?.email;
    if (!recipient) {
      errors.push({ negotiationId, reason: "no recipient email" });
      continue;
    }

    const lines = quotes
      .map(
        (q) => `  • ${q.home_name} — ${fmtCents(q.quote_cents)}`,
      )
      .join("\n");
    const compareUrl = `${baseUrl}/negotiate/${negotiationId}/compare`;
    const resultsUrl = `${baseUrl}/negotiate/${negotiationId}/results`;

    const subject =
      quotes.length === 1
        ? `New quote from ${quotes[0].home_name}`
        : `${quotes.length} new quotes for your funeral arrangements`;

    const text = `Hi,

${
  quotes.length === 1
    ? "A funeral home we contacted on your behalf just sent back their quote:"
    : `${quotes.length} funeral homes we contacted on your behalf just sent back their quotes:`
}

${lines}

You can compare these side-by-side against the regional fair-price range and any other quotes that have come in:

${compareUrl}

Or see the raw responses:

${resultsUrl}

A few reminders before you decide:

— Don't sign anything yet. Take a day to compare.
— Read each quote line by line. Cremation arrangements are where
  bundling tricks usually live.
— You don't owe us anything, ever — Honest Funeral is free to
  families. No upsell here.

Take care,
The Honest Funeral team

—
Reply to this email if anything looks off — a person reads it.`;

    try {
      await sendEmail({ to: recipient, subject, text });
      // Mark each row as notified.
      for (const q of quotes) {
        await admin
          .from("negotiation_outreach")
          .update({ notified_at: new Date().toISOString() })
          .eq("id", q.id);
      }
      sentCount++;
    } catch (e) {
      errors.push({
        negotiationId,
        reason: e instanceof Error ? e.message : "send failed",
      });
    }
  }

  logEvent("cron.quote_notifications", {
    pending: pending.length,
    grouped: byNeg.size,
    sent: sentCount,
    errorCount: errors.length,
  });
  if (errors.length) {
    await sendAlert("warn", "Quote-notification cron had failures", {
      errorCount: errors.length,
      sent: sentCount,
    });
  }

  return NextResponse.json({
    pending: pending.length,
    grouped: byNeg.size,
    sent: sentCount,
    errors,
  });
}
