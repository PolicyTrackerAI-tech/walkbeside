import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { PortalSessionNav } from "@/components/partner/PortalSessionNav";
import { requirePartnerMember } from "@/lib/partner/auth";
import { codesWithClaims } from "@/lib/partner/codes";
import { LinksClient } from "@/components/partner/LinksClient";

export const metadata: Metadata = {
  title: "Referral links",
};

/**
 * Signed-in twin of /partner/r/[token]/links: same LinksClient, same shared
 * codes fetch, but the credential is the member's session (mode="session" —
 * no token ever leaves the server). Everything shown is aggregate: codes,
 * labels, claim COUNTS. Case-level anything is structurally absent
 * (zero-visibility rule).
 */
export default async function PortalLinksPage() {
  const ctx = await requirePartnerMember("/portal/links");
  const codes = await codesWithClaims(ctx.partner.id);

  // Only "employer" gets the employer voice; anything else coerces to the
  // hospice default (the codebase convention). The rest of this page's copy
  // is deliberately setting-neutral, so only LinksClient's hints branch.
  const isEmployer = ctx.partner.partner_type === "employer";

  // Cumulative, all-time, team-level — never time-boxed or framed as a
  // personal-only number. Anyone in the org can see this page, so it has to
  // read honestly as shared good news, not a private metric — and never a
  // target to hit.
  const totalClaims = codes.reduce((s, c) => s + c.claims, 0);

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader navLinks={[]} />
      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-10 space-y-6">
          <PortalSessionNav
            partnerName={ctx.partner.name}
            active="links"
            role={ctx.member.role}
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
              <Link href="/portal" className="text-primary-deep underline">
                aggregate report
              </Link>
              . You&rsquo;ll never see any family&rsquo;s choices, homes, or
              prices — by design, so the trust runs both ways.
            </p>
          </div>

          <LinksClient
            mode="session"
            initialCodes={codes}
            shareHint={
              isEmployer
                ? "Make one per place you’ll share it — the benefits page, the HR handoff, a manager’s toolkit — so you can see which ones people actually use."
                : undefined
            }
            labelPlaceholder={isEmployer ? "e.g. Benefits portal" : undefined}
          />

          <Card tone="primary">
            <CardEyebrow>
              {totalClaims > 0 ? "Since you started sharing" : "Handing this over"}
            </CardEyebrow>
            {totalClaims > 0 ? (
              <>
                <div className="font-serif text-3xl text-primary-deep mt-1 leading-none">
                  {totalClaims}
                </div>
                <p className="text-ink-soft mt-2 text-sm">
                  {totalClaims === 1 ? "family has" : "families have"} used
                  this on their own terms &mdash; no pitch needed, no
                  follow-up required. Just something good to have handed
                  over.
                </p>
              </>
            ) : (
              <p className="text-ink-soft mt-1 text-sm">
                However you share it &mdash; a QR code on a printed card, a
                link in an email &mdash; every family who opens it gets the
                same free, neutral tools. No pitch needed, no follow-up
                required from you.
              </p>
            )}
          </Card>

          <Card tone="soft">
            <CardTitle>The neutrality pledge, in one paragraph</CardTitle>
            <p className="text-sm text-ink-soft mt-2">
              Honest Funeral is free to families and takes no money from
              funeral homes or insurers. Referral links never influence which
              funeral homes a family sees &mdash; attribution exists solely so
              your report can show aggregate outcomes. Families always come to
              us by their own choice.
            </p>
          </Card>
        </div>
      </section>
    </main>
  );
}
