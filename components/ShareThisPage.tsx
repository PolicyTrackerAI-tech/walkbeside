"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { trackTool } from "@/lib/analytics";
import { Button } from "@/components/ui/Button";

/**
 * Loop #3's share affordance: "send this to someone arranging a funeral."
 * PLAIN URLs on purpose — no ref codes, no UTM parameters, nothing that
 * tracks who sent what to whom. The page address is the whole payload.
 */
export function ShareThisPage({
  surface,
  className = "",
}: {
  /** Analytics surface label ("analyzer", "guide") — aggregate-only. */
  surface: string;
  className?: string;
}) {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const pageUrl = `${BRAND.url}${pathname}`;

  const mailtoHref = `mailto:?subject=${encodeURIComponent(
    "A free guide to funeral prices",
  )}&body=${encodeURIComponent(
    `This is a free site that shows what a funeral should cost and flags overcharges on any price list. No sign-up, nothing to buy.\n\n${pageUrl}`,
  )}`;

  async function copyLink() {
    // Fire on intent, before the clipboard await — a pending permission
    // prompt or blocked clipboard must not swallow the count.
    trackTool("share_clicked", { surface, action: "copy" });
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — offer a manual copy, but never let a missing
      // prompt() (some embedded browsers) crash the handler.
      try {
        window.prompt("Copy this link:", pageUrl);
      } catch {
        // nothing left to offer
      }
    }
  }

  return (
    <div
      className={`rounded-2xl border border-border bg-surface p-5 print:hidden ${className}`}
    >
      <div className="font-medium text-ink">
        Send this to someone arranging a funeral
      </div>
      <p className="text-sm text-ink-soft mt-1">
        Just the page address &mdash; no codes attached, nothing tracking who
        you send it to.
      </p>
      <div className="flex flex-wrap gap-3 mt-3">
        <Button variant="secondary" onClick={copyLink}>
          {copied ? "Link copied" : "Copy link"}
        </Button>
        <a
          href={mailtoHref}
          onClick={() => trackTool("share_clicked", { surface, action: "email" })}
          className="inline-flex items-center justify-center gap-2 font-semibold rounded-2xl min-h-11 px-5 py-3 text-sm bg-surface text-ink border border-border hover:border-primary hover:text-primary-deep no-underline hover:no-underline"
        >
          Email it
        </a>
      </div>
    </div>
  );
}
