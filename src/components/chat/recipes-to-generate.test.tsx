import { pickSimilarMatch } from './pick-similar-match'

const result = (name: string, cosineSim: number) => ({
  id: `id-${name}`,
  name,
  slug: `slug-${name}`,
  cosineSim
})

describe('pickSimilarMatch', () => {
  it('returns the top result above the threshold', () => {
    const results = [result('Carbonara', 0.81), result('Alfredo', 0.62)]
    expect(pickSimilarMatch(results, new Set(), 0.5)).toEqual(results[0])
  })

  it('returns null when every result is below the threshold', () => {
    const results = [result('Carbonara', 0.42), result('Alfredo', 0.31)]
    expect(pickSimilarMatch(results, new Set(), 0.5)).toBeNull()
  })

  it('excludes this turn’s suggestions by id', () => {
    const results = [result('Carbonara', 0.95), result('Alfredo', 0.7)]
    const excludeIds = new Set(['id-Carbonara'])
    expect(pickSimilarMatch(results, excludeIds, 0.5)).toEqual(results[1])
  })

  it('returns null for undefined results', () => {
    expect(pickSimilarMatch(undefined, new Set(), 0.5)).toBeNull()
  })

  it('returns null when the only above-threshold result is excluded', () => {
    const results = [result('Carbonara', 0.9)]
    expect(pickSimilarMatch(results, new Set(['id-Carbonara']), 0.5)).toBeNull()
  })
})
