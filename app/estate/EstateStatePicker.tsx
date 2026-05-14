"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StateCombobox } from "@/components/ui/StateCombobox";
import { findUsState } from "@/lib/us-states";

interface Props {
  detailedSlugs: string[];
}

/**
 * EstateStatePicker — typeable state combobox + a "Go" button.
 * If the state has a detailed guide, route to /estate/[slug].
 * If not, show an inline note pointing to a local attorney.
 */
export function EstateStatePicker({ detailedSlugs }: Props) {
  const router = useRouter();
  const [abbr, setAbbr] = useState("");
  const state = abbr ? findUsState(abbr) : null;
  const isDetailed = state ? detailedSlugs.includes(state.slug) : false;

  function go() {
    if (!state) return;
    if (isDetailed) {
      router.push(`/estate/${state.slug}`);
    }
  }

  return (
    <div className="space-y-3">
      <StateCombobox
        id="estate-state"
        value={abbr}
        onChange={setAbbr}
        detailedSlugs={detailedSlugs}
      />
      {state && (
        <div className="rounded-xl border border-border bg-surface p-4">
          {isDetailed ? (
            <>
              <p className="text-sm text-ink-soft mb-3">
                We have a detailed probate guide for {state.name}.
              </p>
              <button
                type="button"
                onClick={go}
                className="inline-flex items-center justify-center gap-2 font-medium rounded-xl px-4 py-2.5 text-sm bg-primary-deep text-on-primary hover:bg-ink"
              >
                Open the {state.name} guide →
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-ink-soft mb-2">
                We don’t have a detailed guide for {state.name} yet.
                The general guidance below still applies.
              </p>
              <p className="text-sm text-ink-soft">
                For state-specific rules, search “{state.name} probate
                attorney” + your county. Most county bar associations
                run a referral service. Avoid attorneys who quote
                prices over the phone before reviewing your situation.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
