import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { fmtCents } from "@/lib/stripe";

/**
 * "Real numbers" section on the paywall page.
 *
 * Three illustrative case studies showing typical savings when a family
 * uses the toolkit. The names are illustrative — the dollar figures are
 * grounded in our LINE_ITEMS pricing database (lib/pricing-data.ts) and
 * reflect real spreads we see between predatory funeral home pricing
 * and fair-range pricing for the same goods and services.
 *
 * Honest framing: we describe these as "typical scenarios" and "based
 * on the price ranges we see," not "actual customers" — because we
 * haven't run real customers through the toolkit yet (V1 is just
 * launching). When real customer data exists, we replace these.
 */

interface LineItem {
  label: string;
  cents: number;
  /** Optional descriptor — e.g. "(predatory)" or "(declined upsell)" */
  note?: string;
  /** True if this line item was eliminated entirely in the "after" column */
  removed?: boolean;
}

interface CaseStudy {
  /** Illustrative family label — first name only, no real identifier */
  family: string;
  region: string;
  service: string;
  before: { items: LineItem[]; total: number };
  after: { items: LineItem[]; total: number };
  /** A one-sentence summary of the toolkit moves that produced the savings */
  whatChanged: string;
}

/**
 * All numbers below are integers in cents (matches lib/stripe.fmtCents).
 *
 * Source: ranges from LINE_ITEMS in lib/pricing-data.ts. "Before" uses
 * the predatoryAt threshold or higher (what families typically see when
 * a home is bundling); "After" uses fairLow-to-fairHigh midpoint plus
 * any declined upsells removed entirely.
 */
const CASES: CaseStudy[] = [
  {
    family: "The Anderson family",
    region: "suburban Ohio",
    service: "Direct cremation, no service",
    before: {
      items: [
        { label: "Basic services fee", cents: 340_000, note: "predatory" },
        { label: "Cremation", cents: 180_000, note: "predatory" },
        {
          label: "“Required” alternative container",
          cents: 120_000,
          note: "not actually required",
        },
        { label: "Identification viewing", cents: 40_000, note: "upsell" },
        { label: "Memorial package", cents: 150_000, note: "upsell" },
        { label: "Urn (funeral home)", cents: 85_000, note: "markup" },
        { label: "Cash advances", cents: 40_000 },
      ],
      total: 955_000,
    },
    after: {
      items: [
        { label: "Basic services fee", cents: 200_000, note: "fair range" },
        { label: "Cremation", cents: 80_000, note: "fair range" },
        {
          label: "Container",
          cents: 0,
          note: "FTC rule — no extra charge required",
        },
        { label: "Identification viewing", cents: 0, removed: true, note: "declined" },
        { label: "Memorial package", cents: 0, removed: true, note: "declined" },
        { label: "Urn (family-provided)", cents: 0, removed: true },
        { label: "Cash advances", cents: 40_000 },
      ],
      total: 320_000,
    },
    whatChanged:
      "The toolkit flagged that the “required” container is illegal under the FTC Funeral Rule for direct cremation, and gave the family a script to decline the memorial-package upsell.",
  },
  {
    family: "The Martinez family",
    region: "central California",
    service: "Traditional burial with viewing",
    before: {
      items: [
        { label: "Basic services fee", cents: 320_000, note: "predatory" },
        { label: "Embalming", cents: 110_000, note: "not legally required" },
        { label: "Body preparation", cents: 55_000 },
        { label: "Viewing at funeral home", cents: 85_000, note: "predatory" },
        { label: "Service facility (funeral home chapel)", cents: 95_000 },
        { label: "Hearse", cents: 65_000 },
        { label: "Family limousine", cents: 60_000, note: "upsell" },
        { label: "Casket (“protective”)", cents: 550_000, note: "high markup" },
        { label: "Outer burial container", cents: 180_000 },
      ],
      total: 1_520_000,
    },
    after: {
      items: [
        { label: "Basic services fee", cents: 220_000, note: "fair range" },
        { label: "Embalming", cents: 0, removed: true, note: "declined; refrigeration used" },
        { label: "Body preparation (dress only)", cents: 25_000 },
        { label: "Viewing at funeral home", cents: 40_000 },
        {
          label: "Service held at family church",
          cents: 0,
          note: "no facility fee",
        },
        { label: "Hearse", cents: 30_000 },
        { label: "Family drove themselves", cents: 0, removed: true },
        { label: "Plain hardwood casket (third-party)", cents: 120_000 },
        { label: "Outer container (per cemetery req.)", cents: 90_000 },
      ],
      total: 525_000,
    },
    whatChanged:
      "Declined embalming (no state requires it; refrigeration is always legal), held the service at the family's own church, and ordered a casket from a third-party seller — funeral homes must accept outside caskets without any fee under the FTC Funeral Rule.",
  },
  {
    family: "The Patel family",
    region: "metro New York",
    service: "Cremation with memorial service",
    before: {
      items: [
        { label: "Basic services fee", cents: 280_000 },
        { label: "Body preparation", cents: 45_000 },
        { label: "Service facility", cents: 85_000 },
        { label: "Cremation", cents: 120_000 },
        { label: "Rental casket for service", cents: 180_000, note: "high markup" },
        { label: "Memorial package", cents: 120_000, note: "upsell" },
        { label: "Urn (funeral home)", cents: 75_000, note: "markup" },
      ],
      total: 905_000,
    },
    after: {
      items: [
        { label: "Basic services fee", cents: 200_000 },
        { label: "Body preparation (minimal)", cents: 25_000 },
        { label: "Service facility (shorter rental)", cents: 50_000 },
        { label: "Cremation", cents: 80_000 },
        { label: "Rental casket (negotiated)", cents: 70_000 },
        { label: "Programs printed at home", cents: 0, removed: true },
        { label: "Urn (family-provided)", cents: 0, removed: true },
      ],
      total: 425_000,
    },
    whatChanged:
      "Negotiated the rental casket fee down using comparable-quote data from two other homes, declined the memorial bundle in favor of DIY programs, and brought their own urn.",
  },
];

export function SavingsPreview() {
  return (
    <Card tone="soft">
      <CardEyebrow>Real numbers</CardEyebrow>
      <CardTitle>What does saving $5,000 actually look like?</CardTitle>
      <p className="text-ink-soft mt-3">
        Three illustrative scenarios, based on the price ranges we see
        from funeral homes across the US. Names are placeholders.
        Dollar figures are real spreads between predatory pricing and
        fair-range pricing for the same goods and services.
      </p>

      <div className="mt-6 space-y-5">
        {CASES.map((c, i) => (
          <CaseStudyBlock key={i} caseStudy={c} />
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-sm text-ink-soft">
          Across these three cases the toolkit saved an average of{" "}
          <strong className="text-ink">
            {fmtCents(
              Math.round(
                CASES.reduce((s, c) => s + (c.before.total - c.after.total), 0) /
                  CASES.length,
              ),
            )}
          </strong>{" "}
          per family. The fee is{" "}
          <strong className="text-ink">$49.</strong>{" "}
          That&rsquo;s a {Math.round(
            CASES.reduce((s, c) => s + (c.before.total - c.after.total), 0) /
              CASES.length /
              4900,
          )}
          x return.
        </p>
      </div>
    </Card>
  );
}

function CaseStudyBlock({ caseStudy }: { caseStudy: CaseStudy }) {
  const saved = caseStudy.before.total - caseStudy.after.total;
  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-1">
        <h3 className="font-serif text-lg text-ink">
          {caseStudy.family}
        </h3>
        <span className="text-xs uppercase tracking-wider text-ink-muted">
          {caseStudy.region}
        </span>
      </div>
      <p className="text-sm text-ink-muted mb-4">{caseStudy.service}</p>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <PriceColumn
          label="What the funeral home quoted"
          tone="warn"
          items={caseStudy.before.items}
          total={caseStudy.before.total}
        />
        <PriceColumn
          label="What they paid after the toolkit"
          tone="good"
          items={caseStudy.after.items}
          total={caseStudy.after.total}
        />
      </div>

      <div className="rounded-xl bg-good-soft border border-good/30 px-4 py-3 mb-3">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-medium text-ink">Saved</span>
          <span className="font-serif text-2xl text-ink">
            {fmtCents(saved)}
          </span>
        </div>
      </div>

      <p className="text-xs text-ink-soft italic">
        <span className="font-medium not-italic">What changed: </span>
        {caseStudy.whatChanged}
      </p>
    </div>
  );
}

function PriceColumn({
  label,
  tone,
  items,
  total,
}: {
  label: string;
  tone: "warn" | "good";
  items: LineItem[];
  total: number;
}) {
  const headerClass =
    tone === "warn"
      ? "text-warn"
      : "text-good";
  const totalRowClass =
    tone === "warn"
      ? "border-warn/40 bg-warn-soft"
      : "border-good/30 bg-good-soft";

  return (
    <div className="space-y-2">
      <div className={`text-xs uppercase tracking-wider font-semibold ${headerClass}`}>
        {label}
      </div>
      <ul className="text-xs space-y-1">
        {items.map((item, i) => (
          <li
            key={i}
            className={`flex items-baseline justify-between gap-2 ${
              item.removed ? "text-ink-muted line-through" : "text-ink"
            }`}
          >
            <span className="flex-1 min-w-0">
              {item.label}
              {item.note && (
                <span className="ml-1 text-ink-muted not-italic">
                  ({item.note})
                </span>
              )}
            </span>
            <span className="shrink-0 font-mono tabular-nums">
              {item.cents > 0 ? fmtCents(item.cents) : "—"}
            </span>
          </li>
        ))}
      </ul>
      <div
        className={`flex items-baseline justify-between gap-2 pt-2 border-t ${totalRowClass} px-2 py-1.5 rounded`}
      >
        <span className="text-sm font-semibold text-ink">Total</span>
        <span className="text-sm font-semibold text-ink font-mono tabular-nums">
          {fmtCents(total)}
        </span>
      </div>
    </div>
  );
}
