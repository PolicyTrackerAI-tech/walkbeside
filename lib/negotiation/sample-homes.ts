/**
 * V1 fallback funeral home directory — realistic-sounding placeholder names
 * used when a real provider lookup isn't available.
 *
 * In production, this is replaced by a Google Places / NPI / state board lookup
 * keyed by zip code + radius. The schema and the `findHomes()` shape stay the same.
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
  { name: "St. Mark's Memorial Home", email: "office@stmarks-memorial.example" },
  { name: "Cedar Hill Funeral Home", email: "info@cedarhill-funeral.example" },
  { name: "Greenwood Cremation Society", email: "hello@greenwood-cremation.example" },
  { name: "Maple Grove Memorial", email: "arrangements@maplegrove-memorial.example" },
  { name: "Anderson Family Mortuary", email: "office@anderson-mortuary.example" },
  { name: "Eastview Funeral Chapel", email: "contact@eastview-chapel.example" },
  { name: "Pinecrest Funeral Service", email: "info@pinecrest-funerals.example" },
  { name: "Holloway Memorial Home", email: "office@holloway-memorial.example" },
  { name: "Sunset Hills Funeral & Cremation", email: "hello@sunsethills-fc.example" },
  { name: "Northgate Funeral Care", email: "arrangements@northgate-care.example" },
  { name: "Willow Branch Funerals", email: "office@willowbranch.example" },
  { name: "Heritage Funeral Home", email: "info@heritage-funeral.example" },
  { name: "Saint James Memorial Chapel", email: "contact@saintjames-chapel.example" },
  { name: "Crossroads Cremation & Burial", email: "office@crossroads-cb.example" },
  { name: "Bluebird Memorial Service", email: "hello@bluebird-memorial.example" },
];

/** Map a search radius (in miles) to how many homes to return. */
export function homesForRadius(radiusMiles: number): number {
  if (radiusMiles <= 5) return 3;
  if (radiusMiles <= 10) return 5;
  if (radiusMiles <= 25) return 9;
  if (radiusMiles <= 50) return 14;
  return TEMPLATES.length;
}

export function findHomes(zip: string, n = 4): FuneralHome[] {
  // Deterministic shuffle by zip for a stable demo experience.
  const seed = Number(zip.replace(/\D/g, "").slice(0, 5) || "0");
  const arr = [...TEMPLATES];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (seed * (i + 1)) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, Math.min(n, arr.length));
}
