import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { PartnerPortalNav } from "@/components/partner/PartnerPortalNav";
import { isPartnerParked, resolvePartnerToken } from "@/lib/partner-auth";
import { codesWithClaims } from "@/lib/partner/codes";
import { displayCount } from "@/lib/partner-report";
import { LinksClient } from "@/components/partner/LinksClient";

export const metadata: Metadata = {
  title: "Referral links",
  robots: { index: false, follow: false },
};

/**
 * Coordinator self-serve referral links (roadmap Phase 4). Credential = the
 * partner's founder-issued report token, same as the report page one level
 * up. Everything shown here is aggregate: codes, labels, claim COUNTS.
 * Case-level anything is structurally absent (zero-visibility rule).
 */
export default async function PartnerLinksPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const partner = await resolvePartnerToken(token);
  // Parked orgs (paused/archived/deactivated) lose bearer-link access the
  // moment the founder parks them — same rule as the session portal (A5-02).
  if (!partner || isPartnerParked(partner)) notFound();

  // Codes + aggregate claim counts (shared with /portal/links). Errors
  // degrade to an empty list with the create flow available.
  const { rows: codes, totalClaims } = await codesWithClaims(partner.id);

  // Cumulative, all-time, team-level — never time-boxed or framed as a
  // personal-only number. The report_token this page shares with the org's
  // aggregate report (docs/PARTNER_PORTAL_SPEC.md) means an ED could open
  // this same page, so this has to read honestly as shared good news, not a
  // private metric — and never a target to hit.

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader navLinks={[]} />
      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-10 space-y-6">
          <PartnerPortalNav
            token={token}
            partnerName={partner.name}
            active="links"
          />
          <div>
            <CardEyebrow>Referral links</CardEyebrow>
            <h1 className="font-serif text-3xl text-ink leading-tight mb-2">
              Give families the calm way in.
            </h1>
            <p className="text-ink-soft text-sm">
              Each link opens our free planning tools with your
              organization&rsquo;s name on them. Families use everything at
              their own pace; if they later ask us to gather quotes, the case
              counts toward your{" "}
              <Link href={`/partner/r/${token}`} className="text-primary-deep underline">
                aggregate report
              </Link>
              . You&rsquo;ll never see any family&rsquo;s choices, homes, or
              prices — by design, so the trust runs both ways.
            </p>
          </div>

          <LinksClient mode="token" token={token} initialCodes={codes} />

          <Card tone="primary">
            <CardEyebrow>
              {totalClaims > 0 ? "Since you started sharing" : "Handing this over"}
            </CardEyebrow>
            {totalClaims > 0 ? (
              <>
                <div className="font-serif text-3xl text-primary-deep mt-1 leading-none">
                  {displayCount(totalClaims)}
                </div>
                <p className="text-ink-soft mt-2 text-sm">
                  families have used this on their own terms &mdash; no pitch
                  needed, no follow-up required. Just something good to have
                  handed over.
                </p>
              </>
            ) : (
              <p className="text-ink-soft mt-1 text-sm">
                However you share it &mdash; a QR code at admission, a link
                in an email &mdash; every family who opens it gets the same
                free, neutral tools. No pitch needed, no follow-up required
                from you.
              </p>
            )}
          </Card>

          <Card tone="soft">
            <CardTitle>The neutrality pledge, in one paragraph</CardTitle>
            <p className="text-sm text-ink-soft mt-2">
              Honest Funeral is free to families and takes no money from
              funeral homes or insurers. Referral links never influence which
              funeral homes a family sees — attribution exists solely so your
              report can show aggregate outcomes. Families always come to us
              by their own choice.
            </p>
          </Card>
        </div>
      </section>
    </main>
  );
}
