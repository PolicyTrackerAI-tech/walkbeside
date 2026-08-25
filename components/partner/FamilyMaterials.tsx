import Link from "next/link";
import QRCode from "qrcode";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { PrintButton } from "@/components/partner/PrintButton";
import { PrintHeader } from "@/components/print/PrintHeader";
import { NeutralityPledge, pledgeText } from "@/components/partner/NeutralityPledge";
import { BRAND } from "@/lib/brand";
import { FREE_WITH_OR_WITHOUT_LINK } from "@/lib/copy";
import { PUBLIC } from "@/lib/env";
import { CopySnippet } from "@/app/portal/materials/CopySnippet";

/** Default accent when the org hasn't set one (validated #hex or fallback). */
const FALLBACK_ACCENT = "#1f3d2c";

function safeAccent(accent: string | null): string {
  return accent && /^#[0-9a-fA-F]{3,8}$/.test(accent) ? accent : FALLBACK_ACCENT;
}

export interface MaterialsPartner {
  name: string;
  brand_accent: string | null;
  partner_type: string;
}

export interface MaterialsCode {
  code: string;
  label: string | null;
  active: boolean;
}

/**
 * Print-ready family materials: a co-branded one-pager, a QR poster per
 * active referral link, and copy-paste snippets. Shared by BOTH partner
 * surfaces — the session portal (/portal/materials) and the token quick link
 * (/partner/r/[token]/materials, added in audit A5: the coordinator holding
 * only the quick link previously could not print the kit at all). Everything
 * family-facing carries the ONE reviewed neutrality pledge
 * (components/partner/NeutralityPledge.tsx) verbatim — never a paraphrase.
 * Snippet voice branches on partner_type; the employer voice never references
 * care settings.
 *
 * linksHref points at the caller's own links page (session or token flavor)
 * so the "create a link first" pointers stay inside the surface the
 * coordinator is actually using.
 */
export async function FamilyMaterials({
  partner,
  codes,
  linksHref,
}: {
  partner: MaterialsPartner;
  codes: MaterialsCode[];
  linksHref: string;
}) {
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

  // Family-facing formal copy names the company in full (BRAND.name) — the
  // naming style rule; these paragraphs land in a family's inbox.
  const emailParagraph = isEmployer
    ? `We share this with our people, free: ${BRAND.name}, an independent guide to funeral prices. It shows fair prices for your area, checks any quote you're given, and — if you ask — will help you get comparison quotes from funeral homes, all free. It takes no money from funeral homes, and there's no sign-up required to look: ${snippetUrl}\n\n${pledgeText(partner.name)}`
    : `One resource we share with the families we serve: ${BRAND.name}, a free, independent guide to funeral prices. It shows fair prices for your area, checks any quote you're given, and — if you ask — will help you get comparison quotes from funeral homes, all free. It takes no money from funeral homes, and there's no sign-up required to look: ${snippetUrl}\n\n${pledgeText(partner.name)}`;

  // Internal staff email — pasted by the coordinator to their OWN colleagues,
  // never to a family (hence a CopySnippet, never a mailto). Joined explicitly
  // so every line starts at column 0: CopySnippet copies `text` verbatim and
  // renders it whitespace-pre-wrap, so source indentation from a multi-line
  // template literal would land in the pasted email.
  //
  // Bullet 1 differs by audience on purpose. Post-admission-only delivery AND
  // display is a hospice rule, because inducing HOSPICE selection is the
  // Anti-Kickback vector; there is no employer analogue, and app/employers
  // sells a standing benefits-page/EAP placement, so the employer arm must not
  // forbid it.
  const teamEmail = (
    isEmployer
      ? [
          `Subject: Something to hand people after a death — our part is one link`,
          ``,
          `When someone here loses a family member, we approve the leave and say we're sorry. Now there's one more thing to hand over.`,
          ``,
          `${BRAND.name} is a free, independent guide to funeral prices. It shows what things fairly cost in their area, reads an itemized quote they were given, and flags what's out of line. It takes no money from funeral homes or insurers, and it never charges the family or points anyone toward a particular provider. Nobody on our team is paid for handing it over, and no funeral home pays to be in it.`,
          ``,
          `Our part is small:`,
          ``,
          `- Put it where people already look — the benefits page, the EAP, the manager toolkit — and hand it over directly when someone loses a family member.`,
          `- Send the link or the printed one-pager. They open it themselves; there's nothing for us to set up.`,
          `- Never enter anything about anyone into it. The family enters whatever they choose to, themselves; we send over nothing but the link, and nobody hears from ${BRAND.name} unless they went there first.`,
          ``,
          `The link to hand over:`,
          snippetUrl,
          ``,
          `It doesn't unlock anything — the site is free either way. Ask me for printed one-pagers with the same QR code if paper is easier.`,
        ]
      : [
          `Subject: Something to hand families after admission — our part is one link`,
          ``,
          `Families ask us what a funeral should cost. We haven't had a good answer. Now there's something to hand them.`,
          ``,
          `${BRAND.name} is a free, independent guide to funeral prices. It shows what things fairly cost around here, reads an itemized quote a family was handed, and flags what's out of line. It takes no money from funeral homes or insurers, and it never charges families or points anyone toward a particular home. Nobody on our team is paid for handing it over, and no funeral home pays to be in it.`,
          ``,
          `Our part is small:`,
          ``,
          `- Hand it over, or post it, only where families already in our care will see it — the admission packet or any time after is fine. Never where families who haven't chosen us yet would see it, and never in anything we use to bring families in.`,
          `- Give them the link or the printed one-pager. They open it themselves; there's nothing for us to set up.`,
          `- Never put anything about a family into it. The family enters whatever they choose to, themselves; we send over nothing but the link, and nobody hears from ${BRAND.name} unless they went there first.`,
          ``,
          `The link to hand over:`,
          snippetUrl,
          ``,
          `It doesn't unlock anything — the site is free either way. Ask me for printed one-pagers with the same QR code if paper is easier.`,
        ]
  ).join("\n");

  // Coordinator-voice twin of the family sentence. The hospice arm carries the
  // reviewed phrase verbatim on one unbroken source line — the acceptance-gate
  // grep pins it, so never let a tidy-up wrap it. Branched because this is the
  // FIRST line an employer's benefits lead reads, and "families you serve"
  // describes a care relationship an employer does not have (see the file
  // invariant above: the employer voice never references care settings).
  const coordinatorFraming = isEmployer
    ? `${BRAND.name} is free to the family of everyone you employ, with or without this link.`
    : `${BRAND.name} is free to every family you serve, with or without this link.`;

  return (
    <>
      <PrintHeader title={`Family materials — ${partner.name}`} />

      <div className="print:hidden">
        <CardEyebrow>Family materials</CardEyebrow>
        <h1 className="font-serif text-3xl text-ink leading-tight mb-2">
          Ready to hand over.
        </h1>
        {/* The trust claim comes before the inventory: a coordinator's
            question here is not what is in the kit, it is what they are
            putting their organization's name on. The {" "} after the
            expression is required — Turbopack eats a bare space at a line
            boundary after an expression. */}
        <p className="text-ink text-sm mb-3">
          {coordinatorFraming}{" "}
          Handing it over costs a family nothing, and nothing is withheld
          from a family who never gets it &mdash; the link only puts your
          name on their screen and counts the case toward your aggregate
          report. It is not a discount, and it is not a gate.
        </p>
        <p className="text-ink-soft text-sm mb-3">
          A one-pager and QR posters that print cleanly, plus short
          snippets you can paste into an email. Everything carries your
          organization&rsquo;s name next to the same neutrality pledge
          families see on the site.
        </p>
        <PrintButton track="materials_printed" />
      </div>

      {activeCodes.length === 0 ? (
        <Card tone="soft" className="print:hidden">
          <CardTitle>One thing first: a referral link</CardTitle>
          <p className="text-sm text-ink-soft">
            The one-pager and posters print with your referral link and
            its QR code on them. Create your first link on the{" "}
            <Link href={linksHref} className="text-primary-deep underline">
              Referral links
            </Link>{" "}
            page &mdash; it takes about fifteen seconds &mdash; then come back here.
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
                  What {BRAND.name} is
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

            {/* The closing statement of page 1, placed AFTER the QR block
                on purpose: the printed URL visibly ends in ?ref=HF-XXXXXX,
                which reads as a tracking code — the answer lands hardest
                straight after the thing that raised the question. Verbatim
                law: render the constant, never retype the sentence.
                Deliberately NOT on the QR posters below — a poster is taped
                to a wall, not handed to a person. */}
            <p className="mt-4 text-sm font-semibold text-ink print-keep-together">
              {FREE_WITH_OR_WITHOUT_LINK}
            </p>
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
          {/* Screen-only: a coordinator should be able to see the exact
              screen a family lands on before handing the link to anyone.
              New tab, so they don't lose this page. */}
          <Card tone="soft">
            <CardTitle>What your families see</CardTitle>
            <p className="text-sm text-ink-soft mt-1">
              Open your link the way a family would. It is the same free
              tools everyone else gets, with your organization&rsquo;s name
              and the neutrality pledge at the top.
            </p>
            <a
              href={snippetUrl}
              target="_blank"
              rel="noopener"
              className="inline-block mt-3 text-sm text-primary-deep underline"
            >
              Preview the family&rsquo;s arrival screen
            </a>
          </Card>

          <div>
            <CardEyebrow>Copy-paste snippets</CardEyebrow>
            <p className="text-ink-soft text-sm">
              Short wording that&rsquo;s ready to use &mdash; say it, or
              paste it into an email.
            </p>
          </div>
          {/* The hospice string is words said TO A FAMILY; the employer
              string is words said TO A MANAGER about a third party. Same
              text, different addressee — so the title branches. */}
          <CopySnippet
            title={isEmployer ? "What to tell a manager (spoken)" : "Hand-off script (spoken)"}
            text={handoffScript}
          />
          <CopySnippet title="Email paragraph (for families)" text={emailParagraph} />
          <CopySnippet title="Email to your team (internal)" text={teamEmail} />
        </div>
      ) : (
        <p className="print:hidden text-sm text-ink-muted">
          Copy-paste snippets appear here too, once you have a{" "}
          <Link href={linksHref} className="text-primary-deep underline">
            referral link
          </Link>{" "}
          for them to point at.
        </p>
      )}
    </>
  );
}
