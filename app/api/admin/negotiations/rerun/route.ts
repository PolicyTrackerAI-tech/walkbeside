import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";
import { requireAdminApi } from "@/lib/admin-auth";
import { readLimitedJson } from "@/lib/http-guards";
import { sendOutreachForNegotiation } from "@/lib/negotiation/send";
import {
  familyHeldPreDeath,
  homeHeldPreDeath,
  isPreDeath,
} from "@/lib/negotiation/pre-death-gate";

const Body = z.object({ negotiationId: z.string().uuid() });

/**
 * Founder re-run of a prepared-only case (audit A2-09 → A5). Cases created
 * while OUTREACH_LIVE was off record terminal `dry_run` outreach rows, and
 * `sendOutreachForNegotiation` only ever processes `pending` — so a family
 * who completed the flow before go-live stays prepared-only forever without
 * this. Resets that case's dry_run rows to pending and re-invokes THE one
 * gated send path.
 *
 * Kill-switch integrity: this route sends nothing itself. With OUTREACH_LIVE
 * off the re-run simply re-records dry_run (harmless, idempotent); only the
 * env flip — a founder deploy action — can make real mail leave. Directory
 * vetting and the denylist re-check all still apply inside the send path.
 *
 * The Virginia pre-death gate applies here too, because this route is the
 * one path that turns an existing row back into a sendable one. The intake
 * form's timing answer isn't stored, so "before a death" means the family's
 * profile has no date of death (or it can't be read). A held family's case
 * resets nothing; a held home's row stays dry_run. A row whose home can't be
 * found in the directory counts as held.
 */
export async function POST(req: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const limited = await readLimitedJson(req, 10);
  if (!limited.ok)
    return NextResponse.json({ error: limited.error }, { status: limited.status });
  const parsed = Body.safeParse(limited.data);
  if (!parsed.success)
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });

  const svc = createServiceClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );

  const negotiationId = parsed.data.negotiationId;
  const { data: neg, error: negErr } = await svc
    .from("negotiations")
    .select("zip, user_id")
    .eq("id", negotiationId)
    .maybeSingle();
  if (negErr)
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  if (!neg) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { data: profile, error: profileErr } = await svc
    .from("profiles")
    .select("date_of_death")
    .eq("id", neg.user_id)
    .maybeSingle();
  const preDeath = isPreDeath({
    dateOfDeath: profileErr ? null : (profile?.date_of_death ?? null),
  });
  if (familyHeldPreDeath(neg.zip, preDeath))
    return NextResponse.json({ ok: true, reset: 0, note: "pre-death hold" });

  let heldIds: string[] = [];
  if (preDeath) {
    const { data: rows, error: rowsErr } = await svc
      .from("negotiation_outreach")
      .select("id, home_email")
      .eq("negotiation_id", negotiationId)
      .eq("status", "dry_run");
    if (rowsErr)
      return NextResponse.json({ error: "unavailable" }, { status: 503 });
    const emails = (rows ?? [])
      .map((r) => r.home_email)
      .filter((e): e is string => typeof e === "string" && e.length > 0);
    const { data: homes, error: homesErr } = emails.length
      ? await svc.from("funeral_homes").select("email, state, zip").in("email", emails)
      : { data: [], error: null };
    if (homesErr)
      return NextResponse.json({ error: "unavailable" }, { status: 503 });
    const byEmail = new Map(
      (homes ?? []).map((h) => [String(h.email).toLowerCase(), h]),
    );
    heldIds = (rows ?? [])
      .filter((r) => homeHeldPreDeath(byEmail.get(String(r.home_email ?? "").toLowerCase()) ?? {}))
      .map((r) => r.id);
  }

  let resetQuery = svc
    .from("negotiation_outreach")
    .update({ status: "pending" })
    .eq("negotiation_id", negotiationId)
    .eq("status", "dry_run");
  if (heldIds.length) resetQuery = resetQuery.not("id", "in", `(${heldIds.join(",")})`);
  const { data: reset, error } = await resetQuery.select("id");
  if (error)
    return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const resetCount = (reset ?? []).length;
  if (resetCount === 0)
    return NextResponse.json({
      ok: true,
      reset: 0,
      held: heldIds.length,
      note: heldIds.length ? "pre-death hold" : "no dry_run rows",
    });

  const result = await sendOutreachForNegotiation(svc, negotiationId);
  return NextResponse.json({ ok: true, reset: resetCount, held: heldIds.length, result });
}
