import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { verifyFuneralHomeOptOutToken } from "@/lib/negotiation/email-body";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, FEATURES } from "@/lib/env";

export const metadata: Metadata = {
  title: "Opt out",
  robots: { index: false, follow: false },
};

/**
 * Funeral-home opt-out. The actual deactivation is a POST-only server action,
 * NOT a side effect of loading the page: email clients and security scanners
 * (Outlook SafeLinks, etc.) prefetch link URLs, and a GET that wrote
 * active=false would let a scanner opt a home out before a human ever clicks.
 * The GET only validates the token and renders a confirm button.
 */

async function performOptOut(formData: FormData): Promise<void> {
  "use server";
  const email = (formData.get("e")?.toString() ?? "").trim().toLowerCase();
  const token = (formData.get("t")?.toString() ?? "").trim();

  if (!email || !token || !FEATURES.supabase()) {
    redirect(`/funeral-home-opt-out?status=invalid`);
  }
  if (!verifyFuneralHomeOptOutToken(email, token)) {
    redirect(`/funeral-home-opt-out?status=invalid`);
  }

  const admin = createServiceClient(
    PUBLIC.supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  );
  // Idempotent: matches by case-insensitive email; row may not exist
  // (e.g., FD self-removed) — a no-op update still counts as success.
  const { error } = await admin
    .from("funeral_homes")
    .update({ active: false })
    .ilike("email", email);
  if (error) {
    console.error("[funeral-home-opt-out] update failed", error);
    redirect(`/funeral-home-opt-out?status=invalid`);
  }
  redirect(`/funeral-home-opt-out?status=done`);
}

export default async function FuneralHomeOptOutPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string; t?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const email = (sp.e ?? "").trim().toLowerCase();
  const token = (sp.t ?? "").trim();

  // Terminal states set by the server action's post-redirect.
  type Status = "confirm" | "ok" | "invalid" | "unconfigured" | "missing";
  let status: Status;
  if (sp.status === "done") status = "ok";
  else if (sp.status === "invalid") status = "invalid";
  else if (!email || !token) status = "missing";
  else if (!FEATURES.supabase()) status = "unconfigured";
  else if (!verifyFuneralHomeOptOutToken(email, token)) status = "invalid";
  else status = "confirm";

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader showBack={false} />
      <section className="flex-1 flex items-center">
        <div className="max-w-md mx-auto w-full px-5 py-12">
          {status === "confirm" && (
            <Card>
              <CardTitle>Opt your firm out of family outreach?</CardTitle>
              <p className="text-ink-soft mt-3">
                Confirm below and we won&rsquo;t send your firm any more
                outreach requests on behalf of families looking for price
                information. If a family later asks for your firm by name,
                we&rsquo;ll still honor this opt-out.
              </p>
              <form action={performOptOut} className="mt-5">
                <input type="hidden" name="e" value={email} />
                <input type="hidden" name="t" value={token} />
                <Button type="submit">Confirm opt-out</Button>
              </form>
            </Card>
          )}
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
