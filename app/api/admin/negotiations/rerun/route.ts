import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";
import { requireAdminApi } from "@/lib/admin-auth";
import { readLimitedJson } from "@/lib/http-guards";
import { sendOutreachForNegotiation } from "@/lib/negotiation/send";

const Body = z.object({ negotiationId: z.string().uuid() });

/**
 * Founder re-run of a prepared-only case (audit A2-09 → A5). Cases created
 * while OUTREACH_LIVE was off record terminal `dry_run` outreach rows, and
 * `sendOutreachForNegotiation` only ever processes `pending` — so a family
 * who completed the flow before go-live stays prepared-only forever without
 * this. Resets that case's dry_run rows to pending and re-invokes THE one
 * gated send path.
 *
 * Kill-switch integrity: this route sends nothing itself. With OUTREACH_LIVE
 * off the re-run simply re-records dry_run (harmless, idempotent); only the
 * env flip — a founder deploy action — can make real mail leave. Directory
 * vetting and the denylist re-check all still apply inside the send path.
 */
export async function POST(req: Request) {
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

  const { data: reset, error } = await svc
    .from("negotiation_outreach")
    .update({ status: "pending" })
    .eq("negotiation_id", parsed.data.negotiationId)
    .eq("status", "dry_run")
    .select("id");
  if (error)
    return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const resetCount = (reset ?? []).length;
  if (resetCount === 0)
    return NextResponse.json({ ok: true, reset: 0, note: "no dry_run rows" });

  const result = await sendOutreachForNegotiation(
    svc,
    parsed.data.negotiationId,
  );
  return NextResponse.json({ ok: true, reset: resetCount, result });
}
