export type SimilarMatch = {
  id: string
  name: string
  slug: string
  cosineSim: number
}

// Picks the best existing recipe to surface as a near-duplicate of a suggestion.
// Results are already ordered by descending cosineSim, so the first row that
// clears the threshold wins. Search is saved-only, so the current turn's own
// (unsaved) suggestions can never appear here — no self-match exclusion needed.
export function pickSimilarMatch(
  results: SimilarMatch[] | undefined,
  threshold: number
): SimilarMatch | null {
  if (!results) return null
  const match = results.find((r) => r.cosineSim >= threshold)
  return match ?? null
}
