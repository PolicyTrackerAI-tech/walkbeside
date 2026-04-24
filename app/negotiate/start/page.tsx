"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Brand } from "@/components/Brand";
import { Card, CardEyebrow } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import { SERVICE_LABELS, type ServiceType } from "@/lib/pricing-data";
import { homesForRadius } from "@/lib/negotiation/sample-homes";

function NegotiateStartForm() {
  const router = useRouter();
  const sp = useSearchParams();

  const [zip, setZip] = useState(sp.get("zip") ?? "");
  const [serviceType, setServiceType] = useState<ServiceType>(
    (sp.get("svc") as ServiceType) ?? "traditional-burial",
  );
  const [radiusMiles, setRadiusMiles] = useState(
    Number(sp.get("r") ?? "25") || 25,
  );
  const [targetHomeName, setTargetHomeName] = useState(sp.get("home") ?? "");
  const [targetEstimate, setTargetEstimate] = useState(sp.get("q") ?? "");
  const [senderFirstName, setSenderFirstName] = useState("");
  const [senderLastName, setSenderLastName] = useState("");
  const [timing, setTiming] = useState("within the next week");
  const [extras, setExtras] = useState("");
  const [showOptional, setShowOptional] = useState(
    Boolean(sp.get("home") || sp.get("q")),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const homesCount = homesForRadius(radiusMiles);

  async function start(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/negotiate/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          zip,
          serviceType,
          radiusMiles,
          targetHomeName: targetHomeName || undefined,
          targetEstimateCents: targetEstimate
            ? Math.round(Number(targetEstimate) * 100)
            : undefined,
          senderFirstName,
          senderLastName: senderLastName || undefined,
          timing,
          extras: extras || undefined,
        }),
      });
      if (r.status === 401) {
        router.push(
          `/login?next=${encodeURIComponent(`/negotiate/start?${sp.toString()}`)}`,
        );
        return;
      }
      const data = await r.json();
      if (!r.ok) throw new Error(JSON.stringify(data.error));
      router.push(`/negotiate/${data.id}/status`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not start.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex-1 flex flex-col">
      <header className="border-b border-border bg-surface/70">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Brand />
          <Link
            href="/prices"
            className="text-sm text-ink-muted hover:text-ink-soft"
          >
            ← Back to prices
          </Link>
        </div>
      </header>
      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-10 space-y-6">
          <div>
            <h1 className="font-serif text-3xl text-ink mb-3">
              Let us negotiate for you.
            </h1>
            <p className="text-lg text-ink-soft">
              We&rsquo;ll quietly contact funeral homes near you on your behalf
              and bring back the best options to compare side by side.
            </p>
          </div>

          <Card tone="primary">
            <CardEyebrow>How this works</CardEyebrow>
            <ol className="space-y-2 list-decimal list-inside text-ink">
              <li>You give us your zip and what kind of service you want.</li>
              <li>
                We email funeral homes asking for itemized prices — no
                pressure, no commitment.
              </li>
              <li>
                As replies come in, we put them side-by-side. You pick the
                home you want.
              </li>
              <li>
                If we save you money, you pay 20% of the savings — capped at
                $500. If we don&rsquo;t, you pay nothing.
              </li>
            </ol>
          </Card>

          <Card>
            <form onSubmit={start} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="zip">Your zip code</Label>
                  <Input
                    id="zip"
                    inputMode="numeric"
                    maxLength={5}
                    required
                    value={zip}
                    onChange={(e) =>
                      setZip(e.target.value.replace(/[^0-9]/g, ""))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="svc">Type of service</Label>
                  <Select
                    id="svc"
                    value={serviceType}
                    onChange={(e) =>
                      setServiceType(e.target.value as ServiceType)
                    }
                  >
                    {Object.entries(SERVICE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-baseline justify-between mb-2">
                    <Label htmlFor="radius" className="mb-0">
                      How far should we look?
                    </Label>
                    <span className="text-sm text-ink-soft">
                      <strong className="text-ink">{radiusMiles} miles</strong>{" "}
                      &middot; up to{" "}
                      <strong className="text-ink">{homesCount}</strong> homes
                    </span>
                  </div>
                  <input
                    id="radius"
                    type="range"
                    min={5}
                    max={100}
                    step={5}
                    value={radiusMiles}
                    onChange={(e) => setRadiusMiles(Number(e.target.value))}
                    className="w-full accent-[var(--primary)]"
                  />
                  <div className="flex justify-between text-xs text-ink-muted mt-1">
                    <span>5 mi</span>
                    <span>25 mi</span>
                    <span>50 mi</span>
                    <span>100 mi</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="first">Your first name</Label>
                  <Input
                    id="first"
                    required
                    value={senderFirstName}
                    onChange={(e) => setSenderFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="last">Last name (optional)</Label>
                  <Input
                    id="last"
                    value={senderLastName}
                    onChange={(e) => setSenderLastName(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label
                    htmlFor="timing"
                    hint="So we can mention urgency in the outreach."
                  >
                    When does this need to happen?
                  </Label>
                  <Input
                    id="timing"
                    value={timing}
                    onChange={(e) => setTiming(e.target.value)}
                  />
                </div>
              </div>

              {/* Optional section — visually separate so people don't feel they need it */}
              <div className="rounded-2xl border border-dashed border-border bg-surface-soft/60 p-5">
                <button
                  type="button"
                  onClick={() => setShowOptional((v) => !v)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div>
                    <div className="text-xs uppercase tracking-wider text-ink-muted mb-1">
                      Optional &middot; skip if you don&rsquo;t have these yet
                    </div>
                    <div className="font-serif text-ink">
                      Have a funeral home or quote in mind already?
                    </div>
                  </div>
                  <span
                    aria-hidden
                    className="text-ink-muted text-lg leading-none ml-4"
                  >
                    {showOptional ? "−" : "+"}
                  </span>
                </button>

                {showOptional && (
                  <div className="grid sm:grid-cols-2 gap-5 mt-5">
                    <div>
                      <Label
                        htmlFor="home"
                        hint="If they already gave you a name."
                      >
                        Funeral home you&rsquo;re considering
                      </Label>
                      <Input
                        id="home"
                        placeholder="e.g. Brookside Funeral Home"
                        value={targetHomeName}
                        onChange={(e) => setTargetHomeName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="q"
                        hint="The all-in number, so we can baseline savings."
                      >
                        Their quoted price (USD)
                      </Label>
                      <Input
                        id="q"
                        inputMode="decimal"
                        placeholder="e.g. 8500"
                        value={targetEstimate}
                        onChange={(e) => setTargetEstimate(e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label
                        htmlFor="extras"
                        hint="Anything that affects the situation. We'll mention it gently."
                      >
                        Other context
                      </Label>
                      <Textarea
                        id="extras"
                        value={extras}
                        onChange={(e) => setExtras(e.target.value)}
                        placeholder="Pre-paid plan with a different home; veteran; cremation already chosen…"
                      />
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="text-sm text-bad bg-bad-soft border border-bad/30 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={busy} size="lg">
                {busy ? "Reaching out…" : `Start outreach to ${homesCount} homes`}
              </Button>
              <p className="text-xs text-ink-muted">
                We don&rsquo;t share your real email with any funeral home. Replies
                come to us; we summarize them for you.
              </p>
            </form>
          </Card>
        </div>
      </section>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="px-5 py-10 max-w-md mx-auto text-ink-muted">
          Loading…
        </div>
      }
    >
      <NegotiateStartForm />
    </Suspense>
  );
}
