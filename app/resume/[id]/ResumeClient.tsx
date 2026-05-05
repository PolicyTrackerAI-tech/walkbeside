"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { HelpFooter } from "@/components/HelpFooter";

interface SnapshotResponse {
  id: string;
  payload: Record<string, unknown>;
}

/**
 * Client side of the /resume/[id] page. Fetches the share-link payload
 * from /api/share/[id], hydrates sessionStorage with the snapshot, and
 * shows a one-screen welcome that hands the user off to the dashboard
 * (or wherever the originator was).
 *
 * Margaret-section-7: this is the proxy operator landing screen.
 */
export function ResumeClient({ id }: { id: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchSnapshot() {
      try {
        const r = await fetch(`/api/share/${id}`);
        if (!r.ok) {
          if (!cancelled) {
            setStatus("error");
            setErrorMessage(
              r.status === 404
                ? "This link has expired or doesn't exist anymore."
                : "Couldn't load the saved progress.",
            );
          }
          return;
        }
        const data = (await r.json()) as SnapshotResponse;
        // Hydrate sessionStorage from the snapshot.
        if (data.payload && typeof data.payload === "object") {
          for (const [key, value] of Object.entries(data.payload)) {
            try {
              const stringValue =
                typeof value === "string" ? value : JSON.stringify(value);
              sessionStorage.setItem(key, stringValue);
            } catch {
              // Skip keys that fail to write — partial restore is better
              // than nothing.
            }
          }
        }
        if (!cancelled) setStatus("ready");
      } catch (e) {
        if (!cancelled) {
          setStatus("error");
          setErrorMessage(
            e instanceof Error
              ? e.message
              : "Something went wrong loading the link.",
          );
        }
      }
    }
    fetchSnapshot();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader showBack={false} />
      <section className="flex-1">
        <div className="max-w-xl mx-auto px-5 py-12 space-y-6">
          {status === "loading" && (
            <Card>
              <p className="text-ink-soft">Restoring saved progress…</p>
            </Card>
          )}

          {status === "error" && (
            <Card tone="warn">
              <CardEyebrow>Link expired</CardEyebrow>
              <h1 className="font-serif text-2xl text-ink mb-3">
                We couldn&rsquo;t open this saved progress.
              </h1>
              <p className="text-ink-soft mb-4">
                {errorMessage ??
                  "Share links expire after 7 days. Ask whoever sent it for a new one, or start fresh on the homepage."}
              </p>
              <Button onClick={() => router.push("/")}>Go home</Button>
            </Card>
          )}

          {status === "ready" && (
            <Card tone="primary">
              <CardEyebrow>You&rsquo;re picking up where they left off</CardEyebrow>
              <h1 className="font-serif text-3xl text-ink mb-3">
                Their answers are saved on this device now.
              </h1>
              <p className="text-ink-soft mb-5">
                Whoever sent you this link started filling out the funeral
                arrangements. We just restored their answers on your phone
                so you don&rsquo;t have to start over.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" onClick={() => router.push("/dashboard")}>
                  Pick up where they stopped →
                </Button>
                <Button variant="ghost" onClick={() => router.push("/")}>
                  Start fresh instead
                </Button>
              </div>
            </Card>
          )}

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
