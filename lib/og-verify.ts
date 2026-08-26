/**
 * Signature check for /og URLs (audit A1-05). Edge-safe: the /og route
 * runs on the edge runtime, so this file uses Web Crypto only — no
 * node: imports, no server-only. Signing lives in `lib/og.ts`
 * (node:crypto, sync); the canonical message here MUST match it:
 * title.length + "\n" + title + "\n" + (eyebrow ?? "") — the length
 * prefix makes the field boundary unambiguous (no re-split of a
 * newline-bearing title into a different title/eyebrow pair).
 */

const HMAC_BYTES = 32; // SHA-256 digest length

function hexToBytes(hex: string): Uint8Array | null {
  if (hex.length !== HMAC_BYTES * 2 || /[^0-9a-f]/i.test(hex)) return null;
  const out = new Uint8Array(HMAC_BYTES);
  for (let i = 0; i < HMAC_BYTES; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export async function verifyOgSignature(
  params: URLSearchParams,
  secret: string,
): Promise<boolean> {
  const sigHex = params.get("sig");
  if (!sigHex) return false;
  // Length/charset mismatch is an immediate false — the digest length is
  // public, so this early exit leaks nothing.
  const given = hexToBytes(sigHex);
  if (!given) return false;

  const title = params.get("title") ?? "";
  const eyebrow = params.get("eyebrow") ?? undefined;
  const message = `${title.length}\n${title}\n${eyebrow ?? ""}`;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const expected = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, enc.encode(message)),
  );

  // Constant-time compare: XOR-accumulate over the full equal-length
  // buffers rather than an early-exit string compare.
  let diff = 0;
  for (let i = 0; i < HMAC_BYTES; i++) diff |= expected[i] ^ given[i];
  return diff === 0;
}
