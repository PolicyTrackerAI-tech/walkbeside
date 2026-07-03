import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";
import { requireAdminApi } from "@/lib/admin-auth";
import { readLimitedJson } from "@/lib/http-guards";

const Body = z.object({
  id: z.string().uuid(),
  active: z.boolean(),
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
  const update: Record<string, unknown> = { active: parsed.data.active };
  if (parsed.data.active) update.approved_at = new Date().toISOString();

  const { error } = await svc
    .from("partners")
    .update(update)
    .eq("id", parsed.data.id);
  if (error)
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  return NextResponse.json({ ok: true });
}
