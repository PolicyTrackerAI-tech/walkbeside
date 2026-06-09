import type { Metadata } from "next";

// Every per-negotiation page (preview, status, results, compare, closed) is
// private to one family — keep all of them out of search indexes.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function NegotiationIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
