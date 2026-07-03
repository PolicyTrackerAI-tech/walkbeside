import { NextResponse } from "next/server";
import { readLimitedJson } from "@/lib/http-guards";
import { rateLimit } from "@/lib/rate-limit";
import { householdAvailable, serviceClient, authorizeOwner } from "../service";

/**
 * POST /api/household/revoke  { id, ownerSecret }
 *
 * Kills the link immediately. Idempotent from the owner's point of view —
 * revoking an already-revoked link reports ok.
 */
export async function POST(req: Request) {
  if (!householdAvailable())
    return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = rateLimit(`household-revoke:${ip}`, { limit: 20, windowMs: 60 * 60_000 });
  if (!rl.ok)
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const limited = await readLimitedJson<{ id?: unknown; ownerSecret?: unknown }>(
    req,
    10,
  );
  if (!limited.ok)
    return NextResponse.json({ error: limited.error }, { status: limited.status });

  const auth = await authorizeOwner(limited.data.id, limited.data.ownerSecret);
  if (!auth.ok) {
    if (auth.error === "revoked") return NextResponse.json({ ok: true });
    return NextResponse.json({ error: auth.error }, { status: 404 });
  }

  const { error } = await serviceClient()
    .from("household_links")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", auth.row.id);
  if (error)
    return NextResponse.json({ error: "unavailable" }, { status: 503 });

  return NextResponse.json({ ok: true });
}
