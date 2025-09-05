// lib/recipes/compactTitles.ts
import crypto from 'crypto'

/**
 * Compact recipe titles for use in system prompt.
 * - lowercases
 * - trims punctuation/extra spaces
 * - dedupes
 * - truncates to ~30 chars
 * - hashes long titles for uniqueness
 */
export function compactTitles(titles: string[], max = 50): string[] {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // strip punctuation
      .replace(/\s+/g, ' ') // collapse whitespace
      .trim()

  const seen = new Set<string>()
  const compacted: string[] = []

  for (const t of titles) {
    const n = norm(t)
    if (!n || seen.has(n)) continue
    seen.add(n)

    // truncate but keep uniqueness if needed
    if (n.length > 30) {
      const hash = crypto.createHash('md5').update(n).digest('hex').slice(0, 4)
      compacted.push(n.slice(0, 27) + '…' + hash)
    } else {
      compacted.push(n)
    }

    if (compacted.length >= max) break
  }

  return compacted
}
