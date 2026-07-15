import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { tierForZip } from "@/lib/benchmarks-store";

/**
 * GET /api/benchmarks/tier?zip=84101 → { tier, n, itemCount, lastUpdated }
 *
 * Public by design: the tier label is aggregate provenance metadata (which
 * data tier a zip's fair ranges come from), no family data anywhere near it.
 * Client components fetch it to upgrade the static "modeled" fallback from
 * dataSourceForZip().
 */

const MODELED = { tier: "modeled", n: null, itemCount: 0, lastUpdated: null };

export async function GET(req: Request) {
  // Throttled in-route: the proxy rate-limiter (proxy.ts) only guards POSTs,
  // and this is a GET.
  const rl = rateLimit(`${clientIp(req.headers)}:/api/benchmarks/tier`, {
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

  const zip = new URL(req.url).searchParams.get("zip") ?? "";
  if (!/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: "invalid_zip" }, { status: 400 });
  }

  try {
    const tier = await tierForZip(zip);
    return NextResponse.json(tier, {
      headers: { "Cache-Control": "public, max-age=3600" },
    });
  } catch {
    // Never a 500 for a family — the honest floor is the modeled tier.
    return NextResponse.json(MODELED, {
      headers: { "Cache-Control": "public, max-age=3600" },
    });
  }
}
