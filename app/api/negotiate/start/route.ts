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

  const homes = findHomes(ctx.zip, homesForRadius(ctx.radiusMiles));

  for (const home of homes) {
    let body = defaultEmailBody(home.name, ctx.senderFirstName);
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
              }),
            },
          ],
        });
        body = textOf(msg) || body;
      } catch {
        // fall through to default body
      }
    }
    const subject = `Funeral pricing inquiry — ${ctx.senderFirstName}`;
    const sent = await sendEmail({
      to: home.email,
      subject,
      text: body,
      fromName: `${ctx.senderFirstName}${ctx.senderLastName ? " " + ctx.senderLastName : ""}`,
      replyTo: `negotiation+${neg.id}@funerose.com`,
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

function defaultEmailBody(home: string, sender: string): string {
  return `Hello,

We just lost a family member and I'm reaching out to a few funeral homes in the area to get a sense of what to expect. Could you send me your itemized General Price List?

Specifically, I'd like to understand your basic services fee and which line items would apply for a simple service. We're hoping to make decisions in the next few days.

Thank you very much for your time.

${sender}

(Sent on behalf of ${home})`;
}
