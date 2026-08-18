import { NextResponse } from "next/server";
import { readLimitedJson } from "@/lib/http-guards";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { serviceClient, shareAvailable } from "../service";

/**
 * POST /api/share/create
 *
 * Body: { payload: object }  — JSON snapshot of relevant sessionStorage
 * keys (decide answers, negotiate-wizard state, etc.). Client controls
 * shape; server stores opaquely.
 *
 * Returns: { id, shareUrl }
 *
 * No account required — anonymous share by UUID. Writes run through the
 * service role because share_links is service-role-only after audit A8
 * (the anon key can no longer read or write the table).
 */
export async function POST(req: Request) {
  if (!shareAvailable())
    return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const ip = clientIp(req.headers);
  const rl = rateLimit(`share-create:${ip}`, { limit: 5, windowMs: 60 * 60_000 });
  if (!rl.ok)
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const limited = await readLimitedJson<{ payload?: unknown }>(req, 100);
  if (!limited.ok)
    return NextResponse.json({ error: limited.error }, { status: limited.status });
  const body = limited.data;

  if (!body.payload || typeof body.payload !== "object") {
    return NextResponse.json(
      { error: "payload must be an object" },
      { status: 400 },
    );
  }

  const { data, error } = await serviceClient()
    .from("share_links")
    .insert({ payload: body.payload })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Could not create share link" },
      { status: 500 },
    );
  }

  const origin = req.headers.get("origin") ?? "https://honestfuneral.co";
  return NextResponse.json({
    id: data.id,
    shareUrl: `${origin}/resume/${data.id}`,
  });
}
