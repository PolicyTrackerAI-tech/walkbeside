import crypto from "node:crypto";

/**
 * Secret key for HMAC'ing email unsubscribe / funeral-home opt-out tokens.
 *
 * Prefer a dedicated `UNSUBSCRIBE_SECRET`. If it is unset, DO NOT fall back to
 * a hardcoded literal — that made the tokens forgeable by anyone who read the
 * source. Instead derive a stable, high-entropy secret from the service-role
 * key (always present in production) via a domain-separated HMAC, so tokens
 * are unforgeable on the live site even before the dedicated var is set. The
 * plain literal remains only as a last resort for local dev where neither
 * server secret exists.
 *
 * Generation and verification both call this, so tokens always validate as
 * long as the environment is stable between the two.
 */
export function unsubscribeSecret(): string {
  const explicit = process.env.UNSUBSCRIBE_SECRET;
  if (explicit && explicit.trim()) return explicit;

  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceRole && serviceRole.trim()) {
    return crypto
      .createHmac("sha256", serviceRole)
      .update("unsubscribe-token-v1")
      .digest("hex");
  }

  return "fallback-please-set-dev-only";
}
