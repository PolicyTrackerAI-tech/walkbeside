import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer, FEATURES } from "@/lib/env";
import { readLimitedJson } from "@/lib/http-guards";
import { rateLimit } from "@/lib/rate-limit";
import { codeFromBytes, normalizeReferralCode } from "@/lib/referral-codes";
import { requirePartnerApi } from "@/lib/partner/auth";

const Body = z.object({
  /** Token path: the founder-issued report_token. Absent = session path. */
  token: z.string().min(16).max(128).optional(),
  action: z.enum(["create", "revoke"]),
  /** create: the coordinator's own note for the link. */
  label: z.string().max(80).optional(),
  /** revoke: which code. */
  code: z.string().max(20).optional(),
});

/**
 * POST /api/partner/links — coordinator self-serve referral links.
 *
 * The credential is EITHER the partner's founder-issued report_token
 * (possession = the institution; body.token) OR a signed-in partner member
 * session (requirePartnerApi — /portal/links). Both resolve to the same
 * partner_id, so founder approval stays upstream: no partners row, no
 * credential, no codes. Responses expose codes and aggregate claim counts
 * only — never case detail (zero-visibility rule).
 */
export async function POST(req: Request) {
  if (!FEATURES.supabase())
    return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = rateLimit(`partner-links:${ip}`, { limit: 30, windowMs: 60 * 60_000 });
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

  // Resolve the credential. Token path: wrong/inactive token reads as 404,
  // same as the report page — no oracle for valid tokens. Session path:
  // requirePartnerApi (which already refuses paused/inactive orgs).
  let partnerId: string;
  if (parsed.data.token) {
    const { data: partner } = await svc
      .from("partners")
      .select("id, active")
      .eq("report_token", parsed.data.token)
      .maybeSingle();
    if (!partner || !partner.active)
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    partnerId = partner.id;
  } else {
    const gate = await requirePartnerApi();
    if (gate instanceof NextResponse) return gate;
    partnerId = gate.partner.id;
  }

  if (parsed.data.action === "create") {
    // Collision-safe: retry a few times on the (tiny) chance of a dup key.
    for (let attempt = 0; attempt < 5; attempt++) {
      const bytes = new Uint8Array(6);
      crypto.getRandomValues(bytes);
      const code = codeFromBytes(bytes);
      const { error } = await svc.from("partner_codes").insert({
        code,
        partner_id: partnerId,
        label: parsed.data.label?.trim() || null,
      });
      if (!error) return NextResponse.json({ ok: true, code });
      if (!/duplicate|unique/i.test(error.message))
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  // revoke
  const code = normalizeReferralCode(parsed.data.code);
  if (!code) return NextResponse.json({ error: "invalid_code" }, { status: 400 });
  const { error } = await svc
    .from("partner_codes")
    .update({ active: false, revoked_at: new Date().toISOString() })
    .eq("code", code)
    .eq("partner_id", partnerId); // can only revoke your own
  if (error)
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  return NextResponse.json({ ok: true });
}
