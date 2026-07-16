# Analyzer eval — claude-sonnet-4-6

- Run: 2026-07-16T21:48:39.449Z
- Base URL: http://localhost:3000
- Fixtures: 14 (test/evals/gpl/)

## Aggregates

| Metric | Value |
|---|---|
| Item recall (name match) | 100.0% |
| Item recall (strict: every field) | 100.0% |
| Item precision (no fabricated items) | 100.0% |
| Cents accuracy (matched items) | 100.0% |
| Benchmark-id accuracy (matched items) | 100.0% |
| Per-unit qty detection | 100.0% |
| Selection-range detection | 100.0% |
| Stated-total reconciliation | 100.0% |
| End-to-end totalQuoted accuracy | 92.9% |
| Rules: must-flag hit rate | 100.0% |
| Rules: must-not-flag clean rate | 100.0% |

## Per fixture

| Fixture | Method | Recall (strict/name/expected) | Precision | Qty | Range | Total | Rules |
|---|---|---|---|---|---|---|---|
| bundled-package | claude | 5/5/5 | 5/5 | 1/1 | 1/1 | ✓ | 3/3 flag, 7/7 clean |
| casket-direct-cremation | claude | 8/8/8 | 8/8 | 2/2 | — | ✓ | 3/3 flag, 7/7 clean |
| clean-itemized | claude | 12/12/12 | 12/12 | — | — | ✓ | 0/0 flag, 5/5 clean |
| demo-canyon-rim | claude | 18/18/18 | 18/18 | — | — | ✓ | 6/6 flag, 8/8 clean |
| embalming-compliant | claude | 8/8/8 | 8/8 | 1/1 | — | ✓ | 0/0 flag, 9/9 clean |
| embalming-disclosure-violation | claude | 7/7/7 | 7/7 | — | — | ✓ | 1/1 flag, 8/8 clean |
| floors-and-markers | claude | 5/5/5 | 5/5 | — | — | ✓ | 2/2 flag, 4/4 clean |
| header-folding | claude | 7/7/7 | 7/7 | — | — | ✓ | 0/0 flag, 4/4 clean |
| ocr-noise | claude | 8/8/8 | 8/8 | — | — | ✓ | 2/2 flag, 3/3 clean |
| per-unit-qty | claude | 7/7/7 | 7/7 | 3/3 | — | ✗ | 0/0 flag, 6/6 clean |
| selection-ranges | claude | 7/7/7 | 7/7 | — | 3/3 | ✓ | 1/1 flag, 7/7 clean |
| stated-total-consistent | claude | 10/10/10 | 10/10 | 1/1 | — | ✓ | 2/2 flag, 9/9 clean |
| stated-total-contradiction | claude | 9/9/9 | 9/9 | — | — | ✓ | 2/2 flag, 9/9 clean |
| two-column-ocr | claude | 7/7/7 | 7/7 | — | — | ✓ | 3/3 flag, 3/3 clean |

## Misses (the honest map of what the checker gets wrong)

### per-unit-qty
- totalQuoted 396500≠358500

---
Reproduce: start the dev server (`npm run dev`), then `npm run eval:analyzer` -- --model=claude-sonnet-4-6. Costs real API cents; runs appear in /admin/ai-costs under the `eval` feature. Not part of vitest/CI.
