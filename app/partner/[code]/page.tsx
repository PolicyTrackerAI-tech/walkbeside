import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { fmtUSD } from "@/lib/pricing-data";
import {
  aggregateCohort,
  sampleCohort,
  SMALL_SAMPLE_THRESHOLD,
} from "@/lib/partner-report";
import { PrintButton } from "./PrintButton";

export const metadata: Metadata = {
  title: "Partner report — Honest Funeral",
  robots: { index: false, follow: false },
};

function titleize(slug: string): string {
  const t = slug.replace(/[-_]+/g, " ").trim();
  return t ? t.replace(/\b\w/g, (c) => c.toUpperCase()) : "Your hospice";
}

export default async function PartnerReportPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const name = titleize(decodeURIComponent(code));
  const stats = aggregateCohort(sampleCohort());

  return (
    <main className="flex-1 flex flex-col">
      <div className="print:hidden">
        <SiteHeader rightSlot={<BackLink defaultHref="/" defaultLabel="← Home" />} />
      </div>

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-10 space-y-6">
          <div className="print:hidden rounded-xl border border-border bg-surface-soft px-4 py-3 text-sm text-ink-soft">
            <strong className="text-ink">Sample report.</strong> Illustrative
            figures so you can see the format — your real report is built from
            your own families during the pilot.
          </div>

          <div>
            <CardEyebrow>Honest Funeral · pilot report</CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-2">
              {name}
            </h1>
            <p className="text-ink-soft">
              What your families experienced — funeral-pricing advocacy, free to
              them and neutral by design.
            </p>
          </div>

          <Card tone="primary">
            <CardEyebrow>Total overcharge caught</CardEyebrow>
            <div className="font-serif text-4xl sm:text-5xl text-primary-deep mt-1 leading-none">
              {fmtUSD(stats.totalOverchargeCaughtCents / 100)}
            </div>
            <p className="text-ink-soft mt-2">
              across {stats.familiesHelped} families you referred — money that
              stayed with them, not the funeral home.
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

          <Card>
            <CardTitle>What this means for {name}</CardTitle>
            <ul className="mt-3 space-y-3 text-sm text-ink-soft leading-relaxed">
              <li>
                <strong className="text-ink">Referral reputation.</strong>{" "}
                Every family who felt genuinely supported through the funeral and
                the paperwork is the family who recommends you — and tells the
                hospital, the SNF, and the physician who refers to you.
              </li>
              <li>
                <strong className="text-ink">
                  Documented mandate coverage.
                </strong>{" "}
                Evidence you supported families across the funeral-and-admin part
                of the ~13-month bereavement window Medicare requires (42 CFR
                418.64) and doesn&rsquo;t separately fund.
              </li>
              <li>
                <strong className="text-ink">Staff hours back.</strong> The
                funeral-pricing and after-death questions your counselors
                field but weren&rsquo;t resourced for — handled.
              </li>
            </ul>
          </Card>

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

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60">
            <p className="text-xs text-ink-muted max-w-md leading-relaxed">
              Aggregate, de-identified outcomes only — never an individual
              family&rsquo;s details. Honest Funeral takes no money from funeral
              homes or insurers. Free to families. We never steer.
            </p>
            <PrintButton />
          </div>

          {stats.smallSample && (
            <p className="text-xs text-ink-muted">
              Small sample (n &lt; {SMALL_SAMPLE_THRESHOLD}) — these figures will
              stabilize as more families are served.
            </p>
          )}
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
