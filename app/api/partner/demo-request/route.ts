import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer, FEATURES } from "@/lib/env";
import { readLimitedJson } from "@/lib/http-guards";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";

const Body = z.object({
  name: z.string().min(1).max(80),
  org: z.string().min(2).max(120),
  email: z.string().email().max(254),
  note: z.string().max(600).optional(),
});

/**
 * POST /api/partner/demo-request — a lighter-weight "I want to talk" lead,
 * deliberately separate from /api/partner/apply. This never writes a
 * `partners` row: that table's PENDING state is a structural gate for a real
 * institutional relationship (report tokens, referral codes), and a lead who
 * just wants a call hasn't entered that relationship yet. Keeping the two
 * paths apart means /admin/partners never fills with dead "just curious" rows.
 *
 * Leads DO persist now: a best-effort insert into `partner_leads`
 * (insert-only, RLS deny-all, read-only strip on /admin/partners) so a
 * missed founder email no longer loses the contact. Both the row and the
 * email are best-effort — the request succeeds if either one landed, and
 * only fails when both did.
 */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = rateLimit(`partner-demo-request:${ip}`, { limit: 5, windowMs: 60 * 60_000 });
  if (!rl.ok)
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const limited = await readLimitedJson(req, 10);
  if (!limited.ok)
    return NextResponse.json({ error: limited.error }, { status: limited.status });
  const parsed = Body.safeParse(limited.data);
  if (!parsed.success)
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });

  // (a) Persist the lead. `source` is omitted on purpose — the DB default
  // 'demo-request' applies.
  let persisted = false;
  if (FEATURES.supabase()) {
    try {
      const svc = createServiceClient(
        PUBLIC.supabaseUrl,
        requireServer("SUPABASE_SERVICE_ROLE_KEY"),
      );
      const { error } = await svc.from("partner_leads").insert({
        name: parsed.data.name.trim(),
        org: parsed.data.org.trim(),
        email: parsed.data.email.trim(),
        note: parsed.data.note?.trim() || null,
      });
      persisted = !error;
    } catch {
      // persisted stays false — the email below is the fallback.
    }
  }

  // (b) Notify the founder.
  let emailed = false;
  try {
    await sendEmail({
      to: process.env.PARTNER_APPLICATIONS_TO ?? "ryan@honestfuneral.co",
      subject: `Demo request: ${parsed.data.org.trim()}`,
      text: [
        `New demo request (no partners row created — this is a lead, not an application).`,
        ``,
        `Organization: ${parsed.data.org.trim()}`,
        `Contact: ${parsed.data.name.trim()} <${parsed.data.email.trim()}>`,
        parsed.data.note ? `Note: ${parsed.data.note.trim()}` : ``,
      ]
        .filter(Boolean)
        .join("\n"),
    });
    emailed = true;
  } catch {
    // emailed stays false — the row above is the fallback.
  }

  if (!persisted && !emailed)
    return NextResponse.json({ error: "unavailable" }, { status: 503 });

  return NextResponse.json({ ok: true });
}
