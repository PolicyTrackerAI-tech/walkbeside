import { notFound } from "next/navigation";
import {
  SCENARIO_GUIDANCE,
  type Scenario,
  SCENARIO_LABELS,
} from "@/lib/scenarios";
import { SCENARIO_LANDING_TONE } from "@/lib/content";
import { GuidanceStepper } from "./Stepper";
import { CrisisUnexpected } from "./CrisisUnexpected";
import { setCommercialSuppression } from "@/lib/suppression";

const VALID: Scenario[] = ["hospital", "home-expected", "home-unexpected", "elsewhere"];

export default async function GuidancePage({
  params,
}: {
  params: Promise<{ scenario: string }>;
}) {
  const { scenario: raw } = await params;
  if (!VALID.includes(raw as Scenario)) notFound();
  const scenario = raw as Scenario;

  if (scenario === "home-unexpected") {
    await setCommercialSuppression();
    return <CrisisUnexpected />;
  }

  const g = SCENARIO_GUIDANCE[scenario];

  return (
    <GuidanceStepper
      label={SCENARIO_LABELS[scenario]}
      headline={g.headline}
      subhead={g.subhead}
      tone={SCENARIO_LANDING_TONE[scenario]}
      steps={g.steps}
      showPriceCompareGate={g.showPriceCompareGate}
      priceGateText={g.priceGateText}
    />
  );
}
