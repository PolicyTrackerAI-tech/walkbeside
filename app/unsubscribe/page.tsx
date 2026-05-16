import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { HelpFooter } from "@/components/HelpFooter";
import { verifyUnsubscribeToken } from "@/lib/nurture-email";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC } from "@/lib/env";
import { FEATURES } from "@/lib/env";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string; t?: string }>;
}) {
  const sp = await searchParams;
  const email = (sp.e ?? "").trim().toLowerCase();
  const token = (sp.t ?? "").trim();

  let status: "ok" | "invalid" | "unconfigured" | "missing" = "missing";

  if (!email || !token) {
    status = "missing";
  } else if (!FEATURES.supabase()) {
    status = "unconfigured";
  } else if (!verifyUnsubscribeToken(email, token)) {
    status = "invalid";
  } else {
    const admin = createServiceClient(
      PUBLIC.supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    );
    const { error } = await admin
      .from("planning_signups")
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq("email", email);
    if (error) {
      // eslint-disable-next-line no-console
      console.error("[unsubscribe] update failed", error);
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
              <CardTitle>You&rsquo;re unsubscribed.</CardTitle>
              <p className="text-ink-soft mt-3">
                We won&rsquo;t send you any more check-in emails. If
                this was a mistake, just sign up again on any of our
                guides and you&rsquo;re back in.
              </p>
              <p className="text-sm text-ink-muted mt-4">
                <Link
                  href="/"
                  className="text-primary-deep underline-offset-2 hover:underline"
                >
                  Back to Honest Funeral →
                </Link>
              </p>
            </Card>
          )}
          {status === "invalid" && (
            <Card tone="warn">
              <CardTitle>That link looks off.</CardTitle>
              <p className="text-ink-soft mt-3">
                The unsubscribe link may have been truncated by your
                email client, or it&rsquo;s no longer valid. Email{" "}
                <a
                  href="mailto:support@honestfuneral.co"
                  className="text-primary-deep underline-offset-2 hover:underline"
                >
                  support@honestfuneral.co
                </a>{" "}
                and we&rsquo;ll remove you manually within a day.
              </p>
            </Card>
          )}
          {status === "missing" && (
            <Card>
              <CardTitle>Unsubscribe</CardTitle>
              <p className="text-ink-soft mt-3">
                Use the unsubscribe link in any email we&rsquo;ve sent
                you, or email{" "}
                <a
                  href="mailto:support@honestfuneral.co"
                  className="text-primary-deep underline-offset-2 hover:underline"
                >
                  support@honestfuneral.co
                </a>{" "}
                with the subject &ldquo;unsubscribe&rdquo; and
                we&rsquo;ll remove you within a day.
              </p>
            </Card>
          )}
          {status === "unconfigured" && (
            <Card tone="warn">
              <CardTitle>Email is not yet configured here.</CardTitle>
              <p className="text-ink-soft mt-3">
                Email{" "}
                <a
                  href="mailto:support@honestfuneral.co"
                  className="text-primary-deep underline-offset-2 hover:underline"
                >
                  support@honestfuneral.co
                </a>{" "}
                and we&rsquo;ll remove you manually.
              </p>
            </Card>
          )}
          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
