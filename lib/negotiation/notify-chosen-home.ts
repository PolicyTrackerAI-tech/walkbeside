/**
 * Sends the "your firm has been selected" email to the funeral home
 * a family picked. Gated by OUTREACH_LIVE (same kill switch as the
 * initial outreach) so a paused outreach state pauses follow-ups too.
 *
 * Callers (Stripe webhook + checkout route) are responsible for ensuring
 * this only fires once per selection — typically via a conditional
 * `neq("status", "closed")` update before invoking.
 */

import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";
import { SERVICE_LABELS, type ServiceType } from "@/lib/pricing-data";
import {
  ADVOCATE_NAME,
  authorizationIdFor,
  buildSelectionEmail,
  familyLabelFromOutreachBody,
  outreachFromAddress,
  outreachReplyTo,
} from "./email-body";
import { isEmailDenylisted } from "./denylist";

export type NotifyReason =
  | "ok"
  | "outreach_paused"
  | "no_fd_email"
  | "no_quote"
  | "missing_negotiation"
  | "missing_outreach"
  | "denylisted";

export interface NotifyResult {
  sent: boolean;
  reason: NotifyReason;
  emailId?: string;
}

export async function notifyChosenHome(opts: {
  admin: SupabaseClient;
  negotiationId: string;
  outreachId: string;
}): Promise<NotifyResult> {
  const { admin, negotiationId, outreachId } = opts;

  const { data: neg } = await admin
    .from("negotiations")
    .select("id, user_id, service_type")
    .eq("id", negotiationId)
    .single();
  if (!neg) return { sent: false, reason: "missing_negotiation" };

  const { data: outreach } = await admin
    .from("negotiation_outreach")
    .select("id, home_name, home_email, quote_cents")
    .eq("id", outreachId)
    .eq("negotiation_id", negotiationId)
    .single();
  if (!outreach) return { sent: false, reason: "missing_outreach" };
  if (!outreach.home_email) return { sent: false, reason: "no_fd_email" };
  if (outreach.quote_cents == null)
    return { sent: false, reason: "no_quote" };
  if (isEmailDenylisted(outreach.home_email)) {
    return { sent: false, reason: "denylisted" };
  }

  const { data: firstOutreach } = await admin
    .from("negotiation_outreach")
    .select("initial_email_body")
    .eq("negotiation_id", negotiationId)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();
  const familyLabel =
    (firstOutreach?.initial_email_body &&
      familyLabelFromOutreachBody(firstOutreach.initial_email_body)) ||
    "the family";

  const serviceLabel =
    SERVICE_LABELS[neg.service_type as ServiceType] ?? neg.service_type;

  const { subject, body } = buildSelectionEmail({
    familyLabel,
    homeName: outreach.home_name,
    homeEmail: outreach.home_email,
    serviceLabel,
    quoteCents: outreach.quote_cents,
    authorizationId: authorizationIdFor(negotiationId),
    advocateName: ADVOCATE_NAME,
  });

  if (process.env.OUTREACH_LIVE !== "true") {
    return { sent: false, reason: "outreach_paused" };
  }

  const sent = await sendEmail({
    to: outreach.home_email,
    subject,
    text: body,
    from: outreachFromAddress(),
    replyTo: outreachReplyTo(negotiationId),
  });

  return { sent: true, reason: "ok", emailId: sent.id };
}
