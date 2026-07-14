import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { CardEyebrow } from "@/components/ui/Card";
import { PortalSessionNav } from "@/components/partner/PortalSessionNav";
import { requirePartnerMember } from "@/lib/partner/auth";
import { CoordinatorCheck } from "@/components/partner/CoordinatorCheck";

export const metadata: Metadata = {
  title: "Quote check",
};

/**
 * Signed-in twin of /partner/r/[token]/check: same CoordinatorCheck, same
 * public analyzer endpoints. One honest difference: the member is SIGNED IN
 * here, so /api/analyze-price-list keeps a price_list_analyses row under
 * their own account — the token page's "nothing was saved" wording would be
 * false. The intro and the saveNote prop below say what actually happens:
 * kept with your account only, never tied to a family, never in the org's
 * report.
 */
export default async function PortalCheckPage() {
  const ctx = await requirePartnerMember("/portal/check");

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader navLinks={[]} />
      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-10 space-y-6">
          <PortalSessionNav
            partnerName={ctx.partner.name}
            active="check"
            role={ctx.member.role}
          />
          <div>
            <CardEyebrow>Quote check</CardEyebrow>
            <h1 className="font-serif text-3xl text-ink leading-tight mb-2">
              Is this quote fair?
            </h1>
            <p className="text-ink-soft text-sm">
              Paste a price list a family showed you and get an instant,
              grounded read &mdash; the same analysis our free family tool
              runs. Checks are kept only with your own sign-in, never tied to
              any family, and never part of your organization&rsquo;s report.
            </p>
          </div>
          <CoordinatorCheck
            backHref="/portal"
            backLabel="Back to your portal →"
            saveNote="Checks run while signed in are kept only with your own account — never shown to families, never part of your organization's report. Check another quote anytime."
          />
        </div>
      </section>
    </main>
  );
}
