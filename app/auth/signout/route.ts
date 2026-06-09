import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateOrigin } from "@/lib/http-guards";

export async function POST(request: Request) {
  if (!validateOrigin(request))
    return NextResponse.json({ error: "bad_origin" }, { status: 403 });
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
