import "server-only";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";
import type { CodeRow } from "@/components/partner/LinksClient";

/**
 * Codes + aggregate claim counts for one partner org — the single fetch
 * behind both the token-gated links page (/partner/r/[token]/links) and the
 * signed-in portal (/portal/links, /portal/materials). Claim counts are the
 * only case-adjacent number this ever exposes (zero-visibility rule).
 *
 * Errors (e.g. the partner_codes migration not applied yet) degrade to an
 * empty list so the create flow stays available.
 */
export async function codesWithClaims(partnerId: string): Promise<CodeRow[]> {
  try {
    const admin = createServiceClient(
      PUBLIC.supabaseUrl,
      requireServer("SUPABASE_SERVICE_ROLE_KEY"),
    );
    const { data: codeRows } = await admin
      .from("partner_codes")
      .select("code, label, active, created_at")
      .eq("partner_id", partnerId)
      .order("created_at", { ascending: false });
    const { data: claims } = await admin
      .from("negotiations")
      .select("partner_code")
      .eq("partner_id", partnerId)
      .not("partner_code", "is", null);
    const counts = new Map<string, number>();
    for (const c of claims ?? []) {
      const k = (c as { partner_code: string }).partner_code;
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    return ((codeRows as Omit<CodeRow, "claims">[] | null) ?? []).map((r) => ({
      ...r,
      claims: counts.get(r.code) ?? 0,
    }));
  } catch {
    return [];
  }
}
