"use client";

import { LinkButton } from "@/components/ui/Button";
import { trackTool } from "@/lib/analytics";

/**
 * A LinkButton that records the institutional-lane click (loop analytics).
 * Client wrapper so server pages (the homepage) can fire the event without
 * becoming client components themselves. Properties are aggregate-only.
 */
export function PartnerCtaLink({
  href,
  surface,
  variant = "secondary",
  children,
}: {
  href: string;
  surface: string;
  variant?: "primary" | "secondary" | "ghost";
  children: React.ReactNode;
}) {
  return (
    <LinkButton
      href={href}
      variant={variant}
      onClick={() => trackTool("partner_cta_clicked", { surface })}
    >
      {children}
    </LinkButton>
  );
}
