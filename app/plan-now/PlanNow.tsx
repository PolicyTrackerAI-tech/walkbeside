"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Field";
import {
  SERVICE_LABELS,
  SERVICE_TOTALS,
  fmtUSD,
  regionMultiplier,
  type ServiceType,
} from "@/lib/pricing-data";
import {
  benefitSweep,
  clearPlan,
  DEFAULT_PLAN,
  readPlan,
  writePlan,
  type PlanState,
  type YesNoUnsure,
} from "@/lib/plan-now";

/**
 * The one-sitting plan for the hospice admission week (research opportunity
 * #1): understand the options → see what fair costs locally → capture what
 * matters → surface likely benefits → name who makes the first call → print
 * the family plan + "first call" card. Pre-death framing throughout; nothing
 * assumes the death has happened. All state stays in localStorage on the
 * family's device — no account, no server write, nothing transmitted anywhere.
 */

const TOTAL_STEPS = 5;

const PATH_NOTES: Record<ServiceType, string> = {
  "direct-cremation":
    "Cremation soon after death, no ceremony at the funeral home. The simplest and least expensive path — a memorial can be held anywhere, anytime.",
  "cremation-with-service":
    "Cremation plus a memorial or viewing through the funeral home.",
  "traditional-burial":
    "Casket burial with a viewing and funeral service — the fullest (and most expensive) path.",
  "graveside-burial":
    "Burial with a short service at the grave, skipping the funeral-home ceremony.",
  "green-burial":
    "Natural burial — no embalming, biodegradable casket or shroud, often in a natural cemetery.",
  aquamation:
    "Water-based cremation (alkaline hydrolysis) — gentler footprint; not yet available in every state.",
  "body-donation":
    "Whole-body donation to a medical program — usually free, with cremated remains returned later.",
  "memorial-no-body":
    "A memorial gathering without the body present — pairs with any disposition choice.",
};

// The two most common paths, shown when the family is still deciding.
const COMMON_PATHS: ServiceType[] = ["direct-cremation", "traditional-burial"];

function fairRange(path: ServiceType, zip: string): { low: number; high: number } | null {
  const t = SERVICE_TOTALS.find((s) => s.type === path);
  if (!t) return null;
  const m = zip.length === 5 ? regionMultiplier(zip) : 1;
  return { low: Math.round(t.fairLow * m), high: Math.round(t.fairHigh * m) };
}

function YesNoUnsureRow({
  id,
  question,
  value,
  onChange,
}: {
  id: string;
  question: string;
  value: YesNoUnsure;
  onChange: (v: YesNoUnsure) => void;
}) {
  return (
    <div>
      <div id={`${id}-label`} className="text-ink font-medium mb-2">
        {question}
      </div>
      <div role="group" aria-labelledby={`${id}-label`} className="flex gap-2">
        {(["yes", "no", "unsure"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`rounded-xl border-2 px-4 py-2 text-sm capitalize transition-colors ${
              value === v
                ? "border-primary bg-primary-soft text-primary-deep font-medium"
                : "border-border bg-surface text-ink hover:border-primary"
            }`}
          >
            {v === "unsure" ? "Not sure" : v}
          </button>
        ))}
      </div>
    </div>
  );
}

export function PlanNow({ partner }: { partner?: string }) {
  const [plan, setPlan] = useState<PlanState>(DEFAULT_PLAN);
  const [step, setStep] = useState(1);
  const [showPlan, setShowPlan] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const planRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const saved = readPlan();
    if (saved) setPlan(saved);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writePlan(plan);
  }, [plan, hydrated]);

  useEffect(() => {
    if (showPlan && planRef.current) {
      planRef.current.focus();
      planRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showPlan]);

  function update<K extends keyof PlanState>(key: K, value: PlanState[K]) {
    setPlan((p) => ({ ...p, [key]: value }));
  }

  const who = plan.personName.trim() || "your person";
  const paths: ServiceType[] = plan.path ? [plan.path] : COMMON_PATHS;
  const benefits = benefitSweep(plan.benefits);

  return (
    <main className="flex-1 flex flex-col">
      <div className="print:hidden">
        <SiteHeader rightSlot={<BackLink defaultHref="/" defaultLabel="← Home" />} />
      </div>
      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-10 space-y-6">
          {partner && (
            <div className="print:hidden rounded-xl border border-primary/30 bg-primary-soft/50 px-4 py-3 text-sm text-ink">
              <span className="font-medium">Provided to you free by {partner}.</span>{" "}
              Neutral, private help — Honest Funeral takes no money from funeral
              homes or insurers, and nothing you enter here is shared with
              anyone.
            </div>
          )}

          {!showPlan && (
            <>
              <div className="print:hidden">
                <CardEyebrow>The plan — about 20 minutes</CardEyebrow>
                <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
                  Decide calmly now, so the first call is easy later.
                </h1>
                <p className="text-ink-soft">
                  When someone dies, the funeral home that picks up the body
                  usually becomes the funeral home — decided in one rushed phone
                  call. Doing this short plan now, while nothing is urgent,
                  means that call happens on your terms. Everything stays on
                  your device; there&rsquo;s nothing to sign up for.
                </p>
                <p className="text-xs text-ink-muted mt-2">
                  Step {step} of {TOTAL_STEPS}
                </p>
              </div>

              {step === 1 && (
                <Card>
                  <CardTitle>Which path feels right?</CardTitle>
                  <p className="text-ink-soft text-sm mt-1 mb-4">
                    A leaning is enough — you can change it anytime, and
                    nothing is committed.
                  </p>
                  <div className="grid gap-2">
                    {(Object.keys(SERVICE_LABELS) as ServiceType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          update("path", t);
                          setStep(2);
                        }}
                        className={`rounded-2xl border-2 p-4 text-left transition-colors ${
                          plan.path === t
                            ? "border-primary bg-primary-soft"
                            : "border-border bg-surface hover:border-primary"
                        }`}
                      >
                        <div className="font-serif text-base text-ink">
                          {SERVICE_LABELS[t]}
                        </div>
                        <div className="text-sm text-ink-soft mt-0.5">
                          {PATH_NOTES[t]}
                        </div>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        update("path", "");
                        setStep(2);
                      }}
                      className="rounded-2xl border-2 border-border bg-surface p-4 text-left hover:border-primary transition-colors"
                    >
                      <div className="font-serif text-base text-ink">
                        Not sure yet
                      </div>
                      <div className="text-sm text-ink-soft mt-0.5">
                        We&rsquo;ll show fair prices for the two most common
                        paths so you can compare.
                      </div>
                    </button>
                  </div>
                </Card>
              )}

              {step === 2 && (
                <Card>
                  <CardTitle>What&rsquo;s fair to pay near you</CardTitle>
                  <div className="mt-3 max-w-xs">
                    <Label htmlFor="zip" hint="Adjusts the fair range for your region. Never stored anywhere but this device.">
                      Zip code
                    </Label>
                    <Input
                      id="zip"
                      inputMode="numeric"
                      maxLength={5}
                      value={plan.zip}
                      onChange={(e) =>
                        update("zip", e.target.value.replace(/[^0-9]/g, ""))
                      }
                    />
                  </div>
                  {plan.zip.length === 5 && (
                    <div className="mt-4 space-y-3">
                      {paths.map((p) => {
                        const r = fairRange(p, plan.zip);
                        if (!r) return null;
                        return (
                          <div
                            key={p}
                            className="rounded-xl border border-border bg-surface-soft px-4 py-3"
                          >
                            <div className="text-sm text-ink-soft">
                              {SERVICE_LABELS[p]}
                            </div>
                            <div className="font-serif text-2xl text-ink mt-0.5">
                              {fmtUSD(r.low)}&ndash;{fmtUSD(r.high)}
                            </div>
                          </div>
                        );
                      })}
                      <p className="text-sm text-ink-soft">
                        That&rsquo;s the fair range near you &mdash; a quote far
                        above it deserves a &ldquo;why?&rdquo;. The same service
                        can cost 2&ndash;3&times; more across town, and prices
                        are negotiable. When you have a real quote in hand, our
                        free{" "}
                        <Link href="/analyzer" className="text-primary-deep underline">
                          checker
                        </Link>{" "}
                        reads it line by line.
                      </p>
                    </div>
                  )}
                  <div className="flex gap-3 mt-5">
                    <Button onClick={() => setStep(3)} disabled={plan.zip.length !== 5}>
                      Continue →
                    </Button>
                    <Button variant="ghost" onClick={() => setStep(1)}>
                      ← Back
                    </Button>
                  </div>
                </Card>
              )}

              {step === 3 && (
                <Card>
                  <CardTitle>What matters to your family</CardTitle>
                  <div className="mt-3 space-y-4">
                    <div className="max-w-xs">
                      <Label htmlFor="person" hint="Optional — just so the plan reads like yours. Stays on this device.">
                        Their first name
                      </Label>
                      <Input
                        id="person"
                        value={plan.personName}
                        maxLength={60}
                        onChange={(e) => update("personName", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="wishes" hint="Anything they've said, or what you know they'd want. Simple is a complete answer.">
                        Wishes and what matters
                      </Label>
                      <Textarea
                        id="wishes"
                        rows={4}
                        value={plan.wishes}
                        onChange={(e) => update("wishes", e.target.value)}
                        placeholder="e.g. Keep it simple. Music at the memorial. Buried near her parents…"
                      />
                    </div>
                    <div>
                      <Label htmlFor="faith" hint="Optional — tradition or faith notes the funeral home should honor.">
                        Faith or tradition
                      </Label>
                      <Input
                        id="faith"
                        value={plan.faithNotes}
                        maxLength={120}
                        onChange={(e) => update("faithNotes", e.target.value)}
                        placeholder="e.g. Catholic funeral Mass · Jewish — burial within 24 hours"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-5">
                    <Button onClick={() => setStep(4)}>Continue →</Button>
                    <Button variant="ghost" onClick={() => setStep(2)}>
                      ← Back
                    </Button>
                  </div>
                </Card>
              )}

              {step === 4 && (
                <Card>
                  <CardTitle>Benefits your family may be owed</CardTitle>
                  <p className="text-ink-soft text-sm mt-1 mb-4">
                    Five quick questions. Every one of these is free to claim —
                    you never need to pay anyone to get them.
                  </p>
                  <div className="space-y-5">
                    <YesNoUnsureRow
                      id="vet"
                      question={`Did ${who} serve in the military?`}
                      value={plan.benefits.veteran}
                      onChange={(v) =>
                        update("benefits", { ...plan.benefits, veteran: v })
                      }
                    />
                    <YesNoUnsureRow
                      id="ssa"
                      question="Receiving Social Security?"
                      value={plan.benefits.onSocialSecurity}
                      onChange={(v) =>
                        update("benefits", { ...plan.benefits, onSocialSecurity: v })
                      }
                    />
                    <YesNoUnsureRow
                      id="ins"
                      question="Is there life insurance?"
                      value={plan.benefits.lifeInsurance}
                      onChange={(v) =>
                        update("benefits", { ...plan.benefits, lifeInsurance: v })
                      }
                    />
                    <YesNoUnsureRow
                      id="med"
                      question="On Medicaid?"
                      value={plan.benefits.onMedicaid}
                      onChange={(v) =>
                        update("benefits", { ...plan.benefits, onMedicaid: v })
                      }
                    />
                    <YesNoUnsureRow
                      id="emp"
                      question="Employed (now or recently), or a union member?"
                      value={plan.benefits.wasEmployed}
                      onChange={(v) =>
                        update("benefits", { ...plan.benefits, wasEmployed: v })
                      }
                    />
                  </div>
                  <div className="flex gap-3 mt-5">
                    <Button onClick={() => setStep(5)}>Continue →</Button>
                    <Button variant="ghost" onClick={() => setStep(3)}>
                      ← Back
                    </Button>
                  </div>
                </Card>
              )}

              {step === 5 && (
                <Card>
                  <CardTitle>Who makes the first call?</CardTitle>
                  <p className="text-ink-soft text-sm mt-1 mb-3">
                    One person, so the moment isn&rsquo;t a group decision. They
                    hold the plan; everyone else holds each other.
                  </p>
                  <div className="max-w-xs">
                    <Label htmlFor="pp">Point person</Label>
                    <Input
                      id="pp"
                      value={plan.pointPerson}
                      maxLength={60}
                      onChange={(e) => update("pointPerson", e.target.value)}
                      placeholder="e.g. Sarah (daughter)"
                    />
                  </div>
                  <div className="flex gap-3 mt-5">
                    <Button size="lg" onClick={() => setShowPlan(true)}>
                      See the family plan →
                    </Button>
                    <Button variant="ghost" onClick={() => setStep(4)}>
                      ← Back
                    </Button>
                  </div>
                </Card>
              )}
            </>
          )}

          {showPlan && (
            <div ref={planRef} tabIndex={-1} className="space-y-6 focus:outline-none">
              {/* Print letterhead — same convention as the analyzer. */}
              <div className="hidden print:block border-b border-border pb-3 mb-2">
                <div className="flex items-baseline justify-between">
                  <span className="font-serif text-xl text-ink">Honest Funeral</span>
                  <span className="text-xs text-ink-muted">The family plan</span>
                </div>
                <p className="text-xs text-ink-muted mt-1">
                  Free and neutral — no money from funeral homes or insurers.
                  honestfuneral.co/plan-now
                </p>
              </div>

              <div>
                <CardEyebrow>The family plan</CardEyebrow>
                <h1 className="font-serif text-3xl text-ink leading-tight">
                  {plan.personName.trim()
                    ? `The plan for ${plan.personName.trim()}`
                    : "Our family plan"}
                </h1>
              </div>

              <Card tone="primary">
                <CardTitle>When the time comes — the first call</CardTitle>
                <ol className="mt-3 space-y-3 text-ink list-decimal pl-5">
                  <li>
                    <strong>If they&rsquo;re on hospice care, call the hospice
                    first.</strong>{" "}
                    The hospice nurse comes to you, confirms the death, and
                    guides the moment. You do not need to call 911.
                  </li>
                  <li>
                    <strong>Call the funeral home you choose — not just the
                    nearest one.</strong>{" "}
                    Whoever picks up the body usually becomes your funeral
                    home. If you haven&rsquo;t chosen yet, that&rsquo;s okay:
                    say you&rsquo;re authorizing <em>transport only</em>.
                  </li>
                  <li>
                    <strong>Decide nothing else on that call.</strong> No
                    package, no casket, no date. There is no decision that
                    can&rsquo;t wait until tomorrow.
                  </li>
                  <li>
                    <strong>Ask them to email their General Price List.</strong>{" "}
                    Itemized prices are your right under the FTC Funeral Rule.
                  </li>
                  <li>
                    <strong>Before signing anything,</strong> check the quote
                    free at <span className="whitespace-nowrap">honestfuneral.co/analyzer</span>.
                  </li>
                </ol>
                <p className="mt-4 text-ink font-medium">
                  {plan.pointPerson.trim()
                    ? `${plan.pointPerson.trim()} makes this call.`
                    : "Name one person to make this call."}
                </p>
              </Card>

              <Card>
                <CardTitle>The path and what&rsquo;s fair to pay</CardTitle>
                <div className="mt-3 space-y-3">
                  {paths.map((p) => {
                    const r = plan.zip.length === 5 ? fairRange(p, plan.zip) : null;
                    return (
                      <div key={p} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <span className="text-ink font-medium">
                          {SERVICE_LABELS[p]}
                          {!plan.path && (
                            <span className="text-xs text-ink-muted ml-2">
                              (still deciding — a common path)
                            </span>
                          )}
                        </span>
                        <span className="text-ink whitespace-nowrap">
                          {r ? `${fmtUSD(r.low)}–${fmtUSD(r.high)} fair near ${plan.zip}` : "add a zip for the local range"}
                        </span>
                      </div>
                    );
                  })}
                  <p className="text-sm text-ink-soft">
                    A quote far above this range deserves a &ldquo;why?&rdquo;
                    &mdash; and prices are negotiable. Caskets and urns can be
                    bought from anyone; the funeral home must accept them
                    without a fee.
                  </p>
                </div>
              </Card>

              {(plan.wishes.trim() || plan.faithNotes.trim()) && (
                <Card>
                  <CardTitle>What matters to us</CardTitle>
                  {plan.wishes.trim() && (
                    <p className="text-ink mt-2 whitespace-pre-wrap">{plan.wishes.trim()}</p>
                  )}
                  {plan.faithNotes.trim() && (
                    <p className="text-ink-soft mt-2 text-sm">
                      Tradition: {plan.faithNotes.trim()}
                    </p>
                  )}
                </Card>
              )}

              {benefits.length > 0 && (
                <Card>
                  <CardTitle>Benefits this family is likely owed</CardTitle>
                  <ul className="mt-3 space-y-4">
                    {benefits.map((b) => (
                      <li key={b.title} className="border-l-2 border-border pl-4">
                        <div className="font-medium text-ink">{b.title}</div>
                        <p className="text-sm text-ink-soft mt-1 leading-relaxed">
                          {b.detail}
                        </p>
                        <p className="text-xs text-ink-muted mt-1">→ {b.action}</p>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              <div className="flex flex-wrap gap-3 print:hidden">
                <Button onClick={() => window.print()}>Print / Save as PDF</Button>
                <Button variant="secondary" onClick={() => setShowPlan(false)}>
                  Edit the plan
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (window.confirm("Start over? This erases the plan from this device.")) {
                      clearPlan();
                      setPlan(DEFAULT_PLAN);
                      setStep(1);
                      setShowPlan(false);
                    }
                  }}
                >
                  Start over
                </Button>
              </div>

              <p className="text-sm text-ink-soft print:hidden">
                Print a copy for the point person and one for the folder with
                the important documents. When you have a real quote in hand,
                the{" "}
                <Link href="/analyzer" className="text-primary-deep underline">
                  checker
                </Link>{" "}
                reads it line by line — free.
              </p>

              {/* Print footer — same convention as the analyzer. */}
              <div className="hidden print:block border-t border-border pt-3 mt-4 text-xs text-ink-muted leading-relaxed">
                <p>
                  Fair ranges are regional estimates from sourced national
                  benchmarks (methodology: honestfuneral.co/methodology). Free
                  to families — Honest Funeral takes no money from funeral
                  homes or insurers, and never steers you to any provider.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
