import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { verifyFuneralHomeOptOutToken } from "@/lib/negotiation/email-body";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, FEATURES } from "@/lib/env";

export const metadata: Metadata = {
  title: "Opt out",
  robots: { index: false, follow: false },
};

export default async function FuneralHomeOptOutPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string; t?: string }>;
}) {
  const sp = await searchParams;
  const email = (sp.e ?? "").trim().toLowerCase();
  const token = (sp.t ?? "").trim();

  type Status = "ok" | "invalid" | "unconfigured" | "missing";
  let status: Status = "missing";

  if (!email || !token) {
    status = "missing";
  } else if (!FEATURES.supabase()) {
    status = "unconfigured";
  } else if (!verifyFuneralHomeOptOutToken(email, token)) {
    status = "invalid";
  } else {
    const admin = createServiceClient(
      PUBLIC.supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    );
    // Idempotent: matches by case-insensitive email; row may not exist
    // (e.g., FD self-removed from directory) — in that case the update is
    // a no-op and we still show success because the FD's intent was to opt out.
    const { error } = await admin
      .from("funeral_homes")
      .update({ active: false })
      .ilike("email", email);
    if (error) {
      console.error("[funeral-home-opt-out] update failed", error);
      status = "invalid";
    } else {
      status = "ok";
    }
  }

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader showBack={false} />
      <section className="flex-1 flex items-center">
        <div className="max-w-md mx-auto w-full px-5 py-12">
          {status === "ok" && (
            <Card>
              <CardTitle>You&rsquo;re opted out.</CardTitle>
              <p className="text-ink-soft mt-3">
                We won&rsquo;t send your firm any more outreach requests on
                behalf of families looking for price information. If a family
                specifically asks for your firm by name in the future,
                we&rsquo;ll honor your opt-out and not contact you.
              </p>
              <p className="text-ink-soft mt-3">
                If this was a mistake or you change your mind, email{" "}
                <a
                  href="mailto:arrangements@honestfuneral.co"
                  className="text-primary-deep underline-offset-2 hover:underline"
                >
                  arrangements@honestfuneral.co
                </a>{" "}
                and we&rsquo;ll restore your firm to the directory.
              </p>
              <p className="text-sm text-ink-muted mt-4">
                <Link
                  href="/our-role"
                  className="text-primary-deep underline-offset-2 hover:underline"
                >
                  Why we contacted you in the first place →
                </Link>
              </p>
            </Card>
          )}
          {status === "invalid" && (
            <Card tone="warn">
              <CardTitle>That opt-out link looks off.</CardTitle>
              <p className="text-ink-soft mt-3">
                The link may have been truncated by your email client, or
                it&rsquo;s no longer valid. To opt out manually, email{" "}
                <a
                  href="mailto:arrangements@honestfuneral.co"
                  className="text-primary-deep underline-offset-2 hover:underline"
                >
                  arrangements@honestfuneral.co
                </a>{" "}
                from the address you&rsquo;d like removed and we&rsquo;ll
                handle it within one business day.
              </p>
            </Card>
          )}
          {status === "missing" && (
            <Card tone="soft">
              <CardTitle>This page is for funeral homes</CardTitle>
              <p className="text-ink-soft mt-3">
                If your firm received an outreach email from us and you
                don&rsquo;t want to receive any more, click the opt-out link
                in the footer of that email. If you can&rsquo;t find it,
                email{" "}
                <a
                  href="mailto:arrangements@honestfuneral.co"
                  className="text-primary-deep underline-offset-2 hover:underline"
                >
                  arrangements@honestfuneral.co
                </a>{" "}
                and we&rsquo;ll remove your firm within one business day.
              </p>
            </Card>
          )}
          {status === "unconfigured" && (
            <Card tone="warn">
              <CardTitle>Service temporarily unavailable</CardTitle>
              <p className="text-ink-soft mt-3">
                We can&rsquo;t process the opt-out right now. Email{" "}
                <a
                  href="mailto:arrangements@honestfuneral.co"
                  className="text-primary-deep underline-offset-2 hover:underline"
                >
                  arrangements@honestfuneral.co
                </a>{" "}
                and we&rsquo;ll handle it manually.
              </p>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}
