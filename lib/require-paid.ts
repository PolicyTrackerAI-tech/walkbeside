/**
 * Server-side helper for paid-only pages. Redirects to /paywall with a
 * `next` param so the user lands back on the gated page after paying.
 *
 * Margaret refactor section 12. Use at the top of any page.tsx that
 * shouldn't be reachable without the $49 unlock:
 *
 *   export default async function MyPage() {
 *     await requirePaid("/my-page");
 *     // ... existing page code
 *   }
 *
 * If Supabase isn't configured (dev / no-account mode), this is a no-op
 * — the page renders. The free-tier UnconfiguredDashboard handles those
 * cases at the page level.
 */

import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { isPaidUser } from "./auth-paid";
import { FEATURES } from "./env";

export async function requirePaid(currentPath: string): Promise<void> {
  if (!FEATURES.supabase()) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/paywall?next=${encodeURIComponent(currentPath)}`);
  }

  if (!(await isPaidUser(supabase, user))) {
    redirect(`/paywall?next=${encodeURIComponent(currentPath)}`);
  }
}
