/**
 * State-by-state legal status of family-led home funerals.
 *
 * In a "home funeral" the family takes responsibility for the body
 * after death — washing, dressing, holding a vigil, then transporting
 * to cremation, burial, or donation. It is legal in most US states.
 *
 * The states listed below as REQUIRING a funeral director impose at
 * least one of: filing the death certificate, transporting the body,
 * or signing off on disposition. The other 40+ states allow families
 * to handle these steps directly.
 *
 * NOT legal advice. State rules change. The National Home Funeral
 * Alliance (homefuneralalliance.org) maintains the most current list
 * and is the canonical source families should reference.
 */

export type HomeFuneralLegalStatus =
  | "family-led-allowed"
  | "fd-involvement-required";

export interface HomeFuneralStateRule {
  abbr: string;
  name: string;
  status: HomeFuneralLegalStatus;
  /** What the state specifically requires when status is fd-involvement-required. */
  requirement?: string;
}

/**
 * Source: National Home Funeral Alliance, current as of 2024.
 * Sister should re-verify with NHFA before publishing to families.
 */
export const HOME_FUNERAL_RULES: HomeFuneralStateRule[] = [
  // States that require funeral director involvement at some step
  {
    abbr: "CT",
    name: "Connecticut",
    status: "fd-involvement-required",
    requirement:
      "A licensed funeral director must file the death certificate and supervise final disposition.",
  },
  {
    abbr: "IL",
    name: "Illinois",
    status: "fd-involvement-required",
    requirement:
      "A licensed funeral director must file the death certificate.",
  },
  {
    abbr: "IN",
    name: "Indiana",
    status: "fd-involvement-required",
    requirement:
      "A licensed funeral director must file the death certificate and obtain the burial-transit permit.",
  },
  {
    abbr: "IA",
    name: "Iowa",
    status: "fd-involvement-required",
    requirement:
      "A licensed funeral director must file the death certificate and obtain the disposition permit.",
  },
  {
    abbr: "LA",
    name: "Louisiana",
    status: "fd-involvement-required",
    requirement:
      "A licensed funeral director must handle the body after death and file paperwork.",
  },
  {
    abbr: "MI",
    name: "Michigan",
    status: "fd-involvement-required",
    requirement:
      "A licensed funeral director must file the death certificate.",
  },
  {
    abbr: "NE",
    name: "Nebraska",
    status: "fd-involvement-required",
    requirement:
      "A licensed funeral director must file the death certificate.",
  },
  {
    abbr: "NJ",
    name: "New Jersey",
    status: "fd-involvement-required",
    requirement:
      "A licensed funeral director must arrange final disposition (the family can still hold a vigil at home).",
  },
  {
    abbr: "NY",
    name: "New York",
    status: "fd-involvement-required",
    requirement:
      "A licensed funeral director must file the death certificate and arrange transport.",
  },

  // States that allow family-led handling end-to-end
  { abbr: "AL", name: "Alabama", status: "family-led-allowed" },
  { abbr: "AK", name: "Alaska", status: "family-led-allowed" },
  { abbr: "AZ", name: "Arizona", status: "family-led-allowed" },
  { abbr: "AR", name: "Arkansas", status: "family-led-allowed" },
  { abbr: "CA", name: "California", status: "family-led-allowed" },
  { abbr: "CO", name: "Colorado", status: "family-led-allowed" },
  { abbr: "DE", name: "Delaware", status: "family-led-allowed" },
  { abbr: "FL", name: "Florida", status: "family-led-allowed" },
  { abbr: "GA", name: "Georgia", status: "family-led-allowed" },
  { abbr: "HI", name: "Hawaii", status: "family-led-allowed" },
  { abbr: "ID", name: "Idaho", status: "family-led-allowed" },
  { abbr: "KS", name: "Kansas", status: "family-led-allowed" },
  { abbr: "KY", name: "Kentucky", status: "family-led-allowed" },
  { abbr: "ME", name: "Maine", status: "family-led-allowed" },
  { abbr: "MD", name: "Maryland", status: "family-led-allowed" },
  { abbr: "MA", name: "Massachusetts", status: "family-led-allowed" },
  { abbr: "MN", name: "Minnesota", status: "family-led-allowed" },
  { abbr: "MS", name: "Mississippi", status: "family-led-allowed" },
  { abbr: "MO", name: "Missouri", status: "family-led-allowed" },
  { abbr: "MT", name: "Montana", status: "family-led-allowed" },
  { abbr: "NV", name: "Nevada", status: "family-led-allowed" },
  { abbr: "NH", name: "New Hampshire", status: "family-led-allowed" },
  { abbr: "NM", name: "New Mexico", status: "family-led-allowed" },
  { abbr: "NC", name: "North Carolina", status: "family-led-allowed" },
  { abbr: "ND", name: "North Dakota", status: "family-led-allowed" },
  { abbr: "OH", name: "Ohio", status: "family-led-allowed" },
  { abbr: "OK", name: "Oklahoma", status: "family-led-allowed" },
  { abbr: "OR", name: "Oregon", status: "family-led-allowed" },
  { abbr: "PA", name: "Pennsylvania", status: "family-led-allowed" },
  { abbr: "RI", name: "Rhode Island", status: "family-led-allowed" },
  { abbr: "SC", name: "South Carolina", status: "family-led-allowed" },
  { abbr: "SD", name: "South Dakota", status: "family-led-allowed" },
  { abbr: "TN", name: "Tennessee", status: "family-led-allowed" },
  { abbr: "TX", name: "Texas", status: "family-led-allowed" },
  { abbr: "UT", name: "Utah", status: "family-led-allowed" },
  { abbr: "VT", name: "Vermont", status: "family-led-allowed" },
  { abbr: "VA", name: "Virginia", status: "family-led-allowed" },
  { abbr: "WA", name: "Washington", status: "family-led-allowed" },
  { abbr: "WV", name: "West Virginia", status: "family-led-allowed" },
  { abbr: "WI", name: "Wisconsin", status: "family-led-allowed" },
  { abbr: "WY", name: "Wyoming", status: "family-led-allowed" },
  { abbr: "DC", name: "District of Columbia", status: "family-led-allowed" },
];

export function getStateRule(abbr: string): HomeFuneralStateRule | undefined {
  return HOME_FUNERAL_RULES.find(
    (r) => r.abbr.toLowerCase() === abbr.toLowerCase(),
  );
}

export function getRequiringStates(): HomeFuneralStateRule[] {
  return HOME_FUNERAL_RULES.filter(
    (r) => r.status === "fd-involvement-required",
  );
}

export function getAllowingStates(): HomeFuneralStateRule[] {
  return HOME_FUNERAL_RULES.filter(
    (r) => r.status === "family-led-allowed",
  );
}
