"use client";

import { useState } from "react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Label, Select } from "@/components/ui/Field";
import {
  VERIFIED_RULES,
  NATIONAL_BASELINE,
  ruleForState,
} from "@/lib/state-body-care";

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

/**
 * The state-specific layer behind the national embalming statement. Only
 * statute-verified states show a specific rule (with its citation); every
 * other state gets the conservative national baseline — never a guess.
 */
export function StateRules() {
  const [code, setCode] = useState("");
  const row = code ? ruleForState(code) : undefined;
  const stateName = ALL_STATES.find(([c]) => c === code)?.[1];

  return (
    <Card>
      <CardTitle>What your state actually requires</CardTitle>
      <p className="text-sm text-ink-soft mt-1">
        {NATIONAL_BASELINE.headline} {NATIONAL_BASELINE.detail}
      </p>
      <div className="mt-4 max-w-xs">
        <Label htmlFor="state-rule">Your state</Label>
        <Select
          id="state-rule"
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
        <div className="mt-4 rounded-xl border border-border bg-surface-soft px-4 py-3">
          {row ? (
            <>
              <p className="text-ink">{row.summary}</p>
              <p className="text-xs text-ink-muted mt-2">
                Source: {row.statuteCite} — verified against the statute text.
                Laws change; confirm with the funeral board if it matters to
                your decision.
              </p>
            </>
          ) : (
            <>
              <p className="text-ink">
                We haven&rsquo;t completed statute-level verification for{" "}
                {stateName} yet, so we won&rsquo;t guess. What&rsquo;s true
                everywhere: embalming is never required for every death, and
                where any time rule exists, refrigeration is an alternative.
              </p>
              <p className="text-xs text-ink-muted mt-2">
                Ask the funeral home to show you the specific statute if they
                say otherwise — that request alone usually settles it.
              </p>
            </>
          )}
        </div>
      )}
      <p className="text-xs text-ink-muted mt-3">
        {VERIFIED_RULES.length} states verified against statute text so far;
        the rest show the national baseline until they clear review.
      </p>
    </Card>
  );
}
