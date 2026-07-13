import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  // Internal paths only — a crafted absolute/protocol-relative `next` must
  // never turn the auth callback into an open redirect.
  const rawNext = url.searchParams.get("next") || "/dashboard";
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";

  // A failed exchange must SAY so, not silently forward an unauthenticated
  // user to `next` (that reads as an endless sign-in loop). Bounce to the
  // login that owns this destination with an error flag it knows to display.
  // Two flavors: a provider-reported error (e.g. the user cancelled Google's
  // consent screen — GoTrue passes ?error=... through) vs a dead email link
  // (consumed/expired token arrives with no code at all).
  const loginPath = next.startsWith("/portal") ? "/portal/login" : "/login";
  const flavor = url.searchParams.get("error") ? "signin_incomplete" : "link_failed";
  const failed = new URL(
    `${loginPath}?error=${flavor}&next=${encodeURIComponent(next)}`,
    url.origin,
  );

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }

  // No code, or the exchange failed. Most common benign cause: re-clicking an
  // already-used link ("let me get back to the site"). If this browser holds
  // a valid session, the honest outcome is their destination, not an error.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) return NextResponse.redirect(new URL(next, url.origin));

  return NextResponse.redirect(failed);
}
