"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Field";
import { CERT_BUCKETS, calcCertificates, CERT_BASELINE } from "@/lib/content";

/** Screen 11 — Death certificate calculator. */
export default function CertificatesPage() {
  const [counts, setCounts] = useState<Record<string, number>>(
    Object.fromEntries(CERT_BUCKETS.map((b) => [b.key, 0])),
  );

  const result = useMemo(() => calcCertificates(counts), [counts]);

  return (
    <main className="flex-1 flex flex-col">
      <header className="border-b border-border bg-surface/70">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Brand />
          <Link href="/dashboard" className="text-sm text-ink-muted">
            Dashboard
          </Link>
        </div>
      </header>
      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-10 space-y-6">
          <div>
            <CardEyebrow>Death certificate calculator</CardEyebrow>
            <h1 className="font-serif text-3xl text-ink mb-3">
              How many certified copies do you actually need?
            </h1>
            <p className="text-ink-soft">
              Most families order three and pay rush fees on the rest later.
              Five minutes here saves a week. Tell us what they had — we&rsquo;ll
              do the math.
            </p>
          </div>

          <Card>
            <div className="grid sm:grid-cols-2 gap-5">
              {CERT_BUCKETS.map((b) => (
                <div key={b.key}>
                  <Label htmlFor={b.key} hint={b.description}>
                    {b.label}
                  </Label>
                  <Input
                    id={b.key}
                    type="number"
                    min={0}
                    max={50}
                    value={counts[b.key]}
                    onChange={(e) =>
                      setCounts((c) => ({
                        ...c,
                        [b.key]: Math.max(0, Number(e.target.value || 0)),
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card tone="primary">
            <CardEyebrow>Order this many certified copies</CardEyebrow>
            <div className="font-serif text-5xl text-primary-deep">
              {result.total}
            </div>
            <p className="text-ink-soft mt-3 text-sm">
              That&rsquo;s {CERT_BASELINE} for misc. uses (probate, employer,
              insurance carriers you may forget) plus one per institution
              you listed.
            </p>
          </Card>

          <Card>
            <CardTitle>Where each one will go</CardTitle>
            <ul className="divide-y divide-border">
              {result.breakdown.map((row) => {
                const bucket = CERT_BUCKETS.find((b) => b.key === row.key)!;
                if (row.count === 0) return null;
                return (
                  <li key={row.key} className="py-3 flex justify-between">
                    <div>
                      <div className="text-ink">{bucket.label}</div>
                      <div className="text-sm text-ink-muted">
                        {row.count} {row.count === 1 ? "institution" : "institutions"}
                      </div>
                    </div>
                    <div className="text-ink font-medium">
                      {row.certs} {row.certs === 1 ? "copy" : "copies"}
                    </div>
                  </li>
                );
              })}
              <li className="py-3 flex justify-between text-ink-soft">
                <div>Misc. (baseline)</div>
                <div>{CERT_BASELINE} copies</div>
              </li>
            </ul>
          </Card>

          <Card tone="soft">
            <CardTitle>How to order them</CardTitle>
            <ol className="space-y-2 list-decimal list-inside text-ink">
              <li>
                Funeral home will offer to order them for you — fine, but
                check their per-copy fee. Anything above $25 is a markup.
              </li>
              <li>
                You can also order direct from your state vital records
                office for the base fee (usually $10–$20 per copy).
              </li>
              <li>
                Always order <strong>certified</strong> copies. Informational
                copies are not accepted by banks or insurers.
              </li>
              <li>
                Keep one in your records — institutions will sometimes lose
                or refuse the copy you sent.
              </li>
            </ol>
          </Card>
        </div>
      </section>
    </main>
  );
}
