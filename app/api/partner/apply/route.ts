import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer, FEATURES } from "@/lib/env";
import { readLimitedJson } from "@/lib/http-guards";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";

const Body = z.object({
  name: z.string().min(2).max(120),
  partnerType: z.enum(["hospice", "employer"]),
  contactName: z.string().min(1).max(80),
  contactEmail: z.string().email().max(254),
  notes: z.string().max(600).optional(),
});

/**
 * POST /api/partner/apply — self-serve application, PENDING by construction.
 *
 * Inserts a partners row with active=false: inert everywhere (the report
 * page, the links manager, and code resolution all require active=true), so
 * nothing about a new institutional relationship exists until the founder
 * flips it on /admin/partners by hand. Also pings the founder mailbox so
 * applications don't sit unseen.
 */
export async function POST(req: Request) {
  if (!FEATURES.supabase())
    return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = rateLimit(`partner-apply:${ip}`, { limit: 5, windowMs: 60 * 60_000 });
  if (!rl.ok)
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const limited = await readLimitedJson(req, 10);
  if (!limited.ok)
    return NextResponse.json({ error: limited.error }, { status: limited.status });
  const parsed = Body.safeParse(limited.data);
  if (!parsed.success)
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });

  const svc = createServiceClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );

  const { error } = await svc.from("partners").insert({
    name: parsed.data.name.trim(),
    partner_type: parsed.data.partnerType,
    status: "pilot",
    active: false, // PENDING — the founder activates by hand
    contact_name: parsed.data.contactName.trim(),
    contact_email: parsed.data.contactEmail.trim(),
    application_notes: parsed.data.notes?.trim() || null,
  });
  if (error)
    return NextResponse.json({ error: "unavailable" }, { status: 503 });

  // Heads-up to the founder mailbox — best-effort, the row is the record.
  try {
    await sendEmail({
      to: process.env.PARTNER_APPLICATIONS_TO ?? "ryan@honestfuneral.co",
      subject: `Partner application: ${parsed.data.name.trim()}`,
      text: [
        `New ${parsed.data.partnerType} application (pending — nothing is live).`,
        ``,
        `Organization: ${parsed.data.name.trim()}`,
        `Contact: ${parsed.data.contactName.trim()} <${parsed.data.contactEmail.trim()}>`,
        parsed.data.notes ? `Notes: ${parsed.data.notes.trim()}` : ``,
        ``,
        `Review and approve: honestfuneral.co/admin/partners`,
      ]
        .filter(Boolean)
        .join("\n"),
    });
  } catch {
    // the pending row is the source of truth; the email is a courtesy
  }

  return NextResponse.json({ ok: true });
}
