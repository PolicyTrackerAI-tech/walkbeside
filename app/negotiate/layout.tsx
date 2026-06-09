import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Have us call funeral homes for you",
  description:
    "We contact funeral homes as your authorized advocate, collect itemized General Price Lists, and bring you the options side by side. Flat $49, paid upfront — refundable in 14 days.",
};

export default function NegotiateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
