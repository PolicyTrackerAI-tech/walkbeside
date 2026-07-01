import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";
import { outreachFromAddress, outreachReplyTo } from "@/lib/negotiation/email-body";
import { isEmailDenylisted } from "@/lib/negotiation/denylist";
import { logEvent, captureError, sendAlert } from "@/lib/observability";

/**
 * Send the prebuilt outreach emails for a negotiation.
 *
 * Honest Funeral is free to families (no payment step of any kind) — this is
 * simply the ONLY place outreach emails to funeral homes are sent, called
 * directly by /negotiate/start once the family authorizes outreach. The real
 * guardrail is OUTREACH_LIVE: when not "true", this records `dry_run` rows
 * instead of emailing, so the flow is exercisable pre-launch without
 * contacting a single home. Protects funeral-home deliverability/goodwill.
 *
 * Idempotent: only rows still in `pending` are sent, so this can safely be
 * called more than once for the same negotiation without double-sending.
 */
export async function sendOutreachForNegotiation(
  admin: SupabaseClient,
  negotiationId: string,
): Promise<{ sent: number; dryRun: number; skipped: number; failed: number }> {
  const { data: rows } = await admin
    .from("negotiation_outreach")
    .select("id, home_email, initial_email_body")
    .eq("negotiation_id", negotiationId)
    .eq("status", "pending");

  const live = process.env.OUTREACH_LIVE === "true";
  const authId = `WB-${negotiationId.slice(0, 8).toUpperCase()}`;
  const subject = `Request for your itemized General Price List — ref ${authId}`;

  let sent = 0;
  let dryRun = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows ?? []) {
    // Belt-and-suspenders: denylist re-check at send time, independent of
    // whatever was filtered at request time.
    if (!row.home_email || isEmailDenylisted(row.home_email)) {
      await admin
        .from("negotiation_outreach")
        .update({ status: "declined" })
        .eq("id", row.id);
      skipped++;
      continue;
    }

    if (live) {
      try {
        const res = await sendEmail({
          to: row.home_email,
          subject,
          text: row.initial_email_body ?? "",
          from: outreachFromAddress(),
          replyTo: outreachReplyTo(negotiationId),
        });
        await admin
          .from("negotiation_outreach")
          .update({ status: "sent", initial_email_id: res.id })
          .eq("id", row.id);
        sent++;
      } catch (err) {
        // Leave as `pending` so a later retry (webhook redelivery or a
        // status-page revisit) can pick it up. Log now; one aggregate alert
        // fires after the loop so a burst of failures doesn't page N times.
        failed++;
        await captureError("outreach.email.send_failed", err, {
          negotiationId,
          outreachId: row.id,
        }, { alert: false });
      }
    } else {
      await admin
        .from("negotiation_outreach")
        .update({ status: "dry_run" })
        .eq("id", row.id);
      dryRun++;
    }
  }

  // Advance the negotiation out of pending_payment once sending has run.
  await admin
    .from("negotiations")
    .update({ status: "contacting" })
    .eq("id", negotiationId)
    .eq("status", "pending_payment");

  logEvent("outreach.run", {
    negotiationId,
    live,
    sent,
    dryRun,
    skipped,
    failed,
  });

  // A PAID family whose outreach didn't go out is the worst failure mode —
  // page once with the count so it can be retried/refunded.
  if (failed > 0) {
    await sendAlert("error", "Outreach failed to send for a paid negotiation", {
      negotiationId,
      failed,
      sent,
      skipped,
    });
  }

  return { sent, dryRun, skipped, failed };
}
