import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardTitle } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Portal paused",
};

/**
 * Where requirePartnerMember parks members whose org is paused or archived.
 * Static and calm — the families the org already referred keep full access
 * to every tool regardless (guardrail #2: free to families, always).
 */
export default function PortalPausedPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader navLinks={[]} />
      <div className="max-w-md mx-auto w-full px-5 py-12">
        <Card>
          <CardTitle>This portal is paused</CardTitle>
          <p className="text-sm text-ink-soft mt-2">
            Your organization&rsquo;s access is currently paused, so the
            report and referral tools are on hold. Families you&rsquo;ve
            already referred keep full, free access to everything — nothing
            changes for them.
          </p>
          <p className="text-sm text-ink-soft mt-2">
            Questions? Email{" "}
            <a
              href="mailto:ryan@honestfuneral.co"
              className="text-primary-deep underline"
            >
              ryan@honestfuneral.co
            </a>
            .
          </p>
        </Card>
      </div>
    </main>
  );
}
