import { NextResponse } from "next/server";
import { readLimitedJson } from "@/lib/http-guards";
import { rateLimit } from "@/lib/rate-limit";
import { householdAvailable, serviceClient, authorizeOwner } from "../service";

/**
 * POST /api/household/rotate  { id, ownerSecret }
 * → { id, ownerSecret, url }
 *
 * Security rotation for a sensitive URL: mint a NEW slug + secret carrying
 * the current payload, and revoke the old row in the same breath. Anyone
 * still holding the old link sees the expired page; the family re-shares the
 * new one.
 */
export async function POST(req: Request) {
  if (!householdAvailable())
    return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = rateLimit(`household-rotate:${ip}`, { limit: 10, windowMs: 60 * 60_000 });
  if (!rl.ok)
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const limited = await readLimitedJson<{ id?: unknown; ownerSecret?: unknown }>(
    req,
    10,
  );
  if (!limited.ok)
    return NextResponse.json({ error: limited.error }, { status: limited.status });

  const auth = await authorizeOwner(limited.data.id, limited.data.ownerSecret);
  if (!auth.ok)
    return NextResponse.json(
      { error: auth.error },
      { status: auth.error === "revoked" ? 403 : 404 },
    );

  const svc = serviceClient();
  const { data: old } = await svc
    .from("household_links")
    .select("payload")
    .eq("id", auth.row.id)
    .single();

  const { data: fresh, error } = await svc
    .from("household_links")
    .insert({ payload: old?.payload ?? {}, rotated_from: auth.row.id })
    .select("id, owner_secret")
    .single();
  if (error || !fresh)
    return NextResponse.json({ error: "unavailable" }, { status: 503 });

  await svc
    .from("household_links")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", auth.row.id);

  const origin = req.headers.get("origin") ?? "https://honestfuneral.co";
  return NextResponse.json({
    id: fresh.id,
    ownerSecret: fresh.owner_secret,
    url: `${origin}/household/${fresh.id}`,
  });
}
