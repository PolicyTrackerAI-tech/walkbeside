/**
 * Referral codes (roadmap Phase 4) — pure helpers + the on-device referral
 * memory that bridges "family opened /plan-now?ref=HF-XXXXXX during the
 * hospice admission week" to "family started a negotiation two weeks later."
 *
 * The code is attribution for AGGREGATE reporting only. It never influences
 * which homes a family sees (anti-steering is structural), and the referring
 * institution never sees case-level anything.
 */

/** Unambiguous alphabet — no 0/O, 1/I/L, so codes survive handwriting. */
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export const CODE_PREFIX = "HF-";
const CODE_BODY_LENGTH = 6;

const CODE_RE = new RegExp(`^${CODE_PREFIX}[${ALPHABET}]{${CODE_BODY_LENGTH}}$`);

/**
 * Generate a code from an injected random source (crypto.getRandomValues in
 * routes, seeded in tests). `bytes` must be at least CODE_BODY_LENGTH long.
 */
export function codeFromBytes(bytes: Uint8Array): string {
  let body = "";
  for (let i = 0; i < CODE_BODY_LENGTH; i++) {
    body += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return CODE_PREFIX + body;
}

/**
 * Normalize free-form input ("hf-7kq2md ", "HF—7KQ2MD") to canonical form,
 * or null when it isn't a referral code at all. Cosmetic ?ref= partner names
 * ("canyon-home-hospice") return null and keep their existing banner-only
 * behavior — the two uses of ?ref coexist.
 */
export function normalizeReferralCode(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const cleaned = raw.trim().toUpperCase().replace(/[—–]/g, "-");
  return CODE_RE.test(cleaned) ? cleaned : null;
}

/* --- On-device referral memory (client only) ------------------------------ */

export const REFERRAL_STORAGE_KEY = "honestfuneral.referral.v1";
/** How long a remembered referral stays claimable — covers the hospice stay. */
export const REFERRAL_TTL_MS = 30 * 24 * 60 * 60_000;

interface StoredReferral {
  code: string;
  at: number;
}

/** Remember a referral code seen in a ?ref= param. No-op for non-codes. */
export function rememberReferral(raw: string | undefined): void {
  if (typeof window === "undefined") return;
  const code = normalizeReferralCode(raw);
  if (!code) return;
  try {
    localStorage.setItem(
      REFERRAL_STORAGE_KEY,
      JSON.stringify({ code, at: Date.now() } satisfies StoredReferral),
    );
  } catch {
    // best-effort
  }
}

/** The remembered code, if any and not expired. */
export function readReferral(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(REFERRAL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredReferral>;
    const code = normalizeReferralCode(parsed.code);
    if (!code || typeof parsed.at !== "number") return null;
    if (Date.now() - parsed.at > REFERRAL_TTL_MS) return null;
    return code;
  } catch {
    return null;
  }
}
