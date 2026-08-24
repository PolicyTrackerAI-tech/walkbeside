import type { Metadata } from "next";

// The page's own metadata sets only `title`, so description/canonical/OG
// here survive the merge (Next.js shallow-merges page over layout per key).
export const metadata: Metadata = {
  title: "Price list analyzer",
  description:
    "Is your funeral quote fair? Snap a photo of the General Price List and see every line item checked against regional fair ranges and the FTC Funeral Rule — free, in about a minute.",
  alternates: { canonical: "/analyzer" },
  openGraph: {
    title: "Is your funeral quote fair? Check the price list free",
    description:
      "Snap a photo of the General Price List. Every line item checked against regional fair ranges and the FTC Funeral Rule — free, in about a minute.",
    url: "/analyzer",
  },
};

export default function AnalyzerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
