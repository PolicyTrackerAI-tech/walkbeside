import "server-only";
import { notFound, redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";

/**
 * Centralised admin gate for internal tooling (/admin/*).
 *
 * Replaces the old `?key=ADMIN_PREVIEW_KEY` URL-param / x-admin-preview-key
 * header scheme, which leaked the shared secret into browser history, server
 * logs, and Referer headers and used a non-timing-safe string compare. Access
 * is now a logged-in Supabase session whose email is on the ADMIN_EMAILS
 * allowlist (see lib/admin.ts) — the same pattern /admin/faith-qa already used.
 *
 * NOTE: isAdminEmail() is permissive until ADMIN_EMAILS is set (any logged-in
 * user passes). Set ADMIN_EMAILS in production before launch — the env
 * validator (lib/env.ts) enforces this when OUTREACH_LIVE is on.
 */

/**
 * Page guard for /admin/* server components. Redirects anonymous users to
 * login, and 404s authenticated non-admins (so the route's existence isn't
 * confirmed to outsiders). Returns the admin's email on success.
 */
export async function requireAdminPage(nextPath: string): Promise<string> {
  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  if (!isAdminEmail(user.email)) notFound();
  return user.email ?? "";
}

/**
 * API guard for admin route handlers. Returns a NextResponse to short-circuit
 * when unauthorized (401 anonymous / 403 non-admin), or null when the caller
 * is an allowlisted admin:
 *
 *   const denied = await requireAdminApi();
 *   if (denied) return denied;
 */
export async function requireAdminApi(): Promise<NextResponse | null> {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isAdminEmail(user.email)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return null;
}
