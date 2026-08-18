import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer, FEATURES } from "@/lib/env";

/**
 * Server half of the "Save for my daughter" share link. After audit A8
 * (2026-08-18) share_links has RLS enabled with NO anon policies — the anon
 * key cannot touch it — so every access runs through this service-role
 * helper, and reads are always scoped to a single row by id + expiry. The
 * unguessable UUID is the capability; it is no longer bulk-enumerable.
 * Mirrors app/api/household/service.ts.
 */

export function shareAvailable(): boolean {
  return FEATURES.supabase();
}

export function serviceClient() {
  return createServiceClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(s: unknown): s is string {
  return typeof s === "string" && UUID_RE.test(s);
}
