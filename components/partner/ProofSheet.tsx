import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { fmtUSD } from "@/lib/pricing-data";
import { SMALL_SAMPLE_THRESHOLD, type CohortStats } from "@/lib/partner-report";
import { PrintButton } from "@/components/partner/PrintButton";
import { PrintHeader } from "@/components/print/PrintHeader";

/**
 * The hospice / employer proof sheet — aggregate, de-identified outcomes for a
 * partner's referred families. Rendered for BOTH the sample sales-deck page
 * (/partner/[code], live=false) and the real token report (/partner/r/[token],
 * live=true). On a live report we hold back the dollar/satisfaction figures
 * below SMALL_SAMPLE_THRESHOLD so a lone referred family can't be re-identified,
 * and show a calm empty state at zero. The pull-quotes are illustrative and only
 * appear on the sample — never on a live partner's report.
 */
export function ProofSheet({
  name,
  stats,
  live,
  digest,
}: {
  name: string;
  stats: CohortStats;
  live: boolean;
  digest?: string;
}) {
  const empty = live && stats.familiesHelped === 0;

  return (
    <main className="flex-1 flex flex-col">
      <div className="print:hidden">
        <SiteHeader rightSlot={<BackLink defaultHref="/" defaultLabel="← Home" />} />
      </div>

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-10 space-y-6 print:py-0">
          <PrintHeader
            title={`Partner outcomes summary — ${name}`}
            subtitle="Aggregate, de-identified family outcomes · prepared by Honest Funeral"
          />
          {!live && (
            <div className="print:hidden rounded-xl border border-border bg-surface-soft px-4 py-3 text-sm text-ink-soft">
              <strong className="text-ink">Sample report.</strong> Illustrative
              figures so you can see the format &mdash; your real report is built
              from your own families during the pilot.
            </div>
          )}

          <div>
            <CardEyebrow>
              Honest Funeral · {live ? "partner report" : "pilot report"}
            </CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-2">
              {name}
            </h1>
            <p className="text-ink-soft">
              What your families experienced &mdash; funeral-pricing advocacy,
              free to them and neutral by design.
            </p>
          </div>

          {empty ? (
            <Card tone="soft">
              <CardTitle>Your report is building.</CardTitle>
              <p className="text-ink-soft mt-2">
                No completed cases yet. As the families you refer finish their
                arrangements, their de-identified outcomes will appear here
                &mdash; total overcharge caught, how many saved, satisfaction,
                and time to resolution.
              </p>
            </Card>
          ) : stats.smallSample ? (
            <Card tone="primary">
              <CardEyebrow>Families helped so far</CardEyebrow>
              <div className="font-serif text-4xl sm:text-5xl text-primary-deep mt-1 leading-none">
                {stats.familiesHelped}
              </div>
              <p className="text-ink-soft mt-2">
                Your report is building. We hold the dollar and satisfaction
                figures back until at least {SMALL_SAMPLE_THRESHOLD} families
                have completed &mdash; both so the numbers are stable and so no
                single family can be identified from them.
              </p>
            </Card>
          ) : (
            <>
              <Card tone="primary">
                <CardEyebrow>Total overcharge caught</CardEyebrow>
                <div className="font-serif text-4xl sm:text-5xl text-primary-deep mt-1 leading-none">
                  {fmtUSD(stats.totalOverchargeCaughtCents / 100)}
                </div>
                <p className="text-ink-soft mt-2">
                  across {stats.familiesHelped} families you referred &mdash;
                  money that stayed with them, not the funeral home.
                </p>
              </Card>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Metric label="Families helped" value={stats.familiesHelped} />
                <Metric
                  label="Families who saved"
                  value={`${stats.familiesWhoSaved} of ${stats.familiesHelped}`}
                />
                <Metric
                  label="Avg caught / family"
                  value={fmtUSD(stats.avgOverchargeCaughtCents / 100)}
                />
                <Metric label="FTC issues flagged" value={stats.ftcIssuesFlagged} />
                <Metric
                  label="Avg satisfaction"
                  value={
                    stats.avgSatisfaction != null
                      ? `${stats.avgSatisfaction} / 5`
                      : "—"
                  }
                />
                <Metric
                  label="Median time to resolution"
                  value={
                    stats.medianResolutionDays != null
                      ? `${stats.medianResolutionDays} days`
                      : "—"
                  }
                />
              </div>

              {stats.pilotMetrics && (
                <Card>
                  <CardTitle>Pilot metrics</CardTitle>
                  <p className="text-xs text-ink-muted mt-1 mb-3">
                    Savings measured against the metro&rsquo;s median fair
                    price (not just the family&rsquo;s own quote). Benefit
                    dollars are amounts families actually recovered (VA, SSA,
                    insurance, county). Satisfaction share = families rating
                    4&ndash;5 of 5.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <Metric
                      label="Median saved vs metro"
                      value={
                        stats.pilotMetrics.medianSavedVsMetroCents != null
                          ? fmtUSD(stats.pilotMetrics.medianSavedVsMetroCents / 100)
                          : "—"
                      }
                    />
                    <Metric
                      label="Avg quotes / family"
                      value={stats.pilotMetrics.avgQuotesPerFamily ?? "—"}
                    />
                    <Metric
                      label="Benefit $ recovered"
                      value={
                        stats.pilotMetrics.totalBenefitDollarsCents != null
                          ? fmtUSD(stats.pilotMetrics.totalBenefitDollarsCents / 100)
                          : "—"
                      }
                    />
                    <Metric
                      label="Rating 4–5 of 5"
                      value={
                        stats.pilotMetrics.satisfactionPromoterPct != null
                          ? `${stats.pilotMetrics.satisfactionPromoterPct}%`
                          : "—"
                      }
                    />
                    <Metric
                      label="Reminded of hospice bereavement benefit"
                      value={`${stats.pilotMetrics.bereavementRemindedPct}%`}
                    />
                  </div>
                </Card>
              )}

              {stats.toolEngagement && (
                <Card>
                  <CardTitle>How families used the tools</CardTitle>
                  <p className="text-xs text-ink-muted mt-1 mb-3">
                    Server-recorded artifacts only — most tools run privately
                    on the family&rsquo;s own device, so these are floors, not
                    totals. Aggregate counts; never who.
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <Metric
                      label="Checked a price list"
                      value={`${stats.toolEngagement.checkerPct}%`}
                    />
                    <Metric
                      label="Tracked certificates"
                      value={`${stats.toolEngagement.certTrackerPct}%`}
                    />
                    <Metric
                      label="Wrote the obituary"
                      value={`${stats.toolEngagement.obituaryPct}%`}
                    />
                  </div>
                </Card>
              )}
            </>
          )}

          {!empty && digest && (
            <Card tone="primary">
              <CardEyebrow>In plain English</CardEyebrow>
              <p className="text-ink mt-1 leading-relaxed">{digest}</p>
            </Card>
          )}

          {!empty && (
            <Card>
              <CardTitle>What this means for {name}</CardTitle>
              <ul className="mt-3 space-y-3 text-sm text-ink-soft leading-relaxed">
                <li>
                  <strong className="text-ink">Referral reputation.</strong>{" "}
                  Every family who felt genuinely supported through the funeral
                  and the paperwork is the family who recommends you &mdash; and
                  tells the hospital, the SNF, and the physician who refers to
                  you.
                </li>
                <li>
                  <strong className="text-ink">Documented mandate coverage.</strong>{" "}
                  Evidence you supported families across the funeral-and-admin
                  part of the ~13-month bereavement window Medicare requires (42
                  CFR 418.64) and doesn&rsquo;t separately fund.
                </li>
                <li>
                  <strong className="text-ink">Staff hours back.</strong> The
                  funeral-pricing and after-death questions your counselors
                  field but weren&rsquo;t resourced for &mdash; handled.
                </li>
              </ul>
            </Card>
          )}

          {!live && (
            <>
              <div className="grid sm:grid-cols-2 gap-3">
                <Quote
                  text="They caught a $2,000 overcharge on the casket and told me exactly what to say. I finally felt like someone was on my side."
                  who="Daughter of a patient · de-identified"
                />
                <Quote
                  text="I had no idea the death certificates were marked up. The checklist for the weeks after was the part I didn't know I needed."
                  who="Spouse · de-identified"
                />
              </div>
              <Card tone="primary">
                <CardTitle>Want a live report for your own families?</CardTitle>
                <p className="text-ink-soft mt-2 mb-4">
                  Apply to partner with Honest Funeral &mdash; there&rsquo;s no
                  cost to the families you refer, and this report starts
                  filling in with their real outcomes.
                </p>
                <LinkButton href="/partners/apply">
                  Apply to partner →
                </LinkButton>
              </Card>
            </>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60">
            <p className="text-xs text-ink-muted max-w-md leading-relaxed">
              Aggregate, de-identified outcomes only &mdash; never an individual
              family&rsquo;s details. Honest Funeral takes no money from funeral
              homes or insurers. Free to families. We never steer.
            </p>
            {!empty && <PrintButton />}
          </div>

          {/* Methodology + scope footnote — print-visible on purpose: the
              printed page travels without its URL context. */}
          <div className="text-xs text-ink-muted leading-relaxed border-t border-border/60 pt-3 space-y-2">
            <p>
              <strong className="text-ink-soft">How these figures are made:</strong>{" "}
              every number aggregates outcomes recorded on the referred
              families&rsquo; own cases (savings measured against the
              family&rsquo;s own original quote; satisfaction as reported by
              the family). Cohorts under {SMALL_SAMPLE_THRESHOLD} families
              suppress dollar and satisfaction figures so no individual family
              is identifiable. Tool-engagement figures count server-recorded
              artifacts only and understate real usage. Full methodology:
              honestfuneral.co/methodology.
            </p>
            <p>
              <strong className="text-ink-soft">What this is not:</strong>{" "}
              an informational summary of aggregate family outcomes — not a
              CMS or CAHPS instrument, not a compliance certification or
              survey substitute, and it implies no endorsement by CMS or any
              regulator.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-surface-soft rounded-xl p-4">
      <div className="text-xs uppercase tracking-wider text-ink-muted">
        {label}
      </div>
      <div className="font-serif text-2xl text-ink mt-1">{value}</div>
    </div>
  );
}

function Quote({ text, who }: { text: string; who: string }) {
  return (
    <Card>
      <p className="text-ink-soft italic leading-relaxed">&ldquo;{text}&rdquo;</p>
      <p className="text-xs text-ink-muted mt-3">— {who}</p>
    </Card>
  );
}
