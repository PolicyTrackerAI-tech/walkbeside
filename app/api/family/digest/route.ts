import { NextResponse } from "next/server";
import { z } from "zod";
import { readLimitedJson } from "@/lib/http-guards";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import {
  buildDigestEmail,
  validDigestItems,
  MAX_DIGEST_ITEMS,
} from "@/lib/family-digest";

const Body = z.object({
  email: z.string().email().max(254),
  assigneeName: z.string().min(1).max(60),
  senderName: z.string().max(60).optional(),
  items: z.unknown(),
});

/**
 * POST /api/family/digest — one-time, family-initiated hand-off email.
 *
 * The client filters the on-device data down to ONE person's assigned items
 * before calling; the rest of the family's plan never reaches us, and
 * nothing is stored here — format, send, forget. Anonymous by design (the
 * tools are account-free), so rate-limited tightly by IP.
 */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = rateLimit(`family-digest:${ip}`, { limit: 5, windowMs: 60 * 60_000 });
  if (!rl.ok)
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const limited = await readLimitedJson(req, 60);
  if (!limited.ok)
    return NextResponse.json({ error: limited.error }, { status: limited.status });
  const parsed = Body.safeParse(limited.data);
  if (!parsed.success)
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  if (!validDigestItems(parsed.data.items))
    return NextResponse.json(
      { error: `invalid_items_max_${MAX_DIGEST_ITEMS}` },
      { status: 400 },
    );

  const { subject, text } = buildDigestEmail({
    assigneeName: parsed.data.assigneeName,
    senderName: parsed.data.senderName,
    items: parsed.data.items,
  });

  try {
    await sendEmail({ to: parsed.data.email, subject, text });
  } catch {
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
