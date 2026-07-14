import type { Metadata } from "next";
import Link from "next/link";
import QRCode from "qrcode";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { PortalSessionNav } from "@/components/partner/PortalSessionNav";
import { PrintButton } from "@/components/partner/PrintButton";
import { PrintHeader } from "@/components/print/PrintHeader";
import { NeutralityPledge, pledgeText } from "@/components/partner/NeutralityPledge";
import { requirePartnerMember } from "@/lib/partner/auth";
import { codesWithClaims } from "@/lib/partner/codes";
import { PUBLIC } from "@/lib/env";
import { CopySnippet } from "./CopySnippet";

export const metadata: Metadata = {
  title: "Family materials",
};

/** Default accent when the org hasn't set one (validated #hex or fallback). */
const FALLBACK_ACCENT = "#1f3d2c";

function safeAccent(accent: string | null): string {
  return accent && /^#[0-9a-fA-F]{3,8}$/.test(accent) ? accent : FALLBACK_ACCENT;
}

/**
 * Print-ready family materials: a co-branded one-pager, a QR poster per
 * active referral link, and two copy-paste snippets. Everything family-facing
 * carries the ONE reviewed neutrality pledge (components/partner/
 * NeutralityPledge.tsx) verbatim — never a paraphrase. Snippet voice branches
 * on partner_type; the employer voice never references care settings.
 */
export default async function PortalMaterialsPage() {
  const ctx = await requirePartnerMember("/portal/materials");
  const { partner } = ctx;

  const codes = await codesWithClaims(partner.id);
  const activeCodes = codes.filter((c) => c.active);
  const urlFor = (code: string) => `${PUBLIC.appUrl}/plan-now?ref=${code}`;
  const accent = safeAccent(partner.brand_accent);
  // Only "employer" gets the employer voice; anything else (hospice, insurer,
  // future types) coerces to the hospice default — the codebase convention.
  const isEmployer = partner.partner_type === "employer";

  const firstUrl = activeCodes.length > 0 ? urlFor(activeCodes[0].code) : null;
  // Snippets only render when a link exists (gated below), so the empty
  // fallback never reaches a coordinator's clipboard.
  const snippetUrl = firstUrl ?? "";

  const posters = await Promise.all(
    activeCodes.map(async (c) => ({
      code: c.code,
      label: c.label,
      url: urlFor(c.code),
      qr: await QRCode.toDataURL(urlFor(c.code), { width: 512, margin: 2 }),
    })),
  );

  const handoffScript = isEmployer
    ? `When one of your people loses someone, you can hand them this: a free, independent guide to funeral prices that shows what things fairly cost nearby and checks any quote they're given. Nobody there takes money from funeral homes, so the numbers are honest. There's no sign-up required to look — the link is ${snippetUrl}.`
    : `After admission, this is something we give every family we serve: a free, independent guide to funeral prices that shows what things fairly cost nearby and checks any quote you're handed. Nobody there takes money from funeral homes, so the numbers are honest. There's no sign-up required to look — the link is ${snippetUrl}.`;

  const emailParagraph = isEmployer
    ? `We share this with our people, free: Honest Funeral, an independent guide to funeral prices. It shows fair prices for your area, checks any quote you're given, and — if you ask — will contact funeral homes to gather comparison quotes, all free. It takes no money from funeral homes, and there's no sign-up required to look: ${snippetUrl}\n\n${pledgeText(partner.name)}`
    : `One resource we share with the families we serve: Honest Funeral, a free, independent guide to funeral prices. It shows fair prices for your area, checks any quote you're given, and — if you ask — will contact funeral homes to gather comparison quotes, all free. It takes no money from funeral homes, and there's no sign-up required to look: ${snippetUrl}\n\n${pledgeText(partner.name)}`;

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader navLinks={[]} />
      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-10 space-y-6">
          <PortalSessionNav
            partnerName={partner.name}
            active="materials"
            role={ctx.member.role}
          />

          <PrintHeader title={`Family materials — ${partner.name}`} />

          <div className="print:hidden">
            <CardEyebrow>Family materials</CardEyebrow>
            <h1 className="font-serif text-3xl text-ink leading-tight mb-2">
              Ready to hand over.
            </h1>
            <p className="text-ink-soft text-sm mb-3">
              A one-pager and QR posters that print cleanly, plus short
              snippets you can paste into an email. Everything carries your
              organization&rsquo;s name next to the same neutrality pledge
              families see on the site.
            </p>
            <PrintButton />
          </div>

          {activeCodes.length === 0 ? (
            <Card tone="soft" className="print:hidden">
              <CardTitle>One thing first: a referral link</CardTitle>
              <p className="text-sm text-ink-soft">
                The one-pager and posters print with your referral link and
                its QR code on them. Create your first link on the{" "}
                <Link href="/portal/links" className="text-primary-deep underline">
                  Referral links
                </Link>{" "}
                page — it takes about fifteen seconds — then come back here.
              </p>
            </Card>
          ) : (
            <>
              {/* ---- The one-pager: prints as page 1 ---- */}
              <Card className="print-keep-together">
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden
                    className="inline-block h-3.5 w-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: accent }}
                  />
                  <h2 className="font-serif text-2xl text-ink leading-tight">
                    {partner.name}
                  </h2>
                </div>
                <p className="text-xs uppercase tracking-wider text-ink-muted mt-1">
                  Free help with funeral prices
                </p>

                <div className="mt-5 space-y-4 text-sm text-ink-soft">
                  <div>
                    <h3 className="font-medium text-ink mb-1">
                      What Honest Funeral is
                    </h3>
                    <p>
                      A free, independent guide to funeral prices. It takes no
                      money from funeral homes or insurers and never charges
                      families &mdash; so the numbers have no thumb on the
                      scale.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-ink mb-1">
                      What you get
                    </h3>
                    <p>
                      Fair prices for your area, a checker that reads any
                      itemized quote and flags overcharges, and &mdash; if you
                      want &mdash; someone to contact funeral homes for
                      comparison quotes. All of it free, at your own pace.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-ink mb-1">How to start</h3>
                    <p>
                      Scan the QR code or type the link below. No sign-up
                      required to look.
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-primary/30 bg-primary-soft/50 px-4 py-3 text-sm text-ink print-keep-together">
                  <NeutralityPledge name={partner.name} />
                </div>

                <div className="mt-5 flex items-center gap-4 print-keep-together">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={posters[0].qr}
                    alt={`QR code that opens ${posters[0].url}`}
                    className="h-28 w-28 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs uppercase tracking-wider text-ink-muted mb-1">
                      Your link
                    </div>
                    <div className="font-mono text-sm text-ink break-all">
                      {posters[0].url}
                    </div>
                  </div>
                </div>
              </Card>

              {/* ---- One QR poster per active link ---- */}
              {posters.map((p) => (
                <div key={p.code} className="print-break-before">
                  <Card className="text-center print-keep-together">
                    <div className="font-serif text-3xl text-ink leading-tight">
                      {partner.name}
                    </div>
                    <div className="font-serif text-xl text-ink-soft mt-3">
                      Free help with funeral prices
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.qr}
                      alt={`QR code that opens ${p.url}`}
                      className="mx-auto mt-6 h-56 w-56"
                    />
                    <div className="mt-4 font-mono text-sm text-ink break-all">
                      {p.url}
                    </div>
                    {p.label && (
                      <div className="mt-1 text-xs text-ink-muted">{p.label}</div>
                    )}
                    <p className="mt-5 text-sm text-ink-soft">
                      Fair local prices, a quote checker, and free help
                      comparing &mdash; at your own pace. No sign-up required
                      to look.
                    </p>
                    {/* Invariant: a partner name never renders to a family
                        without the pledge — so it prints on every poster. */}
                    <p className="mt-4 text-xs text-ink-muted">
                      {pledgeText(partner.name)}
                    </p>
                  </Card>
                </div>
              ))}
            </>
          )}

          {/* ---- Copy-paste snippets (screen only; need a link to be useful) ---- */}
          {activeCodes.length > 0 ? (
            <div className="print:hidden space-y-6">
              <div>
                <CardEyebrow>Copy-paste snippets</CardEyebrow>
                <p className="text-ink-soft text-sm">
                  Short wording that&rsquo;s ready to use &mdash; say it, or
                  paste it into an email.
                </p>
              </div>
              <CopySnippet title="Hand-off script (spoken)" text={handoffScript} />
              <CopySnippet title="Email paragraph (for families)" text={emailParagraph} />
            </div>
          ) : (
            <p className="print:hidden text-sm text-ink-muted">
              Copy-paste snippets appear here too, once you have a{" "}
              <Link href="/portal/links" className="text-primary-deep underline">
                referral link
              </Link>{" "}
              for them to point at.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
