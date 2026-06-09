/**
 * "Skip the fee" check, used so the flat $49 outreach fee can be waived for
 * specific accounts.
 *
 * Under Model A there is no account-level paywall: every tool is free and the
 * only charge is the flat $49, paid upfront before we contact any home
 * (refundable in 14 days if we don't save the family anything). Home selection
 * itself is free. This helper exists so test accounts and the founder's own
 * logins run outreach WITHOUT being charged during testing. A user qualifies if
 * EITHER:
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
