import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";
import { outreachFromAddress, outreachReplyTo } from "@/lib/negotiation/email-body";
import { isEmailDenylisted } from "@/lib/negotiation/denylist";

/**
 * Send the prebuilt outreach emails for a PAID negotiation.
 *
 * GUARANTEE (the whole point of the upfront-pay model): this is the only
 * place outreach emails to funeral homes are sent, and callers invoke it
 * ONLY after Stripe confirms payment. /negotiate/start stores the homes as
 * `pending` rows and never sends — so a family that doesn't pay never causes
 * a single email to go out. Protects funeral-home deliverability/goodwill.
 *
 * Idempotent: only rows still in `pending` are sent, so the webhook and the
 * status-page reconciliation can both call this without double-sending.
 * Honors OUTREACH_LIVE: when not "true", records `dry_run` rows instead of
 * emailing (so the flow is exercisable pre-launch without contacting homes).
 */
export async function sendOutreachForNegotiation(
  admin: SupabaseClient,
  negotiationId: string,
): Promise<{ sent: number; dryRun: number; skipped: number }> {
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
      } catch {
        // Leave as `pending` so a later retry (webhook redelivery or a
        // status-page revisit) can pick it up.
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

  return { sent, dryRun, skipped };
}
