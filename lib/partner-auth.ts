import "server-only";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";

export interface PartnerLite {
  id: string;
  name: string;
  active: boolean;
  /** "hospice" | "employer" | "insurer" — consumers coerce unknowns to "hospice". */
  partner_type: string;
}

/**
 * Resolve a partner's report_token to their {id, name, active, partner_type}
 * row, or null
 * if the token is malformed, unrecognized, or the partners table/migration
 * isn't applied yet. Callers must still check `active` themselves (kept
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
      .select("id, name, active, partner_type")
      .eq("report_token", token)
      .single();
    return (data as PartnerLite | null) ?? null;
  } catch {
    return null;
  }
}
