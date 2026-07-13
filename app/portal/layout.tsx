import type { Metadata } from "next";

/**
 * /portal/* — the signed-in partner surface. Never indexed. The auth gate
 * lives in each page (requirePartnerMember), NOT here: this layout also
 * wraps the public /portal/login and /portal/paused pages, and each gated
 * page needs its own PortalContext anyway.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
