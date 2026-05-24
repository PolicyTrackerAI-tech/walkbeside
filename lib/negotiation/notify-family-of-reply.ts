/**
 * Notify the family by email when a funeral home replies to their outreach.
 *
 * Called from the inbound webhook after a new inbound_fd message is
 * stored. Sends from the family-facing hello@ address (not arrangements@)
 * since this is family-side communication, not FD-side.
 */

import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";

export type NotifyFamilyReason =
  | "ok"
  | "missing_negotiation"
  | "no_family_email"
  | "send_failed";

export interface NotifyFamilyResult {
  sent: boolean;
  reason: NotifyFamilyReason;
  emailId?: string;
}

export async function notifyFamilyOfReply(opts: {
  admin: SupabaseClient;
  negotiationId: string;
  fromHomeName: string;
}): Promise<NotifyFamilyResult> {
  const { admin, negotiationId, fromHomeName } = opts;

  const { data: neg } = await admin
    .from("negotiations")
    .select("user_id")
    .eq("id", negotiationId)
    .single();
  if (!neg) return { sent: false, reason: "missing_negotiation" };

  const { data: userRes } = await admin.auth.admin.getUserById(neg.user_id);
  const familyEmail = userRes?.user?.email;
  if (!familyEmail) return { sent: false, reason: "no_family_email" };

  const statusUrl = `https://honestfuneral.co/negotiate/${negotiationId}/status`;
  const subject = `${fromHomeName} replied — check your status page`;
  const text = `Hi,

${fromHomeName} just replied to the price request we sent on your behalf. There's a new message in your thread.

Read it and respond (we relay your reply, your contact info stays private):
${statusUrl}

Honest Funeral — quiet help after a loss.`;

  try {
    const sent = await sendEmail({
      to: familyEmail,
      subject,
      text,
    });
    return { sent: true, reason: "ok", emailId: sent.id };
  } catch (err) {
    console.error(
      `[notify-family] send failed neg=${negotiationId}: ${err instanceof Error ? err.message : String(err)}`,
    );
    return { sent: false, reason: "send_failed" };
  }
}
