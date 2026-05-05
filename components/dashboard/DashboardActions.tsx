"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

/**
 * Dashboard action row: "Save for my daughter" + "Print my progress".
 *
 * "Save for my daughter" snapshots the relevant sessionStorage keys
 * (decide answers, negotiate-wizard state, etc.), POSTs them to
 * /api/share/create, and uses navigator.share() (or clipboard fallback)
 * with the returned shareUrl. The recipient lands on /resume/[id] and
 * has the snapshot hydrated into their sessionStorage automatically.
 *
 * "Print my progress" calls window.print(). The page already hides nav
 * and SiteHeader controls in print mode (print:hidden).
 */

// Keys we snapshot into a share link. Keep this list minimal — only
// what helps the proxy operator pick up where the originator stopped.
const SHARE_KEYS = [
  "honestfuneral.faith.v1",
  "honestfuneral.faith-denomination.v1",
  "honestfuneral.faith-custom.v1",
  "honestfuneral.decide.v1",
  "honestfuneral.negotiate-wizard.v1",
  "honestfuneral.guidance.hospital.v1",
  "honestfuneral.guidance.home-expected.v1",
  "honestfuneral.guidance.home-unexpected.v1",
  "honestfuneral.guidance.elsewhere.v1",
  "honestfuneral.next30.v1",
];

function snapshotSessionStorage(): Record<string, string> {
  const out: Record<string, string> = {};
  if (typeof window === "undefined") return out;
  for (const key of SHARE_KEYS) {
    try {
      const v = sessionStorage.getItem(key) ?? localStorage.getItem(key);
      if (v != null) out[key] = v;
    } catch {
      // skip
    }
  }
  return out;
}

export function DashboardActions() {
  const [status, setStatus] = useState<"idle" | "creating" | "shared" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleShare() {
    if (typeof window === "undefined") return;
    setStatus("creating");
    setErrorMessage(null);
    try {
      const payload = snapshotSessionStorage();
      const r = await fetch("/api/share/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ payload }),
      });
      if (!r.ok) {
        const data = (await r.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error ?? "Could not create share link");
      }
      const { shareUrl } = (await r.json()) as { shareUrl: string };
      const shareData = {
        title: "Honest Funeral",
        text: "I started this for the funeral arrangements — pick up here when you can.",
        url: shareUrl,
      };
      const nav = navigator as Navigator & {
        share?: (data: ShareData) => Promise<void>;
      };
      if (typeof nav.share === "function") {
        await nav.share(shareData);
        setStatus("idle");
      } else if (nav.clipboard) {
        await nav.clipboard.writeText(shareUrl);
        setStatus("shared");
        window.setTimeout(() => setStatus("idle"), 3500);
      } else {
        // Last-resort fallback: prompt.
        window.prompt("Copy this link and text it to your family:", shareUrl);
        setStatus("idle");
      }
    } catch (e) {
      setStatus("error");
      setErrorMessage(
        e instanceof Error ? e.message : "Couldn't create the share link.",
      );
    }
  }

  function handlePrint() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  return (
    <div className="print:hidden">
      <div className="flex flex-wrap gap-3">
        <Button
          variant="secondary"
          onClick={handleShare}
          disabled={status === "creating"}
        >
          {status === "creating" ? "Creating link…" : "Save for my daughter"}
        </Button>
        <Button variant="ghost" onClick={handlePrint}>
          Print my progress
        </Button>
      </div>
      {status === "shared" && (
        <p className="mt-2 text-sm text-ink-muted">
          Link copied to your clipboard — paste it into a text or email.
        </p>
      )}
      {status === "error" && errorMessage && (
        <p className="mt-2 text-sm text-bad">{errorMessage}</p>
      )}
    </div>
  );
}
