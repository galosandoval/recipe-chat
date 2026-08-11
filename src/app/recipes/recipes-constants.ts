/**
 * Page size for `recipes.infiniteRecipes`. Shared by the RSC that fetches the
 * first page and the client query that reads it — the value is part of the
 * query key, so a mismatch silently misses the seeded cache entry (#590).
 *
 * On a desktop the user sees 12 at most.
 */
export const RECIPES_PER_PAGE_LIMIT = 12
