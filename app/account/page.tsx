import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { HelpFooter } from "@/components/HelpFooter";
import { DeleteAccount } from "./DeleteAccount";

export const metadata: Metadata = {
  title: "Account & data",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/account");

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader showBack backHref="/dashboard" backLabel="← Dashboard" />
      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-12 space-y-6">
          <div>
            <CardEyebrow>Account</CardEyebrow>
            <h1 className="font-serif text-3xl text-ink">Account &amp; data</h1>
          </div>

          <Card>
            <CardTitle>Signed in as</CardTitle>
            <p className="text-ink-soft mt-1">{user.email}</p>
            <p className="text-sm text-ink-muted mt-3">
              We never share your email with funeral homes. How long we keep
              your data, and why, is in our{" "}
              <Link
                href="/privacy"
                className="text-primary-deep underline-offset-2 hover:underline"
              >
                privacy policy
              </Link>
              .
            </p>
          </Card>

          <Card tone="bad">
            <CardTitle>Delete my account</CardTitle>
            <p className="text-ink-soft mt-1 mb-4">
              This permanently erases your account and everything tied to it
              &mdash; saved progress, cases, quotes, drafts, and lookups. It
              can&rsquo;t be undone. (Outreach already emailed to funeral homes
              can&rsquo;t be recalled, but your records here are deleted.)
            </p>
            <DeleteAccount />
          </Card>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
