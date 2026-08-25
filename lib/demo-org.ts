/**
 * The ONE marker separating seeded demo organizations from real partners in
 * prod tables (they share the same tables by design). Written verbatim on
 * partners.application_notes by scripts/seed-demo.mjs — that script keeps its
 * own copy of this literal (it runs under plain node and can't import TS);
 * lib/__tests__/demo-org.test.ts pins the two copies equal, so neither can
 * drift alone.
 *
 * Audit A5-04: any aggregate the founder (or a partner) reads must exclude
 * demo-marked orgs, or our own seeded tests pollute the headline numbers the
 * kill gates are judged on.
 */
export const DEMO_ORG_MARKER = "Seeded demo organization — all data fictional.";
