# Hospice-directory payment-blindness — pointer for counsel

> Not legal advice. This is a code-cited exhibit, the supply-side sibling of
> [`ANTI_STEERING_EVIDENCE.md`](ANTI_STEERING_EVIDENCE.md) (which does the
> same job for funeral homes). Why it exists: hospice care IS federally
> payable, so if a hospice that pays us — or has merely claimed its page —
> ever received preferential ranking, badging, ordering, or placement in any
> surface a family could use to choose a hospice, the platform itself would
> have Anti-Kickback Statute exposure: accepting remuneration from a provider
> while "recommending" that provider ([`BUSINESS_PLAN.md`](BUSINESS_PLAN.md)
> §15, "the four ways to make it illegal," item 3 — the hospice-side mirror
> of anti-steering guardrail #3). Audited 2026-08-18 against every surface
> shipped through Day 6 (PR #171). Deliberately short — expand only if
> counsel asks for more on a specific point.

**The design in one sentence:** partner, payment, and claim status are
structurally incapable of reaching any hospice surface a family sees — the
table has no such column, the query layer selects only CMS fields and orders
alphabetically, the render layer does no database reads of its own, and
claiming a page changes nothing publicly.

1. **The schema cannot express preference.**
   [`supabase/migrations/2026-07-20-hospices-consent.sql:16-25`](../supabase/migrations/2026-07-20-hospices-consent.sql)
   — `public.hospices` has eight columns (`id, ccn, name, city, state, zip,
   ownership, created_at`), all mirrored verbatim from the CMS Provider Data
   Catalog (dataset yc9t-dgbk). No partner, claimed, paid, tier, rank, or
   featured column exists, so no query against the table can prefer a paying
   hospice even by accident. RLS is deny-all with zero policies (lines
   34-35); the only writer is the founder-run import script
   ([`scripts/import-hospices.mjs`](../scripts/import-hospices.mjs)).

2. **One read-only query layer, CMS columns only, alphabetical order.**
   Exactly two product-code modules read the table (inventory pinned by the
   gate, item 8). [`lib/hospice-directory.ts`](../lib/hospice-directory.ts) —
   `const SELECT = "ccn, name, city, state, zip, ownership"` (line 36); state
   lists order by `name` then `ccn` (lines 82-83 — the CCN tiebreak exists
   only for deterministic pagination); the facility lookup is an exact-CCN
   single-row read (lines 95-110).
   [`app/api/hospices/search/route.ts:53-73`](../app/api/hospices/search/route.ts)
   — same CMS columns, case-insensitive match on name or city, name-ordered,
   name-matches-listed-before-city-matches (a relevance rule applied
   identically to every hospice), capped at 10. Neither module contains an
   insert, update, or join to any other table.

3. **Uniform rendering, zero comparative modules.** The pages do no database
   reads of their own — all data arrives through the module in item 2. State
   pages group alphabetically by city and render every row through one
   identical list item
   ([`app/hospices/[state]/page.tsx:314-345`](../app/hospices/%5Bstate%5D/page.tsx)).
   Facility pages are "byte-identical for all ~6,852 records except the CMS
   values," and the header contract bans counts, sibling lists, "nearby
   hospices," and any comparative module
   ([`app/hospices/[state]/[ccn]/page.tsx:26-30`](../app/hospices/%5Bstate%5D/%5Bccn%5D/page.tsx)).
   Facility pages are noindexed and never enter the sitemap
   ([`app/sitemap.ts:130-141`](../app/sitemap.ts)), so search-engine weight
   cannot become a preference vector either.

4. **The homepage finder is partner-blind on purpose.**
   [`components/HospiceFinder.tsx:22-29`](../components/HospiceFinder.tsx) —
   "Deliberately NO partner-name matching against the CMS list … A referral
   is attribution only — nothing here gates on one." Selecting ANY hospice
   reveals the same two-path panel (already-offers-it / want-them-to-offer-it)
   with wording identical for every hospice in the country.

5. **Claiming a page changes nothing a family sees.** There is no "claimed"
   checkmark, badge, or public indicator of any kind — claim status is not
   even queryable from the directory (item 1: no such column exists). The
   claim flow
   ([`ClaimPanel.tsx`](../app/hospices/%5Bstate%5D/%5Bccn%5D/ClaimPanel.tsx) →
   [`app/api/partner/claim/route.ts:65-80`](../app/api/partner/claim/route.ts))
   writes one `partner_leads` row (source `hospice_claim`) and one internal
   founder notification; it never writes the `hospices` table, never creates
   a `partners` row, and never emails the hospice or any family. The UI says
   so in the form copy and again in the post-submit confirmation: "Nothing
   about this page has changed."

6. **Partner data flows one way — attribution in, never display out.** The
   only family-facing reads of partner tables are (a)
   [`app/api/partner/resolve/route.ts`](../app/api/partner/resolve/route.ts),
   where a referral code the family already received from their own
   institution resolves to a display name for the co-brand banner — the
   family is past hospice selection there, and nothing on that path lists or
   compares hospices; and (b) attribution stamps written onto the family's
   own case rows for aggregate partner reporting
   ([`app/api/negotiate/start/route.ts:115-133`](../app/api/negotiate/start/route.ts),
   [`app/api/analyze-price-list/route.ts:368-405`](../app/api/analyze-price-list/route.ts)).
   No file that renders hospices reads a partner table, and no file that
   reads partner tables renders hospices (repo-wide grep, pinned by the
   gate). The same one-way rule already governs the funeral-home side:
   `negotiations.partner_id` is "a reporting label ONLY — never read by
   /api/negotiate/choose, outreach, or home ranking"
   ([`supabase/migrations/2026-06-27-partners.sql:41`](../supabase/migrations/2026-06-27-partners.sql)).

7. **The pages pledge it in writing.** Index: "We list all of them because we
   rank none of them: no ratings, no endorsements, and no hospice pays to
   appear" ([`app/hospices/page.tsx:49-56`](../app/hospices/page.tsx)). State
   pages: "no hospice pays to appear here or to change how it appears," and,
   in the block addressed to hospice teams, "partnering changes nothing on
   this page — this directory lists every Medicare-certified hospice in the
   state the same way, partner or not"
   ([`app/hospices/[state]/page.tsx:184-200, 378-388`](../app/hospices/%5Bstate%5D/page.tsx)).
   Facility pages: "No hospice pays to appear or to change how it appears"
   ([`app/hospices/[state]/[ccn]/page.tsx:169-172`](../app/hospices/%5Bstate%5D/%5Bccn%5D/page.tsx)).

8. **The automated gate.**
   [`lib/__tests__/hospice-directory-firewall.test.ts`](../lib/__tests__/hospice-directory-firewall.test.ts)
   fails the suite if any of the above stops being true mechanically: a third
   file starts querying `hospices`; the query layer selects a non-CMS column,
   orders by anything but name/CCN, gains a write, or references a partner
   table; a directory page or the finder gains a direct database read, a
   Supabase client, or a partner-lib import; the "pays to appear" pledge
   leaves any of the three page templates; or a schema/migration statement
   attaches partner/claim/payment/rank vocabulary to the `hospices` table.
   Tripping it is a counsel-grade design change, not a test to loosen.

**Open flags for counsel (not violations):**

- **A future "claimed" indicator.** Today claiming is publicly invisible. If
  a "claimed by this hospice's team" informational checkmark is ever
  proposed, it is preference-adjacent — it would make claiming (and likely
  paying) hospices visually distinct inside a surface families use to look at
  hospices. Clear it with counsel before building anything, and if cleared,
  keep it strictly informational and ranking-inert.
- **Partner-funnel CTAs on directory pages.** Every state and facility page
  carries an identical "apply to offer it" block addressed to the hospice's
  team, never to families. It renders the same for every hospice and confers
  nothing, but counsel should bless a partner solicitation sitting on the
  same page families read.
