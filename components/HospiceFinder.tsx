"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { FREE_FOR_EVERY_FAMILY } from "@/lib/copy";
import { displayHospiceName } from "@/lib/hospice-display";
import { Card, CardEyebrow } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { LinkButton } from "@/components/ui/Button";

interface Hospice {
  ccn: string;
  name: string;
  city: string | null;
  state: string | null;
}

type SearchStatus = "idle" | "results" | "none" | "unavailable";

/**
 * The homepage hospice-finder module (sprint Day 4, loop #1's front door).
 * Autocomplete over the CMS reference directory; selecting a hospice ALWAYS
 * shows BOTH paths — already-offered (ask the coordinator for the link, or
 * just start) and want-them-to-offer-it (→ /tell-your-hospice). Deliberately
 * NO partner-name matching against the CMS list: the two-path copy is honest
 * without it. A referral is attribution only — nothing here gates on one.
 */
export function HospiceFinder() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [hospices, setHospices] = useState<Hospice[]>([]);
  const [selected, setSelected] = useState<Hospice | null>(null);

  useEffect(() => {
    // The <2-char reset happens in the input's onChange, not here — the
    // effect only ever schedules the debounced fetch (no sync setState).
    const query = q.trim();
    if (query.length < 2) return;
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const r = await fetch(
          `/api/hospices/search?q=${encodeURIComponent(query.slice(0, 80))}`,
          { signal: controller.signal },
        );
        if (!r.ok) {
          // 429 or an unexpected status — the search is unavailable, the
          // product is not.
          setStatus("unavailable");
          setHospices([]);
          return;
        }
        const body = (await r.json()) as { hospices?: Hospice[] };
        const found = body.hospices ?? [];
        setHospices(found);
        setStatus(found.length > 0 ? "results" : "none");
      } catch {
        if (controller.signal.aborted) return;
        setStatus("unavailable");
        setHospices([]);
      }
    }, 250);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [q]);

  const displayName = selected ? displayHospiceName(selected.name) : null;
  const nominateHref = selected
    ? `/tell-your-hospice?hospice=${encodeURIComponent(selected.name)}${
        selected.city ? `&city=${encodeURIComponent(selected.city)}` : ""
      }${selected.state ? `&state=${encodeURIComponent(selected.state)}` : ""}`
    : "/tell-your-hospice";

  return (
    <div>
      <CardEyebrow>For hospice families</CardEyebrow>
      <h2 className="font-serif text-2xl sm:text-3xl text-ink mt-1 mb-3">
        Does your hospice offer {BRAND.name}?
      </h2>
      <p className="font-medium text-ink mb-2">{FREE_FOR_EVERY_FAMILY}</p>
      <p className="text-ink-soft mb-5">
        Hospices can offer this to every family they serve. Look yours up to
        see both ways forward.
      </p>

      {selected ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="font-medium text-ink">
              {displayName}
              {selected.city && (
                <span className="text-ink-muted font-normal">
                  {" "}
                  &middot; {displayHospiceName(selected.city)}
                  {selected.state ? `, ${selected.state}` : ""}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setQ("");
                setStatus("idle");
                setHospices([]);
              }}
              className="text-sm text-primary-deep underline-offset-2 hover:underline"
            >
              Search again
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <h3 className="font-serif text-lg text-ink mb-2">
                If {displayName} already offers this
              </h3>
              <p className="text-sm text-ink-soft mb-4">
                Ask their bereavement coordinator for the link. It never
                unlocks anything &mdash; it only lets {displayName} see
                anonymous totals of the help families got. Or start right now:
              </p>
              <LinkButton href="/analyzer" variant="secondary">
                Check a quote free &rarr;
              </LinkButton>
            </Card>
            <Card>
              <h3 className="font-serif text-lg text-ink mb-2">
                Want {displayName} to offer it?
              </h3>
              <p className="text-sm text-ink-soft mb-4">
                We&rsquo;ve written a short note you can send from your own
                email. It takes about a minute &mdash; and it&rsquo;s how the
                next family they serve hears about this.
              </p>
              <LinkButton href={nominateHref} variant="secondary">
                Tell your hospice &rarr;
              </LinkButton>
            </Card>
          </div>
        </div>
      ) : (
        <div>
          <Input
            value={q}
            onChange={(e) => {
              const value = e.target.value;
              setQ(value);
              if (value.trim().length < 2) {
                setStatus("idle");
                setHospices([]);
              }
            }}
            placeholder="Search by hospice name or city"
            aria-label="Search the national directory of Medicare-certified hospices by name or city"
            maxLength={80}
          />
          {status === "idle" && (
            <p className="text-xs text-ink-muted mt-2">
              We search the national directory of Medicare-certified hospices.
              Type a few letters to start.
            </p>
          )}
          {status === "results" && (
            <ul className="mt-3 rounded-xl border border-border bg-surface divide-y divide-border overflow-hidden">
              {hospices.map((h) => (
                <li key={h.ccn}>
                  <button
                    type="button"
                    onClick={() => setSelected(h)}
                    className="w-full text-left px-4 py-3 hover:bg-surface-soft"
                  >
                    <span className="text-ink">{displayHospiceName(h.name)}</span>
                    {h.city && (
                      <span className="text-sm text-ink-muted">
                        {" "}
                        &middot; {displayHospiceName(h.city)}
                        {h.state ? `, ${h.state}` : ""}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {status === "none" && (
            <p className="text-sm text-ink-soft mt-3">
              We couldn&rsquo;t find that name in the directory of
              Medicare-certified hospices. Try the city, or a shorter piece of
              the name. Either way, you don&rsquo;t need a hospice to use
              anything here &mdash;{" "}
              <Link
                href="/analyzer"
                className="font-medium text-primary-deep underline-offset-2 hover:underline"
              >
                check a quote free &rarr;
              </Link>
            </p>
          )}
          {status === "unavailable" && (
            <p className="text-sm text-ink-soft mt-3">
              Our directory search isn&rsquo;t responding right now. You
              don&rsquo;t need it &mdash; everything here is free:{" "}
              <Link
                href="/analyzer"
                className="font-medium text-primary-deep underline-offset-2 hover:underline"
              >
                check a quote free &rarr;
              </Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
