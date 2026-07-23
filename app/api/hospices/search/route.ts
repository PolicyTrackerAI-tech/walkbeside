import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { PUBLIC, requireServer } from "@/lib/env";

/**
 * GET /api/hospices/search?q=trinity → { hospices: [{ ccn, name, city, state }] }
 *
 * Public by design: hospices is the CMS public directory — reference data
 * with no family data anywhere near it. Feeds the /partners apply-form
 * autocomplete and the homepage hospice finder. Matches name OR city (two
 * separate queries merged name-first — deliberately not a PostgREST `.or()`
 * filter, whose value quoting breaks on user input containing commas).
 * Reads go through the service role because the table is RLS deny-all.
 */

const EMPTY = { hospices: [] };

export async function GET(req: Request) {
  // Throttled in-route: the proxy rate-limiter (proxy.ts) only guards POSTs,
  // and this is a GET. Same pattern as /api/benchmarks/tier.
  const rl = rateLimit(`${clientIp(req.headers)}:/api/hospices/search`, {
    limit: 30,
    windowMs: 60_000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) },
      },
    );
  }

  const q = (new URL(req.url).searchParams.get("q") ?? "").trim();
  if (q.length < 2 || q.length > 80) {
    return NextResponse.json({ error: "invalid_query" }, { status: 400 });
  }

  // Escape ilike metacharacters so %/_ can't widen the match — and escape *
  // too, because PostgREST rewrites a bare * in a like/ilike filter value to
  // % before it reaches SQL (same trap as the ingest-gpl home match).
  const pattern = `%${q
    .replace(/[\\%_]/g, (ch) => `\\${ch}`)
    .replace(/\*/g, "\\*")}%`;

  try {
    const svc = createServiceClient(
      PUBLIC.supabaseUrl,
      requireServer("SUPABASE_SERVICE_ROLE_KEY"),
    );
    const [byName, byCity] = await Promise.all([
      svc
        .from("hospices")
        .select("ccn, name, city, state")
        .ilike("name", pattern)
        .order("name")
        .limit(10),
      svc
        .from("hospices")
        .select("ccn, name, city, state")
        .ilike("city", pattern)
        .order("name")
        .limit(10),
    ]);
    if (byName.error) throw byName.error;
    if (byCity.error) throw byCity.error;
    // Name matches outrank city matches; dedupe by CCN; cap at 10.
    const seen = new Set<string>();
    const hospices = [...(byName.data ?? []), ...(byCity.data ?? [])]
      .filter((h) => (seen.has(h.ccn) ? false : (seen.add(h.ccn), true)))
      .slice(0, 10);
    return NextResponse.json(
      { hospices },
      { headers: { "Cache-Control": "public, max-age=3600" } },
    );
  } catch {
    // Pre-migration schema or a transient read failure — an empty list keeps
    // the autocomplete quiet instead of erroring the form (never a 500). But
    // NOT cached: a failure-shaped empty pinned for an hour would keep a
    // query looking blank long after the table (or the connection) recovers.
    return NextResponse.json(EMPTY, {
      headers: { "Cache-Control": "no-store" },
    });
  }
}
