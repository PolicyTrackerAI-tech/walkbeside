"use client";

import { Button } from "@/components/ui/Button";
import { trackTool, type ToolEvent } from "@/lib/analytics";

/**
 * Shared print trigger (ProofSheet + /portal/materials). Callers that want the
 * print counted pass `track`; ProofSheet deliberately doesn't — a partner
 * printing their own outcomes report is not a delivery event.
 */
export function PrintButton({ track }: { track?: ToolEvent }) {
  return (
    <Button
      variant="secondary"
      className="print:hidden"
      onClick={() => {
        if (track) trackTool(track);
        window.print();
      }}
    >
      Print / Save as PDF
    </Button>
  );
}
