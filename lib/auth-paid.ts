/**
 * Account-level paywall check.
 *
 * Margaret refactor section 12. A user is considered "paid" — i.e. has
 * unlocked the full toolkit — if EITHER:
 *
 * 1. Their email matches an entry in HONEST_FUNERAL_FREE_EMAILS (env var,
 *    comma-separated). Used for test accounts and the founder's own logins
 *    so we don't have to fake-pay during dev. Case-insensitive, trimmed.
 *
 * 2. Their profiles.paid_at is set (Stripe webhook flips this on after
 *    a successful account-paywall checkout).
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
