/**
 * SMS sending via the Twilio REST API — fetch only, no SDK dependency.
 * Mirrors lib/email.ts: without credentials it dry-run logs, so every flow
 * stays exercisable before the founder sets up Twilio. Used ONLY for the
 * opt-in bereavement check-ins; cost is ours, never the family's.
 */

import { maskPhone } from "./observability";

export function smsAvailable(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_FROM,
  );
}

/**
 * Loose E.164 normalization for US-typical input ("(801) 555-0142",
 * "801-555-0142", "+1 801 555 0142"). Returns null when it can't be made
 * into a plausible number — we never guess.
 */
export function normalizePhone(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const digits = raw.replace(/[^\d+]/g, "");
  if (/^\+1\d{10}$/.test(digits)) return digits;
  if (/^1\d{10}$/.test(digits)) return `+${digits}`;
  if (/^\d{10}$/.test(digits)) return `+1${digits}`;
  if (/^\+\d{8,15}$/.test(digits)) return digits; // non-US E.164 passthrough
  return null;
}

export async function sendSms(msg: {
  to: string;
  body: string;
}): Promise<{ id: string }> {
  if (!smsAvailable()) {
    const id = `smsdry_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    // eslint-disable-next-line no-console
    console.log("[sms:dryrun]", id, {
      to: maskPhone(msg.to),
      chars: msg.body.length,
    });
    return { id };
  }
  const sid = process.env.TWILIO_ACCOUNT_SID as string;
  const token = process.env.TWILIO_AUTH_TOKEN as string;
  const from = process.env.TWILIO_FROM as string;
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: msg.to, From: from, Body: msg.body }),
    },
  );
  if (!res.ok) {
    throw new Error(`twilio_${res.status}`);
  }
  const data = (await res.json()) as { sid?: string };
  return { id: data.sid ?? "unknown" };
}
