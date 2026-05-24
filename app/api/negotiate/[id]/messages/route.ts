import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import {
  ADVOCATE_NAME,
  authorizationIdFor,
  familyLabelFromOutreachBody,
  funeralHomeOptOutUrl,
  outreachFromAddress,
  outreachReplyTo,
} from "@/lib/negotiation/email-body";
import { isEmailDenylisted } from "@/lib/negotiation/denylist";

/**
 * Family sends a message to a funeral home, relayed by Honest Funeral so
 * the family's contact info stays private and replies route through our
 * inbound capture (Postmark → /api/inbound/email).
 *
 * Gated by OUTREACH_LIVE — same kill switch as initial outreach + selection.
 */

const Body = z.object({
  outreachId: z.string().uuid(),
  text: z.string().min(1).max(4000),
});

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: negotiationId } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  const { outreachId, text } = parsed.data;

  // Verify ownership of negotiation
  const { data: neg } = await supabase
    .from("negotiations")
    .select("id, user_id")
    .eq("id", negotiationId)
    .eq("user_id", user.id)
    .single();
  if (!neg) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // Verify outreach belongs to this negotiation + has an email
  const { data: outreach } = await supabase
    .from("negotiation_outreach")
    .select("id, home_name, home_email, initial_email_body")
    .eq("id", outreachId)
    .eq("negotiation_id", negotiationId)
    .single();
  if (!outreach || !outreach.home_email) {
    return NextResponse.json({ error: "outreach_unreachable" }, { status: 400 });
  }
  if (isEmailDenylisted(outreach.home_email)) {
    return NextResponse.json({ error: "outreach_blocked" }, { status: 400 });
  }

  const familyLabel =
    (outreach.initial_email_body &&
      familyLabelFromOutreachBody(outreach.initial_email_body)) ||
    "the family";
  const authorizationId = authorizationIdFor(negotiationId);
  const subject = `Re: Price list request — ${familyLabel} (ref ${authorizationId})`;
  const body = `Hi,

A pre-meeting note from ${familyLabel}:

${text}

Reply to this thread and we'll relay back to them.

Thanks,
${ADVOCATE_NAME}
Honest Funeral · honestfuneral.co
Authorization reference: ${authorizationId}

---
Honest Funeral is a consumer advocacy service, not a licensed funeral establishment. The family attends the arrangement meeting in person and signs all paperwork directly with you. More about us: https://honestfuneral.co/for-funeral-homes

To opt out of future outreach from us, one-click: ${funeralHomeOptOutUrl(outreach.home_email)}
${process.env.OUTREACH_POSTAL_ADDRESS ?? "Honest Funeral, PO Box pending — Salt Lake City, UT"}`;

  // Insert the message row first — RLS allows the family to insert
  // outbound_to_fd on their own negotiation. Capture id for the send call.
  const { data: inserted, error: insertErr } = await supabase
    .from("negotiation_messages")
    .insert({
      negotiation_id: negotiationId,
      outreach_id: outreachId,
      direction: "outbound_to_fd",
      from_address: outreachFromAddress(),
      to_address: outreach.home_email,
      subject,
      body_text: body,
    })
    .select("id")
    .single();
  if (insertErr || !inserted) {
    return NextResponse.json(
      { error: insertErr?.message ?? "insert_failed" },
      { status: 500 },
    );
  }

  // Gated send — if OUTREACH_LIVE isn't true, message is stored but not sent.
  // Family sees it in the thread; they're not blocked from working on the case.
  if (process.env.OUTREACH_LIVE !== "true") {
    return NextResponse.json({
      ok: true,
      sent: false,
      reason: "outreach_paused",
    });
  }

  const sent = await sendEmail({
    to: outreach.home_email,
    subject,
    text: body,
    from: outreachFromAddress(),
    replyTo: outreachReplyTo(negotiationId),
  });

  // Stamp delivered_at on the row so the UI can render a checkmark
  await supabase
    .from("negotiation_messages")
    .update({ delivered_at: new Date().toISOString() })
    .eq("id", inserted.id);

  return NextResponse.json({ ok: true, sent: true, emailId: sent.id });
}
