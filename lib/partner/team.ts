import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Team-seat management for the partner portal (/portal/team). Pure data
 * layer: the service-role client is injected so this is unit-testable and
 * so route handlers keep the single-construction-site convention.
 *
 * partner_members is RLS-deny-all (service role only). invited_email is
 * stored trim().toLowerCase() at EVERY write site — the unique index
 * (partner_id, invited_email) is a plain-column index, so normalization
 * here is what makes the dedupe real.
 */

/** Sanity cap on sign-in seats per org. */
export const MAX_SEATS = 20;

export interface TeamMemberRow {
  id: string;
  invited_email: string;
  role: "owner" | "member";
  invited_at: string;
  accepted_at: string | null;
  deactivated_at: string | null;
  created_at: string;
}

const MEMBER_COLS =
  "id, invited_email, role, invited_at, accepted_at, deactivated_at, created_at";

/** Minimal shape check; real deliverability is proven by the sign-in code. */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type InviteResult =
  | { ok: true; already?: true; member?: TeamMemberRow }
  | {
      ok: false;
      error: "invalid_email" | "seat_limit" | "seat_deactivated" | "unavailable";
    };

export type SetActiveResult =
  | { ok: true }
  | {
      ok: false;
      error: "not_found" | "last_owner" | "seat_limit" | "unavailable";
    };

/** All seats for an org (active + deactivated), oldest first. */
export async function listMembers(
  admin: SupabaseClient,
  partnerId: string,
): Promise<TeamMemberRow[]> {
  try {
    const { data } = await admin
      .from("partner_members")
      .select(MEMBER_COLS)
      .eq("partner_id", partnerId)
      .order("created_at", { ascending: true });
    return (data as TeamMemberRow[] | null) ?? [];
  } catch {
    return [];
  }
}

/**
 * Add a member seat. Email is normalized (trim + lowercase) and shape-checked
 * first; the active-seat count is enforced against MAX_SEATS BEFORE the
 * insert; a duplicate-key error means the seat already exists — success
 * ({ already: true }) if that seat is active, but seat_deactivated if it was
 * deactivated (so the owner reaches for Reactivate instead of believing the
 * person can sign in). The unique index does the dedupe.
 *
 * Known single-org limitation (deliberate Day 2 scope): an email already
 * BOUND to another org resolves to THAT org on sign-in —
 * lib/partner/auth.ts resolveMember matches by user_id first — so a seat
 * created here for such an email stays unreachable until multi-org
 * resolution ships.
 */
export async function inviteMember(
  admin: SupabaseClient,
  partnerId: string,
  email: string,
): Promise<InviteResult> {
  const normalized = email.trim().toLowerCase();
  if (
    !normalized ||
    normalized.length > 254 ||
    !EMAIL_SHAPE.test(normalized)
  ) {
    return { ok: false, error: "invalid_email" };
  }

  try {
    const { count, error: countError } = await admin
      .from("partner_members")
      .select("id", { count: "exact", head: true })
      .eq("partner_id", partnerId)
      .is("deactivated_at", null);
    if (countError || count === null || count === undefined) {
      return { ok: false, error: "unavailable" };
    }
    if (count >= MAX_SEATS) return { ok: false, error: "seat_limit" };

    const { data, error } = await admin
      .from("partner_members")
      .insert({
        partner_id: partnerId,
        invited_email: normalized,
        role: "member",
      })
      .select(MEMBER_COLS);
    if (error) {
      if (/duplicate|unique/i.test(error.message)) {
        // The seat exists — but that's only "already on the team" if it's
        // active. A deactivated seat means the person is locked out, and
        // saying "already" here would hide that; surface it instead.
        const { data: existing, error: lookupError } = await admin
          .from("partner_members")
          .select("id, deactivated_at")
          .eq("partner_id", partnerId)
          .eq("invited_email", normalized)
          .limit(1);
        if (lookupError) return { ok: false, error: "unavailable" };
        const seat = (
          existing as { id: string; deactivated_at: string | null }[] | null
        )?.[0];
        if (seat?.deactivated_at) {
          return { ok: false, error: "seat_deactivated" };
        }
        return { ok: true, already: true };
      }
      return { ok: false, error: "unavailable" };
    }
    const member = (data as TeamMemberRow[] | null)?.[0];
    return member ? { ok: true, member } : { ok: true };
  } catch {
    return { ok: false, error: "unavailable" };
  }
}

/**
 * Deactivate (active = false) or reactivate (active = true) a seat.
 * The row lookup is scoped to BOTH partner_id and id — a member id from
 * another org reads as not_found (cross-org protection). Deactivating an
 * owner first counts the org's ACTIVE owners and refuses to remove the
 * last one, so an org can never lock itself out of Team/Settings.
 * Reactivating runs the same active-seat count as inviteMember, so
 * deactivate → invite → reactivate can't sneak past the MAX_SEATS cap.
 */
export async function setMemberActive(
  admin: SupabaseClient,
  partnerId: string,
  memberId: string,
  active: boolean,
): Promise<SetActiveResult> {
  try {
    const { data: rows, error } = await admin
      .from("partner_members")
      .select("id, role")
      .eq("partner_id", partnerId)
      .eq("id", memberId)
      .limit(1);
    if (error) return { ok: false, error: "unavailable" };
    const row = (rows as { id: string; role: string }[] | null)?.[0];
    if (!row) return { ok: false, error: "not_found" };

    if (!active && row.role === "owner") {
      const { count, error: countError } = await admin
        .from("partner_members")
        .select("id", { count: "exact", head: true })
        .eq("partner_id", partnerId)
        .eq("role", "owner")
        .is("deactivated_at", null);
      if (countError || count === null || count === undefined) {
        return { ok: false, error: "unavailable" };
      }
      if (count <= 1) return { ok: false, error: "last_owner" };
    }

    if (active) {
      const { count, error: countError } = await admin
        .from("partner_members")
        .select("id", { count: "exact", head: true })
        .eq("partner_id", partnerId)
        .is("deactivated_at", null);
      if (countError || count === null || count === undefined) {
        return { ok: false, error: "unavailable" };
      }
      if (count >= MAX_SEATS) return { ok: false, error: "seat_limit" };
    }

    const { error: updateError } = await admin
      .from("partner_members")
      .update({
        deactivated_at: active ? null : new Date().toISOString(),
      })
      .eq("partner_id", partnerId)
      .eq("id", memberId);
    if (updateError) return { ok: false, error: "unavailable" };
    return { ok: true };
  } catch {
    return { ok: false, error: "unavailable" };
  }
}
