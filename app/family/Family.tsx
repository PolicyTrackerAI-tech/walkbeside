"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { HelpFooter } from "@/components/HelpFooter";

const SHARE_KEYS = [
  "hf-decide:faith",
  "hf-decide:customFaith",
  "hf-decide:faithDenomination",
  "hf-decide:bodyAtService",
  "hf-decide:dispositionPreference",
  "hf-decide:costPriority",
  "hf-decide:isVeteran",
  "hf-decide:recommendedServiceType",
  "honestfuneral.negotiate-wizard.v1",
  "honestfuneral.guidance.hospital.v1",
  "honestfuneral.guidance.home-expected.v1",
  "honestfuneral.guidance.home-unexpected.v1",
  "honestfuneral.guidance.elsewhere.v1",
  "honestfuneral.next30.v1",
  "honestfuneral.next30.expanded.v1",
  "honestfuneral.notifications.v1",
  "honestfuneral.eulogy.draft.v1",
];

function snapshotStorage(): Record<string, string> {
  const out: Record<string, string> = {};
  if (typeof window === "undefined") return out;
  for (const key of SHARE_KEYS) {
    try {
      const v =
        sessionStorage.getItem(key) ?? localStorage.getItem(key);
      if (v != null) out[key] = v;
    } catch {
      // skip
    }
  }
  return out;
}

export function Family() {
  const [status, setStatus] = useState<"idle" | "creating" | "shared" | "error">(
    "idle",
  );
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function createShare() {
    if (typeof window === "undefined") return;
    setStatus("creating");
    setErrorMessage(null);
    try {
      const payload = snapshotStorage();
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
      const { shareUrl: url } = (await r.json()) as { shareUrl: string };
      setShareUrl(url);
      setStatus("shared");
    } catch (e) {
      setStatus("error");
      setErrorMessage(
        e instanceof Error ? e.message : "Couldn't create the share link.",
      );
    }
  }

  async function share() {
    if (!shareUrl || typeof window === "undefined") return;
    const shareData = {
      title: "Honest Funeral",
      text: "I started this for the funeral arrangements — pick up here when you can.",
      url: shareUrl,
    };
    const nav = navigator as Navigator & {
      share?: (data: ShareData) => Promise<void>;
    };
    try {
      if (typeof nav.share === "function") {
        await nav.share(shareData);
      } else if (nav.clipboard) {
        await nav.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard.");
      } else {
        window.prompt("Copy this link:", shareUrl);
      }
    } catch {
      // user cancelled
    }
  }

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader rightSlot={<BackLink defaultHref="/dashboard" />} />
      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-10 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              Family collaboration
            </p>
            <h1 className="font-serif text-3xl text-ink leading-tight mb-3">
              Hand the work to your family.
            </h1>
            <p className="text-ink-soft">
              You don&rsquo;t have to do all of this alone. Send your
              progress to a sibling, an adult child, or a trusted
              friend. They pick up where you left off — no account or
              login required on their end.
            </p>
          </div>

          <Card tone="primary">
            <CardEyebrow>How it works</CardEyebrow>
            <ol className="space-y-3 list-decimal list-inside text-ink mt-3">
              <li>
                <strong>You create a one-time link.</strong> It captures
                your answers and progress so far.
              </li>
              <li>
                <strong>You text or email it to whoever&rsquo;s
                helping.</strong> Spouse, sibling, adult child, friend.
              </li>
              <li>
                <strong>They open the link.</strong> They land on the
                dashboard with your progress already filled in. No
                account. No sign-up.
              </li>
              <li>
                <strong>They take over from there.</strong> Calls,
                paperwork, whatever you don&rsquo;t have energy for
                today.
              </li>
            </ol>
            <p className="text-sm text-ink-muted mt-4">
              Links expire in 7 days for privacy. Your toolkit access
              stays with your account; the link only carries your
              checklists and answers.
            </p>
          </Card>

          <Card>
            <CardTitle>Create a share link.</CardTitle>
            <p className="text-ink-soft mt-3 mb-5">
              Each link contains your current answers from the
              decision flow, the negotiation wizard, the 30-day
              checklist, the notifications list, and any other in-flight
              progress.
            </p>
            {status === "shared" && shareUrl ? (
              <div className="space-y-3">
                <div className="rounded-xl bg-good-soft border border-good/30 px-4 py-3 text-sm text-ink break-all">
                  {shareUrl}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={share}>Send to my family →</Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setStatus("idle");
                      setShareUrl(null);
                    }}
                  >
                    Create a different link
                  </Button>
                </div>
                <p className="text-xs text-ink-muted">
                  Expires 7 days from now.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  size="lg"
                  onClick={createShare}
                  disabled={status === "creating"}
                >
                  {status === "creating"
                    ? "Creating link…"
                    : "Create a share link →"}
                </Button>
                {status === "error" && errorMessage && (
                  <p className="text-sm text-bad">{errorMessage}</p>
                )}
              </div>
            )}
          </Card>

          <Card tone="soft">
            <CardEyebrow>What the recipient sees</CardEyebrow>
            <p className="text-ink-soft mt-3">
              They land on a welcome screen that tells them
              you&rsquo;ve started this for the family. One tap and
              they&rsquo;re on the dashboard with your progress
              restored on their device. They can continue any task you
              didn&rsquo;t finish — checking off paperwork, sending
              notifications, comparing funeral home quotes.
            </p>
            <p className="text-sm text-ink-muted mt-3">
              Your toolkit unlock stays on your account. The recipient
              uses your shared progress without needing their own paid
              account.
            </p>
          </Card>

          <Card tone="soft">
            <CardTitle>If multiple family members are helping.</CardTitle>
            <p className="text-ink-soft">
              Send the link to one person at a time. Their phone or
              laptop becomes the working device for whatever they pick
              up. Coordinate via your usual family group text — the app
              doesn&rsquo;t do real-time multi-user editing yet, so
              think of it like passing a notebook around the table.
            </p>
          </Card>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
