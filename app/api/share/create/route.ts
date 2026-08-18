import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { readLimitedJson } from "@/lib/http-guards";
import { rateLimit, clientIp } from "@/lib/rate-limit";

/**
 * POST /api/share/create
 *
 * Body: { payload: object }  — JSON snapshot of relevant sessionStorage
 * keys (decide answers, negotiate-wizard state, etc.). Client controls
 * shape; server stores opaquely.
 *
 * Returns: { id, shareUrl }
 *
 * No auth — anonymous share by UUID. RLS policy on share_links allows
 * insert for anon role.
 */
export async function POST(req: Request) {
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

  const supabase = await createClient();
  const { data, error } = await supabase
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
