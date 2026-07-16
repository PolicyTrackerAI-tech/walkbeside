"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import { ZIP_REGIONS } from "@/lib/zip-regions";

// benchmarksForZip matches metro scope_values against zip-regions labels
// EXACTLY — a typo'd free-text label would publish a row no lookup ever hits
// (a silent miss). The dropdown is built once from the same table the store
// reads, so whatever the founder picks is a label lookups can actually match.
const METRO_OPTIONS = Array.from(
  new Set(Object.values(ZIP_REGIONS).map((r) => r.metro)),
).sort((a, b) => a.localeCompare(b));

/**
 * Inline promote-to-data-tier form for one sufficient metro group on
 * /admin/benchmarks. It carries no n and no override — the server recomputes
 * n behind its n≥5 gate, and a gate rejection is surfaced verbatim, never
 * swallowed.
 */
export function PromoteForm({
  lineItemId,
  itemName,
  metro,
  p25Cents,
  p75Cents,
}: {
  lineItemId: string;
  itemName: string;
  metro: string;
  p25Cents: number;
  p75Cents: number;
}) {
  const [scope, setScope] = useState<"metro" | "state" | "zip3">("metro");
  const [scopeValue, setScopeValue] = useState(metro);
  const [fairLow, setFairLow] = useState(String(Math.round(p25Cents / 100)));
  const [fairHigh, setFairHigh] = useState(String(Math.round(p75Cents / 100)));
  const [predatoryAt, setPredatoryAt] = useState("");
  const [tier, setTier] = useState<"verified" | "community">("verified");
  const [sourcesNote, setSourcesNote] = useState("");
  const [version, setVersion] = useState("2026-07-v1");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ id: string; n: number } | null>(null);

  const idBase = `promote-${lineItemId}-${metro.replace(/\W+/g, "-")}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/benchmarks/promote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          scope,
          scopeValue,
          lineItemId,
          fairLowDollars: Number(fairLow),
          fairHighDollars: Number(fairHigh),
          ...(predatoryAt.trim()
            ? { predatoryAtDollars: Number(predatoryAt) }
            : {}),
          tier,
          sourcesNote,
          version,
        }),
      });
      const j = await r.json().catch(() => ({}) as Record<string, unknown>);
      if (!r.ok) {
        // The server's n-gate rejection must stay visible verbatim.
        setError(
          typeof j.error === "string"
            ? j.error
            : `Rejected (${r.status}): ${JSON.stringify(j.error ?? j)}`,
        );
        return;
      }
      setDone({ id: String(j.id), n: Number(j.n) });
    } catch {
      setError("Request failed — try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <p className="text-xs text-good mt-1">
        Promoted — row {done.id} is active (n={done.n}).
      </p>
    );
  }

  return (
    <details className="mt-1 mb-2">
      <summary className="text-xs text-primary-deep cursor-pointer">
        Promote {itemName} · {metro} to a data tier
      </summary>
      <form
        onSubmit={submit}
        className="mt-2 p-4 bg-surface-soft border border-border rounded-xl grid gap-3 sm:grid-cols-2"
      >
        <div>
          <Label htmlFor={`${idBase}-scope`}>Scope</Label>
          <Select
            id={`${idBase}-scope`}
            value={scope}
            onChange={(e) =>
              setScope(e.target.value as "metro" | "state" | "zip3")
            }
          >
            <option value="metro">metro</option>
            <option value="state">state</option>
            <option value="zip3">zip3</option>
          </Select>
        </div>
        <div>
          <Label
            htmlFor={`${idBase}-scope-value`}
            hint="labels come from lib/zip-regions.ts — store lookups match them exactly"
          >
            Scope value
          </Label>
          <Select
            id={`${idBase}-scope-value`}
            value={scopeValue}
            onChange={(e) => setScopeValue(e.target.value)}
            required
          >
            {/* A group label that somehow isn't in today's table (e.g. rows
                aggregated before a zip-regions relabel) still renders, so the
                form can't strand a promotable group. */}
            {!METRO_OPTIONS.includes(scopeValue) && (
              <option value={scopeValue}>{scopeValue}</option>
            )}
            {METRO_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor={`${idBase}-low`}>Fair low ($)</Label>
          <Input
            id={`${idBase}-low`}
            type="number"
            min="1"
            value={fairLow}
            onChange={(e) => setFairLow(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor={`${idBase}-high`}>Fair high ($)</Label>
          <Input
            id={`${idBase}-high`}
            type="number"
            min="1"
            value={fairHigh}
            onChange={(e) => setFairHigh(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor={`${idBase}-predatory`} hint="optional">
            Predatory at ($)
          </Label>
          <Input
            id={`${idBase}-predatory`}
            type="number"
            min="1"
            value={predatoryAt}
            onChange={(e) => setPredatoryAt(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`${idBase}-tier`}>Tier</Label>
          <Select
            id={`${idBase}-tier`}
            value={tier}
            onChange={(e) =>
              setTier(e.target.value as "verified" | "community")
            }
          >
            <option value="verified">verified</option>
            <option value="community">community</option>
          </Select>
        </div>
        <div>
          <Label
            htmlFor={`${idBase}-version`}
            hint="re-promoting the same scope × item needs a bumped version (v1 → v2) — the server rejects a duplicate"
          >
            Version
          </Label>
          <Input
            id={`${idBase}-version`}
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={`${idBase}-sources`}>Sources note</Label>
          <Textarea
            id={`${idBase}-sources`}
            rows={2}
            value={sourcesNote}
            onChange={(e) => setSourcesNote(e.target.value)}
            placeholder="e.g. 6 GPLs collected 2026-07, Salt Lake City homes' published price lists"
            required
          />
        </div>
        <div className="sm:col-span-2 flex items-center gap-3">
          <Button type="submit" disabled={busy}>
            {busy ? "Promoting…" : "Promote"}
          </Button>
          {error && <p className="text-sm text-bad">{error}</p>}
        </div>
      </form>
    </details>
  );
}
