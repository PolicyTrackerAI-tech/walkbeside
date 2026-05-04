"use client";

import { useMemo, useState } from "react";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Select } from "@/components/ui/Field";
import {
  checkVeteransBenefits,
  type DischargeType,
  type DispositionContext,
  type ServiceEra,
  type VeteransInputs,
  type CheckerResult,
} from "@/lib/veterans-benefits";

export function VeteransChecker() {
  const [served, setServed] = useState<VeteransInputs["served"]>("yes");
  const [discharge, setDischarge] = useState<DischargeType>("honorable");
  const [era, setEra] = useState<ServiceEra>("unknown");
  const [disposition, setDisposition] =
    useState<DispositionContext>("unknown");
  const [vaCare, setVaCare] = useState<VeteransInputs["vaCare"]>("no");
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo<CheckerResult>(
    () =>
      checkVeteransBenefits({ served, discharge, era, disposition, vaCare }),
    [served, discharge, era, disposition, vaCare],
  );

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-5">
          <div>
            <Label
              htmlFor="served"
              hint="Active duty, Reserves, or National Guard all count."
            >
              Did the deceased serve in the US military?
            </Label>
            <Select
              id="served"
              value={served}
              onChange={(e) =>
                setServed(e.target.value as VeteransInputs["served"])
              }
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="unsure">Unsure — I think so but can&rsquo;t confirm</option>
            </Select>
          </div>

          {served !== "no" && (
            <>
              <div>
                <Label
                  htmlFor="discharge"
                  hint="Listed on the DD-214 under 'Character of Service'. If you don't have it yet, pick 'Don't know' — most are honorable."
                >
                  Discharge type
                </Label>
                <Select
                  id="discharge"
                  value={discharge}
                  onChange={(e) =>
                    setDischarge(e.target.value as DischargeType)
                  }
                >
                  <option value="honorable">Honorable</option>
                  <option value="general">General (under honorable conditions)</option>
                  <option value="other-than-honorable">Other than honorable</option>
                  <option value="bad-conduct">Bad conduct</option>
                  <option value="dishonorable">Dishonorable</option>
                  <option value="unknown">Don&rsquo;t know</option>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="era"
                  hint="Wartime periods are defined by Congress. If you're not sure, pick 'Don't know' — we'll still show core benefits."
                >
                  When did they serve?
                </Label>
                <Select
                  id="era"
                  value={era}
                  onChange={(e) => setEra(e.target.value as ServiceEra)}
                >
                  <option value="wartime">During a recognized wartime period</option>
                  <option value="peacetime">Peacetime only</option>
                  <option value="active-duty-death">Died while on active duty</option>
                  <option value="unknown">Don&rsquo;t know</option>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="disposition"
                  hint="Pick the closest match. National cemetery burial is free and is the largest single benefit available."
                >
                  Where will burial happen?
                </Label>
                <Select
                  id="disposition"
                  value={disposition}
                  onChange={(e) =>
                    setDisposition(e.target.value as DispositionContext)
                  }
                >
                  <option value="national-cemetery">VA national cemetery</option>
                  <option value="private-cemetery">Private cemetery</option>
                  <option value="private-non-service-connected">
                    Private cemetery, not service-connected
                  </option>
                  <option value="unknown">Not decided yet</option>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="vacare"
                  hint="Death in a VA facility or under VA contract care can increase the burial allowance."
                >
                  Did the death occur in a VA hospital or under VA care?
                </Label>
                <Select
                  id="vacare"
                  value={vaCare}
                  onChange={(e) =>
                    setVaCare(e.target.value as VeteransInputs["vaCare"])
                  }
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                  <option value="unknown">Don&rsquo;t know</option>
                </Select>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 rounded-xl border border-border bg-surface-soft px-4 py-3 text-sm text-ink-soft">
          <p className="text-ink font-medium mb-1">What happens when you submit:</p>
          <ul className="space-y-0.5">
            <li>&bull; We list the benefits the family likely qualifies for.</li>
            <li>&bull; Each one links to the official VA page.</li>
            <li>&bull; Nothing is saved or sent to the VA. You file when ready.</li>
          </ul>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={() => setSubmitted(true)}>Check eligibility</Button>
          {submitted && (
            <span className="text-sm text-ink-muted self-center">
              Updated &mdash; adjust above to refine.
            </span>
          )}
        </div>
      </Card>

      {submitted && <ResultBlock result={result} />}
    </div>
  );
}

function ResultBlock({ result }: { result: CheckerResult }) {
  const tone =
    result.verdict === "likely"
      ? "good"
      : result.verdict === "possibly"
        ? "primary"
        : result.verdict === "unlikely"
          ? "warn"
          : "soft";

  return (
    <>
      <Card tone={tone}>
        <CardEyebrow>Result</CardEyebrow>
        <h2 className="font-serif text-2xl text-ink mb-2">
          {result.headline}
        </h2>
        {result.matches.length === 0 && (
          <p className="text-ink-soft">
            No VA burial benefits apply based on these answers. If you think
            something is wrong, adjust above &mdash; or call a VSO to be sure.
          </p>
        )}
      </Card>

      {result.matches.map((m) => (
        <Card key={m.id}>
          <CardEyebrow>{m.id === "national-cemetery" ? "Largest benefit" : "Benefit"}</CardEyebrow>
          <CardTitle>{m.title}</CardTitle>
          <p className="text-ink-soft mb-3">{m.whatItIs}</p>
          <dl className="space-y-2 text-sm mb-4">
            <div>
              <dt className="text-ink-muted text-xs uppercase tracking-wider mb-0.5">
                What it&rsquo;s worth
              </dt>
              <dd className="text-ink">{m.amountNote}</dd>
            </div>
            <div>
              <dt className="text-ink-muted text-xs uppercase tracking-wider mb-0.5">
                Why this likely applies
              </dt>
              <dd className="text-ink">{m.whyEligible}</dd>
            </div>
            <div>
              <dt className="text-ink-muted text-xs uppercase tracking-wider mb-0.5">
                How to claim
              </dt>
              <dd className="text-ink">{m.howToClaim}</dd>
            </div>
          </dl>
          <a
            href={m.vaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary-deep underline-offset-2 hover:underline"
          >
            {m.vaLinkLabel} &rarr;
          </a>
        </Card>
      ))}

      {result.caveats.length > 0 && (
        <Card tone="soft">
          <CardEyebrow>Worth knowing</CardEyebrow>
          <ul className="space-y-2 text-[15px] text-ink-soft list-disc pl-5">
            {result.caveats.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
