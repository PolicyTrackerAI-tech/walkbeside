import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Obituary helper",
  description:
    "Answer a few questions; we draft an obituary in the family's voice. You revise, print, publish.",
};

export default function ObituaryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
