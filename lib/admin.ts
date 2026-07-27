import "server-only";
import { hasServer } from "./env";

/**
 * Admin allowlist for internal tooling (e.g. /admin/faith-qa, future
 * /admin/vetting).
 *
 * Configured via the `ADMIN_EMAILS` env var — a comma-separated list of
 * emails. Behavior is environment-dependent so internal tools work without
 * env setup in dev, but an unset allowlist can NEVER open the admin surface
 * on the live site:
 *
 *   - ADMIN_EMAILS set                    → only listed emails are admin.
 *   - ADMIN_EMAILS unset, non-production  → permissive (any logged-in user),
 *                                           so local dev works with no setup.
 *   - ADMIN_EMAILS unset, production      → FAIL CLOSED (nobody is admin).
 *
 * The production fail-closed rule means a prod deploy without ADMIN_EMAILS
 * locks the founding team out of /admin (a loud, safe failure) instead of
 * silently making every registered family an admin (a fail-open hole that
 * exposes family case data, benchmark publishing, and partner approval).
 * Set ADMIN_EMAILS in the prod environment. `adminAllowlistConfigured()`
 * lets pages render a reminder banner while it's still unset.
 */

function adminEmails(): string[] {
  if (!hasServer("ADMIN_EMAILS")) return [];
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function adminAllowlistConfigured(): boolean {
  return adminEmails().length > 0;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  const list = adminEmails();
  if (list.length === 0) {
    // Unset allowlist: permissive in dev (no setup needed), fail closed in
    // production so an unconfigured prod deploy can't make everyone an admin.
    return process.env.NODE_ENV !== "production";
  }
  if (!email) return false;
  return list.includes(email.toLowerCase());
}
