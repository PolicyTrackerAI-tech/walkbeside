import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { CardEyebrow } from "@/components/ui/Card";
import { PartnerPortalNav } from "@/components/partner/PartnerPortalNav";
import { resolvePartnerToken } from "@/lib/partner-auth";
import { CoordinatorCheck } from "@/components/partner/CoordinatorCheck";

export const metadata: Metadata = {
  title: "Quote check",
  robots: { index: false, follow: false },
};

/**
 * Stateless coordinator tool: paste a price list a family showed you, get the
 * same fair/high/predatory read the free family analyzer produces. Nothing
 * here is saved or tied to a family — it calls the same public, unauthenticated
 * /api/analyze-price-list + draft-letter endpoints the family tool uses, so a
 * coordinator's session never persists anything (that branch only fires for a
 * logged-in family user). The report_token gate decides who gets a link to
 * this page, same credential as the report and referral-links pages.
 */
export default async function PartnerCheckPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const partner = await resolvePartnerToken(token);
  if (!partner || partner.active === false) notFound();

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader navLinks={[]} />
      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-10 space-y-6">
          <PartnerPortalNav
            token={token}
            partnerName={partner.name}
            active="check"
          />
          <div>
            <CardEyebrow>Quote check</CardEyebrow>
            <h1 className="font-serif text-3xl text-ink leading-tight mb-2">
              Is this quote fair?
            </h1>
            <p className="text-ink-soft text-sm">
              Paste a price list a family showed you and get an instant,
              grounded read &mdash; the same analysis our free family tool
              runs. Nothing here is saved or tied to any family; paste, check,
              done.
            </p>
          </div>
          <CoordinatorCheck backHref={`/partner/r/${token}`} />
        </div>
      </section>
    </main>
  );
}
