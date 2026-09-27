import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";
import { logEvent, captureError } from "@/lib/observability";

export const runtime = "nodejs";

/**
 * Daily purge of expired anonymous family-sharing links (audit A8-05).
 *
 * share_links (7-day "save for my daughter" snapshots) and household_links
 * (30-day rolling) aren't tied to an account, so an account deletion can't
 * cascade to them, and RLS only hides an expired row, it doesn't remove it.
 * Before this cron an expired snapshot of a family's plan sat in the
 * database indefinitely. /privacy says these links expire on their own;
 * this makes that mean deleted.
 *
 * Deletes rows whose expires_at has passed; nothing else. No email, no
 * family contact. Schedule in vercel.json. Security: Vercel cron sends
 * Authorization: Bearer CRON_SECRET.
 */
const PURGED_TABLES = ["share_links", "household_links"] as const;

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${requireServer("CRON_SECRET")}`;
  if (auth !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );
  const now = new Date().toISOString();
  const purged: Record<string, number | null> = {};

  // One table failing (e.g. household_links before its migration is
  // applied) must not stop the other from being purged.
  for (const table of PURGED_TABLES) {
    const { data, error } = await admin
      .from(table)
      .delete()
      .lt("expires_at", now)
      .select("id");
    if (error) {
      purged[table] = null;
      await captureError(`cron.purge_expired_links.${table}`, error, {}, { alert: false });
      continue;
    }
    purged[table] = (data ?? []).length;
  }

  logEvent("cron.purge_expired_links", purged);
  return NextResponse.json({ ok: true, purged });
}
