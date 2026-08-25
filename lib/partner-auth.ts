import "server-only";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";

export interface PartnerLite {
  id: string;
  name: string;
  active: boolean;
  /** "pilot" | "active" | "paused" | "archived" — same enum the portal parks on. */
  status: string;
  /** "hospice" | "employer" | "insurer" — consumers coerce unknowns to "hospice". */
  partner_type: string;
  /** Org accent for co-branded materials (validated at render). */
  brand_accent: string | null;
}

/**
 * The ONE parked rule, shared by both partner surfaces. The session portal
 * (lib/partner/auth.ts) parks on `!active || paused || archived`; before
 * audit A5 the token surfaces checked only `active`, so a status-paused
 * partner kept full bearer-link access to report/links/check. Every token
 * page must gate through this helper so the two surfaces can never split
 * again.
 */
export function isPartnerParked(p: {
  active: boolean;
  status?: string | null;
}): boolean {
  return !p.active || p.status === "paused" || p.status === "archived";
}

/**
 * Resolve a partner's report_token to their row, or null if the token is
 * malformed, unrecognized, or the partners table/migration isn't applied
 * yet. Callers must still check `isPartnerParked(partner)` themselves (kept
 * explicit rather than baked in) so a caller can choose notFound() or a
 * different degrade.
 */
export async function resolvePartnerToken(
  token: string,
): Promise<PartnerLite | null> {
  if (!token || token.length < 16) return null;

  const admin = createServiceClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );
  try {
    const { data } = await admin
      .from("partners")
      .select("id, name, active, status, partner_type, brand_accent")
      .eq("report_token", token)
      .single();
    return (data as PartnerLite | null) ?? null;
  } catch {
    return null;
  }
}
