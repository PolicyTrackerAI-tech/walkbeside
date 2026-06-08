"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  FAITH_TRADITIONS,
  FAITH_SUB_PROFILES,
  type FaithTradition,
} from "@/lib/faith-traditions";
import {
  LINE_ITEMS,
  SERVICE_LABELS,
  fmtRange,
  type ServiceType,
} from "@/lib/pricing-data";

// ---------------------------------------------------------------------------
// Static lookups
// ---------------------------------------------------------------------------

const DISPOSITION_LABELS: Record<string, string> = {
  "burial-required": "Burial required",
  "burial-preferred": "Burial preferred (cremation may be allowed)",
  "cremation-required": "Cremation required",
  "cremation-preferred": "Cremation preferred",
  either: "No requirement — either accepted",
};

const EMBALMING_LABELS: Record<string, string> = {
  common: "Common in this tradition",
  uncommon: "Not customary, but allowed",
  discouraged: "Generally discouraged",
  forbidden: "Not part of the tradition — decline",
};

const LINE_ITEM_BY_ID = new Map(LINE_ITEMS.map((i) => [i.id, i]));

/** Top-level traditions, each with its sub-profiles nested directly after. */
const ORDERED: { profile: FaithTradition; subs: FaithTradition[] }[] =
  FAITH_TRADITIONS.map((profile) => ({
    profile,
    subs: FAITH_SUB_PROFILES.filter((s) => s.parentId === profile.key),
  }));

const ALL_KEYS: string[] = ORDERED.flatMap(({ profile, subs }) => [
  String(profile.key),
  ...subs.map((s) => String(s.key)),
]);

const ALL_PROFILES: FaithTradition[] = ORDERED.flatMap(({ profile, subs }) => [
  profile,
  ...subs,
]);

// ---------------------------------------------------------------------------
// Review state (localStorage)
// ---------------------------------------------------------------------------

type ReviewStatus = "unreviewed" | "ok" | "needs-change";
interface ReviewEntry {
  status: ReviewStatus;
  notes: string;
}
type ReviewState = Record<string, ReviewEntry>;

const STORAGE_KEY = "hf-faithqa-v1";

function emptyEntry(): ReviewEntry {
  return { status: "unreviewed", notes: "" };
}

// localStorage-backed store, read via useSyncExternalStore so there's no
// setState-in-effect hydration step. Snapshot is cached against the raw string
// for referential stability (re-parsing only when the stored value changes).
const EMPTY_STATE: ReviewState = {};
const STORE_EVENT = "faithqa:update";

function subscribeStore(cb: () => void): () => void {
  window.addEventListener("storage", cb);
  window.addEventListener(STORE_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(STORE_EVENT, cb);
  };
}

let snapRaw: string | null = null;
let snapValue: ReviewState = EMPTY_STATE;
function getStoreSnapshot(): ReviewState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw !== snapRaw) {
      snapRaw = raw;
      snapValue = raw ? (JSON.parse(raw) as ReviewState) : EMPTY_STATE;
    }
  } catch {
    snapValue = EMPTY_STATE;
  }
  return snapValue;
}

function getServerSnapshot(): ReviewState {
  return EMPTY_STATE;
}

function writeStore(next: ReviewState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(STORE_EVENT));
  } catch {
    // ignore — private browsing, quota, etc.
  }
}

const STATUS_META: Record<
  ReviewStatus,
  { label: string; btn: string; chip: string }
> = {
  unreviewed: {
    label: "Not reviewed",
    btn: "border-border text-ink-muted",
    chip: "bg-surface-soft text-ink-muted",
  },
  ok: {
    label: "Looks right",
    btn: "border-emerald-300 text-emerald-800 bg-emerald-50",
    chip: "bg-emerald-100 text-emerald-900",
  },
  "needs-change": {
    label: "Needs change",
    btn: "border-rose-300 text-rose-800 bg-rose-50",
    chip: "bg-rose-100 text-rose-900",
  },
};

export function FaithQAReview({
  allowlistConfigured,
}: {
  allowlistConfigured: boolean;
}) {
  const state = useSyncExternalStore(
    subscribeStore,
    getStoreSnapshot,
    getServerSnapshot,
  );
  const [copied, setCopied] = useState(false);

  function entry(key: string): ReviewEntry {
    return state[key] ?? emptyEntry();
  }

  function setStatus(key: string, status: ReviewStatus) {
    writeStore({ ...state, [key]: { ...entry(key), status } });
  }

  function setNotes(key: string, notes: string) {
    writeStore({ ...state, [key]: { ...entry(key), notes } });
  }

  const counts = useMemo(() => {
    let ok = 0;
    let needs = 0;
    let unreviewed = 0;
    for (const key of ALL_KEYS) {
      const s = state[key]?.status ?? "unreviewed";
      if (s === "ok") ok++;
      else if (s === "needs-change") needs++;
      else unreviewed++;
    }
    return { ok, needs, unreviewed, total: ALL_KEYS.length };
  }, [state]);

  // Plaintext corrections report — everything flagged needs-change, plus any
  // profile that has notes regardless of status.
  const report = useMemo(() => {
    const lines: string[] = [
      "Honest Funeral — faith content corrections",
      `Generated ${new Date().toLocaleString()}`,
      `Reviewed ${counts.ok + counts.needs}/${counts.total} · ${counts.needs} need changes`,
      "",
    ];
    let any = false;
    for (const p of ALL_PROFILES) {
      const key = String(p.key);
      const e = state[key];
      if (!e) continue;
      const hasNotes = e.notes.trim().length > 0;
      if (e.status === "needs-change" || hasNotes) {
        any = true;
        lines.push(`## ${p.label} [${key}]`);
        lines.push(`Status: ${STATUS_META[e.status].label}`);
        if (hasNotes) lines.push(`Notes: ${e.notes.trim()}`);
        lines.push("");
      }
    }
    if (!any) lines.push("(Nothing flagged yet.)");
    return lines.join("\n");
  }, [state, counts]);

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="flex-1 flex flex-col">
      <div className="max-w-3xl mx-auto w-full px-5 py-10 print-page">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-wider text-ink-muted mb-2">
            Internal — content QA
          </p>
          <h1 className="font-serif text-3xl text-ink mb-3">
            Faith content QA
          </h1>
          <p className="text-ink-soft">
            Every faith claim on the site, in one place, for a single review
            pass. Read each profile, confirm the disposition / timeline /
            embalming norms and the decline scripts match real practice, and
            flag anything that needs changing. Sources are linked — open them to
            verify. Your status and notes save automatically in this browser.
          </p>
        </div>

        {!allowlistConfigured && (
          <div className="no-print mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <strong>This page is open to any logged-in user.</strong> Set the{" "}
            <code className="font-mono">ADMIN_EMAILS</code> env var (comma-
            separated) before exposing it beyond the founding team.
          </div>
        )}

        {/* Progress + export */}
        <div className="no-print mb-8 rounded-2xl border border-border bg-surface p-5">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="text-sm text-ink">
              <strong>
                {counts.ok + counts.needs}/{counts.total}
              </strong>{" "}
              reviewed
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_META.ok.chip}`}>
              {counts.ok} look right
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${STATUS_META["needs-change"].chip}`}
            >
              {counts.needs} need changes
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${STATUS_META.unreviewed.chip}`}
            >
              {counts.unreviewed} to go
            </span>
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="text-sm rounded-xl border border-border px-3 py-1.5 text-ink hover:bg-surface-soft"
              >
                Print
              </button>
              <button
                type="button"
                onClick={copyReport}
                className="text-sm rounded-xl border border-border px-3 py-1.5 text-ink hover:bg-surface-soft"
              >
                {copied ? "Copied!" : "Copy corrections"}
              </button>
            </div>
          </div>
          <details>
            <summary className="text-sm text-ink-muted cursor-pointer">
              Corrections report (send this to Ryan)
            </summary>
            <textarea
              readOnly
              value={report}
              rows={8}
              className="mt-3 w-full rounded-xl border border-border bg-surface-soft px-3 py-2 text-xs font-mono text-ink"
            />
          </details>
        </div>

        {/* Profiles */}
        <div className="space-y-10">
          {ORDERED.map(({ profile, subs }) => (
            <section key={String(profile.key)} className="space-y-5">
              <ProfileCard
                profile={profile}
                entry={entry(String(profile.key))}
                onStatus={(s) => setStatus(String(profile.key), s)}
                onNotes={(n) => setNotes(String(profile.key), n)}
              />
              {subs.map((sub) => (
                <div key={String(sub.key)} className="ml-4 sm:ml-8">
                  <ProfileCard
                    profile={sub}
                    isSub
                    entry={entry(String(sub.key))}
                    onStatus={(s) => setStatus(String(sub.key), s)}
                    onNotes={(n) => setNotes(String(sub.key), n)}
                  />
                </div>
              ))}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Profile card
// ---------------------------------------------------------------------------

function ProfileCard({
  profile,
  entry,
  onStatus,
  onNotes,
  isSub = false,
}: {
  profile: FaithTradition;
  entry: ReviewEntry;
  onStatus: (s: ReviewStatus) => void;
  onNotes: (n: string) => void;
  isSub?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      {/* Heading */}
      <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
        <h2
          className={`font-serif text-ink ${isSub ? "text-xl" : "text-2xl"}`}
        >
          {profile.label}
        </h2>
        <code className="text-xs font-mono text-ink-muted">
          {String(profile.key)}
          {profile.parentId ? ` · parent: ${profile.parentId}` : ""}
        </code>
      </div>

      {/* Status chip for print */}
      <div className="hidden print:block text-sm mb-3">
        Status: {STATUS_META[entry.status].label}
        {entry.notes.trim() ? ` — Corrections: ${entry.notes.trim()}` : ""}
      </div>

      {/* Core norms */}
      <div className="grid sm:grid-cols-3 gap-3 my-4 text-sm">
        <Field label="Disposition">
          {DISPOSITION_LABELS[profile.dispositionNorm] ?? profile.dispositionNorm}
        </Field>
        <Field label="Timeline">{profile.timelineNorm}</Field>
        <Field label="Embalming">
          {EMBALMING_LABELS[profile.embalmingNorm] ?? profile.embalmingNorm}
        </Field>
      </div>

      <div className="text-sm space-y-4">
        <Field label="Default service type">
          {SERVICE_LABELS[profile.defaultServiceType]}
        </Field>

        {profile.dispositionAllowed && (
          <Field label="Permitted service types">
            <ul className="list-disc pl-5">
              {profile.dispositionAllowed.map((s: ServiceType) => (
                <li key={s}>{SERVICE_LABELS[s]}</li>
              ))}
            </ul>
          </Field>
        )}

        <Field label="Notes (shown to families)">
          <p className="leading-relaxed">{profile.notes}</p>
        </Field>

        {profile.whatYouCanDecline && profile.whatYouCanDecline.length > 0 && (
          <Field label="What you can decline">
            <ul className="list-disc pl-5">
              {profile.whatYouCanDecline.map((id) => {
                const li = LINE_ITEM_BY_ID.get(id);
                return (
                  <li key={id}>
                    {li ? (
                      <>
                        {li.name}{" "}
                        <span className="text-ink-muted">
                          (fair {fmtRange(li.fairLow, li.fairHigh)})
                        </span>
                      </>
                    ) : (
                      <span className="text-rose-700">
                        {id} — unknown id, not in pricing-data
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </Field>
        )}

        {profile.whatToAskTheFH && profile.whatToAskTheFH.length > 0 && (
          <Field label="What to ask the funeral home">
            <ul className="list-disc pl-5 space-y-1">
              {profile.whatToAskTheFH.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </Field>
        )}

        {profile.commonPitfalls && profile.commonPitfalls.length > 0 && (
          <Field label="Common pitfalls">
            <ul className="list-disc pl-5 space-y-1">
              {profile.commonPitfalls.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </Field>
        )}

        {profile.cheatsheet && (
          <div className="rounded-xl border border-border bg-surface-soft p-4 space-y-3">
            <div className="text-xs uppercase tracking-wider text-ink-muted">
              Cheat sheet content
            </div>
            {profile.cheatsheet.openingQuestion && (
              <Field label="Opening question">
                {profile.cheatsheet.openingQuestion}
              </Field>
            )}
            {profile.cheatsheet.extraQuestions.length > 0 && (
              <Field label="Extra questions">
                <ul className="list-disc pl-5 space-y-1">
                  {profile.cheatsheet.extraQuestions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </Field>
            )}
            {profile.cheatsheet.extraDeclines.length > 0 && (
              <Field label="Decline scripts">
                <ul className="space-y-2">
                  {profile.cheatsheet.extraDeclines.map((d, i) => (
                    <li key={i}>
                      <span className="font-medium text-ink">{d.upsell}:</span>{" "}
                      <span className="text-ink-soft">&ldquo;{d.script}&rdquo;</span>
                    </li>
                  ))}
                </ul>
              </Field>
            )}
            <Field label="Community notes">
              <p className="leading-relaxed">
                {profile.cheatsheet.communityNotes}
              </p>
            </Field>
          </div>
        )}

        <Field label="Sources">
          {profile.sources && profile.sources.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1">
              {profile.sources.map((url) => (
                <li key={url}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline break-all"
                  >
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-rose-700">
              No sources cited — needs a citation before this ships.
            </span>
          )}
        </Field>
      </div>

      {/* Review controls */}
      <div className="no-print mt-5 pt-5 border-t border-border">
        <div className="flex flex-wrap gap-2 mb-3">
          {(["ok", "needs-change", "unreviewed"] as ReviewStatus[]).map((s) => {
            const active = entry.status === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => onStatus(s)}
                className={`text-sm rounded-xl border px-3 py-1.5 transition-colors ${
                  active
                    ? STATUS_META[s].btn
                    : "border-border text-ink-muted hover:bg-surface-soft"
                }`}
              >
                {STATUS_META[s].label}
              </button>
            );
          })}
        </div>
        <textarea
          value={entry.notes}
          onChange={(e) => onNotes(e.target.value)}
          rows={2}
          placeholder="Corrections, missing nuance, wrong claim, better source…"
          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-ink-muted text-xs uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="text-ink">{children}</div>
    </div>
  );
}
