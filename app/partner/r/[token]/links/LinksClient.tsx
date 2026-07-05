"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";

export interface CodeRow {
  code: string;
  label: string | null;
  active: boolean;
  created_at: string;
  /** Aggregate claim count — the only case-adjacent number this surface ever shows. */
  claims: number;
}

/**
 * Create / copy / revoke referral links. The shareable URL points at
 * /plan-now (the admission-week flow — where the research says the value
 * concentrates), with the code as ?ref=.
 */
export function LinksClient({
  token,
  initialCodes,
}: {
  token: string;
  initialCodes: CodeRow[];
}) {
  const [codes, setCodes] = useState<CodeRow[]>(initialCodes);
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://honestfuneral.co";
  const urlFor = (code: string) => `${origin}/plan-now?ref=${code}`;

  async function create() {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/partner/links", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, action: "create", label: label || undefined }),
      });
      if (!r.ok) throw new Error();
      const d = (await r.json()) as { code: string };
      setCodes((prev) => [
        {
          code: d.code,
          label: label || null,
          active: true,
          created_at: new Date().toISOString(),
          claims: 0,
        },
        ...prev,
      ]);
      setLabel("");
    } catch {
      setError(
        "Couldn't create a link just now — if this keeps happening, reply to any email from us and we'll sort it out.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function revoke(code: string) {
    if (!window.confirm(`Turn off ${code}? Printed materials using it will stop attributing new families.`))
      return;
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/partner/links", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, action: "revoke", code }),
      });
      if (!r.ok) throw new Error();
      setCodes((prev) =>
        prev.map((c) => (c.code === code ? { ...c, active: false } : c)),
      );
    } catch {
      setError("Couldn't turn that link off just now — try again.");
    } finally {
      setBusy(false);
    }
  }

  async function copy(code: string) {
    try {
      await navigator.clipboard.writeText(urlFor(code));
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      window.prompt("Copy this link:", urlFor(code));
    }
  }

  async function downloadQr(code: string) {
    try {
      const dataUrl = await QRCode.toDataURL(urlFor(code), {
        width: 512,
        margin: 2,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `honestfuneral-${code}.png`;
      a.click();
    } catch {
      setError("Couldn't generate a QR code just now — try again.");
    }
  }

  return (
    <>
      <Card>
        <CardTitle>Create a referral link</CardTitle>
        <p className="text-sm text-ink-soft mt-1 mb-3">
          Make one per place you&rsquo;ll share it — the admission packet, the
          front-desk QR code, a social worker&rsquo;s email signature — so you
          can see which ones families actually use.
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[14rem]">
            <Label htmlFor="link-label">Label (just for you)</Label>
            <Input
              id="link-label"
              value={label}
              maxLength={80}
              placeholder="e.g. Admission packet"
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>
          <Button onClick={create} disabled={busy}>
            {busy ? "Working…" : "Create link →"}
          </Button>
        </div>
        {error && <p className="text-sm text-bad mt-3">{error}</p>}
      </Card>

      {codes.length > 0 && (
        <Card>
          <CardTitle>Your links</CardTitle>
          <ul className="mt-3 space-y-3">
            {codes.map((c) => (
              <li
                key={c.code}
                className={`rounded-xl border px-4 py-3 ${c.active ? "border-border bg-surface" : "border-border bg-surface-soft opacity-70"}`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <span className="font-mono text-sm text-ink">{c.code}</span>
                  <span className="text-xs text-ink-muted">
                    {c.claims} famil{c.claims === 1 ? "y" : "ies"} started a case
                    {!c.active && " · turned off"}
                  </span>
                </div>
                {c.label && (
                  <div className="text-xs text-ink-muted mt-0.5">{c.label}</div>
                )}
                <div className="text-xs text-ink-soft mt-1 break-all">
                  {urlFor(c.code)}
                </div>
                {c.active && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => copy(c.code)}>
                      {copied === c.code ? "Copied ✓" : "Copy link"}
                    </Button>
                    <Button variant="secondary" onClick={() => downloadQr(c.code)}>
                      Download QR
                    </Button>
                    <Button variant="ghost" onClick={() => revoke(c.code)} disabled={busy}>
                      Turn off
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
