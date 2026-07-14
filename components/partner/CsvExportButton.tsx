"use client";

import { Button } from "@/components/ui/Button";
import { statsToCsv } from "@/lib/partner/stats-csv";
import type { CohortStats } from "@/lib/partner-report";

/**
 * "Download CSV" on the /portal overview — the same aggregate,
 * suppression-gated numbers the ProofSheet renders, as a file a partner can
 * drop into their own spreadsheet. Built entirely client-side from the stats
 * the page already loaded; no extra endpoint, nothing beyond CohortStats can
 * reach the file.
 */
export function CsvExportButton({
  orgName,
  stats,
  partnerType = "hospice",
}: {
  orgName: string;
  stats: CohortStats;
  /** Audience variant — an employer export omits the hospice-program bereavement row. */
  partnerType?: "hospice" | "employer";
}) {
  function download() {
    const csv = statsToCsv(orgName, stats, partnerType);
    const date = new Date().toISOString().slice(0, 10);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `honest-funeral-outcomes-${date}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <Button type="button" variant="secondary" onClick={download}>
      Download CSV
    </Button>
  );
}
