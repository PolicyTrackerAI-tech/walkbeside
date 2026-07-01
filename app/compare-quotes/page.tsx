import type { Metadata } from "next";
import { CompareQuotes } from "./CompareQuotes";

export const metadata: Metadata = {
  title: "Compare funeral quotes side by side | Honest Funeral",
  description:
    "Gathered quotes from more than one funeral home? Run each through the same neutral fairness check and see them side by side — overcharges, FTC flags, and fair-range verdicts per quote. We never rank or recommend a home; the choice is yours. Free, no money from funeral homes or insurers.",
  alternates: { canonical: "/compare-quotes" },
};

export default function Page() {
  return <CompareQuotes />;
}
