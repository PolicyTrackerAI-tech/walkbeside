import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer, FEATURES } from "@/lib/env";
import { readLimitedJson } from "@/lib/http-guards";
import { sendEmail } from "@/lib/email";
import { BRAND } from "@/lib/brand";

const Body = z.object({
  /** The hospice being nominated (finder-prefilled or typed). */
  hospice: z.string().min(2).max(160),
  city: z.string().max(80).optional(),
  state: z.string().max(40).optional(),
  note: z.string().max(600).optional(),
  email: z.string().email().max(254).optional(),
  /** The explicit "OK to contact me about this" checkbox. */
  contactOk: z.boolean().optional(),
});

export type NominateBody = z.infer<typeof Body>;

/**
 * Map a validated nominate body to the `partner_leads` insert row. Pure and
 * exported for tests. Channel-survival invariants live here:
 *
 * - The submitter's email is kept ONLY when the explicit consent box was
 *   checked — otherwise it is dropped even if provided (defense-in-depth
 *   against a client that renders the field without the checkbox).
 * - `email` falls back to "" because partner_leads.email is NOT NULL and a
 *   nomination is valid with no contact info at all.
 */
export function buildNominationLead(data: NominateBody): {
  org: string;
  email: string;
  note: string | null;
  source: "family_nomination";
} {
  const location = [data.city?.trim(), data.state?.trim()]
    .filter(Boolean)
    .join(", ");
  const note = [location ? `Location: ${location}` : null, data.note?.trim() || null]
    .filter(Boolean)
    .join("\n");
  return {
    org: data.hospice.trim(),
    email: data.contactOk === true ? (data.email?.trim() ?? "") : "",
    note: note || null,
    source: "family_nomination",
  };
}

/**
 * POST /api/partner/nominate — loop #1's consented half: a family (or friend)
 * asks us to note that their hospice should offer the tools. Writes a
 * `partner_leads` row (source `family_nomination`) and notifies the founder
 * internally.
 *
 * This route NEVER emails the nominated hospice and NEVER emails the family —
 * the only send is the internal founder notification to BRAND.supportEmail.
 * The family-driven path (the prefilled intro on /tell-your-hospice) goes
 * through the family's own mail client; it never touches this route.
 *
 * Rate-limited by the proxy via RATE_LIMITS["/api/partner/nominate"].
 */
export async function POST(req: Request) {
  const limited = await readLimitedJson(req, 10);
  if (!limited.ok)
    return NextResponse.json({ error: limited.error }, { status: limited.status });
  const parsed = Body.safeParse(limited.data);
  if (!parsed.success)
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });

  const lead = buildNominationLead(parsed.data);

  // (a) Persist the lead (best-effort; the email below is the fallback).
  let persisted = false;
  if (FEATURES.supabase()) {
    try {
      const svc = createServiceClient(
        PUBLIC.supabaseUrl,
        requireServer("SUPABASE_SERVICE_ROLE_KEY"),
      );
      const { error } = await svc.from("partner_leads").insert(lead);
      persisted = !error;
    } catch {
      // persisted stays false.
    }
  }

  // (b) Internal founder notification — never the hospice, never the family.
  let emailed = false;
  try {
    await sendEmail({
      to: BRAND.supportEmail,
      subject: `Hospice nomination: ${lead.org}`,
      text: [
        `A family nominated a hospice to offer the tools (no partners row created — this is a lead).`,
        ``,
        `Hospice: ${lead.org}`,
        lead.note ? lead.note : ``,
        lead.email
          ? `Submitter (consented to contact): ${lead.email}`
          : `Submitter: no contact info left (or no consent) — do not follow up with anyone.`,
      ]
        .filter(Boolean)
        .join("\n"),
    });
    emailed = true;
  } catch {
    // emailed stays false — the row above is the fallback.
  }

  if (!persisted && !emailed)
    return NextResponse.json({ error: "unavailable" }, { status: 503 });

  return NextResponse.json({ ok: true });
}
