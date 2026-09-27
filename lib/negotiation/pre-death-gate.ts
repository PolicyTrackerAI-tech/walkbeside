/**
 * The Virginia pre-death gate (CLAUDE.md channel-survival rules; the DMV
 * legal overview's product-change list, item 4).
 *
 * Virginia licenses "the business of preneed funeral planning" for any
 * person, not only funeral licensees (Va. Code §54.1-2805), and defines
 * preneed as "the making of arrangements prior to death" (§54.1-2800).
 * Until counsel clears it, the platform contacts no funeral home before a
 * death when the family or the recipient home is in Virginia. After a death
 * a price request is an ordinary at-need inquiry and goes ahead.
 *
 * "Before a death" is decided conservatively: the family gave no date of
 * passing, or said they are planning ahead. The date field is optional, so
 * an at-need family who skipped it is held too; the status page tells them
 * to start again with the date.
 *
 * Counsel clearing a state means removing it from
 * PRE_DEATH_OUTREACH_BLOCKED_STATES, nothing else.
 */

import { regionForZip } from "@/lib/zip-regions";

export const PRE_DEATH_OUTREACH_BLOCKED_STATES: readonly string[] = ["VA"];

/** The negotiations.status a case gets when the gate holds all outreach. */
export const PRE_DEATH_HOLD_STATUS = "pre_death_hold";

export function isPreDeath(input: {
  dateOfDeath?: string | null;
  timing?: string | null;
}): boolean {
  return !input.dateOfDeath || input.timing === "planning-ahead";
}

function isBlockedState(state: string | null): boolean {
  return state !== null && PRE_DEATH_OUTREACH_BLOCKED_STATES.includes(state);
}

function stateForZip(zip: string | null | undefined): string | null {
  return zip ? (regionForZip(zip)?.state ?? null) : null;
}

/** True when the family's own location holds all pre-death outreach. */
export function familyHeldPreDeath(familyZip: string, preDeath: boolean): boolean {
  return preDeath && isBlockedState(stateForZip(familyZip));
}

/**
 * True when a home may not receive pre-death outreach: its recorded state or
 * its zip's state is a blocked one. A home whose state can't be told either
 * way is held too.
 */
export function homeHeldPreDeath(home: {
  state?: string | null;
  zip?: string | null;
}): boolean {
  const recorded = home.state?.trim().toUpperCase() || null;
  const fromZip = stateForZip(home.zip);
  if (!recorded && !fromZip) return true;
  return isBlockedState(recorded) || isBlockedState(fromZip);
}
