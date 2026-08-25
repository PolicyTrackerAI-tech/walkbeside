import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { RATE_LIMITS, rateLimit, clientIp } from "@/lib/rate-limit";

export async function proxy(request: NextRequest) {
  // Best-effort, per-instance rate limiting on the hottest POST endpoints
  // (see lib/rate-limit.ts). Runs before the Supabase session refresh so a
  // flood is rejected cheaply.
  if (request.method === "POST") {
    const rule = RATE_LIMITS[request.nextUrl.pathname];
    if (rule) {
      const key = `${clientIp(request.headers)}:${request.nextUrl.pathname}`;
      const rl = rateLimit(key, rule);
      if (!rl.ok) {
        return NextResponse.json(
          { error: "rate_limited" },
          {
            status: 429,
            headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) },
          },
        );
      }
    }
  }

  // (Audit A9: the commercial_suppression_until cookie block that lived here
  // was removed with the rest of the suppression chain — it was written on
  // /guidance/home-unexpected visits but NOTHING ever read it, and the
  // feature's premise (suppressing paid upsells after a traumatic scenario)
  // died with the consumer fee. Every CTA is free help now; tone rules
  // govern instead.)
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
