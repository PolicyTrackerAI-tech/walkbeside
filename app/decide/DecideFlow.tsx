"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardEyebrow } from "@/components/ui/Card";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Field";
import {
  denominationsFor,
  type FaithKey,
  getFaith,
} from "@/lib/faith-traditions";
import { SERVICE_LABELS, SERVICE_TOTALS, fmtRange } from "@/lib/pricing-data";
import {
  DECIDE_STORAGE_KEYS,
  readDecide,
  writeDecide,
} from "@/lib/faith-storage";
import {
  recommend,
  type BodyAtService,
  type CostPriority,
  type DispositionPreference,
} from "@/lib/decide-engine";

/**
 * Top-level dropdown order per Session B spec. Catholic listed first because
 * it's the largest single denomination in the US. "Other (please specify)"
 * is last and reveals a free-text input.
 */
const FAITH_DROPDOWN: { value: FaithKey; label: string }[] = [
  { value: "christian-catholic", label: "Catholic" },
  { value: "christian-protestant", label: "Protestant" },
  { value: "christian-orthodox", label: "Eastern Orthodox" },
  { value: "lds-mormon", label: "LDS / Mormon" },
  { value: "jewish", label: "Jewish" },
  { value: "muslim", label: "Muslim" },
  { value: "hindu", label: "Hindu" },
  { value: "buddhist", label: "Buddhist" },
  { value: "sikh", label: "Sikh" },
  { value: "secular", label: "Secular / None of the above" },
  { value: "other", label: "Other (please specify)" },
];

export function DecideFlow() {
  const [faith, setFaith] = useState<FaithKey>("secular");
  const [customFaith, setCustomFaith] = useState<string>("");
  const [faithDenomination, setFaithDenomination] = useState<string>("");
  const [bodyAtService, setBodyAtService] = useState<BodyAtService>("unsure");
  const [dispositionPreference, setDispositionPreference] =
    useState<DispositionPreference>("no-preference");
  const [costPriority, setCostPriority] = useState<CostPriority>("balanced");
  const [submitted, setSubmitted] = useState(false);

  // Hydrate from sessionStorage on mount.
  useEffect(() => {
    const f = readDecide(DECIDE_STORAGE_KEYS.faith);
    if (f && FAITH_DROPDOWN.some((o) => o.value === f)) {
      setFaith(f as FaithKey);
    }
    const c = readDecide(DECIDE_STORAGE_KEYS.customFaith);
    if (c) setCustomFaith(c);
    const d = readDecide(DECIDE_STORAGE_KEYS.faithDenomination);
    if (d) setFaithDenomination(d);
  }, []);

  // Persist changes.
  useEffect(() => {
    writeDecide(DECIDE_STORAGE_KEYS.faith, faith);
    // Clear sibling keys when they no longer apply.
    if (faith !== "other") writeDecide(DECIDE_STORAGE_KEYS.customFaith, "");
    if (!denominationsFor(faith))
      writeDecide(DECIDE_STORAGE_KEYS.faithDenomination, "");
  }, [faith]);

  useEffect(() => {
    writeDecide(DECIDE_STORAGE_KEYS.customFaith, customFaith);
  }, [customFaith]);

  useEffect(() => {
    writeDecide(DECIDE_STORAGE_KEYS.faithDenomination, faithDenomination);
  }, [faithDenomination]);

  const denominationOptions = denominationsFor(faith);

  const recommendation = useMemo(
    () =>
      recommend({
        faith,
        bodyAtService,
        dispositionPreference,
        costPriority,
      }),
    [faith, bodyAtService, dispositionPreference, costPriority],
  );

  const faithProfile = getFaith(faith);
  const totals = SERVICE_TOTALS.find((t) => t.type === recommendation.serviceType);

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-5">
          <div>
            <Label htmlFor="faith" hint="Pick what guides decisions in your family. Pick 'Secular' if no tradition is in play.">
              Faith tradition
            </Label>
            <Select
              id="faith"
              value={faith}
              onChange={(e) => setFaith(e.target.value as FaithKey)}
            >
              {FAITH_DROPDOWN.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>

            {faith === "other" && (
              <div className="mt-3">
                <Label htmlFor="customFaith">What tradition?</Label>
                <Input
                  id="customFaith"
                  type="text"
                  value={customFaith}
                  onChange={(e) => setCustomFaith(e.target.value)}
                  placeholder="e.g. Bahá'í, Jain, Quaker, Native American spiritual practice…"
                  autoComplete="off"
                />
              </div>
            )}

            {denominationOptions && (
              <div className="mt-3">
                <Label
                  htmlFor="denomination"
                  hint="Practice within this tradition varies by denomination. Pick the closest — or 'Not sure' if you don't know."
                >
                  Which tradition?
                </Label>
                <Select
                  id="denomination"
                  value={faithDenomination}
                  onChange={(e) => setFaithDenomination(e.target.value)}
                >
                  <option value="">Select one…</option>
                  {denominationOptions.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </Select>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="body" hint="Some families want a viewing or open casket; others prefer a memorial without the body present.">
              Body present at the service?
            </Label>
            <Select
              id="body"
              value={bodyAtService}
              onChange={(e) => setBodyAtService(e.target.value as BodyAtService)}
            >
              <option value="yes">Yes — viewing or body present</option>
              <option value="no">No — memorial only</option>
              <option value="unsure">Not sure yet</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="dispo" hint="Pick what feels right. We&rsquo;ll flag if it conflicts with the tradition you chose.">
              Disposition preference
            </Label>
            <Select
              id="dispo"
              value={dispositionPreference}
              onChange={(e) =>
                setDispositionPreference(e.target.value as DispositionPreference)
              }
            >
              <option value="no-preference">No strong preference</option>
              <option value="burial">Burial</option>
              <option value="cremation">Cremation</option>
              <option value="donation">Whole-body donation to science</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="cost" hint="There&rsquo;s no wrong answer. Some families want the lowest possible cost; others want a fuller traditional service.">
              What matters most on cost?
            </Label>
            <Select
              id="cost"
              value={costPriority}
              onChange={(e) => setCostPriority(e.target.value as CostPriority)}
            >
              <option value="lowest">Lowest cost — strip to essentials</option>
              <option value="balanced">Balanced — fair price for what we want</option>
              <option value="tradition">Tradition matters more than cost</option>
            </Select>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-surface-soft px-4 py-3 text-sm text-ink-soft space-y-1">
          <p className="text-ink font-medium">What happens when you submit:</p>
          <ul className="space-y-0.5">
            <li>&bull; We recommend a service type that fits your answers.</li>
            <li>&bull; You&rsquo;ll see what fair pricing looks like for it.</li>
            <li>&bull; Nothing is saved. No one gets contacted.</li>
          </ul>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={() => setSubmitted(true)}>See recommendation</Button>
          {submitted && (
            <span className="text-sm text-ink-muted self-center">
              Updated — adjust answers above to refine.
            </span>
          )}
        </div>
      </Card>

      {submitted && (
        <>
          <Card tone="primary">
            <CardEyebrow>Recommendation</CardEyebrow>
            <h2 className="font-serif text-3xl text-primary-deep mb-2">
              {SERVICE_LABELS[recommendation.serviceType]}
            </h2>
            <p className="text-ink-soft mb-4">{recommendation.oneLiner}</p>
            {totals && (
              <p className="text-sm text-ink mb-4">
                <span className="text-ink-muted">Fair total range nationally: </span>
                <strong>{fmtRange(totals.fairLow, totals.fairHigh)}</strong>
                <span className="text-ink-muted"> &nbsp;·&nbsp; predatory: </span>
                <strong>{fmtRange(totals.predatoryLow, totals.predatoryHigh)}</strong>
              </p>
            )}
            <ul className="space-y-1.5 text-sm text-ink-soft mb-5">
              {recommendation.reasons.map((r, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary" aria-hidden>•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <LinkButton href={`/prices?svc=${recommendation.serviceType}`}>
                See fair prices for my zip →
              </LinkButton>
              <LinkButton
                variant="secondary"
                href={`/negotiate/start?svc=${recommendation.serviceType}`}
              >
                Get quotes from local homes →
              </LinkButton>
              <LinkButton variant="ghost" href="/worksheet">
                Pre-meeting worksheet →
              </LinkButton>
            </div>
          </Card>

          {faithProfile.key !== "secular" && faithProfile.key !== "other" && (
            <Card tone="soft">
              <CardEyebrow>{faithProfile.label} — what to expect</CardEyebrow>
              <p className="text-sm text-ink-soft mb-3">{faithProfile.notes}</p>
              <dl className="grid sm:grid-cols-2 gap-3 text-sm mb-4">
                <div>
                  <dt className="text-ink-muted text-xs uppercase tracking-wider mb-1">Timeline</dt>
                  <dd className="text-ink">{faithProfile.timelineNorm}</dd>
                </div>
                <div>
                  <dt className="text-ink-muted text-xs uppercase tracking-wider mb-1">Embalming</dt>
                  <dd className="text-ink">{embalmingLabel(faithProfile.embalmingNorm)}</dd>
                </div>
              </dl>
              <LinkButton href={`/faith/${faithProfile.key}`} variant="secondary">
                Full guide for {faithProfile.label} →
              </LinkButton>
            </Card>
          )}

          {recommendation.faithLocked && dispositionPreference !== "no-preference" && conflictsWithFaith(recommendation.serviceType, dispositionPreference) && (
            <Card tone="warn">
              <p className="text-sm text-ink">
                <strong>Heads up:</strong> Your disposition preference conflicts
                with the tradition you chose. We weighted faith because it&rsquo;s
                usually the harder constraint to change. If you want to override,
                pick &ldquo;No religious preference&rdquo; at the top.
              </p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function embalmingLabel(norm: "common" | "uncommon" | "discouraged" | "forbidden"): string {
  switch (norm) {
    case "common":
      return "Common in this tradition.";
    case "uncommon":
      return "Not customary, but allowed.";
    case "discouraged":
      return "Generally discouraged.";
    case "forbidden":
      return "Not part of the tradition. Decline at the funeral home.";
  }
}

function conflictsWithFaith(
  recommendedType: string,
  pref: DispositionPreference,
): boolean {
  const recommendsBurial = recommendedType.includes("burial");
  const recommendsCremation = recommendedType.includes("cremation") || recommendedType === "aquamation";
  if (pref === "burial" && recommendsCremation) return true;
  if (pref === "cremation" && recommendsBurial) return true;
  return false;
}
