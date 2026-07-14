"use client";

import { useState } from "react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Input } from "@/components/ui/Field";

/**
 * Owner-only settings form + the quick-link danger zone. The org name is
 * display-only (set at approval); everything else saves in one POST.
 * Rotation shows the new quick link exactly once from the response —
 * after that the page only ever shows the masked prefix.
 */

const HEX_RE = /^#[0-9a-fA-F]{6}$/;
/** Neutral fallback for the color picker when no accent is set. */
const DEFAULT_ACCENT = "#2f5d4f";

export function SettingsClient({
  orgName,
  contactName: initialContactName,
  notificationEmail: initialNotificationEmail,
  contactEmail,
  brandAccent: initialBrandAccent,
  appUrl,
  reportToken,
}: {
  orgName: string;
  contactName: string;
  notificationEmail: string;
  contactEmail: string | null;
  brandAccent: string;
  appUrl: string;
  reportToken: string;
}) {
  const [contactName, setContactName] = useState(initialContactName);
  const [notificationEmail, setNotificationEmail] = useState(
    initialNotificationEmail,
  );
  const [brandAccent, setBrandAccent] = useState(initialBrandAccent);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [token, setToken] = useState(reportToken);
  const [newLink, setNewLink] = useState<string | null>(null);
  const [rotating, setRotating] = useState(false);
  const [rotateError, setRotateError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const accentValid = brandAccent === "" || HEX_RE.test(brandAccent);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    if (!accentValid) {
      setError("The accent needs to be a six-digit hex color like #2f5d4f.");
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, string> = {
        contactName: contactName.trim(),
        notificationEmail: notificationEmail.trim(),
        brandAccent: brandAccent.trim(),
      };
      const r = await fetch("/api/portal/settings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error();
      setSaved(true);
    } catch {
      setError("Couldn't save your settings just now — try again.");
    } finally {
      setSaving(false);
    }
  }

  async function rotate() {
    if (
      !window.confirm(
        "Rotate the quick link? Every copy in circulation stops working immediately. Your sign-in is unaffected.",
      )
    )
      return;
    setRotating(true);
    setRotateError(null);
    setCopied(false);
    try {
      const r = await fetch("/api/portal/settings/rotate-token", {
        method: "POST",
      });
      const body = (await r.json().catch(() => null)) as {
        ok?: boolean;
        token?: string;
      } | null;
      if (!r.ok || !body?.ok || !body.token) throw new Error();
      setToken(body.token);
      setNewLink(`${appUrl}/partner/r/${body.token}`);
    } catch {
      setRotateError("Couldn't rotate the link just now — try again.");
    } finally {
      setRotating(false);
    }
  }

  async function copyNewLink() {
    if (!newLink) return;
    try {
      await navigator.clipboard.writeText(newLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — the full URL stays visible to copy by hand.
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardTitle>Organization</CardTitle>
        <form onSubmit={save} className="mt-2 space-y-4">
          <div>
            <div className="text-sm text-ink font-medium mb-1">Name</div>
            <p className="text-base text-ink">{orgName}</p>
            <p className="text-xs text-ink-muted mt-0.5">
              Set when your application was approved. If it needs to change,
              reply to any of our emails.
            </p>
          </div>
          <div>
            <Label htmlFor="settings-contact-name">Contact name</Label>
            <Input
              id="settings-contact-name"
              maxLength={80}
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div>
            <Label
              htmlFor="settings-notification-email"
              hint={`Where the monthly outcomes summary goes. Leave blank to use ${contactEmail ?? "your application contact email"}.`}
            >
              Notification email
            </Label>
            <Input
              id="settings-notification-email"
              type="email"
              maxLength={254}
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div>
            <Label
              htmlFor="settings-brand-accent"
              hint="Shown next to your name on family-facing materials. Leave blank for the default."
            >
              Brand accent
            </Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                aria-label="Pick an accent color"
                value={HEX_RE.test(brandAccent) ? brandAccent : DEFAULT_ACCENT}
                onChange={(e) => setBrandAccent(e.target.value)}
                className="h-11 w-14 shrink-0 cursor-pointer rounded-xl border border-border bg-surface p-1"
              />
              <Input
                id="settings-brand-accent"
                maxLength={7}
                value={brandAccent}
                onChange={(e) => setBrandAccent(e.target.value)}
                placeholder="#2f5d4f"
                autoComplete="off"
                className="font-mono"
              />
            </div>
            {!accentValid && (
              <p className="text-xs text-bad mt-1">
                Use a six-digit hex color like #2f5d4f, or leave it blank.
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save settings"}
            </Button>
            {saved && <span className="text-sm text-good">Saved.</span>}
          </div>
          {error && <p className="text-sm text-bad">{error}</p>}
        </form>
      </Card>

      <Card tone="warn">
        <CardTitle>Quick link</CardTitle>
        <p className="text-sm text-ink-soft">
          Anyone with this link can see your report and tools without signing
          in. Rotating it stops every copy in circulation from working
          immediately — your sign-in is unaffected.
        </p>
        <p className="text-sm text-ink mt-3">
          Current quick link:{" "}
          <span className="font-mono break-all">
            {appUrl}/partner/r/{token.slice(0, 8)}…
          </span>
        </p>
        {newLink && (
          <div className="mt-3 rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-sm text-ink font-medium">
              Your new quick link — share this one from now on:
            </p>
            <p className="text-sm font-mono break-all mt-1">{newLink}</p>
            <button
              type="button"
              onClick={copyNewLink}
              className="mt-2 text-sm text-primary-deep underline-offset-2 hover:underline"
            >
              {copied ? "Copied ✓" : "Copy link"}
            </button>
          </div>
        )}
        <div className="mt-4">
          <Button variant="danger" onClick={rotate} disabled={rotating}>
            {rotating ? "Rotating…" : "Rotate quick link"}
          </Button>
        </div>
        {rotateError && <p className="text-sm text-bad mt-2">{rotateError}</p>}
      </Card>
    </div>
  );
}
