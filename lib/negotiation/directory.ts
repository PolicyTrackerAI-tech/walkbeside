/**
 * Server-only funeral home directory lookup. Reads the sister-curated
 * `funeral_homes` table; falls back to placeholder `findHomes()` when
 * Supabase is unavailable or the table is empty.
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
