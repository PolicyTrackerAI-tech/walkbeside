import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { homesForRadius } from "@/lib/negotiation/sample-homes";
import { findHomesFromDirectory } from "@/lib/negotiation/directory";
import {
  ADVOCATE_NAME,
  buildFamilyLabel,
  buildOutreachEmail,
  outreachFromAddress,
  outreachReplyTo,
} from "@/lib/negotiation/email-body";

const Body = z.object({
  zip: z.string().min(3).max(10),
  serviceType: z.enum([
    "direct-cremation",
    "cremation-with-service",
    "traditional-burial",
    "graveside-burial",
    "green-burial",
    "aquamation",
    "body-donation",
    "memorial-no-body",
  ]),
  targetHomeName: z.string().max(120).optional(),
  targetEstimateCents: z.number().int().nonnegative().optional(),
  senderFirstName: z.string().min(1).max(60),
  senderLastName: z.string().max(60).optional(),
  timing: z.string().max(120).default("within the next week"),
  notes: z.string().max(800).optional(),
  extras: z.string().max(400).optional(),
  radiusMiles: z.number().int().min(5).max(100).default(25),
  authorizationAccepted: z.boolean().default(false),
});

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

  const ctx = parsed.data;

  // Require the family's written authorization — advocacy is gated behind consent.
  if (!ctx.authorizationAccepted) {
    return NextResponse.json(
      { error: "authorization_required" },
      { status: 400 },
    );
  }

  // Create the negotiation row
  const { data: neg, error: negErr } = await supabase
    .from("negotiations")
    .insert({
      user_id: user.id,
      zip: ctx.zip,
      service_type: ctx.serviceType,
      target_home_name: ctx.targetHomeName,
      target_home_estimate_cents: ctx.targetEstimateCents,
      status: "contacting",
    })
    .select()
    .single();
  if (negErr || !neg)
    return NextResponse.json({ error: negErr?.message ?? "db" }, { status: 500 });

  const authorizationId = `WB-${neg.id.slice(0, 8).toUpperCase()}`;
  const familyLabel = buildFamilyLabel(ctx.senderFirstName, ctx.senderLastName);

  const homes = await findHomesFromDirectory(ctx.zip, homesForRadius(ctx.radiusMiles));

  for (const home of homes) {
    const { subject, body } = buildOutreachEmail({
      familyLabel,
      authorizationId,
      advocateName: ADVOCATE_NAME,
      timing: ctx.timing,
    });

    // Kill-switch: when OUTREACH_LIVE is not "true", we record what
    // WOULD have been sent but we don't actually email the funeral home.
    // Flip OUTREACH_LIVE=true in Vercel env to start real sends.
    const outreachLive = process.env.OUTREACH_LIVE === "true";

    let sentId: string | null = null;
    if (outreachLive) {
      const sent = await sendEmail({
        to: home.email,
        subject,
        text: body,
        from: outreachFromAddress(),
        replyTo: outreachReplyTo(neg.id),
      });
      sentId = sent.id;
    }

    await supabase.from("negotiation_outreach").insert({
      negotiation_id: neg.id,
      home_name: home.name,
      home_email: home.email,
      initial_email_id: sentId,
      initial_email_body: body,
      status: outreachLive ? "sent" : "dry_run",
    });
  }

  return NextResponse.json({ id: neg.id });
}
