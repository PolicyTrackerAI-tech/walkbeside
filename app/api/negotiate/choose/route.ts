import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";
import { notifyChosenHome } from "@/lib/negotiation/notify-chosen-home";

/**
 * Family picks a home from their results. Under the upfront-pay model the $49
 * was already charged at /preview, so choosing costs NOTHING more — we just
 * notify the chosen home and close the negotiation.
 *
 * Form POST from the results page so it works without JS.
 */
export async function POST(req: Request) {
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

  // Must have already paid (outreach sent) — not still on the teaser.
  if (neg.status === "pending_payment") {
    return NextResponse.redirect(
      new URL(`/negotiate/${negotiationId}/preview`, req.url),
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
