"use client";

import { useMemo, useState } from "react";
import { Card, CardEyebrow } from "@/components/ui/Card";
import { Button, LinkButton } from "@/components/ui/Button";
import { Label, Select } from "@/components/ui/Field";
import { FAITH_TRADITIONS, type FaithKey, getFaith } from "@/lib/faith-traditions";
import { SERVICE_LABELS, SERVICE_TOTALS, fmtRange } from "@/lib/pricing-data";
import {
  recommend,
  type BodyAtService,
  type CostPriority,
  type DispositionPreference,
} from "@/lib/decide-engine";

export function DecideFlow() {
  const [faith, setFaith] = useState<FaithKey>("secular");
  const [bodyAtService, setBodyAtService] = useState<BodyAtService>("unsure");
  const [dispositionPreference, setDispositionPreference] =
    useState<DispositionPreference>("no-preference");
  const [costPriority, setCostPriority] = useState<CostPriority>("balanced");
  const [submitted, setSubmitted] = useState(false);

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
            <Label htmlFor="faith" hint="Pick what guides decisions in your family. Pick 'secular' if no tradition is in play.">
              Faith tradition
            </Label>
            <Select
              id="faith"
              value={faith}
              onChange={(e) => setFaith(e.target.value as FaithKey)}
            >
              {FAITH_TRADITIONS.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </Select>
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
