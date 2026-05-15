import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { FEATURES } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import { buildWelcomeEmail } from "@/lib/welcome-email";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const zip = typeof body?.zip === "string" ? body.zip.trim().slice(0, 10) : null;
  // Source identifies which content page or surface captured the email.
  // Defaults to "cheatsheet" for back-compat with the original CheatSheetForm.
  const rawSource = typeof body?.source === "string" ? body.source.trim().slice(0, 60) : "";
  const source = rawSource || "cheatsheet";

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
    source,
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

  // Fire-and-forget welcome email. Don't block the response on send
  // success/failure; the user's primary signal is the form result.
  // Failures log but don't break the UX (the address is in the DB
  // either way and a follow-up can be sent manually).
  if (FEATURES.email()) {
    const { subject, html, text } = buildWelcomeEmail(source);
    sendEmail({ to: email, subject, html, text }).catch((err) => {
      // eslint-disable-next-line no-console
      console.error("[planning-signup] welcome email failed", {
        email,
        source,
        message: err instanceof Error ? err.message : String(err),
      });
    });
  }

  return NextResponse.json({ ok: true, stored: true });
}
