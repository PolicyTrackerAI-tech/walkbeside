/**
 * Server-only funeral home directory lookup. Reads the sister-curated
 * `funeral_homes` table.
 *
 * A home only qualifies for outreach when it is BOTH `active` (good standing)
 * AND `vetted` (a human reviewed it in /admin/vetting) AND has an email. The
 * `vetted` gate means an unreviewed import can never be contacted, even with
 * OUTREACH_LIVE on.
 *
 * Returns only real, vetted, active homes with an email — an empty array,
 * never a placeholder, when Supabase is unconfigured, the query errors, or no
 * home qualifies. Callers MUST handle the empty-array case explicitly; never
 * assume a non-empty result. (A live family flow that silently substituted a
 * fake home would tell a grieving family we're contacting funeral homes while
 * nothing real happens — see app/api/negotiate/start/route.ts's handling of
 * an empty result. Admin-only tools that want an honest placeholder for
 * preview purposes, e.g. app/api/negotiate/preview/route.ts, supply their own
 * explicitly-labeled placeholder rather than relying on this function to.)
 *
 * Imports `@/lib/supabase/server` (which pulls in `next/headers`) — must
 * never be imported from a Client Component.
 */

import "server-only";
import { createClient } from "@/lib/supabase/server";
import { FEATURES } from "@/lib/env";
import type { FuneralHome } from "./sample-homes";

export async function findHomesFromDirectory(
  zip: string,
  n = 4,
): Promise<FuneralHome[]> {
  if (!FEATURES.supabase()) return [];

  const supabase = await createClient();
  const zip3 = zip.slice(0, 3);

  const { data, error } = await supabase
    .from("funeral_homes")
    .select("name, email, zip")
    .eq("active", true)
    .eq("vetted", true)
    .not("email", "is", null);

  if (error || !data) return [];

  const exact = data.filter((h) => h.zip === zip);
  const prefix = data.filter((h) => h.zip?.startsWith(zip3) && h.zip !== zip);
  const rest = data.filter((h) => !h.zip?.startsWith(zip3));

  return [...exact, ...prefix, ...rest]
    .filter((h): h is { name: string; email: string; zip: string | null } =>
      typeof h.email === "string" && h.email.length > 0,
    )
    .slice(0, n)
    .map((h) => ({ name: h.name, email: h.email }));
}
