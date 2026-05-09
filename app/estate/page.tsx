import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { HelpFooter } from "@/components/HelpFooter";
import { requirePaid } from "@/lib/require-paid";

export const metadata: Metadata = {
  title: "Estate settlement — what comes after the paperwork",
  description:
    "Probate basics by state, inherited IRA rules, unclaimed property, when to call an estate attorney. The long-tail piece of settling someone's affairs.",
};

export default async function EstatePage() {
  await requirePaid("/estate");

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader rightSlot={<BackLink defaultHref="/dashboard" />} />
      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-12 space-y-7">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              Estate settlement
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              The long-tail of settling someone&rsquo;s affairs.
            </h1>
            <p className="text-lg text-ink-soft">
              Most families settle in 6&ndash;18 months. Nothing here is
              urgent in the funeral-week sense &mdash; pace yourself and
              do one thing at a time.
            </p>
          </div>

          <Card tone="warn">
            <CardTitle>Get a one-hour attorney consult.</CardTitle>
            <p className="text-ink-soft mt-3">
              Almost every estate benefits from a single consult with a
              local estate attorney. Most charge $150&ndash;$400 for an hour.
              They&rsquo;ll tell you whether probate is required, what
              forms you need, and where the landmines are. This consult
              is the highest-leverage decision in the entire process.
            </p>
            <p className="text-sm text-ink-muted mt-3">
              How to find one: search &ldquo;estate attorney&rdquo; +
              your county. Your county bar association also runs a
              referral service. Avoid attorneys who quote prices over
              the phone before reviewing your situation.
            </p>
          </Card>

          <Card>
            <CardEyebrow>Probate basics</CardEyebrow>
            <CardTitle>Do you actually need probate?</CardTitle>
            <p className="text-ink-soft mt-3 mb-4">
              Probate is the court-supervised process of distributing a
              deceased person&rsquo;s assets according to their will (or
              state law if there&rsquo;s no will). It&rsquo;s slower and
              more expensive than people expect, but for many estates,
              it&rsquo;s required.
            </p>
            <p className="text-ink-soft mb-2">
              <strong>Probate is usually NOT required when:</strong>
            </p>
            <ul className="space-y-1.5 text-sm text-ink-soft mb-4 list-disc pl-5">
              <li>Assets are held in a revocable living trust.</li>
              <li>
                Accounts have a named beneficiary (life insurance, IRAs,
                401(k)s, payable-on-death bank accounts).
              </li>
              <li>
                Property is held jointly with right of survivorship (most
                married couples&rsquo; homes and bank accounts).
              </li>
              <li>
                The estate is small (most states have a &ldquo;small
                estate&rdquo; affidavit threshold; commonly
                $50,000&ndash;$150,000).
              </li>
            </ul>
            <p className="text-ink-soft mb-2">
              <strong>Probate IS required when:</strong>
            </p>
            <ul className="space-y-1.5 text-sm text-ink-soft list-disc pl-5">
              <li>
                Real estate or vehicles are titled solely in the
                deceased&rsquo;s name.
              </li>
              <li>
                Bank accounts have no surviving co-owner or
                payable-on-death beneficiary.
              </li>
              <li>
                There&rsquo;s a will but no living trust holding the
                assets.
              </li>
              <li>
                The total estate exceeds the small-estate threshold.
              </li>
            </ul>
          </Card>

          <Card>
            <CardEyebrow>How long probate takes</CardEyebrow>
            <CardTitle>Six months to two years, typically.</CardTitle>
            <p className="text-ink-soft mt-3 mb-3">
              The average is 9&ndash;12 months. Faster when the estate
              is straightforward and the will is clean. Slower when
              there&rsquo;s a contested will, an out-of-state property,
              or unclaimed creditors.
            </p>
            <p className="text-sm text-ink-muted">
              California, Texas, and Florida have particularly long
              probate timelines. New states with &ldquo;informal&rdquo;
              probate (e.g. Arizona, Colorado, parts of Nevada) tend to
              move faster.
            </p>
          </Card>

          <Card>
            <CardEyebrow>Inherited retirement accounts</CardEyebrow>
            <CardTitle>The 10-year rule changed everything.</CardTitle>
            <p className="text-ink-soft mt-3 mb-3">
              Under the SECURE Act (2020), most non-spouse beneficiaries
              of inherited IRAs and 401(k)s must drain the account
              within 10 years of the original owner&rsquo;s death.
              Failing to do so triggers a 50% penalty on the
              undistributed amount.
            </p>
            <p className="text-ink-soft mb-3">
              <strong>Spouses</strong> have additional options: roll the
              account into their own IRA (no 10-year limit), or treat
              it as an inherited IRA (different rules).
            </p>
            <p className="text-ink-soft">
              <strong>This is the single most expensive estate decision
              to get wrong.</strong> Talk to a CPA or the retirement plan
              administrator before moving the money. Don&rsquo;t cash it
              out without advice.
            </p>
          </Card>

          <Card>
            <CardEyebrow>Unclaimed property</CardEyebrow>
            <CardTitle>Free money the family didn&rsquo;t know existed.</CardTitle>
            <p className="text-ink-soft mt-3 mb-3">
              Every state runs a database of dormant accounts, uncashed
              checks, safe-deposit-box contents, and abandoned property.
              By federal mandate, banks turn over inactive accounts to
              the state after a few years.
            </p>
            <p className="text-ink-soft mb-3">
              Search every state the deceased ever lived in. Most
              families turn up a few hundred to a few thousand dollars
              they didn&rsquo;t know existed. It&rsquo;s free.
            </p>
            <a
              href="https://www.missingmoney.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm font-medium text-primary-deep underline-offset-2 hover:underline"
            >
              Search MissingMoney.com →
            </a>
            <p className="text-xs text-ink-muted mt-2">
              The official multi-state database, endorsed by NAUPA
              (National Association of Unclaimed Property Administrators).
            </p>
          </Card>

          <Card>
            <CardEyebrow>Final tax return</CardEyebrow>
            <CardTitle>Two returns may be due.</CardTitle>
            <p className="text-ink-soft mt-3 mb-3">
              <strong>Final 1040.</strong> Covers the portion of the year
              the deceased was alive. Filed by the surviving spouse or
              the estate executor. Due by the standard April deadline
              of the year after death.
            </p>
            <p className="text-ink-soft mb-3">
              <strong>1041 estate income tax return.</strong> Required if
              the estate earns income after death (interest, dividends,
              rental income). Due 9 months after death (extendable).
            </p>
            <p className="text-ink-soft">
              Most families need a CPA for this &mdash; the rules are
              fiddly and the penalties for getting them wrong are real.
              An accountant who handles estates costs $300&ndash;$1,500
              for a typical return.
            </p>
          </Card>

          <Card>
            <CardEyebrow>Digital accounts</CardEyebrow>
            <CardTitle>The new will-clause families forget.</CardTitle>
            <p className="text-ink-soft mt-3 mb-3">
              Email, password manager, cloud drive, social media. Each
              platform has its own legacy/memorialization process.
              Without a legacy contact set up before death, you&rsquo;ll
              typically need a court order to access accounts.
            </p>
            <ul className="space-y-1.5 text-sm text-ink-soft list-disc pl-5">
              <li>
                <strong>Apple</strong> — Legacy Contact via{" "}
                <code>appleid.apple.com</code>.
              </li>
              <li>
                <strong>Google</strong> — Inactive Account Manager via{" "}
                <code>myaccount.google.com/inactive</code>.
              </li>
              <li>
                <strong>Facebook / Instagram</strong> — Memorialize via
                in-app settings or the help center.
              </li>
              <li>
                <strong>1Password / LastPass</strong> — Family/legacy
                share is a paid feature; without it, the vault is
                effectively lost.
              </li>
            </ul>
          </Card>

          <Card tone="soft">
            <CardEyebrow>One last thing</CardEyebrow>
            <CardTitle>Set up your own estate while it&rsquo;s fresh.</CardTitle>
            <p className="text-ink-soft mt-3">
              Watching someone else&rsquo;s estate get settled is the
              single best motivator to set up your own. Will, beneficiary
              designations on every account, legacy contacts on Apple
              and Google, and a list of accounts your family will need
              to access &mdash; do it in the next 30 days while
              you&rsquo;re thinking about it.
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <LinkButton href="/planning" variant="secondary">
                Open planning resources →
              </LinkButton>
            </div>
          </Card>

          <p className="text-xs text-ink-muted">
            This page is general consumer guidance, not legal, tax, or
            financial advice. State rules vary. Specific questions go
            to a licensed estate attorney or a CPA.
          </p>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
