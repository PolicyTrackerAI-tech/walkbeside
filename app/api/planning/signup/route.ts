import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { FEATURES } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import { buildWelcomeEmail, signupSource } from "@/lib/welcome-email";
import { hashId } from "@/lib/observability";
import { readLimitedJson, validateOrigin } from "@/lib/http-guards";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Keyed one-way hash of the client IP (audit A8-07). A plain SHA-256 of an
 * IPv4 address is reversible by brute force, so it was pseudonymized, not
 * hashed in any useful sense. With IP_HASH_SECRET unset nothing is stored.
 */
export function ipHashFor(ip: string, secret: string | undefined): string | null {
  if (!ip || !secret) return null;
  return crypto.createHmac("sha256", secret).update(ip).digest("hex");
}

export async function POST(request: NextRequest) {
  // Anonymous endpoint that emails the address it is given (audit A1-07):
  // refuse a request that says it came from another site.
  if (!validateOrigin(request))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const parsedBody = await readLimitedJson<Record<string, unknown>>(request, 5);
  if (!parsedBody.ok)
    return NextResponse.json({ error: parsedBody.error }, { status: parsedBody.status });
  const body = parsedBody.data;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const zip = typeof body?.zip === "string" ? body.zip.trim().slice(0, 10) : null;
  // Source identifies which content page or surface captured the email.
  // Defaults to "cheatsheet" for back-compat with the original CheatSheetForm.
  const rawSource = typeof body?.source === "string" ? body.source.trim().slice(0, 60) : "";
  const source = signupSource(rawSource || "cheatsheet");

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
  const ipHash = ipHashFor(ip, process.env.IP_HASH_SECRET);
  const userAgent = request.headers.get("user-agent")?.slice(0, 500) ?? null;

  const supabase = await createClient();
  const { error } = await supabase.from("planning_signups").insert({
    email,
    source,
    zip,
    ip_hash: ipHash,
    user_agent: userAgent,
  });

  const duplicate = !!error && !!error.message?.toLowerCase().includes("duplicate");
  if (error && !duplicate) {
    return NextResponse.json(
      { error: "Couldn't save. Try again in a moment." },
      { status: 500 },
    );
  }
  // Already signed up from this page: no second welcome. Re-sending on every
  // repeat let anyone mail an address over and over (audit A1-07).
  if (duplicate) return NextResponse.json({ ok: true, stored: true });

  // Await the welcome send — it must finish before we return. On Vercel the
  // serverless function is frozen the instant the response is sent, so a
  // fire-and-forget send has its in-flight HTTP request aborted
  // ("Unable to fetch data. The request could not be resolved.") and the
  // email silently never goes out. Awaiting keeps the function alive until
  // Resend responds. A send failure still must not break signup (the address
  // is saved regardless), so we swallow and log it.
  if (FEATURES.email()) {
    const { subject, html, text } = buildWelcomeEmail(source);
    try {
      await sendEmail({ to: email, subject, html, text });
    } catch (err) {
      console.error("[planning-signup] welcome email failed", {
        emailHash: hashId(email),
        source,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return NextResponse.json({ ok: true, stored: true });
}
