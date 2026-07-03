import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";
import { homesForRadius } from "@/lib/negotiation/sample-homes";
import { findHomesFromDirectory } from "@/lib/negotiation/directory";
import {
  ADVOCATE_NAME,
  buildFamilyLabel,
  buildOutreachEmail,
} from "@/lib/negotiation/email-body";
import { isEmailDenylisted } from "@/lib/negotiation/denylist";
import { sendOutreachForNegotiation } from "@/lib/negotiation/send";
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
  // Optional date of the passing (YYYY-MM-DD) — anchors the bereavement
  // check-in cadence. Must be a real, non-future calendar date.
  dateOfDeath: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine(
      (s) => {
        const t = Date.parse(`${s}T00:00:00Z`);
        return Number.isFinite(t) && t <= Date.now();
      },
      { message: "date_of_death_invalid" },
    )
    .optional(),
  radiusMiles: z.number().int().min(5).max(100).default(25),
  authorizationAccepted: z.boolean().default(false),
  // The named sender is the family's ONE authorized contact and consented to
  // their first name appearing in outreach. Defaults false so an old client
  // (or a hand-rolled request) can't skip the designation.
  pointPersonConsent: z.boolean().default(false),
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

  // And the point-person designation: one named family contact who agreed to
  // their first name being shared with the homes. Only that name ever goes
  // out — the sender's email/phone and other family members never do.
  if (!ctx.pointPersonConsent) {
    return NextResponse.json(
      { error: "point_person_consent_required" },
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

  // Anchor the bereavement check-in cadence on the family's own explicit date.
  // Best-effort by design: an intake nicety must never fail the outreach itself
  // (e.g. if the bereavement-cadence migration hasn't been applied yet, the
  // update errors and we simply move on — RLS profiles_self_write covers it).
  if (ctx.dateOfDeath) {
    await supabase
      .from("profiles")
      .update({
        date_of_death: ctx.dateOfDeath,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
  }

  const authorizationId = `WB-${neg.id.slice(0, 8).toUpperCase()}`;
  const familyLabel = buildFamilyLabel(ctx.senderFirstName, ctx.senderLastName);

  const homes = await findHomesFromDirectory(ctx.zip, homesForRadius(ctx.radiusMiles));

  // Build and STORE the outreach as `pending`. Honest Funeral is FREE to
  // families (Operating Plan guardrail #2) — there is no payment step. We then
  // trigger the send below directly. The send self-gates on OUTREACH_LIVE and,
  // until the founder explicitly enables live outreach, records `dry_run` rows
  // and emails no funeral home.
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

  // Trigger the outreach now — free to the family, no payment step. The send
  // self-gates on OUTREACH_LIVE (records `dry_run` rows and emails nothing
  // until the founder explicitly enables live outreach) and is the ONLY code
  // path that ever emails a funeral home.
  const admin = createServiceClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );
  await sendOutreachForNegotiation(admin, neg.id);

  return NextResponse.json({ id: neg.id });
}
