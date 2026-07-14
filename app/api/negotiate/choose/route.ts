import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";
import { notifyChosenHome } from "@/lib/negotiation/notify-chosen-home";
import { validateOrigin } from "@/lib/http-guards";

/**
 * Family picks a home from their results. Free to families — choosing
 * costs NOTHING; we just notify the chosen home and close the negotiation.
 *
 * Form POST from the results page so it works without JS.
 */
export async function POST(req: Request) {
  if (!validateOrigin(req))
    return NextResponse.json({ error: "bad_origin" }, { status: 403 });

  const form = await req.formData();
  const negotiationId = String(form.get("negotiationId") ?? "");
  const outreachId = String(form.get("outreachId") ?? "");
  if (!negotiationId || !outreachId)
    return NextResponse.json({ error: "missing" }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  const { data: neg } = await supabase
    .from("negotiations")
    .select("id, user_id, status")
    .eq("id", negotiationId)
    .eq("user_id", user.id)
    .single();
  if (!neg) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // Outreach must have run before a home can be chosen. "preparing" only
  // survives if the send failed mid-request (it normally flips to
  // "contacting" in the same request that created the row); the status page
  // is where that case recovers. "pending_payment" is the legacy label.
  if (neg.status === "preparing" || neg.status === "pending_payment") {
    return NextResponse.redirect(
      new URL(`/negotiate/${negotiationId}/status`, req.url),
      { status: 303 },
    );
  }

  const admin = createServiceClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );

  // Close + notify the chosen home. Conditional update prevents a duplicate
  // notification if the family double-submits.
  const { data: updated } = await admin
    .from("negotiations")
    .update({ status: "closed" })
    .eq("id", negotiationId)
    .neq("status", "closed")
    .select("id");
  if (updated && updated.length > 0) {
    // Record the family's own pick on the outreach row (same column the
    // admin back-office uses; the partial unique index allows one chosen row
    // per negotiation). Best-effort — closing and notifying must not fail
    // over the marker.
    try {
      await admin
        .from("negotiation_outreach")
        .update({ chosen: true })
        .eq("id", outreachId)
        .eq("negotiation_id", negotiationId);
    } catch {
      // ignore
    }
    const result = await notifyChosenHome({ admin, negotiationId, outreachId });
    console.info(
      `[choose] notifyChosenHome neg=${negotiationId} reason=${result.reason} sent=${result.sent}`,
    );
  }

  return NextResponse.redirect(
    new URL(`/negotiate/${negotiationId}/closed?included=1`, req.url),
    { status: 303 },
  );
}
