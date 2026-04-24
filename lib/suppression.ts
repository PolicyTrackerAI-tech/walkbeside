import { cookies } from "next/headers";

/**
 * Commercial suppression — if a user has entered the unexpected-home crisis flow,
 * we set this cookie to hide all pricing/negotiation paths for 4 hours.
 */
const COOKIE_NAME = "commercial_suppression_until";
const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

export async function setCommercialSuppression(): Promise<void> {
  const store = await cookies();
  const until = Date.now() + FOUR_HOURS_MS;
  store.set(COOKIE_NAME, String(until), {
    path: "/",
    maxAge: FOUR_HOURS_MS / 1000,
    sameSite: "lax",
  });
}

export async function isCommercialSuppressed(): Promise<boolean> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return false;
  const until = Number(raw);
  if (!Number.isFinite(until)) return false;
  return until > Date.now();
}

export async function clearCommercialSuppression(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
