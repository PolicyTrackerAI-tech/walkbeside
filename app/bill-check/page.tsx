import type { Metadata } from "next";
import { BillCheck } from "./BillCheck";

export const metadata: Metadata = {
  title: "Check your final funeral bill against the quote",
  description:
    "Upload or paste the original funeral quote and the final bill — we diff them line by line and show exactly what was added or increased. Every finding comes from your own two documents. Free, neutral, no money from funeral homes or insurers.",
  alternates: { canonical: "/bill-check" },
};

export default function Page() {
  return <BillCheck />;
}
