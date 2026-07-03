import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer, FEATURES } from "@/lib/env";
import { rateLimit } from "@/lib/rate-limit";
import { normalizeReferralCode } from "@/lib/referral-codes";

/**
 * GET /api/partner/resolve?code=HF-XXXXXX → { name }
 *
 * Public by design: the family got the code from the institution, and the
 * only thing it resolves to is the institution's display name for the
 * co-brand banner. Active codes only; 404 otherwise. Enumeration is
 * impractical (31^6 code space behind an IP rate limit).
 */
export async function GET(req: Request) {
  if (!FEATURES.supabase())
    return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = rateLimit(`partner-resolve:${ip}`, { limit: 60, windowMs: 60 * 60_000 });
  if (!rl.ok)
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const code = normalizeReferralCode(
    new URL(req.url).searchParams.get("code"),
  );
  if (!code) return NextResponse.json({ error: "not_found" }, { status: 404 });

  try {
    const svc = createServiceClient(
      PUBLIC.supabaseUrl,
      requireServer("SUPABASE_SERVICE_ROLE_KEY"),
    );
    const { data } = await svc
      .from("partner_codes")
      .select("active, partners ( name, active )")
      .eq("code", code)
      .maybeSingle();
    const partner = (data as unknown as {
      active: boolean;
      partners: { name: string; active: boolean } | null;
    } | null);
    if (!partner?.active || !partner.partners?.active)
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ name: partner.partners.name });
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}
