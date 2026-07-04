# Spanish translation — human review queue

**Status: DRAFTS ONLY — nothing here ships until a human bilingual reviewer
signs off.** The roadmap item (Phase 3, [L]) requires human-reviewed
translation, not machine-only; that gate is hard. This doc is the working
queue for getting from drafts to live.

## What exists

Draft translations in `docs/i18n-es/` — one file per surface, in
`EN:` / `ES:` pairs so the reviewer always sees the source line beside the
draft. Produced 2026-07-03 by a translate → fidelity-check pipeline; the
fidelity pass specifically hunted for weakened hedges, shifted legal
meanings, and missing crisis paths (its findings are noted per file).

Surfaces, matching the roadmap scope:

| Draft | Source of truth |
|---|---|
| `where.md` | `app/where/page.tsx` |
| `guidance-scenarios.md` | `lib/scenarios.ts` (all four scenarios) |
| `decide.md` | `app/decide/*` |
| `worksheet.md` | `app/worksheet/*` |
| `grief.md` | `app/grief/*` + `lib/grief-selfcheck.ts` |
| `after-hospice.md` | `app/after-hospice/page.tsx` |

## The review standard (what "human-reviewed" means here)

1. **Reviewer:** a professional translator or fluent bilingual reviewer with
   healthcare or legal-adjacent experience — not "someone who took Spanish."
   Post-editing these drafts is a standard, quotable service (expect it to be
   billed per word; the drafts cut that cost substantially).
2. **Non-negotiables the reviewer must verify line-by-line** (the same rules
   the drafters worked to):
   - Every hedge and disclaimer carried verbatim in meaning — "usually,"
     "in most states," "not legal advice," "not a diagnosis."
   - Legal/benefit meanings unshifted (a right stays a right; "may" stays
     "may"; no number or timeframe changed).
   - Crisis paths intact: 988, the hospice bereavement line.
   - Usted register throughout; neutral Latin American Spanish.
   - US-specific terms kept in English with the Spanish gloss on first use
     (General Price List, DD-214, Medicaid, FTC Funeral Rule, DNR).
   - Faith content keeps its pending-clergy-review framing exactly.
3. **Sign-off:** the reviewer initials each file; the founder records the
   sign-off here before any engineering work begins.

## After sign-off (engineering, in order)

1. i18n routing decision (`/es/...` subpaths vs a locale switcher) — decide
   once, before wiring anything.
2. Wire the six surfaces; `hreflang` tags; the `/accessibility` page's
   language-limitation paragraph updates to announce Spanish.
3. The readability gate gains Spanish sources (Fernández-Huerta index is the
   Spanish analog of Flesch-Kincaid).

## Founder actions

- [ ] Engage the bilingual reviewer (drafts in `docs/i18n-es/` are their
      starting point).
- [ ] Record sign-offs above.
- [ ] Green-light the engineering wiring.
