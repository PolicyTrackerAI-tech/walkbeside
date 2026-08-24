"use client";

import { Button } from "@/components/ui/Button";

/**
 * "Download CSV" on the /portal overview — the same aggregate,
 * suppression-gated numbers the ProofSheet renders, as a file a partner can
 * drop into their own spreadsheet. The CSV is built SERVER-SIDE
 * (lib/partner/stats-csv.ts) and this component receives only the finished
 * string: passing raw CohortStats across the client boundary would embed the
 * exact suppressed counts in the page payload the partner's browser receives,
 * defeating the banding the server render applies.
 */
export function CsvExportButton({ csv }: { csv: string }) {
  function download() {
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
