/**
 * Auth-only gate (no payment check). Use on routes that need a signed-in
 * user but should remain free until the family actively picks a funeral
 * home (V2 canonical pricing: $199 charged only on home selection).
 *
 * Companion to `requirePaid`. The difference:
 *   - requirePaid:   sends unauthed users to /login, sends authed-but-unpaid
 *                    users to /paywall.
 *   - requireSignedIn: sends unauthed users to /login. Authed users pass through
 *                      regardless of payment status.
 *
 * If Supabase isn't configured (dev / no-account mode), this is a no-op
 * so the flow stays exercisable.
 */

import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { FEATURES } from "./env";

export async function requireSignedIn(currentPath: string): Promise<void> {
  if (!FEATURES.supabase()) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(currentPath)}`);
  }
}
