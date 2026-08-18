import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Have us contact funeral homes — free",
  description:
    "Funeral-home outreach as your authorized advocate: itemized General Price List requests under the FTC Funeral Rule, options side by side. Free to families, always.",
};

export default function NegotiateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
