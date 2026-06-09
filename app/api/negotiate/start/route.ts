import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { homesForRadius } from "@/lib/negotiation/sample-homes";
import { findHomesFromDirectory } from "@/lib/negotiation/directory";
import {
  ADVOCATE_NAME,
  buildFamilyLabel,
  buildOutreachEmail,
} from "@/lib/negotiation/email-body";
import { isEmailDenylisted } from "@/lib/negotiation/denylist";
import { readLimitedJson } from "@/lib/http-guards";

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

  const limited = await readLimitedJson(req, 100);
  if (!limited.ok)
    return NextResponse.json({ error: limited.error }, { status: limited.status });
  const parsed = Body.safeParse(limited.data);
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
      status: "pending_payment",
    })
    .select()
    .single();
  if (negErr || !neg)
    return NextResponse.json({ error: negErr?.message ?? "db" }, { status: 500 });

  const authorizationId = `WB-${neg.id.slice(0, 8).toUpperCase()}`;
  const familyLabel = buildFamilyLabel(ctx.senderFirstName, ctx.senderLastName);

  const homes = await findHomesFromDirectory(ctx.zip, homesForRadius(ctx.radiusMiles));

  // Build and STORE the outreach as `pending` — we do NOT send anything here.
  // Emails go out only after the family pays (lib/negotiation/send.ts, invoked
  // from the Stripe webhook + the status-page reconciliation). This is what
  // guarantees we never email a home for a family that hasn't paid.
  const rows = homes
    // Code-level denylist runs before we even store a home, independent of
    // funeral_homes.active. Survives DB edits.
    .filter((home) => !isEmailDenylisted(home.email))
    .map((home) => {
      const { body } = buildOutreachEmail({
        familyLabel,
        authorizationId,
        advocateName: ADVOCATE_NAME,
        timing: ctx.timing,
        homeEmail: home.email,
      });
      return {
        negotiation_id: neg.id,
        home_name: home.name,
        home_email: home.email,
        initial_email_body: body,
        status: "pending",
      };
    });

  if (rows.length > 0) {
    await supabase.from("negotiation_outreach").insert(rows);
  }

  // Family lands on the teaser/preview to pay before anything is sent.
  return NextResponse.json({ id: neg.id });
}
