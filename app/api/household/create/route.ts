import { NextResponse } from "next/server";
import { readLimitedJson } from "@/lib/http-guards";
import { rateLimit } from "@/lib/rate-limit";
import {
  householdAvailable,
  serviceClient,
  isValidPayload,
} from "../service";

/**
 * POST /api/household/create  { payload }
 * → { id, ownerSecret, url }
 *
 * Creates the durable family-view slug. ownerSecret is returned exactly once
 * — the creating device stores it; it never appears in the shared URL or any
 * read response. Anonymous by design (the tools it snapshots are
 * account-free), so rate-limited by IP.
 */
export async function POST(req: Request) {
  if (!householdAvailable())
    return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = rateLimit(`household-create:${ip}`, { limit: 5, windowMs: 60 * 60_000 });
  if (!rl.ok)
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const limited = await readLimitedJson<{ payload?: unknown }>(req, 300);
  if (!limited.ok)
    return NextResponse.json({ error: limited.error }, { status: limited.status });
  if (!isValidPayload(limited.data.payload))
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const { data, error } = await serviceClient()
    .from("household_links")
    .insert({ payload: limited.data.payload })
    .select("id, owner_secret")
    .single();
  if (error || !data)
    return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const origin = req.headers.get("origin") ?? "https://honestfuneral.co";
  return NextResponse.json({
    id: data.id,
    ownerSecret: data.owner_secret,
    url: `${origin}/household/${data.id}`,
  });
}
