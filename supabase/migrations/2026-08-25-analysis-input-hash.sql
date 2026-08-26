-- Source-document hash on stored analyses (audit A4-04).
--
-- THE BUG, both directions: every Compare click and every re-Analyze click
-- inserts a near-duplicate price_list_analyses row, and under user-scoped
-- dedupe a re-analysis whose extraction wobbled the cents lands as a SECOND
-- observation — inflating benchmark n at promote time. Mirror bug: the same
-- user's two DIFFERENT documents that print the same price collapse to ONE
-- observation. Neither is defensible under guardrail #4.
--
-- THE FIX: stamp each row with a content hash of the normalized input text
-- (lib/analysis-hash.ts — trim, collapse whitespace, lowercase, sha256).
-- lib/benchmark-sources.ts then keeps only the newest row per user+hash and
-- scopes pipeline dedupe per document, so re-analyses collapse to one
-- observation and distinct documents count separately. Hashless legacy rows
-- keep their old dedupe behavior.
--
-- FOUNDER-APPLIED ONLY — run in the Supabase SQL editor. Idempotent.
-- ORDERING: apply BEFORE deploying the code that writes it — both insert
-- paths (the analyzer + /admin/ingest-gpl) send the column; until this is
-- applied the analyzer degrades to saved:false and founder ingest 500s.

alter table public.price_list_analyses
  add column if not exists input_hash text;

comment on column public.price_list_analyses.input_hash is
  'sha256 hex of the normalized input text (lib/analysis-hash.ts) — identifies the source document, so re-analyses collapse to one benchmark observation and distinct documents from one user count separately. NULL on legacy rows.';
