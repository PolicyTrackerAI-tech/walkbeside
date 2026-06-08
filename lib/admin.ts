import "server-only";
import { hasServer } from "./env";

/**
 * Admin allowlist for internal tooling (e.g. /admin/faith-qa, future
 * /admin/vetting).
 *
 * Configured via the `ADMIN_EMAILS` env var — a comma-separated list of
 * emails. Behavior is deliberately permissive-by-default so internal tools
 * work the moment a founder logs in, without env setup:
 *
 *   - ADMIN_EMAILS unset  → any logged-in user is treated as admin.
 *   - ADMIN_EMAILS set    → only listed emails are admin; everyone else 404s.
 *
 * Set ADMIN_EMAILS before these routes are exposed to anyone outside the
 * founding team. `adminAllowlistConfigured()` lets pages render a reminder
 * banner while it's still open.
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
  if (list.length === 0) return true; // open by default until configured
  if (!email) return false;
  return list.includes(email.toLowerCase());
}
