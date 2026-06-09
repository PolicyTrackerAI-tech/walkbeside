import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";
import { logEvent, logWarn, captureError, sendAlert } from "@/lib/observability";

export const runtime = "nodejs";

/**
 * Resend webhook handler — bounce + complaint events.
 *
 * When a funeral home email hard-bounces (mailbox doesn't exist, domain
 * unreachable, etc.) or marks our message as spam, flip their
 * funeral_homes row to active=false so we stop hammering bad addresses.
 *
 * Setup (Resend dashboard):
 *   1. Webhooks → Add Endpoint
 *   2. URL: https://app.honestfuneral.co/api/inbound/resend-webhook
 *   3. Subscribe to events: email.bounced, email.complained
 *   4. Copy the signing secret (starts with "whsec_") into
 *      RESEND_WEBHOOK_SECRET env var in Vercel.
 *
 * Signature verification follows the Svix HMAC pattern Resend uses.
 */

interface ResendBounceEvent {
  type:
    | "email.bounced"
    | "email.complained"
    | "email.delivered"
    | "email.sent"
    | "email.opened"
    | "email.clicked"
    | "email.delivery_delayed"
    | "email.failed";
  created_at?: string;
  data?: {
    email_id?: string;
    from?: string;
    to?: string[] | string;
    subject?: string;
    bounce?: {
      type?: "Permanent" | "Transient" | "Undetermined";
      subType?: string;
      message?: string;
    };
  };
}

function verifySvixSignature(
  payload: string,
  id: string | null,
  timestamp: string | null,
  signatureHeader: string | null,
  rawSecret: string,
): boolean {
  if (!id || !timestamp || !signatureHeader) return false;
  const secret = rawSecret.replace(/^whsec_/, "");
  let secretBytes: Buffer;
  try {
    secretBytes = Buffer.from(secret, "base64");
  } catch {
    return false;
  }
  const toSign = `${id}.${timestamp}.${payload}`;
  const computed = crypto
    .createHmac("sha256", secretBytes)
    .update(toSign)
    .digest("base64");
  const expected = `v1,${computed}`;
  // Resend may include multiple signatures space-separated; any match passes
  return signatureHeader
    .split(" ")
    .some((sig) => sig.trim() === expected);
}

export async function POST(req: Request) {
  const payload = await req.text();
  const id = req.headers.get("svix-id");
  const timestamp = req.headers.get("svix-timestamp");
  const signature = req.headers.get("svix-signature");

  const secret = requireServer("RESEND_WEBHOOK_SECRET");
  if (!verifySvixSignature(payload, id, timestamp, signature, secret)) {
    logWarn("resend.webhook.bad_signature", { svixId: id });
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let event: ResendBounceEvent;
  try {
    event = JSON.parse(payload) as ResendBounceEvent;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  // We only act on permanent bounces + spam complaints. Transient bounces
  // (mailbox full, temporarily unreachable) recover on their own.
  const isHardBounce =
    event.type === "email.bounced" &&
    event.data?.bounce?.type === "Permanent";
  const isComplaint = event.type === "email.complained";

  if (!isHardBounce && !isComplaint) {
    return NextResponse.json({ accepted: true, action: "ignored" });
  }

  const recipients = Array.isArray(event.data?.to)
    ? event.data.to
    : event.data?.to
      ? [event.data.to]
      : [];
  if (recipients.length === 0) {
    return NextResponse.json({ accepted: true, action: "no_recipients" });
  }

  const admin = createClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );

  const reason = isHardBounce ? "hard_bounce" : "spam_complaint";
  const flipped: string[] = [];

  for (const recipient of recipients) {
    const email = recipient.trim();
    if (!email) continue;
    const { data, error } = await admin
      .from("funeral_homes")
      .update({ active: false })
      .ilike("email", email)
      .select("id, name, email");
    if (error) {
      await captureError(
        "resend.webhook.deactivate_failed",
        error,
        { email, reason },
        { alert: false },
      );
      continue;
    }
    if (data && data.length > 0) {
      flipped.push(email);
      logEvent("resend.webhook.home_deactivated", {
        reason,
        email,
        matched: data.length,
      });
    }
  }

  // A home going dark on us is worth a heads-up so the directory stays healthy.
  if (flipped.length > 0) {
    await sendAlert("warn", "Funeral home deactivated (bounce/complaint)", {
      reason,
      emails: flipped,
    });
  }

  return NextResponse.json({
    accepted: true,
    reason,
    flipped_count: flipped.length,
    event_id: event.data?.email_id,
  });
}
