"use client";

import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Field";
import { StateCombobox } from "@/components/ui/StateCombobox";
import { HelpFooter } from "@/components/HelpFooter";
import {
  METROS,
  VENDORS,
  vendorsForMetro,
  type MonumentVendor,
} from "@/lib/cemetery-vendors";

export function HeadstoneVendors() {
  const [metro, setMetro] = useState<string>("");
  const [stateFilter, setStateFilter] = useState<string>("");

  const results = useMemo<MonumentVendor[]>(() => {
    if (metro) return vendorsForMetro(metro);
    if (stateFilter) {
      const sf = stateFilter.toUpperCase();
      return VENDORS.filter((v) => v.state === sf || v.state === "—");
    }
    return VENDORS;
  }, [metro, stateFilter]);

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader rightSlot={<BackLink defaultHref="/dashboard" />} />
      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-10 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              Monument company directory
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              Buy the headstone direct. Save 30&ndash;60%.
            </h1>
            <p className="text-lg text-ink-soft">
              Funeral homes typically mark up headstones 50&ndash;200%
              over what monument companies charge for the same stone.
              Below are vetted monument companies serving your area.
              Direct purchase, same product, much less money.
            </p>
          </div>

          <Card tone="primary">
            <CardEyebrow>How this works</CardEyebrow>
            <ol className="space-y-2 mt-3 text-ink-soft list-decimal list-inside">
              <li>
                <strong className="text-ink">
                  Confirm the cemetery&rsquo;s rules first.
                </strong>{" "}
                Some cemeteries have strict size, material, or
                installation requirements. The monument company you
                pick should know your cemetery.
              </li>
              <li>
                <strong className="text-ink">Get two quotes.</strong>{" "}
                One from the funeral home, one from a monument
                company. Compare totals.
              </li>
              <li>
                <strong className="text-ink">Decide based on the gap.</strong>{" "}
                If the funeral home is within 15% of direct, the
                convenience may be worth it. If they&rsquo;re 30%+
                over, go direct.
              </li>
              <li>
                <strong className="text-ink">
                  Tell the cemetery who&rsquo;s installing.
                </strong>{" "}
                Most cemeteries require approved installers; the
                monument company coordinates this.
              </li>
            </ol>
          </Card>

          <Card>
            <CardEyebrow>Filter by area</CardEyebrow>
            <div className="space-y-3 mt-3">
              <div>
                <Label htmlFor="metro">Metro area</Label>
                <select
                  id="metro"
                  value={metro}
                  onChange={(e) => {
                    setMetro(e.target.value);
                    setStateFilter("");
                  }}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-base"
                >
                  <option value="">All metros</option>
                  {METROS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="state">Or filter by state</Label>
                <StateCombobox
                  id="state"
                  value={stateFilter}
                  onChange={(abbr) => {
                    setStateFilter(abbr);
                    if (abbr) setMetro("");
                  }}
                />
              </div>
            </div>
          </Card>

          <Card>
            <CardEyebrow>
              {results.length} vendor{results.length === 1 ? "" : "s"}
            </CardEyebrow>
            <ul className="mt-4 space-y-3">
              {results.map((v) => (
                <li
                  key={v.id}
                  className="rounded-xl border border-border bg-surface p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-serif text-lg text-ink">
                        {v.name}
                      </div>
                      <div className="text-sm text-ink-muted">
                        {v.city}
                        {v.state !== "—" && `, ${v.state}`} ·{" "}
                        {v.metro}
                      </div>
                      <p className="text-sm text-ink-soft mt-2 leading-relaxed">
                        {v.notes}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm">
                    {v.website && (
                      <a
                        href={v.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary-deep underline-offset-2 hover:underline"
                      >
                        Visit website →
                      </a>
                    )}
                    {v.phone && (
                      <a
                        href={`tel:${v.phone}`}
                        className="font-medium text-primary-deep underline-offset-2 hover:underline"
                      >
                        {v.phone.replace(
                          /^\+1(\d{3})(\d{3})(\d{4})$/,
                          "($1) $2-$3",
                        )}
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            {results.length === 0 && (
              <p className="text-sm text-ink-soft italic mt-4">
                No vendors in our directory for that filter yet. Try
                searching &ldquo;monument company&rdquo; + your city
                online — most regions have several reputable options.
                Or use one of the nationwide online sellers above.
              </p>
            )}
          </Card>

          <Card tone="soft">
            <CardEyebrow>Don&rsquo;t see your area?</CardEyebrow>
            <p className="text-ink-soft text-sm">
              We&rsquo;re building this directory state by state, with
              every vendor verified by our team. If you don&rsquo;t
              see your metro, two ways to find a reputable monument
              company nearby:
            </p>
            <ul className="space-y-2 text-sm text-ink-soft list-disc pl-5 mt-3">
              <li>
                Search the{" "}
                <a
                  href="https://monumentbuilders.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-deep underline-offset-2 hover:underline"
                >
                  Monument Builders of North America
                </a>{" "}
                member directory.
              </li>
              <li>
                Ask the cemetery directly — they typically have a list
                of approved monument vendors who do regular work
                there.
              </li>
              <li>
                Or use a nationwide direct-to-consumer seller (listed
                above) that ships and coordinates with local installers.
              </li>
            </ul>
          </Card>

          <div className="text-xs text-ink-muted space-y-2">
            <p>
              <strong className="text-ink-soft">Not a marketplace.</strong>{" "}
              We take no commissions, referral fees, or kickbacks from
              any vendor listed above. We are not affiliated with any
              of them. Listings are based on public information,
              independently verified by our team, and reflect our
              best understanding at the time of publication. Pricing,
              service area, and availability change &mdash; confirm
              directly with the vendor before relying on anything
              here.
            </p>
            <p>
              <strong className="text-ink-soft">Run a monument company listed here?</strong>{" "}
              If anything is wrong, out of date, or you&rsquo;d
              prefer not to be included, email{" "}
              <a
                href="mailto:corrections@honestfuneral.co"
                className="text-primary-deep underline-offset-2 hover:underline"
              >
                corrections@honestfuneral.co
              </a>{" "}
              and we&rsquo;ll update or remove the listing within 48
              hours.
            </p>
          </div>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
