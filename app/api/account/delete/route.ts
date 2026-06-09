import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer, FEATURES } from "@/lib/env";
import { validateOrigin } from "@/lib/http-guards";
import { logEvent, captureError, hashId } from "@/lib/observability";

/**
 * Permanent account deletion (GDPR/CCPA-style right to erasure).
 *
 * Deleting the auth user cascades to every user-owned table via ON DELETE
 * CASCADE (profiles, tasks, negotiations → outreach/messages, price_list_
 * analyses, cert_trackers, obituaries). We also remove marketing signups,
 * which are keyed by email and not covered by the auth-user FK.
 *
 * Form POST from /account so it works without JS. Origin-checked (CSRF).
 */
export async function POST(req: Request) {
  if (!validateOrigin(req))
    return NextResponse.json({ error: "bad_origin" }, { status: 403 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.redirect(new URL("/login", req.url), { status: 303 });

  // Dev / no-Supabase mode: nothing to delete.
  if (!FEATURES.supabase()) {
    return NextResponse.redirect(new URL("/", req.url), { status: 303 });
  }

  const admin = createServiceClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );

  // Marketing list is keyed by email, not the auth-user FK — clear it too.
  // Non-fatal: if this cleanup fails we still delete the account (erasure of
  // the account is the user's primary right), but we alert so the orphaned
  // marketing row can be removed by hand rather than failing silently.
  if (user.email) {
    const { error: signupErr } = await admin
      .from("planning_signups")
      .delete()
      .ilike("email", user.email);
    if (signupErr) {
      await captureError("account.delete_signups_failed", signupErr, {
        userHash: hashId(user.id),
      });
    }
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    await captureError("account.delete_failed", error, {
      userHash: hashId(user.id),
    });
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }

  logEvent("account.deleted", { userHash: hashId(user.id) });
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/?deleted=1", req.url), { status: 303 });
}
