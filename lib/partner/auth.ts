import "server-only";
import { notFound, redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getUser } from "@/lib/supabase/server";
import { PUBLIC, requireServer } from "@/lib/env";

/**
 * Session gate for the sign-in partner portal (/portal/*). Mirrors
 * lib/admin-auth.ts: a logged-in Supabase session, resolved against
 * partner_members via the service role (the table is RLS-deny-all).
 *
 * A seat is created with invited_email only (lowercase at every write site);
 * the first time that person logs in with the matching email we bind their
 * auth.users id and stamp accepted_at. The report_token quick links
 * (lib/partner-auth.ts) are unaffected — this is an additive way in.
 */

export interface PortalPartner {
  id: string;
  name: string;
  partner_type: "hospice" | "employer" | "insurer";
  status: string;
  active: boolean;
  report_token: string;
  brand_accent: string | null;
  notification_email: string | null;
  contact_email: string | null;
}

export interface PortalMember {
  id: string;
  role: "owner" | "member";
  invited_email: string;
}

export interface PortalContext {
  partner: PortalPartner;
  member: PortalMember;
  email: string;
}

function svc() {
  return createServiceClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );
}

type MemberRow = {
  id: string;
  partner_id: string;
  role: "owner" | "member";
  invited_email: string;
  accepted_at: string | null;
};

const MEMBER_COLS = "id, partner_id, role, invited_email, accepted_at";

/**
 * Find the caller's active seat: by bound user_id first, else by
 * invited-email match (bind-on-first-login — stamps user_id + accepted_at).
 * Returns null when the user simply isn't a partner member; any table error
 * (e.g. migration not applied yet) also resolves to null so callers 404.
 */
async function resolveMember(
  admin: ReturnType<typeof svc>,
  userId: string,
  email: string | undefined,
): Promise<MemberRow | null> {
  try {
    const { data: bound } = await admin
      .from("partner_members")
      .select(MEMBER_COLS)
      .eq("user_id", userId)
      .is("deactivated_at", null)
      .order("created_at", { ascending: true })
      .limit(1);
    if (bound && bound.length > 0) return bound[0] as MemberRow;

    if (!email) return null;
    const { data: invited } = await admin
      .from("partner_members")
      .select(MEMBER_COLS)
      .eq("invited_email", email.toLowerCase())
      .is("user_id", null)
      .is("deactivated_at", null)
      .order("created_at", { ascending: true })
      .limit(1);
    if (!invited || invited.length === 0) return null;

    const seat = invited[0] as MemberRow;
    // Guarded bind: .is("user_id", null) makes a double-login race idempotent.
    const { data: claimed } = await admin
      .from("partner_members")
      .update({
        user_id: userId,
        accepted_at: seat.accepted_at ?? new Date().toISOString(),
      })
      .eq("id", seat.id)
      .is("user_id", null)
      .select(MEMBER_COLS);
    return claimed && claimed.length > 0 ? (claimed[0] as MemberRow) : null;
  } catch {
    return null;
  }
}

async function loadPartner(
  admin: ReturnType<typeof svc>,
  partnerId: string,
): Promise<PortalPartner | null> {
  try {
    const { data } = await admin
      .from("partners")
      .select(
        "id, name, partner_type, status, active, report_token, brand_accent, notification_email, contact_email",
      )
      .eq("id", partnerId)
      .single();
    return (data as PortalPartner | null) ?? null;
  } catch {
    return null;
  }
}

/**
 * Page guard for /portal/* server components. Redirects anonymous users to
 * the portal login, 404s authenticated non-members (the route's existence is
 * never confirmed to outsiders), and parks members of paused/archived orgs
 * on /portal/paused. `minRole: "owner"` additionally 404s plain members.
 */
export async function requirePartnerMember(
  nextPath: string,
  minRole?: "owner",
): Promise<PortalContext> {
  const user = await getUser();
  if (!user) redirect(`/portal/login?next=${encodeURIComponent(nextPath)}`);

  const admin = svc();
  const seat = await resolveMember(admin, user.id, user.email);
  if (!seat) notFound();

  const partner = await loadPartner(admin, seat.partner_id);
  if (!partner) notFound();
  if (!partner.active || partner.status === "paused" || partner.status === "archived") {
    redirect("/portal/paused");
  }
  if (minRole === "owner" && seat.role !== "owner") notFound();

  return {
    partner,
    member: { id: seat.id, role: seat.role, invited_email: seat.invited_email },
    email: user.email ?? "",
  };
}

/**
 * API guard for /api/portal/* route handlers. Returns a NextResponse to
 * short-circuit (401 anonymous / 403 non-member, paused org, or insufficient
 * role), or the PortalContext when the caller may proceed:
 *
 *   const gate = await requirePartnerApi();
 *   if (gate instanceof NextResponse) return gate;
 *   const { partner, member } = gate;
 */
export async function requirePartnerApi(
  minRole?: "owner",
): Promise<PortalContext | NextResponse> {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = svc();
  const seat = await resolveMember(admin, user.id, user.email);
  if (!seat) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const partner = await loadPartner(admin, seat.partner_id);
  if (
    !partner ||
    !partner.active ||
    partner.status === "paused" ||
    partner.status === "archived"
  ) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (minRole === "owner" && seat.role !== "owner") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  return {
    partner,
    member: { id: seat.id, role: seat.role, invited_email: seat.invited_email },
    email: user.email ?? "",
  };
}
