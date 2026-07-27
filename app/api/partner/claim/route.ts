import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer, FEATURES } from "@/lib/env";
import { readLimitedJson } from "@/lib/http-guards";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { BRAND } from "@/lib/brand";
import { getHospiceByCcn, type HospiceRow } from "@/lib/hospice-directory";
import { displayHospiceName } from "@/lib/hospice-display";

const Body = z.object({
  /** CMS certification number — a zero-padded, possibly-alphanumeric STRING
   * ('011500', 'A01640'). NEVER numeric-cast; the leading zeros are
   * load-bearing. */
  ccn: z
    .string()
    .trim()
    .min(4)
    .max(10)
    .regex(/^[0-9A-Za-z]+$/),
  note: z.string().max(600).optional(),
  email: z.string().email().max(254).optional(),
  /** The explicit "OK to contact me about this claim" checkbox. */
  contactOk: z.boolean().optional(),
});

export type ClaimBody = z.infer<typeof Body>;

/**
 * Map a server-resolved hospice + validated claim body to the
 * `partner_leads` insert row. Pure and exported for tests. Invariants
 * (copied from buildNominationLead, both unit-tested):
 *
 * - The org is SERVER-DERIVED from the hospices row — a forged body can't
 *   plant an arbitrary org name in the lead.
 * - The claimant's email is kept ONLY when the explicit consent box was
 *   checked — otherwise dropped even if provided.
 * - `email` falls back to "" because partner_leads.email is NOT NULL and a
 *   claim is valid with no contact info at all.
 */
export function buildClaimLead(
  hospice: Pick<HospiceRow, "ccn" | "name" | "city" | "state">,
  data: ClaimBody,
): {
  org: string;
  email: string;
  note: string;
  source: "hospice_claim";
} {
  const flat = (s: string) => s.replace(/\s*[\r\n]+\s*/g, " ").trim();
  const location = [hospice.city, hospice.state].filter(Boolean).join(", ");
  const header = [`CCN ${hospice.ccn}`, location || null]
    .filter(Boolean)
    .join(" · ");
  const userNote = data.note ? flat(data.note) : "";
  return {
    org: displayHospiceName(hospice.name),
    email: data.contactOk === true ? (data.email?.trim() ?? "") : "",
    note: userNote ? `${header}\n${userNote}` : header,
    source: "hospice_claim",
  };
}

/**
 * POST /api/partner/claim — someone at a hospice claims its directory page
 * (/hospices/[state]/[ccn]). Writes a `partner_leads` row (source
 * `hospice_claim`) and notifies the founder internally. Claiming changes
 * nothing about the page or what families see — it is a lead, not a listing
 * change and not an endorsement.
 *
 * This route NEVER emails the hospice and NEVER emails any family — internal
 * founder notification only. Nothing on this platform ever cold-contacts
 * anyone.
 *
 * Rate-limited twice, mirroring /api/partner/nominate: the proxy's
 * RATE_LIMITS entry (5/min burst guard) plus the in-route hourly cap below —
 * this endpoint sends a founder email and writes a row, so a per-minute-only
 * limit would still allow 300 rows/hour per IP.
 */
export async function POST(req: Request) {
  const rl = rateLimit(`partner-claim:${clientIp(req.headers)}`, {
    limit: 5,
    windowMs: 60 * 60_000,
  });
  if (!rl.ok)
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const limited = await readLimitedJson(req, 10);
  if (!limited.ok)
    return NextResponse.json(
      { error: limited.error },
      { status: limited.status },
    );
  const parsed = Body.safeParse(limited.data);
  if (!parsed.success)
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });

  // Resolve the hospice server-side — unknown CCN means no row, no email.
  const hospice = await getHospiceByCcn(parsed.data.ccn);
  if (!hospice)
    return NextResponse.json({ error: "unknown_ccn" }, { status: 404 });

  const lead = buildClaimLead(hospice, parsed.data);

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

  // (b) Internal founder notification — never the hospice, never any family.
  // Every user-controlled fragment is newline-flattened and label-prefixed so
  // a crafted note can't forge lines that read as route-generated.
  const flat = (s: string) => s.replace(/\s*[\r\n]+\s*/g, " ").trim();
  const location = [hospice.city, hospice.state].filter(Boolean).join(", ");
  const userNote = parsed.data.note?.trim();
  let emailed = false;
  try {
    await sendEmail({
      to: BRAND.supportEmail,
      subject: `Hospice page claim: ${flat(lead.org)}`,
      text: [
        `Someone claimed a hospice's directory page (no partners row created — this is a lead).`,
        ``,
        `Hospice: ${flat(lead.org)}`,
        `CCN: ${hospice.ccn}`,
        location ? `Location: ${flat(location)}` : ``,
        userNote ? `Note: ${flat(userNote)}` : ``,
        lead.email
          ? `Claimant (consented to contact): ${flat(lead.email)}`
          : `Claimant: contact info withheld (or no consent) — do not follow up with anyone.`,
      ]
        .filter(Boolean)
        .join("\n"),
    });
    // A dry-run send (no Resend key) must not count as the fallback having
    // landed — otherwise persist-failure + email-unconfigured returns ok:true
    // while the claim vanishes.
    emailed = FEATURES.email();
  } catch {
    // emailed stays false — the row above is the fallback.
  }

  if (!persisted && !emailed)
    return NextResponse.json({ error: "unavailable" }, { status: 503 });

  return NextResponse.json({ ok: true });
}
