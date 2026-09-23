/**
 * Server-only funeral home directory lookup. Reads the founder-curated
 * `funeral_homes` table.
 *
 * A home only qualifies for outreach when it is BOTH `active` (good standing)
 * AND `vetted` (a human reviewed it in /admin/vetting) AND has an email. The
 * `vetted` gate means an unreviewed import can never be contacted, even with
 * OUTREACH_LIVE on.
 *
 * Returns only real, vetted, active homes with an email IN THE FAMILY'S
 * SERVICE AREA (lib/service-markets.ts: the family's market, e.g. the whole
 * DC metro across DC/MD/VA, or just its zip3 outside a defined market) — an
 * empty array, never a placeholder and never an out-of-area home, when
 * Supabase is unconfigured, the query errors, or no home qualifies.
 *
 * Order: same zip, then same zip3, then the rest of the market. Within each
 * tier the order is shuffled per call, so when an area has more vetted homes
 * than the cap, which ones receive the request is a fair draw — not an
 * artifact of import order that would hand the same homes every family's
 * request (guardrail #3: never steer).
 *
 * Callers MUST handle the empty-array case explicitly; never assume a
 * non-empty result. (A live family flow that silently substituted a
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
import { serviceAreaZip3s } from "@/lib/service-markets";
import { isEmailDenylisted } from "./denylist";
import type { FuneralHome } from "./sample-homes";

export async function findHomesFromDirectory(
  zip: string,
  n = 4,
  random: () => number = Math.random,
): Promise<FuneralHome[]> {
  if (!FEATURES.supabase()) return [];

  const supabase = await createClient();
  const zip3 = zip.slice(0, 3);
  const area = serviceAreaZip3s(zip);

  const { data, error } = await supabase
    .from("funeral_homes")
    .select("name, email, zip")
    .eq("active", true)
    .eq("vetted", true)
    .not("email", "is", null);

  if (error || !data) return [];

  // Denylisted addresses are dropped BEFORE the cap, so a blocked domain
  // can't take a slot a contactable home in the same market should have had
  // (and an all-blocked area returns [] → the honest no_homes_available path).
  const withEmail = data.filter(
    (h): h is { name: string; email: string; zip: string } =>
      typeof h.email === "string" &&
      h.email.length > 0 &&
      !isEmailDenylisted(h.email) &&
      typeof h.zip === "string" &&
      area.has(h.zip.slice(0, 3)),
  );
  const exact = withEmail.filter((h) => h.zip === zip);
  const prefix = withEmail.filter((h) => h.zip.startsWith(zip3) && h.zip !== zip);
  const market = withEmail.filter((h) => !h.zip.startsWith(zip3));

  return [...shuffle(exact, random), ...shuffle(prefix, random), ...shuffle(market, random)]
    .slice(0, n)
    .map((h) => ({ name: h.name, email: h.email }));
}

/** Fisher–Yates on a copy. */
function shuffle<T>(items: T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
