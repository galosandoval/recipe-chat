export type SimilarMatch = {
  id: string
  name: string
  slug: string
  cosineSim: number
}

// Picks the best existing recipe to surface as a near-duplicate of a suggestion.
// Results are already ordered by descending cosineSim, so the first qualifying
// row wins. The current turn's own suggestions are excluded by id: they get
// persisted and embedded (see embedMessageRecipes), so a search by one
// suggestion's name can return itself or a sibling suggestion from the same turn.
export function pickSimilarMatch(
  results: SimilarMatch[] | undefined,
  excludeIds: Set<string>,
  threshold: number
): SimilarMatch | null {
  if (!results) return null
  const match = results.find(
    (r) => r.cosineSim >= threshold && !excludeIds.has(r.id)
  )
  return match ?? null
}
