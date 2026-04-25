import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  SCENARIO_GUIDANCE,
  type Scenario,
  SCENARIO_LABELS,
} from "@/lib/scenarios";
import { SCENARIO_LANDING_TONE } from "@/lib/content";
import { StepList } from "@/components/guidance/StepList";
import { CrisisUnexpected } from "./CrisisUnexpected";
import { JsonLd } from "@/components/seo/JsonLd";

const VALID: Scenario[] = ["hospital", "home-expected", "home-unexpected", "elsewhere"];

const SCENARIO_SEO_TITLES: Record<Scenario, string> = {
  hospital: "What to do when someone dies in the hospital",
  "home-expected": "What to do when hospice calls",
  "home-unexpected": "What to do after an unexpected death at home",
  elsewhere: "What to do after an unexpected death",
};

const SCENARIO_DESCRIPTIONS: Record<Scenario, string> = {
  hospital:
    "They'll ask you to pick a funeral home soon. Here's what to do in the next two hours — and what to know before you call anyone.",
  "home-expected":
    "Hospice or an expected death at home. Here's exactly what happens next and what you have time to do right.",
  "home-unexpected":
    "You're not in trouble. Here's what happens when 911 comes, and what you can and can't do while you wait.",
  elsewhere:
    "A workplace, a public place, somewhere away from home. Here are the next steps — and who takes the body from here.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ scenario: string }>;
}): Promise<Metadata> {
  const { scenario: raw } = await params;
  if (!VALID.includes(raw as Scenario)) return {};
  const scenario = raw as Scenario;
  return {
    title: SCENARIO_SEO_TITLES[scenario],
    description: SCENARIO_DESCRIPTIONS[scenario],
  };
}

export default async function GuidancePage({
  params,
}: {
  params: Promise<{ scenario: string }>;
}) {
  const { scenario: raw } = await params;
  if (!VALID.includes(raw as Scenario)) notFound();
  const scenario = raw as Scenario;

  if (scenario === "home-unexpected") {
    return <CrisisUnexpected />;
  }

  const g = SCENARIO_GUIDANCE[scenario];

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: SCENARIO_SEO_TITLES[scenario],
    description: SCENARIO_DESCRIPTIONS[scenario],
    datePublished: "2026-01-01",
    author: {
      "@type": "Organization",
      name: "Honest Funeral",
      url: "https://honestfuneral.co",
    },
    publisher: {
      "@type": "Organization",
      name: "Honest Funeral",
      url: "https://honestfuneral.co",
    },
  };

  return (
    <>
      <JsonLd data={articleSchema} />
      <StepList
        label={SCENARIO_LABELS[scenario]}
        headline={g.headline}
        subhead={g.subhead}
        tone={SCENARIO_LANDING_TONE[scenario]}
        steps={g.steps}
        pullQuote={g.pullQuote}
        showPriceCompareGate={g.showPriceCompareGate}
        priceGateText={g.priceGateText}
        showCrisisResources={scenario === "elsewhere"}
      />
    </>
  );
}
