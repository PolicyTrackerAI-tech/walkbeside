"use client";

import { LinkButton } from "@/components/ui/Button";
import { usePhase } from "@/components/PhaseContext";

/**
 * Phase-aware homepage CTA. The text and destination shift based on
 * how far the user has gotten through the spine.
 *
 * Server-side default render uses "crisis" (the safest first-touch
 * default). On hydration, the phase context resolves and the CTA
 * may swap.
 */
export function HomepageHeroCta() {
  const phase = usePhase();

  const config = (() => {
    switch (phase) {
      case "decisions":
        return {
          href: "/decide",
          label: "Continue where you left off →",
          sub: "We saved your answers on this device.",
        };
      case "comparing":
        return {
          href: "/dashboard",
          label: "Open your dashboard →",
          sub: "Your funeral-home outreach is in progress.",
        };
      case "service":
        return {
          href: "/dashboard",
          label: "Open your dashboard →",
          sub: "We&rsquo;re here for the rest of the week.",
        };
      case "after":
      case "estate":
        return {
          href: "/next-30-days",
          label: "Open the next-30-days checklist →",
          sub: "Death certificates, accounts, estate basics — in order.",
        };
      case "done":
        return {
          href: "/dashboard",
          label: "Open your dashboard →",
          sub: "You&rsquo;ve handled the hardest part.",
        };
      case "crisis":
      default:
        return {
          href: "/where",
          label: "Get started — it's free",
          sub: null,
        };
    }
  })();

  return (
    <>
      <LinkButton href={config.href} size="lg" className="w-full sm:w-auto">
        {config.label}
      </LinkButton>
      {config.sub && (
        <p
          className="mt-3 text-sm text-ink-muted"
          dangerouslySetInnerHTML={{ __html: config.sub }}
        />
      )}
    </>
  );
}
