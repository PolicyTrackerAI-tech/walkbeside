import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer, FEATURES } from "@/lib/env";
import { requirePartnerApi } from "@/lib/partner/auth";
import { readLimitedJson } from "@/lib/http-guards";
import { rateLimit } from "@/lib/rate-limit";

const Body = z.object({
  contactName: z
    .union([z.string().min(1).max(80), z.literal("")])
    .optional(),
  notificationEmail: z
    .union([z.string().email().max(254), z.literal("")])
    .optional(),
  brandAccent: z
    .union([z.string().regex(/^#[0-9a-fA-F]{6}$/), z.literal("")])
    .optional(),
});

/**
 * POST /api/portal/settings — owner-only org settings. Only the fields
 * present in the body are written; empty strings persist as null (clear
 * the override). The update is scoped to the caller's own partner_id from
 * the session gate — no id is accepted from the client.
 */
export async function POST(req: Request) {
  if (!FEATURES.supabase())
    return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = rateLimit(`portal-settings:${ip}`, {
    limit: 20,
    windowMs: 60 * 60_000,
  });
  if (!rl.ok)
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const gate = await requirePartnerApi("owner");
  if (gate instanceof NextResponse) return gate;
  const { partner } = gate;

  const limited = await readLimitedJson(req, 10);
  if (!limited.ok)
    return NextResponse.json(
      { error: limited.error },
      { status: limited.status },
    );
  const parsed = Body.safeParse(limited.data);
  if (!parsed.success)
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });

  const update: Record<string, string | null> = {};
  if (parsed.data.contactName !== undefined) {
    const trimmed = parsed.data.contactName.trim();
    update.contact_name = trimmed === "" ? null : trimmed;
  }
  if (parsed.data.notificationEmail !== undefined) {
    update.notification_email =
      parsed.data.notificationEmail === ""
        ? null
        : parsed.data.notificationEmail.trim().toLowerCase();
  }
  if (parsed.data.brandAccent !== undefined) {
    update.brand_accent =
      parsed.data.brandAccent === ""
        ? null
        : parsed.data.brandAccent.toLowerCase();
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ ok: true });
  }

  const svc = createServiceClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );
  const { error } = await svc
    .from("partners")
    .update(update)
    .eq("id", partner.id);
  if (error)
    return NextResponse.json({ error: "unavailable" }, { status: 503 });

  return NextResponse.json({ ok: true });
}
