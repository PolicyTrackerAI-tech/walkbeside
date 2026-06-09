# Importing funeral homes (the launch directory)

The outreach flow can only contact homes that exist in the `funeral_homes`
table **and** have been approved by a human. Until real homes are loaded and
vetted, the directory falls back to placeholder homes and nothing real is ever
contacted. Loading the launch state's homes is the #1 data gate.

There are two stages, and they are deliberately separate:

1. **Import** (this script) — load rows into the table. Every row lands
   `active=true`, `vetted=false`. Nothing imported can be contacted yet.
2. **Vet** (`/admin/vetting`) — a human reviews each home, fixes/adds emails,
   and approves the real ones. Only `vetted=true` homes are ever contacted.

## 1. Build the CSV

Use this exact header (column order doesn't matter; extra columns are ignored):

```
name,email,phone,address,city,state,zip,google_rating,google_review_count,notes
```

See `funeral-homes.example.csv` in this folder for a template.

Rules the importer enforces:

| Column                | Required | Notes |
|-----------------------|----------|-------|
| `name`                | yes      | non-empty, ≤255 chars |
| `zip`                 | yes      | exactly 5 digits |
| `state`               | yes      | 2-letter; must match the expected state (default `UT`) |
| `email`               | no       | validated + lowercased; blank/invalid → imported but not contactable |
| `phone`              | no       | normalised to 10 digits when possible |
| `google_rating`       | no       | 0.0–5.0; bad values cleared |
| `google_review_count` | no       | integer ≥0 |
| `address`,`city`,`notes` | no    | free text; `city` is title-cased |

Rows missing a name or a valid zip/state are **skipped as invalid** (and listed
in the report). Everything else imports.

## 2. Dry run first (no writes)

```bash
npm run import:homes -- ./utah-homes.csv --dry-run
```

(or, passing creds explicitly:)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<service-role-key> \
node scripts/import-funeral-homes.mjs ./utah-homes.csv --dry-run
```

The dry run prints exactly what *would* happen: counts of valid / invalid /
duplicate rows, every warning, and how many rows would be inserted vs updated.
Fix the CSV until the report looks right.

## 3. Apply

```bash
npm run import:homes -- ./utah-homes.csv
```

The import is **idempotent and dedup-safe**:

- Existing rows are matched by `email`, then by `name`+`zip`, and **updated in
  place** — re-running the same file creates no duplicates.
- Within-file duplicates are skipped.
- Vetting columns (`vetted`, `vetted_at`, `vetted_by`) are **never** touched, so
  re-importing an updated CSV won't silently un-approve a home you already vetted
  (it updates contact fields but leaves the approval intact).

## 4. Vet

Go to `/admin/vetting` (must be signed in as an `ADMIN_EMAILS` admin), approve
the real homes, and add any missing emails. A home becomes contactable only when
it is **approved (vetted) AND has an email** — and even then only when
`OUTREACH_LIVE=true`.

## Other states / the nationwide dataset

The importer defaults to expecting `UT`. To load another state, pass
`--state=CA` (etc.). To accept any valid 2-letter state in one file (e.g. the
eventual nationwide dataset), pass `--state=ALL`.

## Requirements

- `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (the service-role
  key bypasses RLS to write the directory). `npm run import:homes` reads them
  from `.env.local` automatically if present.
- Never commit a CSV containing real contact data, or `.env.local`.
