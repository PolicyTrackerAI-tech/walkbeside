import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import { Card, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "What you can decline",
  description:
    "The nine most common line items on a funeral bill that you are not legally required to buy. Plain-English explanations and what to say instead.",
};

interface Right {
  title: string;
  law: string;
  body: string;
  tellThem?: string;
}

/**
 * Source: master_brief.docx Section 3 (Phase 3) and Section 4 pricing database.
 * TODO: Sarah review — state-specific embalming rules and vault/liner nuance.
 */
const RIGHTS: Right[] = [
  {
    title: "Embalming, in most states",
    law: "FTC Funeral Rule · 16 CFR 453",
    body: "Embalming is not legally required for a direct cremation, a burial within 24–48 hours, a graveside service, or a closed-casket viewing. It is only typically required for an open-casket service with a multi-day delay, and even that depends on your state.",
    tellThem: "We’re not having embalming. We understand it isn’t legally required for the service we’re planning.",
  },
  {
    title: "A casket from the funeral home",
    law: "FTC Funeral Rule · 16 CFR 453.4",
    body: "Federal law requires the funeral home to accept a casket you buy from any third-party vendor — Costco, Amazon, a local casket store — at no additional handling fee. Funeral home casket markups run 300–500% above wholesale. A $1,200 casket elsewhere is routinely $4,000–$6,000 through the home.",
    tellThem: "We’ll be bringing our own casket. Please confirm there’s no handling charge — I know federal law prohibits one.",
  },
  {
    title: "A package — you can line-item everything",
    law: "FTC Funeral Rule — itemized price disclosure",
    body: "Funeral homes often present three tiers (basic, standard, premium). You are not required to pick a package. You can ask for the itemized General Price List and build your own combination from it. The only non-declinable charge is the basic services fee.",
  },
  {
    title: "A ‘protective’ casket seal",
    law: "Consumer protection — no legal basis for protection claims",
    body: "A sealed or ‘protective’ casket does not meaningfully preserve remains or extend anything. The FTC has warned funeral providers about making protection claims. You are paying purely for the name.",
    tellThem: "We’re not interested in the protective seal. A standard casket is fine.",
  },
  {
    title: "A concrete burial vault (in most places)",
    law: "Cemetery rule, not law",
    body: "Burial vaults or concrete grave liners are required by many cemeteries to keep the ground from settling. They are not required by law. Ask the cemetery for their minimum requirement, and buy the cheapest option that meets it. Upgrade ‘protective’ vaults are almost always optional.",
    tellThem: "We’d like the most basic liner that meets the cemetery’s minimum requirement. Please show us that option.",
  },
  {
    title: "A family limousine",
    law: "Pure upsell",
    body: "The family limo is not a service charge, a transport requirement, or a legal fee. It is transportation you are renting. Most families can drive themselves. This alone saves $150–$600.",
    tellThem: "We’ll be driving ourselves to the cemetery. Please remove the limo.",
  },
  {
    title: "Newspaper obituary placement through the funeral home",
    law: "Not required",
    body: "The funeral home will often charge a placement fee on top of what the newspaper charges. You can submit an obituary directly to any newspaper yourself, and most online obituary publications are free.",
  },
  {
    title: "Funeral-home-sourced flowers, programs, and memorial cards",
    law: "Not required",
    body: "Flowers through a funeral home are marked up 40–60% above a florist. Programs cost a fraction if you print them locally or at home. These are not required to be sourced through the funeral home.",
    tellThem: "We’ll handle the flowers, programs, and obituary ourselves. Please leave those off the bill.",
  },
  {
    title: "A specific cemetery or headstone vendor",
    law: "No bundling requirement",
    body: "The funeral home may suggest a cemetery or a monument company. Those referrals often involve referral fees. You can choose any cemetery that serves your area and buy a headstone direct from a monument company — funeral home markup on stones is among the highest in the industry.",
  },
];

export default function RightsPage() {
  return (
    <main className="flex-1 flex flex-col">
      <header className="border-b border-border bg-surface/70">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Brand />
          <Link
            href="/where"
            className="text-sm text-ink-muted hover:text-ink-soft"
          >
            ← Back
          </Link>
        </div>
      </header>

      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-10 space-y-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              What you can decline
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              Nine things a funeral home cannot make you buy.
            </h1>
            <p className="text-lg text-ink-soft">
              Most families walk into the arrangement meeting assuming everything
              on the list is required. It isn&rsquo;t. These are the nine biggest
              line items that are legally or practically optional.
            </p>
          </div>

          <Card tone="primary">
            <CardTitle>The one question that changes the conversation</CardTitle>
            <blockquote className="my-3 border-l-4 border-primary-deep pl-4 text-ink italic">
              &ldquo;Can I see your itemized General Price List before we
              begin?&rdquo;
            </blockquote>
            <p className="text-sm text-ink-soft">
              The FTC Funeral Rule requires every funeral home to give you a
              printed, itemized price list on request &mdash; over the phone or
              in person. Ask for it before you agree to anything.
            </p>
          </Card>

          <ol className="space-y-4">
            {RIGHTS.map((r, i) => (
              <li
                key={i}
                className="rounded-2xl border border-border bg-surface p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-deep text-white font-serif text-sm shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <h2 className="font-serif text-xl text-ink mb-1">
                      {r.title}
                    </h2>
                    <div className="text-xs uppercase tracking-wider text-ink-muted mb-3">
                      {r.law}
                    </div>
                    <p className="text-ink-soft leading-relaxed">{r.body}</p>
                    {r.tellThem && (
                      <div className="mt-4 rounded-xl bg-surface-soft px-4 py-3 border-l-4 border-primary">
                        <div className="text-xs uppercase tracking-wider text-ink-muted mb-1">
                          What to say
                        </div>
                        <p className="text-ink italic">&ldquo;{r.tellThem}&rdquo;</p>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <Card tone="soft">
            <CardTitle>Bring this into the meeting, not just into your head.</CardTitle>
            <p className="text-ink-soft mb-4">
              The printable cheat sheet has every line item, a fair price for
              your zip code, and word-for-word decline scripts on one page.
            </p>
            <LinkButton href="/prep">Open the Arrangement Kit</LinkButton>
          </Card>
        </div>
      </section>
    </main>
  );
}
