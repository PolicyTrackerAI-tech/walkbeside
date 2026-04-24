import { NextResponse, type NextRequest } from "next/server";

const SUPPRESS_COOKIE = "commercial_suppression_until";
const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  if (req.nextUrl.pathname === "/guidance/home-unexpected") {
    const until = Date.now() + FOUR_HOURS_MS;
    res.cookies.set(SUPPRESS_COOKIE, String(until), {
      path: "/",
      maxAge: FOUR_HOURS_MS / 1000,
      sameSite: "lax",
    });
  }

  return res;
}

export const config = {
  matcher: ["/guidance/:path*"],
};
