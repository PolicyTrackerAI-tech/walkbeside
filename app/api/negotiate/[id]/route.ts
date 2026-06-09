import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { stripe, stripeAvailable } from "@/lib/stripe";
import { PUBLIC, requireServer } from "@/lib/env";
import { sendOutreachForNegotiation } from "@/lib/negotiation/send";
import { logEvent, captureError } from "@/lib/observability";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });

  const { data: neg, error } = await supabase
    .from("negotiations")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (error || !neg)
    return NextResponse.json({ error: error?.message ?? "not_found" }, { status: 404 });

  // Self-heal: if the family paid but the webhook hasn't sent the outreach yet
  // (delayed/missed), verify the stored checkout session and send now. The
  // status page polls this route, so this runs automatically. Idempotent.
  if (
    neg.status === "pending_payment" &&
    neg.stripe_payment_intent_id &&
    stripeAvailable()
  ) {
    try {
      const session = await stripe().checkout.sessions.retrieve(
        neg.stripe_payment_intent_id,
      );
      if (session.payment_status === "paid") {
        const admin = createServiceClient(
          PUBLIC.supabaseUrl,
          requireServer("SUPABASE_SERVICE_ROLE_KEY"),
        );
        const result = await sendOutreachForNegotiation(admin, id);
        neg.status = "contacting";
        logEvent("negotiate.reconcile_sent", { negotiationId: id, ...result });
      }
    } catch (e) {
      // Retrieval/send failed — the webhook is the primary path, so don't page;
      // just record it. (send.ts already alerts on per-email send failures.)
      await captureError("negotiate.reconcile_failed", e, { negotiationId: id }, {
        alert: false,
      });
    }
  }

  const { data: outreach } = await supabase
    .from("negotiation_outreach")
    .select("*")
    .eq("negotiation_id", id)
    .order("created_at", { ascending: true });

  const { data: messages } = await supabase
    .from("negotiation_messages")
    .select(
      "id, outreach_id, direction, from_address, subject, body_text, created_at",
    )
    .eq("negotiation_id", id)
    .order("created_at", { ascending: true });

  return NextResponse.json({
    negotiation: neg,
    outreach: outreach ?? [],
    messages: messages ?? [],
  });
}
