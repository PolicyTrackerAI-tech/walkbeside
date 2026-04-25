import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";

export const metadata: Metadata = {
  title: "Accounts to close after a death — the full checklist",
  description:
    "Social Security, banks, credit cards, subscriptions, email, social media, DMV. A full checklist in the order that makes the most sense, with scripts for the hard calls.",
};

const PHASES: {
  id: string;
  title: string;
  when: string;
  items: { name: string; detail: string }[];
}[] = [
  {
    id: "first-two-weeks",
    title: "First — within two weeks",
    when: "These are time-sensitive or block other steps.",
    items: [
      {
        name: "Social Security Administration",
        detail:
          "Call 1-800-772-1213 or your local office. If the funeral home didn't already report the death, you need to. Survivor benefits (for a spouse, minor child, or disabled adult child) may start from here. Don't cash any Social Security payment issued for the month of death or later — it will be clawed back.",
      },
      {
        name: "The deceased's employer",
        detail:
          "Final paycheck, accrued PTO, any employer-held life insurance, 401(k)/pension instructions, and health insurance (for surviving spouse/dependents — ask about COBRA timing).",
      },
      {
        name: "Life insurance carriers",
        detail:
          "Each policy is a separate claim. You'll need a certified death certificate per policy. Ask whether the payout is taxable (most aren't) and the expected timeline (often 14–30 days).",
      },
      {
        name: "Primary bank account",
        detail:
          "If the account is joint, it stays active with the survivor as primary. If solo, ask about pay-on-death beneficiary designations and how to access funds for funeral expenses. Don't close it until recurring deposits (pensions, benefits) stop.",
      },
    ],
  },
  {
    id: "weeks-2-to-4",
    title: "Second — weeks 2 to 4",
    when: "Do these once certified copies are in hand.",
    items: [
      {
        name: "Credit cards",
        detail:
          "Call each issuer, report the death, request a final statement. Unpaid balances are the estate's responsibility — not a surviving family member's (with narrow exceptions for joint cardholders or community-property states). Don't cancel cards with outstanding rewards until points are transferred or redeemed.",
      },
      {
        name: "Banks and brokerages",
        detail:
          "One certified copy per institution, not per account. Ask whether accounts transfer to a named beneficiary (transfer on death / payable on death) or require probate. If no beneficiary was named, the account goes into the estate.",
      },
      {
        name: "IRS and state tax authority",
        detail:
          "A final income tax return is due by April 15 of the year following death. If the estate is large enough, an estate tax return may also be required. Save receipts for medical expenses, funeral costs, and estate administration — some are deductible.",
      },
      {
        name: "Pension and retirement accounts",
        detail:
          "401(k), IRA, and pension plans each have their own rules. A spouse often has rollover options a non-spouse beneficiary doesn't. Don't cash anything out before understanding tax consequences — talk to a tax professional if the balance is meaningful.",
      },
      {
        name: "Utilities and services",
        detail:
          "Electric, gas, water, internet, phone, trash. If the home will stay occupied by a surviving family member, transfer into their name. If it will be sold, keep utilities on until after the closing.",
      },
      {
        name: "DMV",
        detail:
          "Cancel the deceased's driver's license (prevents identity theft). Transfer vehicle titles. Each state has its own process and paperwork — search for \"[your state] DMV death\" for specifics.",
      },
    ],
  },
  {
    id: "when-you-have-energy",
    title: "Third — when you have the energy",
    when: "Lower stakes. Do them in any order.",
    items: [
      {
        name: "Subscriptions and memberships",
        detail:
          "Streaming services, gym, clubs, magazines, software. Most can be canceled via customer support with an email and the account holder's name. Keep an eye on bank and credit card statements for the next 90 days to catch ones you missed.",
      },
      {
        name: "Email accounts",
        detail:
          "Gmail, Outlook, Yahoo, etc. Each provider has a death-notification process that either deletes the account or transfers access (varies by provider). Don't rush — you may need the email to verify other accounts first.",
      },
      {
        name: "Social media",
        detail:
          "Facebook and Instagram offer \"memorialization\" (account preserved, with a banner indicating the death) or deletion. LinkedIn offers deletion. Each platform has a form requiring proof of death.",
      },
      {
        name: "Loyalty and rewards programs",
        detail:
          "Airline miles, hotel points, credit card rewards. Some transfer to a spouse or named beneficiary; many don't. Read each program's death-of-member policy before canceling.",
      },
      {
        name: "The USPS",
        detail:
          "File a Change of Address to forward mail to the executor for six months. Catches stray bills, subscription renewals, and notifications you missed.",
      },
    ],
  },
];

export default function AccountsToClosePage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader backHref="/after" backLabel="← After the funeral" />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              Weeks 1 to 4
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              Accounts to close, in the order that makes the most sense.
            </h1>
            <p className="text-lg text-ink-soft">
              Nothing here is urgent in the hours after a death. Start
              once you have certified death certificates in hand. Work
              through one phase before moving to the next &mdash; later
              phases often require confirmations from earlier ones.
            </p>
          </div>

          <nav
            aria-label="Phases"
            className="sticky top-0 z-10 -mx-5 px-5 py-3 bg-bg/95 backdrop-blur border-b border-border"
          >
            <ul className="flex gap-2 overflow-x-auto whitespace-nowrap text-sm">
              {PHASES.map((p) => (
                <li key={p.id}>
                  <a
                    href={`#${p.id}`}
                    className="inline-block px-3 py-1.5 rounded-full border border-border bg-surface text-ink-soft hover:text-ink hover:border-primary"
                  >
                    {p.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {PHASES.map((phase, pi) => (
            <Card key={phase.id} tone={pi === 0 ? "primary" : undefined}>
              <h2
                id={phase.id}
                className="font-serif text-xl text-ink mb-2 scroll-mt-20"
              >
                {phase.title}
              </h2>
              <CardEyebrow>Phase {pi + 1}</CardEyebrow>
              <p className="text-ink-soft text-sm mb-5">{phase.when}</p>
              <ul className="space-y-4">
                {phase.items.map((item, i) => (
                  <li
                    key={i}
                    className="border-l-2 border-border pl-4 py-0.5"
                  >
                    <h3 className="font-medium text-ink mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-ink-soft leading-relaxed">
                      {item.detail}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          ))}

          <Card tone="soft">
            <div className="flex items-start justify-between gap-3 mb-2">
              <CardTitle>A script for the hard calls.</CardTitle>
              <CopyButton
                text={`I'm calling to report the death of [name]. I'm the [relationship]. The account number is [number] if you have it handy. Please tell me what documents you need to close the account, and confirm the best way to send them to you.`}
              />
            </div>
            <p className="text-ink-soft mb-3">
              Most of the people on the other end of these phone calls do
              this every day. They are not emotional about it and they
              are not going to pressure you. You can use this verbatim:
            </p>
            <blockquote className="border-l-4 border-primary-deep pl-5 py-1 text-ink font-serif text-base leading-relaxed my-3">
              &ldquo;I&rsquo;m calling to report the death of [name].
              I&rsquo;m the [relationship]. The account number is [number]
              if you have it handy. Please tell me what documents you need
              to close the account, and confirm the best way to send them
              to you.&rdquo;
            </blockquote>
            <p className="text-ink-soft text-sm">
              If you start crying, it&rsquo;s fine. Pause. They will wait.
              You don&rsquo;t have to apologize.
            </p>
          </Card>

          <p className="text-xs text-ink-muted">
            General consumer guidance, not legal or tax advice. Procedures
            vary by state, institution, and account type. When in doubt
            &mdash; especially for pension, tax, or probate questions
            &mdash; consult a licensed professional.
          </p>

          <div className="flex flex-wrap gap-4 pt-4 border-t border-border text-sm">
            <Link
              href="/after/estate-basics"
              className="font-medium text-primary-deep hover:underline"
            >
              Next: Estate basics &rarr;
            </Link>
            <Link
              href="/after/death-certificates"
              className="text-ink-muted hover:text-ink-soft"
            >
              ← Death certificates
            </Link>
            <Link
              href="/after"
              className="text-ink-muted hover:text-ink-soft"
            >
              After the funeral (index)
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
