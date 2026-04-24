import { NextResponse, type NextRequest } from "next/server";

const SAFE_PATH = /^\/[a-zA-Z0-9/_-]*$/;

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const raw = String(form.get("next") ?? "/prices");
  const next = SAFE_PATH.test(raw) ? raw : "/prices";

  const response = NextResponse.redirect(new URL(next, request.url), 303);
  response.cookies.delete("commercial_suppression_until");
  return response;
}
