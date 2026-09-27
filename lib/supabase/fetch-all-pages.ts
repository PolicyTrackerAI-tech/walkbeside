/**
 * Supabase (PostgREST) caps every response at 1,000 rows, whatever `.limit()`
 * asks for — a `.limit(5000)` silently returns 1,000. Any read that can pass
 * that size has to page with `.range()` until a short page arrives.
 */
export const SUPABASE_MAX_ROWS = 1000;

/**
 * Drain a paginated read: keep fetching fixed-size pages until a short page
 * arrives. Pure over the injected fetcher so the chunking is unit-testable.
 * Any page-level failure (fetcher returns null) fails the whole read — a
 * partial list rendered as complete would be a lie.
 *
 * The fetcher's query must have a deterministic order (end it with a unique
 * column such as `id`), or rows can repeat or vanish across page boundaries.
 */
export async function fetchAllPages<T>(
  fetchPage: (offset: number) => Promise<T[] | null>,
  pageSize: number = SUPABASE_MAX_ROWS,
): Promise<T[] | null> {
  const all: T[] = [];
  for (let offset = 0; ; offset += pageSize) {
    const page = await fetchPage(offset);
    if (page === null) return null;
    all.push(...page);
    if (page.length < pageSize) return all;
  }
}
