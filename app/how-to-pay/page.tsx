import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { HelpFooter } from "@/components/HelpFooter";
import { ogImage } from "@/lib/og";

export const metadata: Metadata = {
  title: "How to pay for a funeral when you can't afford it — every program, in order",
  description:
    "County indigent burial, FEMA funeral assistance, Medicaid burial allowance, religious aid, free options like body donation, plus the cheapest legal way to handle a death. The full playbook for families with no money for a funeral.",
  openGraph: { images: [ogImage("How to pay for a funeral when you can't afford it", "Money")] },
};

/**
 * /how-to-pay — public, indexable. Probably the most-searched and
 * worst-answered question in the consumer funeral space. Practical
 * walk through every assistance program, cost-cutting option, and
 * last-resort path. No sister voice; factual and procedural.
 */
export default function HowToPayPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-7">
          <div>
            <CardEyebrow>How to pay when you can&rsquo;t afford it</CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              Every program, every free option, every cost-cutting move &mdash; in order.
            </h1>
            <p className="text-lg text-ink-soft">
              The median US funeral costs $9,000&ndash;$15,000.
              Roughly 40% of US families can&rsquo;t cover an
              unexpected $400 expense, let alone that. There is a
              full menu of assistance programs, free options, and
              cost-cutting moves &mdash; most families either
              don&rsquo;t know about them or learn too late. This is
              the menu, ordered by what you should consider first.
            </p>
          </div>

          <Card tone="primary">
            <CardTitle>The cheapest legal option is free.</CardTitle>
            <p className="text-ink-soft mt-3">
              Before you do anything else, know that whole-body
              donation to a university medical school costs the
              family $0 in many cases &mdash; including transport
              and cremation, with ashes returned 1&ndash;3 years
              later. It is not for every family, but if cost is the
              binding constraint, this is the path with no bill.{" "}
              <Link
                href="/body-donation"
                className="text-primary-deep underline"
              >
                See the full guide to body donation.
              </Link>
            </p>
          </Card>

          <Card>
            <CardEyebrow>Step 1 — Check what is already owed to the family</CardEyebrow>
            <CardTitle>Five sources of money most families don&rsquo;t realize they have.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Before applying for assistance, find money already on
                the table:
              </p>
              <ol className="space-y-3 list-decimal pl-5">
                <li>
                  <strong className="text-ink">Life insurance.</strong>{" "}
                  Check the deceased&rsquo;s files, employer
                  benefits, credit card agreements, and union or
                  membership benefits. Many people have small
                  life-insurance policies (often $5,000&ndash;$25,000)
                  through work or as a card perk that they never
                  mentioned. Death certificate is the only document
                  most claims need.
                </li>
                <li>
                  <strong className="text-ink">Social Security $255 death benefit.</strong>{" "}
                  Goes to a surviving spouse or eligible child.
                  Two-year deadline. Apply by calling
                  1-800-772-1213.{" "}
                  <Link
                    href="/survivor-benefits"
                    className="text-primary-deep underline"
                  >
                    Full guide to survivor benefits.
                  </Link>
                </li>
                <li>
                  <strong className="text-ink">Veterans burial benefits.</strong>{" "}
                  A veteran with an honorable discharge qualifies for
                  free burial in a national cemetery, a free
                  headstone or marker, a burial flag, and military
                  honors. Cash burial allowance of $300&ndash;$2,000
                  depending on circumstances.{" "}
                  <Link
                    href="/veterans"
                    className="text-primary-deep underline"
                  >
                    Full guide to veterans burial benefits.
                  </Link>
                </li>
                <li>
                  <strong className="text-ink">Employer death benefits.</strong>{" "}
                  Many employers pay accrued PTO, final wages, and
                  sometimes a small lump-sum death benefit to a
                  spouse. Some 401(k) plans pay a small bereavement
                  benefit. The HR department or benefits
                  administrator can confirm.
                </li>
                <li>
                  <strong className="text-ink">Pre-need contracts the family didn&rsquo;t know about.</strong>{" "}
                  Older people sometimes pre-paid for a funeral
                  decades ago and forgot to tell anyone. Check the
                  deceased&rsquo;s safe-deposit box, files marked
                  &ldquo;in case of emergency,&rdquo; and call a few
                  funeral homes in their hometown to ask if they
                  have a pre-need contract on file.
                </li>
              </ol>
              <p>
                Together these often cover a substantial part of a
                modest funeral.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Step 2 &mdash; Government assistance programs</CardEyebrow>
            <CardTitle>County, state, and federal aid the family may qualify for.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                <strong className="text-ink">County indigent burial.</strong>{" "}
                Every US state has some version of an indigent
                burial program, administered at the county level.
                Eligibility is usually based on the deceased&rsquo;s
                financial situation and whether the next of kin
                also lacks resources. The program typically pays for
                a direct cremation (most common) or a basic burial,
                with no service. Contact the county social services
                or human services office, or the county
                coroner/medical examiner. Application is usually
                made within a few days of death.
              </p>
              <p>
                <strong className="text-ink">Medicaid burial allowance.</strong>{" "}
                Many states allow Medicaid recipients to set aside
                a modest amount (typically $1,500&ndash;$3,000)
                during life specifically for burial expenses,
                without it counting against Medicaid asset limits.
                If the deceased was on Medicaid, check with the
                state Medicaid office for any burial-fund balance.
                A few states pay a small post-death allowance
                directly to a funeral home or family.
              </p>
              <p>
                <strong className="text-ink">FEMA funeral assistance.</strong>{" "}
                FEMA has historically only paid funeral assistance
                for federally declared disasters. The
                COVID-19-specific program (paid up to $9,000 per
                death) closed for new applications, but FEMA does
                periodically open similar programs for major
                disaster events. Check{" "}
                <a
                  href="https://www.fema.gov/disaster/funeral-assistance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-deep underline"
                >
                  fema.gov/disaster/funeral-assistance
                </a>{" "}
                for current eligibility.
              </p>
              <p>
                <strong className="text-ink">Crime victim compensation.</strong>{" "}
                Every US state has a victim compensation program
                that pays funeral costs for deaths from violent
                crime &mdash; homicide, hit-and-run, manslaughter,
                drunk-driving deaths. Typical payment:
                $3,000&ndash;$10,000 for funeral and related
                expenses. Application is made through the state
                attorney general's office or the prosecutor handling
                the case.
              </p>
              <p>
                <strong className="text-ink">Public-safety officer death benefits.</strong>{" "}
                Federal Public Safety Officers Benefits program pays
                a large lump-sum benefit ($400,000+ in 2026) to the
                survivors of police officers, firefighters, EMTs,
                and corrections officers who die in the line of
                duty. State equivalents add to this.
              </p>
              <p>
                <strong className="text-ink">Tribal benefits.</strong>{" "}
                Many federally recognized tribes have burial
                assistance programs for tribal members. Indian
                Health Service may also cover some costs.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Step 3 &mdash; Charitable and community aid</CardEyebrow>
            <CardTitle>Religious, fraternal, and nonprofit funeral aid.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                <strong className="text-ink">Religious community aid.</strong>{" "}
                Most established faith communities have a burial or
                funeral fund for members and sometimes for
                non-members in the community. Catholic dioceses
                (parish poor box, St. Vincent de Paul societies),
                Jewish chevra kadisha and burial societies, Islamic
                burial societies, Mormon ward bishop's storehouse,
                and many independent congregations all maintain
                some form of aid. Ask the religious leader, not
                only the front office.
              </p>
              <p>
                <strong className="text-ink">Fraternal organizations.</strong>{" "}
                Masonic lodges, Elks, Moose, Knights of Columbus,
                Eastern Star, and similar groups often pay a small
                death benefit ($500&ndash;$3,000) for members. Many
                also have programs for non-member family in dire
                need.
              </p>
              <p>
                <strong className="text-ink">Nonprofit funeral funds.</strong>{" "}
                Final Salute (
                <a
                  href="https://finalsaluteinc.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-deep underline"
                >
                  finalsaluteinc.org
                </a>
                ) for women veterans; Children's Burial Assistance
                (
                <a
                  href="https://childrensburial.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-deep underline"
                >
                  childrensburial.org
                </a>
                ) for the death of a minor child; The TEARS
                Foundation (
                <a
                  href="https://thetearsfoundation.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-deep underline"
                >
                  thetearsfoundation.org
                </a>
                ) for infant loss. The hospice agency social worker
                or hospital case manager will often know about
                regional funds specific to the cause of death or
                the family's circumstances.
              </p>
              <p>
                <strong className="text-ink">Funeral home charity programs.</strong>{" "}
                Some funeral homes &mdash; particularly independent,
                long-established neighborhood homes &mdash; quietly
                handle a small number of cases each year at cost or
                for free. They don&rsquo;t advertise this and it
                isn&rsquo;t guaranteed; asking respectfully and
                being honest about the family&rsquo;s situation is
                usually how it&rsquo;s arranged. Larger chain homes
                rarely offer this.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Step 4 &mdash; The cheapest legal services</CardEyebrow>
            <CardTitle>If you&rsquo;re paying out of pocket, here&rsquo;s the floor.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                If the family is paying without assistance, the
                lowest legal costs in 2026 are:
              </p>
              <ul className="space-y-3 list-disc pl-5">
                <li>
                  <strong className="text-ink">Whole-body donation:</strong>{" "}
                  $0 (free, includes cremation, ashes returned).
                  Conditions apply (acceptance is not guaranteed,
                  pre-registration strongly preferred).
                </li>
                <li>
                  <strong className="text-ink">County indigent direct cremation:</strong>{" "}
                  $0 to the family if qualified. No service, ashes
                  may or may not be returned depending on county.
                </li>
                <li>
                  <strong className="text-ink">Home funeral + direct cremation:</strong>{" "}
                  $800&ndash;$1,500 total. Family handles care of
                  the body and transport; the only paid step is the
                  cremation itself. Legal in 41 states.{" "}
                  <Link
                    href="/home-funeral"
                    className="text-primary-deep underline"
                  >
                    Full guide.
                  </Link>
                </li>
                <li>
                  <strong className="text-ink">Direct cremation through a low-cost provider:</strong>{" "}
                  $800&ndash;$1,500. Several national low-cost
                  cremation services operate in major US metros
                  (Tulip Cremation, Solace Cremation, and similar).
                  Local low-cost providers exist in most cities;
                  compare 2&ndash;3 by calling for a quote.
                </li>
                <li>
                  <strong className="text-ink">Direct burial without service:</strong>{" "}
                  $1,500&ndash;$4,000 plus cemetery costs
                  ($1,000&ndash;$4,000). The lowest-cost burial
                  option. Body goes directly from funeral home to
                  cemetery; no embalming, no viewing, no funeral
                  service at the home.
                </li>
              </ul>
              <p>
                Any of these can be paired with a memorial service
                later, anywhere, on the family&rsquo;s schedule,
                without involving (or paying) a funeral home.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Step 5 &mdash; If the family decides to crowdfund</CardEyebrow>
            <CardTitle>What works, what doesn&rsquo;t, what to know about taxes.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                GoFundMe is the default platform; it charges no
                platform fee (the credit-card processing fee is
                about 2.9% + $0.30 per donation). Funds release to
                a bank account, usually within 2&ndash;5 business
                days of withdrawal. The campaign organizer does not
                need to be the next of kin, but they need a bank
                account and a real US tax ID.
              </p>
              <p>
                <strong className="text-ink">What works:</strong>{" "}
                a brief, honest description; one or two clear
                photos; a real dollar goal with a brief breakdown
                of what it covers; updates as donations come in;
                thank-you notes. The most successful campaigns are
                organized by a friend or relative, not the closest
                next of kin who is often too overwhelmed.
              </p>
              <p>
                <strong className="text-ink">What doesn&rsquo;t:</strong>{" "}
                vague goals (&ldquo;help us pay for the funeral&rdquo;
                with no number), pressure tactics, sharing only on a
                small social circle. Asking 3 close friends or
                family to share the link with their networks
                multiplies reach faster than the organizer can do
                alone.
              </p>
              <p>
                <strong className="text-ink">Taxes:</strong>{" "}
                gifts of less than $18,000 per donor per year
                (2026 limit) are not taxable to the recipient or
                the donor. The vast majority of funeral
                crowdfunding falls well below this. GoFundMe issues
                no tax forms for personal campaigns. The funds are
                not income.
              </p>
            </div>
          </Card>

          <Card tone="warn">
            <CardEyebrow>Step 6 &mdash; Last resort and what to avoid</CardEyebrow>
            <CardTitle>Funeral payment plans, loans, and the no-money path.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                <strong className="text-ink">Funeral home payment plans.</strong>{" "}
                Many funeral homes will accept a payment plan,
                particularly for families they recognize from the
                neighborhood or who present clearly and honestly.
                Plans typically run 3&ndash;12 months with no
                interest. Ask. Independent homes are far more
                flexible than national chains.
              </p>
              <p>
                <strong className="text-ink">Avoid high-interest funeral loans.</strong>{" "}
                Some online lenders specifically target families
                paying for funerals with 15&ndash;30% APR
                installment loans. These are predatory. A
                higher-quality credit card (typically 18&ndash;25%
                APR) is rarely worse, and a credit union personal
                loan (8&ndash;15% APR) is much better. The county
                indigent program, body donation, and direct
                cremation through a low-cost provider almost always
                beat any loan option.
              </p>
              <p>
                <strong className="text-ink">If the family genuinely has no money and refuses to claim the body:</strong>{" "}
                if no next of kin steps forward to claim a body,
                the county takes responsibility under its indigent
                program. The body is held by the coroner or medical
                examiner for a defined period (varies by state,
                typically 30&ndash;90 days) and then disposed of at
                county expense, usually by cremation, with ashes
                held or scattered per county policy. This is a
                legitimate option for families with no resources;
                no one is required to pay for a funeral they cannot
                afford.
              </p>
              <p>
                <strong className="text-ink">Talk to a hospital or hospice social worker first.</strong>{" "}
                Their job includes helping families navigate
                exactly this. They know the local programs, the
                cooperative funeral homes, and the specific
                paperwork. Use them.
              </p>
            </div>
          </Card>

          <Card tone="primary">
            <CardTitle>One sentence to remember.</CardTitle>
            <p className="text-ink-soft mt-3">
              There is no legal or moral obligation to spend money
              the family doesn&rsquo;t have on a funeral. A direct
              cremation, a body donation, or a county indigent
              process is a complete and respectful end. A
              $12,000 funeral is a choice, not a duty.
            </p>
          </Card>

          <p className="text-xs text-ink-muted">
            This page is general consumer information, not legal or
            financial advice. Program eligibility, payment amounts,
            and procedures vary by state and county and change over
            time. For a binding answer about a specific situation,
            contact the relevant program directly: county social
            services for indigent burial, the Social Security
            Administration for survivor benefits, the VA for
            veterans benefits, or a hospital or hospice social
            worker for guidance through the full menu.
          </p>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
