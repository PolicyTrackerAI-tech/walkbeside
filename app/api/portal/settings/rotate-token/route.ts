import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer, FEATURES } from "@/lib/env";
import { requirePartnerApi } from "@/lib/partner/auth";
import { rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/portal/settings/rotate-token — owner-only quick-link rotation.
 * Generates a fresh 48-char lowercase-hex report_token (same shape as the
 * SQL default encode(gen_random_bytes(24),'hex')) and writes it scoped to
 * the caller's own org. Every previously shared /partner/r/<token> URL
 * stops resolving immediately; sign-in seats are unaffected. The new token
 * is returned to the caller — an authenticated owner receiving their own
 * credential. No body is read; the session is the entire input.
 */
export async function POST(req: Request) {
  if (!FEATURES.supabase())
    return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = rateLimit(`portal-rotate:${ip}`, {
    limit: 5,
    windowMs: 60 * 60_000,
  });
  if (!rl.ok)
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const gate = await requirePartnerApi("owner");
  if (gate instanceof NextResponse) return gate;
  const { partner } = gate;

  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const token = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
    "",
  );

  const svc = createServiceClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );
  const { error } = await svc
    .from("partners")
    .update({ report_token: token })
    .eq("id", partner.id);
  if (error)
    return NextResponse.json({ error: "unavailable" }, { status: 503 });

  return NextResponse.json({ ok: true, token });
}
