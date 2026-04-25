import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advocate outreach",
  description:
    "We contact funeral homes as your authorized advocate, collect itemized General Price Lists, and bring you the options side by side. Flat $49 only if you choose a home we present.",
};

export default function NegotiateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
