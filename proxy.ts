import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const SUPPRESS_COOKIE = "commercial_suppression_until";
const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

export async function proxy(request: NextRequest) {
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
