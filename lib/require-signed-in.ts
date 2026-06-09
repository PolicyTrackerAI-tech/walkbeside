/**
 * Auth-only gate (no payment check). Use on routes that need a signed-in
 * user. Under Model A every tool is free and the only charge is the flat
 * $49 paid upfront before we contact any home (refundable in 14 days), so
 * this is the only gate the negotiate flow needs: unauthed users go to
 * /login; authed users pass through.
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
