"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  { value: "secular", label: "No religious tradition" },
  { value: "atheist", label: "Atheist" },
  { value: "christian-catholic", label: "Catholic" },
  { value: "christian-protestant", label: "Protestant" },
  { value: "christian-orthodox", label: "Eastern Orthodox" },
  { value: "lds-mormon", label: "LDS / Mormon" },
  { value: "jewish", label: "Jewish" },
  { value: "muslim", label: "Muslim" },
  { value: "hindu", label: "Hindu" },
  { value: "buddhist", label: "Buddhist" },
  { value: "sikh", label: "Sikh" },
  { value: "other", label: "Other (please specify)" },
];

export type IsVeteran = "yes" | "no" | "unsure";

export function DecideFlow() {
  const [faith, setFaith] = useState<FaithKey>("secular");
  const [customFaith, setCustomFaith] = useState<string>("");
  const [faithDenomination, setFaithDenomination] = useState<string>("");
  const [bodyAtService, setBodyAtService] = useState<BodyAtService>("unsure");
  const [dispositionPreference, setDispositionPreference] =
    useState<DispositionPreference>("no-preference");
  const [costPriority, setCostPriority] = useState<CostPriority>("balanced");
  const [isVeteran, setIsVeteran] = useState<IsVeteran>("unsure");
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
    const b = readDecide(DECIDE_STORAGE_KEYS.bodyAtService);
    if (b === "open-casket" || b === "closed-casket" || b === "no" || b === "unsure") {
      setBodyAtService(b);
    } else if (b === "yes") {
      // Migrate legacy stored value (single 'yes' option, pre 2026-05-16).
      // Default to open-casket since most 'yes' picks historically were viewings.
      setBodyAtService("open-casket");
    }
    const dp = readDecide(DECIDE_STORAGE_KEYS.dispositionPreference);
    if (dp === "burial" || dp === "cremation" || dp === "donation" || dp === "no-preference") {
      setDispositionPreference(dp);
    }
    const cp = readDecide(DECIDE_STORAGE_KEYS.costPriority);
    if (cp === "lowest" || cp === "balanced" || cp === "tradition") setCostPriority(cp);
    const v = readDecide(DECIDE_STORAGE_KEYS.isVeteran);
    if (v === "yes" || v === "no" || v === "unsure") setIsVeteran(v);
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

  useEffect(() => {
    writeDecide(DECIDE_STORAGE_KEYS.bodyAtService, bodyAtService);
  }, [bodyAtService]);

  useEffect(() => {
    writeDecide(DECIDE_STORAGE_KEYS.dispositionPreference, dispositionPreference);
  }, [dispositionPreference]);

  useEffect(() => {
    writeDecide(DECIDE_STORAGE_KEYS.costPriority, costPriority);
  }, [costPriority]);

  useEffect(() => {
    writeDecide(DECIDE_STORAGE_KEYS.isVeteran, isVeteran);
  }, [isVeteran]);

  const denominationOptions = denominationsFor(faith);

  // Scroll the recommendation into view when the user taps "Show me what fits".
  // Without this, the recommendation card renders below the form on mobile and
  // users miss it — they tap the button and feel like nothing happened.
  const recommendationRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (submitted && recommendationRef.current) {
      recommendationRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [submitted]);

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

  // Persist the recommended service type so other pages (/next-30-days,
  // /negotiate/start, etc.) can filter content by it without re-asking.
  useEffect(() => {
    if (submitted) {
      writeDecide(
        DECIDE_STORAGE_KEYS.recommendedServiceType,
        recommendation.serviceType,
      );
    }
  }, [submitted, recommendation.serviceType]);

  const faithProfile = getFaith(faith);
  const totals = SERVICE_TOTALS.find((t) => t.type === recommendation.serviceType);

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-5">
          <div>
            <Label htmlFor="faith" hint="Pick what guides decisions in your family. Pick 'No religious tradition' if none is in play.">
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
            <Label
              htmlFor="body"
              hint="Open casket means people see them at the service (requires embalming). Closed casket means the casket is there with the lid closed (embalming optional). Memorial means no body present — often used after cremation."
            >
              Will the body be at the service?
            </Label>
            <Select
              id="body"
              value={bodyAtService}
              onChange={(e) => setBodyAtService(e.target.value as BodyAtService)}
            >
              <option value="open-casket">Open casket — visible during the service</option>
              <option value="closed-casket">Closed casket — present, lid closed</option>
              <option value="no">No — memorial service only (no body)</option>
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

          <div>
            <Label htmlFor="veteran" hint="Veterans qualify for free national cemetery burial, a burial allowance, and a flag — most families miss at least one. We'll surface them automatically if you answer yes.">
              Did the deceased serve in the military?
            </Label>
            <Select
              id="veteran"
              value={isVeteran}
              onChange={(e) => setIsVeteran(e.target.value as IsVeteran)}
            >
              <option value="unsure">Not sure</option>
              <option value="yes">Yes — they were a veteran</option>
              <option value="no">No</option>
            </Select>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-surface-soft px-4 py-3 text-sm text-ink-soft space-y-1">
          <p className="text-ink font-medium">What we&rsquo;ll do with your answers:</p>
          <ul className="space-y-0.5">
            <li>&bull; We recommend a service type that fits your answers.</li>
            <li>&bull; You&rsquo;ll see what fair pricing looks like for it.</li>
            <li>&bull; Nothing is saved. No one gets contacted.</li>
          </ul>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 items-center">
          <Button size="lg" onClick={() => setSubmitted(true)}>
            Show me what fits →
          </Button>
          {submitted && (
            <span className="text-sm text-ink-muted">
              Updated — adjust answers above to refine.
            </span>
          )}
        </div>
      </Card>

      {submitted && (
        <div ref={recommendationRef} className="space-y-6 scroll-mt-4">
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
            {totals && (
              <div className="mb-5 rounded-xl bg-good-soft border border-good/30 px-4 py-3">
                <p className="text-sm text-ink">
                  <strong className="text-ink">
                    Families like yours typically save $
                    {Math.round(totals.maxSavings / 100) * 100} to $
                    {Math.round((totals.maxSavings * 1.5) / 100) * 100}
                  </strong>{" "}
                  on the funeral arrangement when they compare two or
                  three homes with our help — versus walking into the
                  first home they call.
                </p>
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <LinkButton
                href={`/negotiate/start?svc=${recommendation.serviceType}`}
                size="lg"
              >
                Have us compare funeral homes for you →
              </LinkButton>
              <LinkButton
                variant="secondary"
                href={`/prices?svc=${recommendation.serviceType}`}
              >
                Or look up fair prices first
              </LinkButton>
            </div>
            <p className="mt-3 text-xs text-ink-muted">
              Free to start. We contact homes on your behalf and bring
              the quotes back side by side. You only pay our flat $199
              fee when you choose a home we presented &mdash; not
              before. Money-back in 14 days if we didn&rsquo;t save
              you anything. No commissions or kickbacks from any home
              we contact.
            </p>
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
              <p className="text-xs text-ink-muted mt-3">
                General guidance to help you prepare, not religious authority.
                Customs vary by community &mdash; confirm specifics with your
                own faith leader.
              </p>
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
        </div>
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
