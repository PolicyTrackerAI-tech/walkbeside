import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer, FEATURES } from "@/lib/env";
import { requirePartnerApi } from "@/lib/partner/auth";
import { readLimitedJson } from "@/lib/http-guards";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { inviteMember, setMemberActive } from "@/lib/partner/team";

const Body = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("invite"),
    email: z.string().email().max(254),
  }),
  z.object({ action: z.literal("deactivate"), memberId: z.string().uuid() }),
  z.object({ action: z.literal("reactivate"), memberId: z.string().uuid() }),
]);

/**
 * POST /api/portal/team — owner-only seat management for the signed-in
 * portal. invite inserts a member seat (the unique partner+email index
 * dedupes; a duplicate over an ACTIVE seat is success, over a deactivated
 * seat it's a 400 seat_deactivated pointing the owner at Reactivate) and
 * best-effort emails the invitee; deactivate/reactivate toggle
 * deactivated_at, with the last-active-owner rule and the seat cap
 * enforced in lib/partner/team.ts. All lookups are scoped to the caller's
 * own partner_id from the session gate — memberId is never trusted across
 * orgs.
 */
export async function POST(req: Request) {
  if (!FEATURES.supabase())
    return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = rateLimit(`portal-team:${ip}`, {
    limit: 30,
    windowMs: 60 * 60_000,
  });
  if (!rl.ok)
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const gate = await requirePartnerApi("owner");
  if (gate instanceof NextResponse) return gate;
  const { partner, member, email: callerEmail } = gate;

  const limited = await readLimitedJson(req, 10);
  if (!limited.ok)
    return NextResponse.json(
      { error: limited.error },
      { status: limited.status },
    );
  const parsed = Body.safeParse(limited.data);
  if (!parsed.success)
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });

  const svc = createServiceClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );

  if (parsed.data.action === "invite") {
    const result = await inviteMember(svc, partner.id, parsed.data.email);
    if (!result.ok) {
      if (result.error === "unavailable")
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Heads-up to the new teammate — best-effort, never blocks the seat
    // (the seat row is the source of truth; they can sign in regardless).
    if (!result.already) {
      const inviter = callerEmail || member.invited_email;
      try {
        await sendEmail({
          to: parsed.data.email.trim().toLowerCase(),
          subject: `You have been added to the ${partner.name} portal on Honest Funeral`,
          text: [
            `${inviter} added you to ${partner.name}'s Honest Funeral portal.`,
            ``,
            `Sign in here: ${PUBLIC.appUrl}/portal/login`,
            `Use this email address — we'll email you a six-digit code, no password needed.`,
            ``,
            `Inside: your organization's aggregate outcomes report, referral links and QR codes for families, and a quote-check tool. Never any individual family's details.`,
          ].join("\n"),
        });
      } catch {
        // Invite email failed — the seat exists and sign-in still works.
      }
    }

    return NextResponse.json({
      ok: true,
      already: result.already ?? false,
      member: result.member ?? null,
    });
  }

  // deactivate / reactivate
  const result = await setMemberActive(
    svc,
    partner.id,
    parsed.data.memberId,
    parsed.data.action === "reactivate",
  );
  if (!result.ok) {
    if (result.error === "unavailable")
      return NextResponse.json({ error: "unavailable" }, { status: 503 });
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
