import { NextResponse } from "next/server";
import { readLimitedJson } from "@/lib/http-guards";
import { rateLimit } from "@/lib/rate-limit";
import {
  householdAvailable,
  serviceClient,
  authorizeOwner,
  isValidPayload,
} from "../service";

/**
 * POST /api/household/update  { id, ownerSecret, payload }
 *
 * Owner re-publish: replaces the snapshot and rolls the expiry forward
 * 30 days. This is what makes the link "live" — the point person's device
 * calls it (debounced) whenever the tools save.
 */
export async function POST(req: Request) {
  if (!householdAvailable())
    return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = rateLimit(`household-update:${ip}`, { limit: 60, windowMs: 60 * 60_000 });
  if (!rl.ok)
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const limited = await readLimitedJson<{
    id?: unknown;
    ownerSecret?: unknown;
    payload?: unknown;
  }>(req, 300);
  if (!limited.ok)
    return NextResponse.json({ error: limited.error }, { status: limited.status });
  if (!isValidPayload(limited.data.payload))
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const auth = await authorizeOwner(limited.data.id, limited.data.ownerSecret);
  if (!auth.ok)
    return NextResponse.json(
      { error: auth.error },
      { status: auth.error === "revoked" ? 403 : 404 },
    );

  const { error } = await serviceClient()
    .from("household_links")
    .update({
      payload: limited.data.payload,
      updated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60_000).toISOString(),
    })
    .eq("id", auth.row.id);
  if (error)
    return NextResponse.json({ error: "unavailable" }, { status: 503 });

  return NextResponse.json({ ok: true });
}
