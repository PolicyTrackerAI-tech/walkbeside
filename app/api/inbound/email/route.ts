import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";
import { notifyFamilyOfReply } from "@/lib/negotiation/notify-family-of-reply";

export const runtime = "nodejs";

/**
 * Postmark Inbound webhook.
 *
 * MX records on reply.honestfuneral.co point at Postmark. When a funeral
 * home replies to `advocate+{negotiationId}@reply.honestfuneral.co`,
 * Postmark POSTs the parsed message here.
 *
 * Auth: Basic Auth via POSTMARK_INBOUND_USER + POSTMARK_INBOUND_SECRET
 * (configured in Postmark's server settings as the webhook URL with
 * `https://user:pass@app.honestfuneral.co/api/inbound/email`).
 *
 * Dedup: negotiation_messages.inbound_message_id has a unique partial
 * index, so Postmark retries won't insert duplicates.
 */

interface PostmarkInbound {
  From?: string;
  FromFull?: { Email?: string; Name?: string };
  To?: string;
  ToFull?: Array<{ Email?: string; Name?: string; MailboxHash?: string }>;
  MailboxHash?: string;
  MessageID?: string;
  Subject?: string;
  TextBody?: string;
  HtmlBody?: string;
  Date?: string;
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  const expectedUser = requireServer("POSTMARK_INBOUND_USER");
  const expectedSecret = requireServer("POSTMARK_INBOUND_SECRET");
  const expected =
    "Basic " +
    Buffer.from(`${expectedUser}:${expectedSecret}`).toString("base64");
  if (authHeader !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let payload: PostmarkInbound;
  try {
    payload = (await req.json()) as PostmarkInbound;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  // Plus-addressed local part — e.g. `advocate+abc-uuid@reply.honestfuneral.co`
  // → MailboxHash = `abc-uuid`. Postmark also exposes per-recipient hash in
  // ToFull[0].MailboxHash; prefer the recipient-specific one when set.
  const negotiationId =
    payload.ToFull?.[0]?.MailboxHash || payload.MailboxHash || "";
  const fromAddress = payload.FromFull?.Email || payload.From || "";
  const toAddress = payload.ToFull?.[0]?.Email || payload.To || "";
  const inboundMessageId = payload.MessageID || "";

  if (!negotiationId) {
    // 200 so Postmark doesn't retry, but log for visibility — these are
    // typically replies to a non-plus-addressed inbox (someone manually
    // emailing arrangements@) or spam.
    console.warn(
      `[inbound] no negotiationId in to=${toAddress} from=${fromAddress} msgId=${inboundMessageId}`,
    );
    return NextResponse.json({ accepted: false, reason: "no_negotiation_id" });
  }

  const admin = createClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );

  // Verify the negotiation exists; ignore otherwise.
  const { data: neg } = await admin
    .from("negotiations")
    .select("id")
    .eq("id", negotiationId)
    .single();
  if (!neg) {
    console.warn(
      `[inbound] negotiation not found id=${negotiationId} from=${fromAddress}`,
    );
    return NextResponse.json({ accepted: false, reason: "unknown_negotiation" });
  }

  // Best-effort match the sender to a known outreach row so the message
  // attaches to the right FD. If no match, outreach_id stays null; Sister
  // can manually link via SQL editor.
  let outreachId: string | null = null;
  if (fromAddress) {
    const { data: match } = await admin
      .from("negotiation_outreach")
      .select("id")
      .eq("negotiation_id", negotiationId)
      .ilike("home_email", fromAddress)
      .limit(1)
      .maybeSingle();
    outreachId = match?.id ?? null;
  }

  const insert = {
    negotiation_id: negotiationId,
    outreach_id: outreachId,
    direction: "inbound_fd" as const,
    from_address: fromAddress || null,
    to_address: toAddress || null,
    subject: payload.Subject ?? null,
    body_text: payload.TextBody ?? null,
    body_html: payload.HtmlBody ?? null,
    raw_payload: payload as unknown as Record<string, unknown>,
    inbound_provider: "postmark",
    inbound_message_id: inboundMessageId || null,
  };

  const { error } = await admin.from("negotiation_messages").insert(insert);
  if (error) {
    // Unique-violation on inbound_message_id = retry of an already-stored
    // message. Treat as success.
    if (error.code === "23505") {
      return NextResponse.json({ accepted: true, deduped: true });
    }
    console.error(`[inbound] insert failed: ${error.message}`);
    return NextResponse.json({ error: "insert_failed" }, { status: 500 });
  }

  console.info(
    `[inbound] stored msg neg=${negotiationId} from=${fromAddress} outreach=${outreachId ?? "unmatched"}`,
  );

  // Best-effort family notification — failure here doesn't fail the webhook
  // since the message is already stored and will surface on /status next refresh.
  let fromHomeName = "A funeral home";
  if (outreachId) {
    const { data: oRow } = await admin
      .from("negotiation_outreach")
      .select("home_name")
      .eq("id", outreachId)
      .single();
    if (oRow?.home_name) fromHomeName = oRow.home_name;
  }
  const notify = await notifyFamilyOfReply({
    admin,
    negotiationId,
    fromHomeName,
  });
  console.info(
    `[inbound] family notify neg=${negotiationId} reason=${notify.reason} sent=${notify.sent}`,
  );

  return NextResponse.json({
    accepted: true,
    outreach_matched: !!outreachId,
    family_notified: notify.sent,
  });
}
