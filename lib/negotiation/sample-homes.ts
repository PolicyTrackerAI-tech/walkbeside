/**
 * V1 fallback funeral home directory — realistic-sounding placeholder names
 * used when a real provider lookup isn't available.
 *
 * In production, this is replaced by a Google Places / NPI / state board lookup
 * keyed by zip code. The schema and the `findHomes()` shape stay the same.
 */

export interface FuneralHome {
  name: string;
  email: string;
}

const TEMPLATES: FuneralHome[] = [
  { name: "Brookside Funeral Home", email: "office@brookside-funerals.example" },
  { name: "Riverview Memorial Chapel", email: "info@riverview-memorial.example" },
  { name: "Hawthorne & Sons Funeral Service", email: "arrangements@hawthorne-sons.example" },
  { name: "Lakeside Funeral & Cremation", email: "contact@lakeside-fc.example" },
  { name: "Whitman Family Funerals", email: "office@whitman-family.example" },
];

export function findHomes(zip: string, n = 4): FuneralHome[] {
  // Deterministic shuffle by zip for a stable demo experience.
  const seed = Number(zip.replace(/\D/g, "").slice(0, 5) || "0");
  const arr = [...TEMPLATES];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (seed * (i + 1)) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}
