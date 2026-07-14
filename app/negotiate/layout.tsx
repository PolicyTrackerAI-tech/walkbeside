import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Have us contact funeral homes — free",
  description:
    "We contact funeral homes as your authorized advocate, collect itemized General Price Lists, and bring you the options side by side. Free to families — we contact homes on your behalf at no charge.",
};

export default function NegotiateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
