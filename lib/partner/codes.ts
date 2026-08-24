import "server-only";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";
import { displayCount } from "@/lib/partner-report";
import type { CodeRow } from "@/components/partner/LinksClient";

export interface CodesWithClaims {
  /** Per-code rows with claim counts pre-banded into display strings. */
  rows: CodeRow[];
  /**
   * Exact sum of claims across all codes — SERVER-SIDE USE ONLY. Render it
   * through displayCount (or compare against 0) in a server component; never
   * pass it, or any exact 1–4, across a client-component boundary — client
   * props serialize into the page payload the partner's browser receives.
   */
  totalClaims: number;
}

/**
 * Codes + aggregate claim counts for one partner org — the single fetch
 * behind both the token-gated links page (/partner/r/[token]/links) and the
 * signed-in portal (/portal/links, /portal/materials). Claim counts are the
 * only case-adjacent number this ever exposes (zero-visibility rule), and
 * they leave this module already BANDED (displayCount: exact at 0 and ≥5,
 * "fewer than 5" in between) so an exact small tally on a labeled code can
 * never reach a partner surface or payload.
 *
 * Errors (e.g. the partner_codes migration not applied yet) degrade to an
 * empty list so the create flow stays available.
 */
export async function codesWithClaims(
  partnerId: string,
): Promise<CodesWithClaims> {
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
    const rows = (
      (codeRows as Omit<CodeRow, "claimsDisplay">[] | null) ?? []
    ).map((r) => ({
      ...r,
      claimsDisplay: displayCount(counts.get(r.code) ?? 0),
    }));
    let totalClaims = 0;
    for (const n of counts.values()) totalClaims += n;
    return { rows, totalClaims };
  } catch {
    return { rows: [], totalClaims: 0 };
  }
}
