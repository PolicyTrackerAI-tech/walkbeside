import {
  LINE_ITEMS,
  fmtUSD,
  fmtRange,
  adjustedRange,
  type LineItem,
  type ServiceType,
} from "@/lib/pricing-data";

const REQUIRED_BADGE: Record<LineItem["required"], { label: string; tone: string }> = {
  yes: { label: "Required", tone: "bg-bad-soft text-bad" },
  no: { label: "Optional", tone: "bg-good-soft text-good" },
  burial: { label: "Burial only", tone: "bg-warn-soft text-warn" },
  cemetery: { label: "Per cemetery", tone: "bg-warn-soft text-warn" },
  cremation: { label: "Cremation only", tone: "bg-warn-soft text-warn" },
};

export function PriceTable({
  zip,
  filterService,
  highlightHighMarkup = false,
}: {
  zip?: string;
  filterService?: ServiceType;
  highlightHighMarkup?: boolean;
}) {
  const items = filterService
    ? LINE_ITEMS.filter((i) => i.categories.includes(filterService))
    : LINE_ITEMS;
  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <div className="grid grid-cols-12 px-5 py-3 border-b border-border bg-surface-soft text-xs uppercase tracking-wider text-ink-muted">
        <div className="col-span-5">Item</div>
        <div className="col-span-3 text-right">Fair price</div>
        <div className="col-span-2 text-right">Watch out above</div>
        <div className="col-span-2 text-right">Required?</div>
      </div>
      <ul>
        {items.map((it) => {
          const [low, high] = adjustedRange(it.fairLow, it.fairHigh, zip);
          const flag = highlightHighMarkup && it.highMarkup;
          return (
            <li
              key={it.id}
              className={`grid grid-cols-12 px-5 py-4 border-b border-border last:border-b-0 ${
                flag ? "bg-primary-soft/40" : ""
              }`}
            >
              <div className="col-span-5">
                <div className="text-ink font-medium">{it.name}</div>
                <div className="text-sm text-ink-soft mt-1">{it.notes}</div>
              </div>
              <div className="col-span-3 text-right text-ink">
                {fmtRange(low, high)}
              </div>
              <div className="col-span-2 text-right text-bad">
                &gt; {fmtUSD(Math.round(it.predatoryAt * (high / it.fairHigh)))}
              </div>
              <div className="col-span-2 text-right">
                <span
                  className={`inline-block text-[11px] uppercase tracking-wide px-2 py-1 rounded-full ${REQUIRED_BADGE[it.required].tone}`}
                >
                  {REQUIRED_BADGE[it.required].label}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
