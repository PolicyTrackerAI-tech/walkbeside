import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";
import { requireAdminApi } from "@/lib/admin-auth";
import { readLimitedJson } from "@/lib/http-guards";
import { sendEmail } from "@/lib/email";

const Body = z
  .object({
    id: z.string().uuid(),
    active: z.boolean().optional(),
    status: z.enum(["pilot", "active", "paused", "archived"]).optional(),
  })
  .refine((b) => b.active !== undefined || b.status !== undefined, {
    message: "must set active or status",
  });

/**
 * PATCH /api/admin/partners — the human approval gate. Session-gated to the
 * founder allowlist, same as the other /admin APIs. Activation stamps
 * approved_at; pausing leaves it (the history of having been approved).
 */
export async function PATCH(req: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

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
  const update: Record<string, unknown> = {};
  if (parsed.data.active !== undefined) {
    update.active = parsed.data.active;
    if (parsed.data.active) update.approved_at = new Date().toISOString();
  }
  if (parsed.data.status !== undefined) update.status = parsed.data.status;

  const { error } = await svc
    .from("partners")
    .update(update)
    .eq("id", parsed.data.id);
  if (error)
    return NextResponse.json({ error: "unavailable" }, { status: 503 });

  // Heads-up to the coordinator that their dashboard is live — best-effort,
  // never blocks the approval itself. The row's `active` flag is the source
  // of truth; this is a courtesy so the coordinator doesn't have to be told
  // their report_token link by hand.
  if (parsed.data.active) {
    try {
      const { data: partner } = await svc
        .from("partners")
        .select("name, contact_email, report_token")
        .eq("id", parsed.data.id)
        .single();
      if (partner?.contact_email) {
        await sendEmail({
          to: partner.contact_email,
          subject: "You're approved — your Honest Funeral dashboard",
          text: [
            `${partner.name} is approved.`,
            ``,
            `Your dashboard: ${PUBLIC.appUrl}/partner/r/${partner.report_token}`,
            ``,
            `This link is private to your organization — from there you can see your report and generate referral links for families.`,
          ].join("\n"),
        });
      }
    } catch {
      // the approval already succeeded; a notification failure is never worth
      // reverting it over
    }
  }

  return NextResponse.json({ ok: true });
}
