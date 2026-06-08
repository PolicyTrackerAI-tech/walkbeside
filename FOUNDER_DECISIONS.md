# Founder decisions & ideas — offline working doc

Fill these in. When wifi is back, hand it to Claude and we'll turn the
decisions into specs, memory updates, and the lawyer brief.

---

## ✅ ACTIONED 2026-05-21 (decisions you gave; what got done)

- **#3 Fee = flat $49** — VERIFIED already uniform across code + copy; the old
  "20% of savings / capped $500" model is fully gone. No change needed. Proof in
  `docs/CLAIMS_VALIDATION.md` §2.
- **#7 Remove funeral-director / sister positioning** — DONE across homepage,
  layout meta, footer, /about (full rewrite, also killed literal
  {{TODO_SARAH_STATE}} placeholders that would've shipped), /faq, /planning,
  /prep, and false "validated by [cofounder]" provenance in code. Voice is now
  founder-as-builder. Sister out of all plans; possible later hire.
- **#8 Lawyer doc** → `docs/LAWYER_BRIEF.md` (complete; business overview, money
  flow, 11 risk areas, prioritized questions, materials to bring).
- **#6 AI strategy** → `docs/AI_STRATEGY.md` (exhaustive, buildable).
- **#2 Validate all claims** → `docs/CLAIMS_VALIDATION.md` (faith/fee/outflow/
  rights audited; outreach transparency claim verified at source).
- **#4 Data plan** → `docs/DATA_PLAN.md` (raw Utah → national pipeline).
- **#5 No manual deals / live testing** — baked into the docs as a constraint
  (features must be self-serve + safe; outreach needs a pre-send guard).

The sections below remain for your own thinking where a human call is still open
(release discipline, launch-state gating, Sarah's eventual role, lawyer inputs).

---

## TIER 1 — Blocking right now

### 1. Release / integration discipline
The repo has 35+ branches from parallel AI sessions that overlap and will
collide on merge. Decide the single rule.

- What is the ONE source-of-truth branch everything rebases onto?
- Who merges to main (just me?) and what triggers it?
- How do I stop parallel sessions from editing the same files?

My decision:
>


### 2. "Allowed to go live" gate
Merging to main auto-deploys to the live site. Some work isn't safe to expose.

- What must be true before ANY branch merges to prod?
- Faith content: gated/unlinked until Sarah signs off? Or just don't merge it?
- Fee/outreach changes: held until the regulatory read?

My checklist:
>


---

## TIER 2 — Next 30 days

### 3. Fee model — LOCK IT
Brief says 20% of savings, capped $500. Code charges a flat $49. Pick one.

- Final model:
- Why (revenue math, simplicity, what families understand):
>


### 4. Utah — market or probe?
- Committing to Utah as the launch metro, or throwaway test?
- If committing: what does Sarah need to validate for Utah specifically?
>


### 5. Manual-deal learning loop
- Have I done one full deal end-to-end yet? (y/n)
- What am I measuring on each manual deal?
- What would make me confident families will actually pay?
>


---

## TIER 3 — Ideas to flesh out (think, don't decide)

### 6. AI feature priority + data moat
- Which ONE AI feature compounds my data advantage most?
- What data must every deal capture to build toward it?
>


### 7. Sarah's time (the real constraint)
- What can ONLY she do?
- What can I draft for her to just approve?
- Realistic weekly hours she has:
>


### 8. Lawyer brief inputs (highest ROI offline writing)
Write the specifics so one paid hour is efficient.

- Exactly how money moves (who pays whom, when, via what):
- Exactly what the outreach emails say / claim:
- What I want to automate (AI contacting homes, negotiating):
- My state(s) of operation:
- Specific questions I'm worried about:
>


---

## Parking lot (capture anything else here)
>
