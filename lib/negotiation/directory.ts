/**
 * Server-only funeral home directory lookup. Reads the sister-curated
 * `funeral_homes` table; falls back to placeholder `findHomes()` when
 * Supabase is unavailable or no home qualifies.
 *
 * A home only qualifies for outreach when it is BOTH `active` (good standing)
 * AND `vetted` (a human reviewed it in /admin/vetting) AND has an email. The
 * `vetted` gate means an unreviewed import can never be contacted, even with
 * OUTREACH_LIVE on. Until homes are approved, this returns the placeholder
 * fallback — which is harmless under the OUTREACH_LIVE kill switch.
 *
 * Imports `@/lib/supabase/server` (which pulls in `next/headers`) — must
 * never be imported from a Client Component.
 */

import "server-only";
import { createClient } from "@/lib/supabase/server";
import { FEATURES } from "@/lib/env";
import { findHomes, type FuneralHome } from "./sample-homes";

export async function findHomesFromDirectory(
  zip: string,
  n = 4,
): Promise<FuneralHome[]> {
  if (!FEATURES.supabase()) return findHomes(zip, n);

  const supabase = await createClient();
  const zip3 = zip.slice(0, 3);

  const { data, error } = await supabase
    .from("funeral_homes")
    .select("name, email, zip")
    .eq("active", true)
    .eq("vetted", true)
    .not("email", "is", null);

  if (error || !data || data.length === 0) return findHomes(zip, n);

  const exact = data.filter((h) => h.zip === zip);
  const prefix = data.filter((h) => h.zip?.startsWith(zip3) && h.zip !== zip);
  const rest = data.filter((h) => !h.zip?.startsWith(zip3));

  const ordered = [...exact, ...prefix, ...rest]
    .filter((h): h is { name: string; email: string; zip: string | null } =>
      typeof h.email === "string" && h.email.length > 0,
    )
    .slice(0, n)
    .map((h) => ({ name: h.name, email: h.email }));

  return ordered.length > 0 ? ordered : findHomes(zip, n);
}
