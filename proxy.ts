import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { RATE_LIMITS, rateLimit, clientIp } from "@/lib/rate-limit";

const SUPPRESS_COOKIE = "commercial_suppression_until";
const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

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

  const response = await updateSession(request);

  if (request.nextUrl.pathname === "/guidance/home-unexpected") {
    const until = Date.now() + FOUR_HOURS_MS;
    response.cookies.set(SUPPRESS_COOKIE, String(until), {
      path: "/",
      maxAge: FOUR_HOURS_MS / 1000,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
