import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { client as anthropic, MODEL, textOf, claudeAvailable } from "@/lib/claude";
import { sendEmail } from "@/lib/email";
import {
  initialEmailSystem,
  initialEmailUser,
} from "@/lib/negotiation/prompts";
import { findHomes, homesForRadius } from "@/lib/negotiation/sample-homes";
import type { ServiceType } from "@/lib/pricing-data";

const Body = z.object({
  zip: z.string().min(3).max(10),
  serviceType: z.enum([
    "direct-cremation",
    "cremation-with-service",
    "traditional-burial",
    "graveside-burial",
  ]),
  targetHomeName: z.string().max(120).optional(),
  targetEstimateCents: z.number().int().nonnegative().optional(),
  senderFirstName: z.string().min(1).max(60),
  senderLastName: z.string().max(60).optional(),
  timing: z.string().max(120).default("within the next week"),
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
  const advocateName = "The Funerose Advocate Team";
  const familyLabel = ctx.senderLastName
    ? `the ${ctx.senderLastName} family`
    : `${ctx.senderFirstName}'s family`;

  const homes = findHomes(ctx.zip, homesForRadius(ctx.radiusMiles));

  for (const home of homes) {
    let body = defaultEmailBody(
      home.name,
      familyLabel,
      authorizationId,
      advocateName,
      ctx.timing,
    );
    if (claudeAvailable()) {
      try {
        const msg = await anthropic().messages.create({
          model: MODEL,
          max_tokens: 700,
          system: initialEmailSystem(),
          messages: [
            {
              role: "user",
              content: initialEmailUser(home.name, {
                zip: ctx.zip,
                serviceType: ctx.serviceType as ServiceType,
                senderFirstName: ctx.senderFirstName,
                senderLastName: ctx.senderLastName,
                timing: ctx.timing,
                extras: ctx.extras,
                advocateName,
                authorizationId,
              }),
            },
          ],
        });
        body = textOf(msg) || body;
      } catch {
        // fall through to default body
      }
    }
    const subject = `GPL request on behalf of ${familyLabel} — ref ${authorizationId}`;
    const sent = await sendEmail({
      to: home.email,
      subject,
      text: body,
      fromName: "Funerose Advocacy",
      replyTo: `advocate+${neg.id}@funerose.com`,
    });

    await supabase.from("negotiation_outreach").insert({
      negotiation_id: neg.id,
      home_name: home.name,
      home_email: home.email,
      initial_email_id: sent.id,
      initial_email_body: body,
      status: "sent",
    });
  }

  return NextResponse.json({ id: neg.id });
}

function defaultEmailBody(
  home: string,
  familyLabel: string,
  authorizationId: string,
  advocateName: string,
  timing: string,
): string {
  return `Hello,

I'm writing on behalf of ${familyLabel}, who has engaged Funerose (funerose.com) as a consumer advocate to gather General Price Lists and service quotes from funeral homes in your area before choosing where to arrange services.

Under the FTC Funeral Rule, we are requesting your current itemized General Price List. The family is evaluating arrangements within ${timing} and would appreciate your reply with the GPL and any service-specific quote you can share.

The family will review the responses and contact your firm directly if they select you. You will not need to negotiate through us; we just collect the price information on their behalf.

Thank you for your time.

${advocateName}
Funerose — Consumer Advocacy for Families
Authorization reference: ${authorizationId}
${home}`;
}
