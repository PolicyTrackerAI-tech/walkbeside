"use client";

import { useEffect, useState } from "react";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  readHouseholdLink,
  writeHouseholdLink,
  snapshotHousehold,
  type HouseholdLinkRecord,
} from "@/lib/household-link";

type Busy = "" | "create" | "refresh" | "rotate" | "revoke";

/**
 * The live family view — the durable counterpart to the one-time handoff
 * link above it. One stable URL for the whole family; this device (the point
 * person's) re-publishes automatically as the tools are used; rotate/revoke
 * on demand.
 */
export function HouseholdLinkCard() {
  const [rec, setRec] = useState<HouseholdLinkRecord | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [busy, setBusy] = useState<Busy>("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setRec(readHouseholdLink());
    setHydrated(true);
  }, []);

  const url = rec
    ? `${typeof window !== "undefined" ? window.location.origin : "https://honestfuneral.co"}/household/${rec.id}`
    : null;

  async function call(path: string, body: object): Promise<Response> {
    return fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  async function create() {
    setBusy("create");
    setError(null);
    try {
      const r = await call("/api/household/create", {
        payload: snapshotHousehold(),
      });
      if (!r.ok) throw new Error();
      const d = (await r.json()) as { id: string; ownerSecret: string };
      const next = { id: d.id, ownerSecret: d.ownerSecret, lastPublishedAt: Date.now() };
      writeHouseholdLink(next);
      setRec(next);
    } catch {
      setError("The live link isn't available right now — try again in a bit.");
    } finally {
      setBusy("");
    }
  }

  async function refresh() {
    if (!rec) return;
    setBusy("refresh");
    setError(null);
    try {
      const r = await call("/api/household/update", {
        id: rec.id,
        ownerSecret: rec.ownerSecret,
        payload: snapshotHousehold(),
      });
      if (r.status === 404 || r.status === 403) {
        writeHouseholdLink(null);
        setRec(null);
        return;
      }
      if (!r.ok) throw new Error();
      const next = { ...rec, lastPublishedAt: Date.now() };
      writeHouseholdLink(next);
      setRec(next);
    } catch {
      setError("Couldn't refresh just now — your family still sees the last published state.");
    } finally {
      setBusy("");
    }
  }

  async function rotate() {
    if (!rec) return;
    if (!window.confirm("Get a new link? The old one stops working immediately — you'll need to re-send the new one to your family.")) return;
    setBusy("rotate");
    setError(null);
    try {
      const r = await call("/api/household/rotate", {
        id: rec.id,
        ownerSecret: rec.ownerSecret,
      });
      if (!r.ok) throw new Error();
      const d = (await r.json()) as { id: string; ownerSecret: string };
      const next = { id: d.id, ownerSecret: d.ownerSecret, lastPublishedAt: Date.now() };
      writeHouseholdLink(next);
      setRec(next);
    } catch {
      setError("Couldn't rotate the link — the current one is unchanged.");
    } finally {
      setBusy("");
    }
  }

  async function revoke() {
    if (!rec) return;
    if (!window.confirm("Turn the family view off? Anyone with the link loses access immediately.")) return;
    setBusy("revoke");
    setError(null);
    try {
      await call("/api/household/revoke", {
        id: rec.id,
        ownerSecret: rec.ownerSecret,
      });
    } catch {
      // even if the network call failed, forget it locally — the row expires on its own
    } finally {
      writeHouseholdLink(null);
      setRec(null);
      setBusy("");
    }
  }

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  if (!hydrated) return null;

  return (
    <Card>
      <CardEyebrow>New</CardEyebrow>
      <CardTitle>Or keep a live family view running.</CardTitle>
      <p className="text-ink-soft mt-3 mb-4">
        One stable link the whole family can check anytime — who&rsquo;s been
        told, which documents are found, what&rsquo;s done on the checklist.
        Read-only, and it updates automatically whenever you use the tools on
        this device. It expires after 30 days of inactivity, and you can
        replace or turn it off whenever you want.
      </p>
      {rec && url ? (
        <div className="space-y-3">
          <div className="rounded-xl bg-good-soft border border-good/30 px-4 py-3 text-sm text-ink break-all">
            {url}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={copy}>{copied ? "Copied ✓" : "Copy the link"}</Button>
            <Button variant="secondary" onClick={refresh} disabled={busy !== ""}>
              {busy === "refresh" ? "Refreshing…" : "Refresh now"}
            </Button>
            <Button variant="secondary" onClick={rotate} disabled={busy !== ""}>
              {busy === "rotate" ? "Rotating…" : "New link (rotate)"}
            </Button>
            <Button variant="ghost" onClick={revoke} disabled={busy !== ""}>
              Turn off
            </Button>
          </div>
          {rec.lastPublishedAt && (
            <p className="text-xs text-ink-muted">
              Last published{" "}
              {new Date(rec.lastPublishedAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
              . Only this device can update or manage the link.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <Button size="lg" onClick={create} disabled={busy !== ""}>
            {busy === "create" ? "Creating…" : "Start the live family view →"}
          </Button>
        </div>
      )}
      {error && <p className="text-sm text-bad mt-3">{error}</p>}
    </Card>
  );
}
