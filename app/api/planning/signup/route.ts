import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { FEATURES } from "@/lib/env";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const zip = typeof body?.zip === "string" ? body.zip.trim().slice(0, 10) : null;

  if (!EMAIL.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  if (!FEATURES.supabase()) {
    // Dev fallback: accept, but nothing is stored.
    return NextResponse.json({ ok: true, stored: false });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "";
  const ipHash = ip ? crypto.createHash("sha256").update(ip).digest("hex") : null;
  const userAgent = request.headers.get("user-agent")?.slice(0, 500) ?? null;

  const supabase = await createClient();
  const { error } = await supabase.from("planning_signups").insert({
    email,
    source: "cheatsheet",
    zip,
    ip_hash: ipHash,
    user_agent: userAgent,
  });

  if (error && !error.message?.toLowerCase().includes("duplicate")) {
    return NextResponse.json(
      { error: "Couldn't save. Try again in a moment." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, stored: true });
}
