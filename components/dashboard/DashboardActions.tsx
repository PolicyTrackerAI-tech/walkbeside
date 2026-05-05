"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

/**
 * Dashboard action row: "Save for my daughter" + "Print my progress".
 *
 * Section 7 wires up the share-link backend. For now, "Save for my
 * daughter" is a visual scaffold that uses navigator.share() with a
 * placeholder URL. Replace with real share-link API call in Section 7.
 *
 * "Print my progress" calls window.print(). Print-only stylesheet
 * already hides nav and SiteHeader controls (print:hidden).
 */
export function DashboardActions() {
  const [shared, setShared] = useState(false);

  async function handleShare() {
    // TODO-margaret-section-7: replace with POST /api/share/create
    // and use the returned shareUrl.
    const placeholderUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/dashboard?share=todo`
        : "";
    const shareData = {
      title: "Honest Funeral",
      text: "I started this for the funeral arrangements — pick up here when you can.",
      url: placeholderUrl,
    };
    try {
      if (typeof navigator === "undefined") return;
      const nav = navigator as Navigator & {
        share?: (data: ShareData) => Promise<void>;
      };
      if (typeof nav.share === "function") {
        await nav.share(shareData);
      } else if (nav.clipboard) {
        await nav.clipboard.writeText(placeholderUrl);
        setShared(true);
        window.setTimeout(() => setShared(false), 3000);
      }
    } catch {
      // User cancelled the share sheet — no-op.
    }
  }

  function handlePrint() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  return (
    <div className="flex flex-wrap gap-3 print:hidden">
      <Button variant="secondary" onClick={handleShare}>
        Save for my daughter
      </Button>
      <Button variant="ghost" onClick={handlePrint}>
        Print my progress
      </Button>
      {shared && (
        <span className="text-sm text-ink-muted self-center">
          Link copied — paste into a text or email.
        </span>
      )}
    </div>
  );
}
