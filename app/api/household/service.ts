import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer, FEATURES } from "@/lib/env";

/**
 * Server half of the household link. household_links has RLS enabled with NO
 * policies — the anon key cannot touch it — so every access runs through
 * these service-role helpers. owner_secret gates all mutations and is never
 * included in anything a read path returns.
 */

export function householdAvailable(): boolean {
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

/** Payload guard: flat string→string record, bounded (defense in depth after readLimitedJson). */
export function isValidPayload(p: unknown): p is Record<string, string> {
  if (!p || typeof p !== "object" || Array.isArray(p)) return false;
  const entries = Object.entries(p as Record<string, unknown>);
  if (entries.length > 40) return false;
  return entries.every(
    ([k, v]) =>
      typeof k === "string" &&
      k.length <= 80 &&
      typeof v === "string" &&
      v.length <= 100_000,
  );
}

interface OwnedRow {
  id: string;
  owner_secret: string;
  revoked_at: string | null;
  expires_at: string;
}

/**
 * Fetch a link row and check the presented secret. Returns the row on
 * success; a discriminated failure otherwise. A wrong secret returns the
 * same "not_found" as a missing row — no oracle for valid slugs.
 */
export async function authorizeOwner(
  id: unknown,
  ownerSecret: unknown,
): Promise<
  | { ok: true; row: OwnedRow }
  | { ok: false; error: "not_found" | "revoked" }
> {
  if (!isUuid(id) || !isUuid(ownerSecret)) return { ok: false, error: "not_found" };
  const { data } = await serviceClient()
    .from("household_links")
    .select("id, owner_secret, revoked_at, expires_at")
    .eq("id", id)
    .maybeSingle();
  if (!data || data.owner_secret !== ownerSecret)
    return { ok: false, error: "not_found" };
  if (data.revoked_at) return { ok: false, error: "revoked" };
  return { ok: true, row: data as OwnedRow };
}
