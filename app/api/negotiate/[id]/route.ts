import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  const { data: outreach } = await supabase
    .from("negotiation_outreach")
    .select("*")
    .eq("negotiation_id", id)
    .order("created_at", { ascending: true });

  // The ai_* columns ship in 2026-07-16-inbound-ai-parse.sql (founder-
  // applied); until it lands, selecting them errors the whole query — so
  // retry with the legacy column list rather than blanking the messages
  // panel on a pre-migration schema.
  const MESSAGE_COLS =
    "id, outreach_id, direction, from_address, subject, body_text, created_at";
  let messages: Record<string, unknown>[] | null = null;
  {
    const withAi = await supabase
      .from("negotiation_messages")
      .select(
        `${MESSAGE_COLS}, ai_quote_cents, ai_quote_items, ai_parse_confidence, ai_confirmed_at`,
      )
      .eq("negotiation_id", id)
      .order("created_at", { ascending: true });
    messages = withAi.data;
    if (!messages) {
      const legacy = await supabase
        .from("negotiation_messages")
        .select(MESSAGE_COLS)
        .eq("negotiation_id", id)
        .order("created_at", { ascending: true });
      messages = legacy.data;
    }
  }

  return NextResponse.json({
    negotiation: neg,
    outreach: outreach ?? [],
    messages: messages ?? [],
  });
}
