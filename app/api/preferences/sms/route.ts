import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer, FEATURES } from "@/lib/env";
import { readLimitedJson } from "@/lib/http-guards";
import { rateLimit } from "@/lib/rate-limit";
import { normalizePhone } from "@/lib/sms";

const Body = z.object({
  id: z.string().uuid(),
  phone: z.string().max(25),
  optIn: z.boolean(),
});

/**
 * POST /api/preferences/sms — SMS opt-in/out for the bereavement check-ins.
 * The profile id is the credential (the unguessable preferences link mailed
 * to the account's own inbox — the same trust level as the unsubscribe
 * action beside it). Opting out never requires a valid phone.
 */
export async function POST(req: Request) {
  if (!FEATURES.supabase())
    return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = rateLimit(`prefs-sms:${ip}`, { limit: 10, windowMs: 60 * 60_000 });
  if (!rl.ok)
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const limited = await readLimitedJson(req, 5);
  if (!limited.ok)
    return NextResponse.json({ error: limited.error }, { status: limited.status });
  const parsed = Body.safeParse(limited.data);
  if (!parsed.success)
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });

  const phone = normalizePhone(parsed.data.phone);
  if (parsed.data.optIn && !phone)
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });

  const svc = createServiceClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );
  const { error } = await svc
    .from("profiles")
    .update(
      parsed.data.optIn
        ? { bereavement_sms_phone: phone, bereavement_sms_opt_in: true }
        : { bereavement_sms_opt_in: false },
    )
    .eq("id", parsed.data.id);
  if (error)
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  return NextResponse.json({ ok: true });
}
