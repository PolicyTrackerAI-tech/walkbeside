import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  fetchAllPages,
  SUPABASE_MAX_ROWS,
} from "@/lib/supabase/fetch-all-pages";
import type { VettingHome } from "./VettingClient";

export const VETTING_SELECT_COLS =
  "id, name, email, phone, address, city, state, zip, google_rating, google_review_count, notes, active, vetted, vetted_at, vetted_by";

export type VettingLoad =
  | { homes: VettingHome[]; error: null }
  | { homes: []; error: string };

/**
 * Every funeral home in the directory, for /admin/vetting. The directory
 * outgrew Supabase's 1,000-row response cap (the old `.limit(5000)` quietly
 * returned the first 1,000 by state, so whole states never reached the page),
 * so this pages with `.range()` until a short page. The `id` tiebreak keeps
 * page boundaries stable when state/city/name tie. Any page error fails the
 * whole load: a partial list shown as the full directory would hide homes
 * from review.
 */
export async function loadVettingHomes(
  admin: SupabaseClient,
  pageSize: number = SUPABASE_MAX_ROWS,
): Promise<VettingLoad> {
  let failure: string | null = null;
  const homes = await fetchAllPages<VettingHome>(async (offset) => {
    const { data, error } = await admin
      .from("funeral_homes")
      .select(VETTING_SELECT_COLS)
      .order("state", { ascending: true })
      .order("city", { ascending: true })
      .order("name", { ascending: true })
      .order("id", { ascending: true })
      .range(offset, offset + pageSize - 1);
    if (error) {
      failure = error.message;
      return null;
    }
    return (data ?? []) as VettingHome[];
  }, pageSize);

  if (homes === null) {
    return { homes: [], error: failure ?? "unknown error" };
  }
  return { homes, error: null };
}
