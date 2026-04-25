import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Estate basics — wills, probate, and when to call an attorney",
  description:
    "What a will actually does, when probate applies and when it doesn't, what \"executor\" means in practice, and the specific situations where calling an estate attorney saves you money.",
};

export default function EstateBasicsPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader backHref="/after" backLabel="← After the funeral" />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              Month 1+
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              Estate basics, in plain English.
            </h1>
            <p className="text-lg text-ink-soft">
              This is the section that makes people nervous. It
              doesn&rsquo;t have to. Most estates are simpler than the
              word suggests. Here&rsquo;s what you actually need to
              understand, and the moments when calling an attorney
              saves you money instead of costing it.
            </p>
          </div>

          <Card>
            <CardTitle>What an &ldquo;estate&rdquo; actually means.</CardTitle>
            <p className="text-ink-soft mb-3">
              The estate is everything the deceased owned at the moment of
              death: bank accounts, real estate, vehicles, retirement
              accounts, personal property, debts. It exists as a legal
              entity until the assets are distributed and the debts are
              paid, then it closes.
            </p>
            <p className="text-ink-soft">
              &ldquo;Settling the estate&rdquo; means doing that work:
              inventorying what&rsquo;s there, paying what&rsquo;s owed,
              and distributing what&rsquo;s left according to the will
              (or state law, if there&rsquo;s no will).
            </p>
          </Card>

          <Card>
            <CardTitle>What a will does &mdash; and doesn&rsquo;t.</CardTitle>
            <p className="text-ink-soft mb-3">
              A will is a written instruction for how to distribute
              assets that go through probate. It names an{" "}
              <strong className="text-ink">executor</strong> (the person
              who does the work) and, if there are minor children,
              guardians.
            </p>
            <p className="text-ink-soft mb-3">
              Things a will typically <em>doesn&rsquo;t</em> control:
            </p>
            <ul className="space-y-2 text-[15px] text-ink-soft list-disc pl-5">
              <li>
                Accounts with a named beneficiary (life insurance,
                401(k), IRA, transfer-on-death bank accounts) &mdash; these
                go directly to the beneficiary, no probate.
              </li>
              <li>
                Jointly-owned property with right of survivorship (most
                married couples&rsquo; homes, joint bank accounts) &mdash;
                passes to the survivor automatically.
              </li>
              <li>
                Assets held in a trust &mdash; governed by the trust
                document, not the will.
              </li>
            </ul>
            <p className="text-ink-soft text-sm mt-3">
              This is why many families never go through probate at all:
              everything either had a beneficiary or was jointly owned.
            </p>
          </Card>

          <Card tone="primary">
            <CardEyebrow>The word people fear</CardEyebrow>
            <CardTitle>Probate, in plain terms.</CardTitle>
            <p className="text-ink-soft mb-3">
              Probate is the court process for transferring assets that
              don&rsquo;t have a beneficiary or joint owner. If the
              deceased owned a house solely in their name with no
              transfer-on-death deed, it probably has to go through
              probate.
            </p>
            <p className="text-ink-soft mb-3">
              What probate actually looks like:
            </p>
            <ul className="space-y-2 text-[15px] text-ink-soft list-disc pl-5 mb-3">
              <li>
                File the will (if any) with the county probate court,
                along with a petition to open the estate.
              </li>
              <li>
                The court confirms the executor (&ldquo;issues letters
                testamentary&rdquo;).
              </li>
              <li>
                The executor inventories assets, notifies creditors, pays
                debts and taxes, and distributes what&rsquo;s left.
              </li>
              <li>
                Final accounting filed; court closes the estate.
              </li>
            </ul>
            <p className="text-ink-soft">
              Timeline: typically 6&ndash;12 months for a simple estate,
              longer if there&rsquo;s real estate to sell or disputes
              between heirs. Many states have a &ldquo;small estate&rdquo;
              procedure (simplified probate) for estates under a dollar
              threshold &mdash; often $50,000&ndash;$150,000 depending on
              the state.
            </p>
          </Card>

          <Card>
            <CardTitle>Being the executor, in practice.</CardTitle>
            <p className="text-ink-soft mb-3">
              If the will named you executor &mdash; or the court appoints
              you because there&rsquo;s no will &mdash; your job is to
              administer the estate. Specifically:
            </p>
            <ul className="space-y-2 text-[15px] text-ink-soft list-disc pl-5 mb-3">
              <li>Secure assets (lock the house, safeguard valuables).</li>
              <li>Open an estate bank account for paying bills and collecting receivables.</li>
              <li>Inventory everything the deceased owned and owed.</li>
              <li>Notify creditors (some states publish a newspaper notice).</li>
              <li>Pay valid debts and taxes from estate funds.</li>
              <li>File the final income tax return (and, for larger estates, an estate tax return).</li>
              <li>Distribute remaining assets to heirs per the will or state law.</li>
              <li>File a final accounting with the probate court.</li>
            </ul>
            <p className="text-ink-soft">
              You&rsquo;re not a volunteer. Executors can be paid a
              reasonable fee from the estate &mdash; many states set the
              rate in statute, usually 2&ndash;4% of the estate value.
            </p>
          </Card>

          <Card tone="soft">
            <CardTitle>When to call an estate attorney.</CardTitle>
            <p className="text-ink-soft mb-3">
              An attorney costs money. So does doing this wrong. Call one
              if any of these apply:
            </p>
            <ul className="space-y-2 text-[15px] text-ink-soft list-disc pl-5 mb-3">
              <li>
                <strong className="text-ink">Real estate in probate.</strong>{" "}
                Deed transfer, title insurance, and the court process
                are easier to get right the first time.
              </li>
              <li>
                <strong className="text-ink">The estate is &ldquo;taxable&rdquo;</strong>{" "}
                &mdash; at the federal level that&rsquo;s above ~$13M
                (2026; subject to change), but some states impose estate
                or inheritance taxes at much lower thresholds.
              </li>
              <li>
                <strong className="text-ink">Disputes between heirs.</strong>{" "}
                As soon as one heir signals they may contest the will,
                get counsel &mdash; for yourself, not for the estate.
              </li>
              <li>
                <strong className="text-ink">A business or investment property.</strong>{" "}
                Valuation, transfer, and tax treatment are specialized
                work.
              </li>
              <li>
                <strong className="text-ink">Significant debts.</strong>{" "}
                An attorney can advise on whether to accept the executor
                role at all when the estate may be insolvent.
              </li>
              <li>
                <strong className="text-ink">A trust is involved.</strong>{" "}
                Trust administration is its own area and often requires
                specific filings.
              </li>
            </ul>
            <p className="text-ink-soft text-sm">
              Ask for a flat fee or a capped hourly estimate up front.
              Many estate attorneys offer a free initial consultation.
            </p>
          </Card>

          <Card>
            <CardEyebrow>If there&rsquo;s no will</CardEyebrow>
            <CardTitle>&ldquo;Intestate&rdquo; &mdash; but not chaos.</CardTitle>
            <p className="text-ink-soft mb-3">
              Every state has a default distribution plan for when
              someone dies without a will. Typically: to a surviving
              spouse and children in defined shares; then parents,
              siblings, and other relatives by degree.
            </p>
            <p className="text-ink-soft">
              Probate is still required, but the court applies state
              law instead of the will. If the family structure is
              straightforward, intestate estates often close as cleanly
              as testate ones &mdash; just with less flexibility in who
              receives what.
            </p>
          </Card>

          <Card tone="soft">
            <CardTitle>Things you can do now, without an attorney.</CardTitle>
            <ul className="space-y-2 text-[15px] text-ink-soft list-disc pl-5">
              <li>
                Find the will (safe deposit box, home safe, attorney&rsquo;s
                files, or electronic records).
              </li>
              <li>
                Locate recent bank, brokerage, and retirement statements
                &mdash; you&rsquo;ll need them to inventory assets.
              </li>
              <li>
                Collect at least 5 certified death certificates to start (see{" "}
                <Link
                  href="/after/death-certificates"
                  className="underline-offset-2 hover:underline text-primary-deep"
                >
                  the death-certificates page
                </Link>
                ).
              </li>
              <li>
                Open an estate bank account at the deceased&rsquo;s
                primary bank once you have letters from the probate
                court.
              </li>
              <li>
                Keep receipts for every estate expense &mdash; many are
                reimbursable or tax-deductible.
              </li>
            </ul>
          </Card>

          <p className="text-xs text-ink-muted">
            General consumer guidance only. Estate and probate law is
            state-specific and changes. Nothing on this page is legal or
            tax advice. For any estate with real property, business
            interests, material debts, or family conflict, consult a
            licensed attorney in your state before acting.
          </p>

          <div className="flex flex-wrap gap-4 pt-4 border-t border-border text-sm">
            <Link
              href="/after"
              className="font-medium text-primary-deep hover:underline"
            >
              Back to After the funeral (index)
            </Link>
            <Link
              href="/after/accounts-to-close"
              className="text-ink-muted hover:text-ink-soft"
            >
              ← Accounts to close
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
