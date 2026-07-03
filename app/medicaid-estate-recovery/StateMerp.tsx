"use client";

import { useState } from "react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Label, Select } from "@/components/ui/Field";
import { VERIFIED_MERP, merpForState } from "@/lib/merp-by-state";

const ALL_STATES: Array<[string, string]> = [
  ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"],
  ["CA", "California"], ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"],
  ["DC", "District of Columbia"], ["FL", "Florida"], ["GA", "Georgia"], ["HI", "Hawaii"],
  ["ID", "Idaho"], ["IL", "Illinois"], ["IN", "Indiana"], ["IA", "Iowa"],
  ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"],
  ["MD", "Maryland"], ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"],
  ["MS", "Mississippi"], ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"],
  ["NV", "Nevada"], ["NH", "New Hampshire"], ["NJ", "New Jersey"], ["NM", "New Mexico"],
  ["NY", "New York"], ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"],
  ["OK", "Oklahoma"], ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"],
  ["SC", "South Carolina"], ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"],
  ["UT", "Utah"], ["VT", "Vermont"], ["VA", "Virginia"], ["WA", "Washington"],
  ["WV", "West Virginia"], ["WI", "Wisconsin"], ["WY", "Wyoming"],
];

const SCOPE_LABEL: Record<string, string> = {
  "probate-only":
    "This state recovers from the probate estate only (the federal minimum).",
  "expanded-estate":
    "This state uses an EXPANDED estate definition — it can reach some assets that skip probate.",
  unclear: "",
};

/**
 * The state layer of the MERP navigator. Verified states show their actual
 * scope/notice/hardship rules with the citation; everything else shows only
 * the federal floor — never a guess. Same structural honesty as /rights.
 */
export function StateMerp() {
  const [code, setCode] = useState("");
  const row = code ? merpForState(code) : undefined;
  const stateName = ALL_STATES.find(([c]) => c === code)?.[1];

  return (
    <Card>
      <CardTitle>Your state&rsquo;s rules</CardTitle>
      <div className="mt-3 max-w-xs">
        <Label htmlFor="merp-state">Your state</Label>
        <Select
          id="merp-state"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        >
          <option value="">Choose a state…</option>
          {ALL_STATES.map(([c, name]) => (
            <option key={c} value={c}>
              {name}
            </option>
          ))}
        </Select>
      </div>
      {code && (
        <div className="mt-4 rounded-xl border border-border bg-surface-soft px-4 py-3 space-y-3">
          {row ? (
            <>
              {SCOPE_LABEL[row.scope] && (
                <p className="text-ink font-medium">{SCOPE_LABEL[row.scope]}</p>
              )}
              <div>
                <div className="text-xs uppercase tracking-wider text-ink-muted mb-1">
                  What can be claimed
                </div>
                <p className="text-ink text-sm">{row.scopeSummary}</p>
              </div>
              {row.noticeSummary && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-ink-muted mb-1">
                    After the notice arrives
                  </div>
                  <p className="text-ink text-sm">{row.noticeSummary}</p>
                </div>
              )}
              <div>
                <div className="text-xs uppercase tracking-wider text-ink-muted mb-1">
                  Hardship waiver
                </div>
                <p className="text-ink text-sm">{row.hardshipSummary}</p>
              </div>
              <p className="text-xs text-ink-muted">
                Administered by {row.agencyName}. Source: {row.statuteCite} —
                verified against the statute or the state&rsquo;s Medicaid
                manual. Rules change and every estate is different; before
                paying or signing anything, talk to a local elder-law attorney
                (many offer free consultations, and legal aid handles these).
              </p>
            </>
          ) : (
            <>
              <p className="text-ink text-sm">
                We haven&rsquo;t completed citation-level verification for{" "}
                {stateName} yet, so we won&rsquo;t guess at its specifics. The
                federal protections above apply everywhere — including the
                spouse and disabled-child deferrals and the hardship-waiver
                requirement.
              </p>
              <p className="text-xs text-ink-muted">
                Ask the state&rsquo;s recovery unit to cite the rule they are
                acting under, in writing — and talk to a local elder-law
                attorney before paying or signing anything.
              </p>
            </>
          )}
        </div>
      )}
      <p className="text-xs text-ink-muted mt-3">
        {VERIFIED_MERP.length} states verified against statute or Medicaid-manual
        text so far; the rest show the federal baseline until they clear review.
      </p>
    </Card>
  );
}
