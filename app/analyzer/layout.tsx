import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Price list analyzer",
  description:
    "Upload a funeral home's General Price List. See every line item flagged against regional fair ranges.",
};

export default function AnalyzerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
