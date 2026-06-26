"use client";

import * as React from "react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea, Label } from "@/components/ui/Field";
import { fmtUSD } from "@/lib/pricing-data";

export interface HiddenFee {
  label: string;
  cents: number;
  note?: string;
}

export interface OutcomeHome {
  id: string;
  negotiation_id: string;
  home_name: string;
  quote_cents: number | null;
  chosen: boolean;
  listed_price_cents: number | null;
  negotiated_price_cents: number | null;
  hidden_fees: HiddenFee[] | null;
  status: string;
}

export interface OutcomeCase {
  id: string;
  zip: string;
  service_type: string;
  status: string;
  target_home_estimate_cents: number | null;
  best_quote_cents: number | null;
  negotiated_price_cents: number | null;
  amount_paid_cents: number | null;
  satisfaction_score: number | null;
  savings_vs_listed_cents: number | null;
  outcome_recorded_at: string | null;
  created_at: string;
  homes: OutcomeHome[];
}

type Filter = "all" | "closed" | "with-outcome" | "needs-outcome";

function money(cents: number | null | undefined): string {
  if (cents == null) return "—";
  return fmtUSD(Math.round(cents) / 100);
}

function centsToInput(cents: number | null | undefined): string {
  return cents == null ? "" : String(Math.round(cents) / 100);
}

function inputToCents(v: string): number | null {
  const t = v.trim();
  if (t === "") return null;
  const n = Number(t.replace(/[$,]/g, ""));
  if (!Number.isFinite(n) || n < 0) return NaN;
  return Math.round(n * 100);
}

export function OutcomesClient({
  initial,
  adminKey,
}: {
  initial: OutcomeCase[];
  adminKey: string;
}) {
  const [cases, setCases] = React.useState<OutcomeCase[]>(initial);
  const [filter, setFilter] = React.useState<Filter>("all");
  const [query, setQuery] = React.useState("");
  const [busy, setBusy] = React.useState<Record<string, boolean>>({});
  const [error, setError] = React.useState<string | null>(null);

  const totals = React.useMemo(() => {
    let withOutcome = 0;
    let savings = 0;
    for (const c of cases) {
      if (c.outcome_recorded_at) withOutcome++;
      if (typeof c.savings_vs_listed_cents === "number") {
        savings += c.savings_vs_listed_cents;
      }
    }
    return { total: cases.length, withOutcome, savings };
  }, [cases]);

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return cases.filter((c) => {
      if (filter === "closed" && c.status !== "closed") return false;
      if (filter === "with-outcome" && !c.outcome_recorded_at) return false;
      if (filter === "needs-outcome" && c.outcome_recorded_at) return false;
      if (q) {
        const hay = [c.zip, c.service_type, c.status, ...c.homes.map((h) => h.home_name)]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [cases, filter, query]);

  async function send(payload: Record<string, unknown>, busyKey: string) {
    setBusy((b) => ({ ...b, [busyKey]: true }));
    setError(null);
    try {
      const res = await fetch("/api/admin/outcomes", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-admin-preview-key": adminKey,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof json?.error === "string" ? json.error : "Save failed",
        );
      }
      return json as { negotiation?: OutcomeCase; outreach?: OutcomeHome };
    } catch (err) {
      setError(`${err instanceof Error ? err.message : "Save failed"} — try again.`);
      return null;
    } finally {
      setBusy((b) => ({ ...b, [busyKey]: false }));
    }
  }

  function patchCaseLocal(negId: string, patch: Partial<OutcomeCase>) {
    setCases((prev) =>
      prev.map((c) => (c.id === negId ? { ...c, ...patch } : c)),
    );
  }

  function patchHomeLocal(
    negId: string,
    homeId: string,
    patch: Partial<OutcomeHome>,
    clearSiblingsChosen = false,
  ) {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== negId) return c;
        return {
          ...c,
          homes: c.homes.map((h) => {
            if (h.id === homeId) return { ...h, ...patch };
            if (clearSiblingsChosen) return { ...h, chosen: false };
            return h;
          }),
        };
      }),
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 text-sm">
        <Pill label="Cases" value={String(totals.total)} />
        <Pill label="Outcome recorded" value={String(totals.withOutcome)} tone="good" />
        <Pill label="Total savings vs listed" value={money(totals.savings)} tone="good" />
      </div>

      <Card tone="soft">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label htmlFor="f-status">Show</Label>
            <Select
              id="f-status"
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
            >
              <option value="all">All cases</option>
              <option value="closed">Closed</option>
              <option value="needs-outcome">Needs outcome</option>
              <option value="with-outcome">Outcome recorded</option>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="f-q">Search</Label>
            <Input
              id="f-q"
              placeholder="zip, service, home…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <p className="text-xs text-ink-muted mt-3">
          Showing {visible.length} of {totals.total}. Savings vs listed is
          computed by the database (listed − amount paid, or negotiated when
          amount paid isn&rsquo;t known).
        </p>
      </Card>

      {error && (
        <div className="rounded-xl border border-bad/30 bg-bad/10 text-bad text-sm px-4 py-3">
          {error}
        </div>
      )}

      {visible.length === 0 ? (
        <Card tone="soft">
          <p className="text-ink-soft">No cases match these filters.</p>
        </Card>
      ) : (
        <ul className="space-y-4">
          {visible.map((c) => (
            <li key={c.id}>
              <CaseRow
                c={c}
                busy={busy}
                send={send}
                patchCaseLocal={patchCaseLocal}
                patchHomeLocal={patchHomeLocal}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CaseRow({
  c,
  busy,
  send,
  patchCaseLocal,
  patchHomeLocal,
}: {
  c: OutcomeCase;
  busy: Record<string, boolean>;
  send: (
    payload: Record<string, unknown>,
    busyKey: string,
  ) => Promise<{ negotiation?: OutcomeCase; outreach?: OutcomeHome } | null>;
  patchCaseLocal: (negId: string, patch: Partial<OutcomeCase>) => void;
  patchHomeLocal: (
    negId: string,
    homeId: string,
    patch: Partial<OutcomeHome>,
    clearSiblingsChosen?: boolean,
  ) => void;
}) {
  const [negotiated, setNegotiated] = React.useState(
    centsToInput(c.negotiated_price_cents),
  );
  const [amountPaid, setAmountPaid] = React.useState(
    centsToInput(c.amount_paid_cents),
  );
  const [satisfaction, setSatisfaction] = React.useState(
    c.satisfaction_score == null ? "" : String(c.satisfaction_score),
  );

  async function saveCase() {
    const np = inputToCents(negotiated);
    const ap = inputToCents(amountPaid);
    if (Number.isNaN(np) || Number.isNaN(ap)) return;
    const res = await send(
      {
        scope: "case",
        negotiationId: c.id,
        negotiatedPriceCents: np,
        amountPaidCents: ap,
        satisfactionScore: satisfaction === "" ? null : Number(satisfaction),
      },
      `case:${c.id}`,
    );
    if (res?.negotiation) patchCaseLocal(c.id, res.negotiation);
  }

  const created = new Date(c.created_at).toLocaleDateString();
  const saving = !!busy[`case:${c.id}`];

  return (
    <Card>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <CardTitle className="mb-0.5">
            {c.zip} · {c.service_type}
          </CardTitle>
          <div className="text-xs text-ink-muted">
            {created} · status {c.status} · case {c.id.slice(0, 8)}
          </div>
        </div>
        <div className="text-right text-sm">
          <div className="text-ink-soft">
            Savings vs listed:{" "}
            <span className="font-semibold text-good">
              {money(c.savings_vs_listed_cents)}
            </span>
          </div>
          {c.outcome_recorded_at && (
            <div className="text-xs text-ink-muted">outcome recorded</div>
          )}
        </div>
      </div>

      {/* Reference (read-only) metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-sm">
        <Metric label="Listed (original)" value={money(c.target_home_estimate_cents)} />
        <Metric label="Best quote" value={money(c.best_quote_cents)} />
        <Metric label="Negotiated" value={money(c.negotiated_price_cents)} />
        <Metric label="Amount paid" value={money(c.amount_paid_cents)} />
      </div>

      {/* Case-level editor */}
      <div className="grid gap-3 sm:grid-cols-4 mt-4 items-end">
        <div>
          <Label htmlFor={`neg-${c.id}`}>Negotiated $</Label>
          <Input
            id={`neg-${c.id}`}
            inputMode="decimal"
            placeholder="0.00"
            value={negotiated}
            onChange={(e) => setNegotiated(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`paid-${c.id}`}>Amount paid $</Label>
          <Input
            id={`paid-${c.id}`}
            inputMode="decimal"
            placeholder="0.00"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`sat-${c.id}`}>Satisfaction</Label>
          <Select
            id={`sat-${c.id}`}
            value={satisfaction}
            onChange={(e) => setSatisfaction(e.target.value)}
          >
            <option value="">—</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </div>
        <Button onClick={saveCase} disabled={saving}>
          {saving ? "Saving…" : "Save case"}
        </Button>
      </div>

      {/* Per-home rows */}
      {c.homes.length > 0 && (
        <div className="mt-5 border-t border-border pt-4 space-y-3">
          <div className="text-xs uppercase tracking-wide text-ink-muted">
            Homes contacted
          </div>
          {c.homes.map((h) => (
            <HomeRow
              key={h.id}
              c={c}
              h={h}
              busy={busy}
              send={send}
              patchHomeLocal={patchHomeLocal}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

function HomeRow({
  c,
  h,
  busy,
  send,
  patchHomeLocal,
}: {
  c: OutcomeCase;
  h: OutcomeHome;
  busy: Record<string, boolean>;
  send: (
    payload: Record<string, unknown>,
    busyKey: string,
  ) => Promise<{ negotiation?: OutcomeCase; outreach?: OutcomeHome } | null>;
  patchHomeLocal: (
    negId: string,
    homeId: string,
    patch: Partial<OutcomeHome>,
    clearSiblingsChosen?: boolean,
  ) => void;
}) {
  const [listed, setListed] = React.useState(centsToInput(h.listed_price_cents));
  const [negotiated, setNegotiated] = React.useState(
    centsToInput(h.negotiated_price_cents),
  );
  const [feesText, setFeesText] = React.useState(
    h.hidden_fees && h.hidden_fees.length
      ? JSON.stringify(h.hidden_fees)
      : "",
  );

  const [feeErr, setFeeErr] = React.useState<string | null>(null);

  const saving = !!busy[`home:${h.id}`];
  const choosing = !!busy[`chosen:${h.id}`];

  async function choose() {
    const res = await send(
      {
        scope: "home",
        negotiationId: c.id,
        outreachId: h.id,
        chosen: true,
      },
      `chosen:${h.id}`,
    );
    if (res?.outreach) {
      patchHomeLocal(c.id, h.id, { chosen: true }, true);
    }
  }

  async function saveHome() {
    setFeeErr(null);
    const lp = inputToCents(listed);
    const np = inputToCents(negotiated);
    if (Number.isNaN(lp) || Number.isNaN(np)) return;
    let hiddenFees: HiddenFee[] | null = null;
    const t = feesText.trim();
    if (t !== "") {
      try {
        const parsed = JSON.parse(t);
        if (!Array.isArray(parsed)) throw new Error("not an array");
        hiddenFees = parsed as HiddenFee[];
      } catch {
        setFeeErr('Hidden fees must be JSON like [{"label":"…","cents":1234}]');
        return;
      }
    }
    const res = await send(
      {
        scope: "home",
        negotiationId: c.id,
        outreachId: h.id,
        listedPriceCents: lp,
        negotiatedPriceCents: np,
        hiddenFees,
      },
      `home:${h.id}`,
    );
    if (res?.outreach) patchHomeLocal(c.id, h.id, res.outreach);
  }

  return (
    <div className="rounded-xl border border-border bg-surface-soft px-4 py-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="font-medium text-ink">
          {h.home_name}
          {h.chosen && (
            <span className="ml-2 text-xs font-medium border border-good/30 bg-good/10 text-good rounded-full px-2 py-0.5">
              chosen
            </span>
          )}
        </div>
        <div className="text-sm text-ink-soft">
          quote {money(h.quote_cents)} · {h.status}
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-4 mt-3 items-end">
        <div>
          <Label htmlFor={`hl-${h.id}`}>Listed $</Label>
          <Input
            id={`hl-${h.id}`}
            inputMode="decimal"
            placeholder="0.00"
            value={listed}
            onChange={(e) => setListed(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`hn-${h.id}`}>Negotiated $</Label>
          <Input
            id={`hn-${h.id}`}
            inputMode="decimal"
            placeholder="0.00"
            value={negotiated}
            onChange={(e) => setNegotiated(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={`hf-${h.id}`} hint='JSON: [{"label":"…","cents":1234}]'>
            Hidden fees
          </Label>
          <Textarea
            id={`hf-${h.id}`}
            rows={1}
            placeholder="[]"
            value={feesText}
            onChange={(e) => setFeesText(e.target.value)}
          />
        </div>
      </div>
      {feeErr && <p className="text-sm text-bad mt-2">{feeErr}</p>}
      <div className="flex flex-wrap gap-2 mt-3">
        <Button onClick={saveHome} disabled={saving} variant="secondary">
          {saving ? "Saving…" : "Save home"}
        </Button>
        {!h.chosen && (
          <Button onClick={choose} disabled={choosing} variant="ghost">
            {choosing ? "…" : "Mark chosen"}
          </Button>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-ink-muted">{label}</div>
      <div className="text-ink font-medium">{value}</div>
    </div>
  );
}

function Pill({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "good";
}) {
  const cls =
    tone === "good"
      ? "bg-good/10 border-good/30 text-good"
      : "bg-surface border-border text-ink";
  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded-full px-3 py-1 ${cls}`}
    >
      <span className="font-semibold">{value}</span>
      <span className="text-xs uppercase tracking-wide">{label}</span>
    </span>
  );
}
