"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import { HelpFooter } from "@/components/HelpFooter";
import { CaseStepper } from "@/components/negotiate/CaseStepper";
import { readReferral } from "@/lib/referral-codes";
import { ReferralCoBrand } from "@/components/ReferralCoBrand";
import { SERVICE_LABELS, type ServiceType } from "@/lib/pricing-data";
import { homesForRadius } from "@/lib/negotiation/sample-homes";
import { trackTool } from "@/lib/analytics";
import {
  DEFAULT_STATE,
  readState,
  writeState,
  clearState,
  hasMeaningfulProgress,
  type WizardState,
} from "@/lib/negotiate-wizard-state";

const TOTAL_STEPS = 8;

function NegotiateStartWizard() {
  const router = useRouter();
  const sp = useSearchParams();

  // Wizard state — persisted in sessionStorage between renders.
  const [state, setState] = useState<WizardState>(DEFAULT_STATE);
  const [step, setStep] = useState(1);
  const [hydrated, setHydrated] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  // Which fields the analyzer handoff actually filled — the "from your quote
  // check" note must never sit beside a value that came from storage or the
  // URL instead.
  const [fromAnalyzer, setFromAnalyzer] = useState({
    zip: false,
    quote: false,
  });
  const [authorized, setAuthorized] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Holds the analyzer handoff after its one-shot sessionStorage read so the
  // hydration effect stays idempotent when React StrictMode double-invokes it
  // in dev (run two would otherwise find the key already consumed and clobber
  // the merged values).
  const handoffRef = useRef<{
    present: boolean;
    values: Partial<WizardState>;
  } | null>(null);

  // Hydrate from sessionStorage + query params.
  useEffect(() => {
    const fromStorage = readState();
    const fromQuery: Partial<WizardState> = {
      zip: sp.get("zip") ?? undefined,
      serviceType: (sp.get("svc") as ServiceType) ?? undefined,
      targetHomeName: sp.get("home") ?? undefined,
      targetEstimate: sp.get("q") ?? undefined,
    };
    // Filter out undefineds so they don't blow away storage values.
    const cleanQuery = Object.fromEntries(
      Object.entries(fromQuery).filter(([, v]) => v != null && v !== ""),
    );
    // One-shot handoff written by the analyzer's "Have us contact funeral
    // homes" CTA (survives the sign-in redirect, unlike query params).
    // Consumed once — removed on read — and every field is validated before
    // it can touch the wizard: the analyzer's total arrives in CENTS and
    // targetEstimate is a raw DOLLARS string until submit.
    if (handoffRef.current === null) {
      const handoff: Partial<WizardState> = {};
      let handoffPresent = false;
      try {
        const rawHandoff =
          window.sessionStorage.getItem("hf-analyzer:handoff");
        if (rawHandoff) {
          window.sessionStorage.removeItem("hf-analyzer:handoff");
          handoffPresent = true;
          const h = JSON.parse(rawHandoff) as {
            zip?: unknown;
            serviceType?: unknown;
            totalCents?: unknown;
            homeName?: unknown;
          };
          if (typeof h.zip === "string" && /^\d{5}$/.test(h.zip)) {
            handoff.zip = h.zip;
          }
          if (
            typeof h.serviceType === "string" &&
            h.serviceType in SERVICE_LABELS
          ) {
            handoff.serviceType = h.serviceType as ServiceType;
          }
          if (typeof h.homeName === "string" && h.homeName) {
            handoff.targetHomeName = h.homeName;
          }
          if (
            typeof h.totalCents === "number" &&
            Number.isFinite(h.totalCents) &&
            h.totalCents > 0
          ) {
            handoff.targetEstimate =
              h.totalCents % 100 === 0
                ? String(h.totalCents / 100)
                : (h.totalCents / 100).toFixed(2);
          }
          if (handoff.targetHomeName || handoff.targetEstimate) {
            handoff.hasQuote = "yes";
            // The fresh check overrides BOTH quote fields wholesale so a new
            // estimate can never pair with a stale stored home name (or vice
            // versa) — mixed provenance would misstate the family's quote.
            handoff.targetHomeName = handoff.targetHomeName ?? "";
            handoff.targetEstimate = handoff.targetEstimate ?? "";
          }
        }
      } catch {
        // a malformed handoff never blocks the wizard
      }
      handoffRef.current = { present: handoffPresent, values: handoff };
    }
    const { present: handoffPresent, values: handoff } = handoffRef.current;
    if (fromStorage && hasMeaningfulProgress(fromStorage) && !handoffPresent) {
      setState({ ...fromStorage, ...cleanQuery });
      setShowResumePrompt(true);
    } else {
      // The family arriving mid-flow from the checker isn't "resuming" — no
      // resume prompt; their fresh answers merge over anything stale.
      setState({ ...DEFAULT_STATE, ...fromStorage, ...handoff, ...cleanQuery });
      setFromAnalyzer({
        zip: handoff.zip !== undefined,
        quote:
          handoff.targetHomeName !== undefined ||
          handoff.targetEstimate !== undefined,
      });
    }
    setHydrated(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on change.
  useEffect(() => {
    if (!hydrated) return;
    writeState(state);
  }, [state, hydrated]);

  function update<K extends keyof WizardState>(key: K, value: WizardState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function next() {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 1));
  }
  function autoNext(delayMs = 1200) {
    window.setTimeout(next, delayMs);
  }

  // Step 4 conditional sub-screen — if hasQuote === "no", skip 4b.
  // Encoded by treating "step 5" as the "next after 4 + 4b" depending
  // on hasQuote.
  function nextFromQuoteStep() {
    if (state.hasQuote === "yes") {
      setStep(5); // proceed to "how soon"
    } else {
      setStep(5); // same — 4b is rendered inline when yes
    }
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const targetEstimateNum = state.targetEstimate
        ? Number(state.targetEstimate.replace(/[^0-9.]/g, ""))
        : 0;
      const r = await fetch("/api/negotiate/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          zip: state.zip,
          serviceType: state.serviceType,
          radiusMiles: state.radiusMiles,
          targetHomeName: state.targetHomeName || undefined,
          targetEstimateCents:
            targetEstimateNum > 0
              ? Math.round(targetEstimateNum * 100)
              : undefined,
          senderFirstName: state.senderFirstName,
          senderLastName: state.senderLastName || undefined,
          timing: state.timing,
          notes: state.notes || undefined,
          extras: state.extras || undefined,
          dateOfDeath: state.dateOfDeath || undefined,
          pointPersonConsent: state.pointPersonConsent,
          authorizationAccepted: authorized,
          // Attribution for the referring institution's AGGREGATE report only
          // (remembered on-device from a ?ref= visit; absent for most families).
          referralCode: readReferral() ?? undefined,
        }),
      });
      if (r.status === 401) {
        router.push(
          `/login?next=${encodeURIComponent(`/negotiate/start`)}`,
        );
        return;
      }
      const data = await r.json();
      if (!r.ok) throw new Error(JSON.stringify(data.error));
      clearState();
      trackTool("negotiate_started", { serviceType: state.serviceType });
      // Free to the family — the outreach is already triggered server-side
      // (dry_run until OUTREACH_LIVE is on). Go straight to the status page.
      router.push(`/negotiate/${data.id}/status`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not start.");
    } finally {
      setBusy(false);
    }
  }

  const homesCount = homesForRadius(state.radiusMiles);

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader
        rightSlot={<BackLink defaultHref="/decide" defaultLabel="← Decide" />}
      />
      <section className="flex-1">
        <div className="max-w-xl mx-auto px-5 py-10 space-y-6">
          <ReferralCoBrand refParam={sp.get("ref") ?? undefined} />

          <div>
            <h1 className="font-serif text-3xl text-ink mb-3">
              Have us contact funeral homes — free.
            </h1>
            <p className="text-ink-soft">
              We&rsquo;ll contact 3&ndash;5 homes near you as your advocate,
              request itemized prices, and bring back the options to compare.
              Free to families &mdash; we contact homes on your behalf at no
              charge.
            </p>
          </div>

          {/* Resume prompt */}
          {hydrated && showResumePrompt && (
            <Card tone="soft">
              <p className="text-sm text-ink-soft mb-3">
                We saved your last answers. Continue, or start fresh?
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowResumePrompt(false)}
                >
                  Continue where I left off
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    clearState();
                    setState(DEFAULT_STATE);
                    setStep(1);
                    setShowResumePrompt(false);
                  }}
                >
                  Start fresh
                </Button>
              </div>
            </Card>
          )}

          {!showResumePrompt && hydrated && (
            <>
              <CaseStepper stage="started" />

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-ink-muted font-medium">
                    Step {step} of {TOTAL_STEPS}
                  </span>
                  {step > 1 && (
                    <button
                      onClick={back}
                      className="text-xs text-ink-muted hover:text-ink-soft underline-offset-2 hover:underline"
                    >
                      ← Back
                    </button>
                  )}
                </div>
                <div
                  className="h-1.5 bg-surface-soft rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={step}
                  aria-valuemin={1}
                  aria-valuemax={TOTAL_STEPS}
                >
                  <div
                    className="h-full bg-primary-deep transition-all duration-500"
                    style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                  />
                </div>
              </div>

              {/* Steps */}
              {step === 1 && (
                <Card>
                  <Label htmlFor="zip" hint="Used to find nearby homes. Never sold.">
                    What zip code?
                  </Label>
                  <Input
                    id="zip"
                    inputMode="numeric"
                    maxLength={5}
                    value={state.zip}
                    onChange={(e) =>
                      update("zip", e.target.value.replace(/[^0-9]/g, ""))
                    }
                    placeholder="44106"
                    autoFocus
                  />
                  {fromAnalyzer.zip && state.zip.length === 5 && (
                    <p className="text-xs text-ink-muted mt-2">
                      from your quote check ✓
                    </p>
                  )}
                  <Button
                    size="lg"
                    onClick={next}
                    disabled={state.zip.length !== 5}
                    className="mt-5"
                  >
                    Continue →
                  </Button>
                </Card>
              )}

              {step === 2 && (
                <Card>
                  <Label htmlFor="svc" hint="If you came from the decision guide, this is already set.">
                    What kind of service?
                  </Label>
                  <Select
                    id="svc"
                    value={state.serviceType}
                    onChange={(e) => {
                      update("serviceType", e.target.value as ServiceType);
                      autoNext();
                    }}
                  >
                    {Object.entries(SERVICE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </Select>
                  <Button size="lg" onClick={next} className="mt-5">
                    Continue →
                  </Button>
                </Card>
              )}

              {step === 3 && (
                <Card>
                  <h2 className="font-serif text-xl text-ink mb-3">
                    How far are you willing to drive?
                  </h2>
                  <div className="grid sm:grid-cols-3 gap-3 mt-3">
                    {[10, 25, 50].map((mi) => (
                      <button
                        type="button"
                        key={mi}
                        onClick={() => {
                          update("radiusMiles", mi);
                          autoNext();
                        }}
                        className={`rounded-2xl border-2 p-4 text-left transition-colors ${
                          state.radiusMiles === mi
                            ? "border-primary bg-primary-soft"
                            : "border-border bg-surface hover:border-primary"
                        }`}
                      >
                        <div className="font-serif text-xl text-ink">
                          {mi} miles
                        </div>
                        <div className="text-sm text-ink-soft mt-1">
                          ~{homesForRadius(mi)} homes
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>
              )}

              {step === 4 && (
                <Card>
                  <h2 className="font-serif text-xl text-ink mb-2">
                    Already have a quote from a funeral home?
                  </h2>
                  <p className="text-sm text-ink-muted mb-3">
                    If yes, we&rsquo;ll baseline savings against it. If no,
                    we just go gather options.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { value: "yes" as const, label: "Yes, I have one" },
                      { value: "no" as const, label: "No, not yet" },
                    ].map((opt) => (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => {
                          update("hasQuote", opt.value);
                          if (opt.value === "no") {
                            // Clear any leftover quote details and skip 4b.
                            update("targetHomeName", "");
                            update("targetEstimate", "");
                          }
                          autoNext();
                        }}
                        className={`rounded-2xl border-2 p-4 text-left transition-colors ${
                          state.hasQuote === opt.value
                            ? "border-primary bg-primary-soft"
                            : "border-border bg-surface hover:border-primary"
                        }`}
                      >
                        <div className="font-serif text-lg text-ink">
                          {opt.label}
                        </div>
                      </button>
                    ))}
                  </div>

                  {state.hasQuote === "yes" && (
                    <div className="mt-6 space-y-4">
                      {fromAnalyzer.quote &&
                        (state.targetHomeName !== "" ||
                          state.targetEstimate !== "") && (
                          <p className="text-xs text-ink-muted">
                            from your quote check ✓
                          </p>
                        )}
                      <div>
                        <Label htmlFor="home">
                          Which funeral home gave you the quote?
                        </Label>
                        <Input
                          id="home"
                          value={state.targetHomeName}
                          onChange={(e) =>
                            update("targetHomeName", e.target.value)
                          }
                          placeholder="e.g. Brookside Funeral Home"
                        />
                      </div>
                      <div>
                        <Label htmlFor="q">
                          How much was their all-in quote?
                        </Label>
                        <Input
                          id="q"
                          inputMode="decimal"
                          value={state.targetEstimate}
                          onChange={(e) =>
                            update("targetEstimate", e.target.value)
                          }
                          placeholder="8500"
                        />
                      </div>
                      <Button size="lg" onClick={nextFromQuoteStep}>
                        Continue →
                      </Button>
                    </div>
                  )}
                </Card>
              )}

              {step === 5 && (
                <Card>
                  <h2 className="font-serif text-xl text-ink mb-3">
                    How soon does this need to happen?
                  </h2>
                  <div className="grid gap-3 mt-3">
                    {[
                      { value: "today", label: "Today / within 24 hours" },
                      { value: "this-week", label: "This week (1–7 days)" },
                      { value: "this-month", label: "This month" },
                      {
                        value: "planning-ahead",
                        label: "Planning ahead (more than 30 days)",
                      },
                      { value: "not-sure", label: "Not sure yet" },
                    ].map((opt) => (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => {
                          update("timing", opt.value);
                          autoNext();
                        }}
                        className={`rounded-2xl border-2 p-4 text-left transition-colors ${
                          state.timing === opt.value
                            ? "border-primary bg-primary-soft"
                            : "border-border bg-surface hover:border-primary"
                        }`}
                      >
                        <div className="font-serif text-base text-ink">
                          {opt.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>
              )}

              {step === 6 && (
                <Card>
                  <Label htmlFor="first" hint="One person speaks for the family here — it keeps the process calm and the funeral homes honest. Often the person named on the plan, but any adult the family trusts works.">
                    Who is the family&rsquo;s point person?
                  </Label>
                  <div className="grid sm:grid-cols-2 gap-3 mt-2">
                    <Input
                      id="first"
                      value={state.senderFirstName}
                      onChange={(e) => update("senderFirstName", e.target.value)}
                      placeholder="First"
                      autoFocus
                    />
                    <Input
                      id="last"
                      value={state.senderLastName}
                      onChange={(e) => update("senderLastName", e.target.value)}
                      placeholder="Last (optional)"
                    />
                  </div>
                  <p className="text-sm text-ink-soft mt-3">
                    Funeral homes see only the name you enter here (as
                    &ldquo;the Miller family&rdquo; or &ldquo;Sarah&rsquo;s
                    family&rdquo;) and our shared reply address. Your email,
                    phone number, and everyone else in the family stay private
                    &mdash; always.
                  </p>
                  <label className="flex items-start gap-3 mt-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={state.pointPersonConsent}
                      onChange={(e) =>
                        update("pointPersonConsent", e.target.checked)
                      }
                      className="mt-1 h-4 w-4 accent-[var(--primary-deep,#2f5d50)]"
                    />
                    <span className="text-sm text-ink">
                      I&rsquo;m the family&rsquo;s point person for this, and
                      I&rsquo;m okay with the funeral homes we contact seeing
                      this name.
                    </span>
                  </label>
                  <Button
                    size="lg"
                    onClick={next}
                    disabled={
                      state.senderFirstName.length === 0 ||
                      !state.pointPersonConsent
                    }
                    className="mt-5"
                  >
                    Continue →
                  </Button>
                </Card>
              )}

              {step === 7 && (
                <Card>
                  <Label htmlFor="notes">
                    Anything specific to mention?
                  </Label>
                  <p className="text-sm text-ink-muted mb-2">
                    Religious tradition, language preference, special
                    accommodation. Optional.
                  </p>
                  <Textarea
                    id="notes"
                    rows={4}
                    value={state.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    placeholder="e.g. Catholic funeral, Spanish-speaking, veteran (DD-214 ready)…"
                  />
                  <div className="mt-5">
                    <Label
                      htmlFor="dod"
                      hint="Optional. Lets us check in at the moments that tend to matter — a month out, the anniversary. Never marketing, and you can turn it off anytime."
                    >
                      When did they pass?
                    </Label>
                    <Input
                      id="dod"
                      type="date"
                      value={state.dateOfDeath}
                      max={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => update("dateOfDeath", e.target.value)}
                      className="max-w-xs"
                    />
                  </div>
                  <div className="flex flex-wrap gap-3 mt-5">
                    <Button size="lg" onClick={next}>
                      Continue →
                    </Button>
                    <Button variant="ghost" onClick={next}>
                      Skip
                    </Button>
                  </div>
                </Card>
              )}

              {step === 8 && (
                <Card tone="primary">
                  <CardEyebrow>One last thing</CardEyebrow>
                  <h2 className="font-serif text-2xl text-ink mb-3">
                    Authorize us to reach out for you.
                  </h2>
                  <p className="text-ink-soft mb-4">
                    By checking the box below, you tell us we can contact
                    funeral homes near you on your behalf.
                  </p>
                  <ul className="text-sm text-ink space-y-2 list-disc pl-5 mb-5">
                    <li>
                      We identify ourselves as your advocate &mdash; never
                      as you.
                    </li>
                    <li>
                      We request itemized prices, which is your right under
                      the FTC Funeral Rule.
                    </li>
                    <li>
                      If you pick a home, we help schedule the in-person
                      arrangement meeting and relay pre-meeting questions
                      so your personal contact info stays private.
                    </li>
                    <li>
                      You attend the arrangement meeting in person and sign
                      all paperwork directly with the home &mdash; Honest
                      Funeral never signs for you and is not a funeral
                      establishment.
                    </li>
                    <li>
                      This is free to families &mdash; we contact homes on
                      your behalf at no charge.
                    </li>
                  </ul>
                  <label className="flex items-start gap-3 cursor-pointer mb-5">
                    <input
                      type="checkbox"
                      checked={authorized}
                      onChange={(e) => setAuthorized(e.target.checked)}
                      className="mt-1 w-5 h-5 accent-[var(--primary-deep)] shrink-0"
                    />
                    <span className="text-sm text-ink leading-relaxed">
                      I am the legal next of kin or have written authority
                      from the next of kin, and I authorize Honest Funeral
                      on the terms above.
                    </span>
                  </label>
                  {error && (
                    <div className="text-sm text-bad bg-bad-soft border border-bad/30 rounded-xl px-4 py-3 mb-4">
                      {error}
                    </div>
                  )}
                  <Button
                    onClick={submit}
                    disabled={busy || !authorized}
                    size="lg"
                  >
                    {busy
                      ? "Reaching out…"
                      : `Reach out to ${homesCount} homes →`}
                  </Button>
                </Card>
              )}

              <p className="text-center text-sm text-ink-soft">
                You can close this and come back later. Your answers are
                saved on this device.
              </p>
            </>
          )}

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}

export function Wizard() {
  return (
    <Suspense
      fallback={
        <div className="px-5 py-10 max-w-md mx-auto text-ink-muted">
          Loading…
        </div>
      }
    >
      <NegotiateStartWizard />
    </Suspense>
  );
}
