/**
 * Free-email / test-account check. Honest Funeral is free to families — there is
 * no family charge anywhere. This helper survives as scaffolding to identify
 * test/founder accounts (e.g. to gate future institutional billing or test-only
 * behavior); it no longer waives any consumer fee. A user qualifies if EITHER:
 *
 * 1. Their email matches an entry in HONEST_FUNERAL_FREE_EMAILS (env var,
 *    comma-separated). This is the live mechanism. Case-insensitive, trimmed.
 *
 * 2. Their profiles.paid_at is set. Legacy column — nothing writes it anymore
 *    (the upfront account-paywall that used it was removed), so in practice
 *    this check is the free-email allowlist. Kept for backward compatibility
 *    with any historical rows.
 *
 * Both checks are server-side. Don't expose the free-email list to the client.
 */

import type { SupabaseClient, User } from "@supabase/supabase-js";

function freeEmailsFromEnv(): Set<string> {
  const raw = process.env.HONEST_FUNERAL_FREE_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isFreeEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return freeEmailsFromEnv().has(email.toLowerCase());
}

/**
 * Server-side: is this user paid? Anonymous users are never paid.
 */
export async function isPaidUser(
  supabase: SupabaseClient,
  user: User | null,
): Promise<boolean> {
  if (!user) return false;
  if (isFreeEmail(user.email)) return true;
  const { data: profile } = await supabase
    .from("profiles")
    .select("paid_at")
    .eq("id", user.id)
    .maybeSingle();
  return Boolean(profile?.paid_at);
}
