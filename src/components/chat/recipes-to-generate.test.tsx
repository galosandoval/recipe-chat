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
    expect(pickSimilarMatch(results, 0.5)).toEqual(results[0])
  })

  it('returns null when every result is below the threshold', () => {
    const results = [result('Carbonara', 0.42), result('Alfredo', 0.31)]
    expect(pickSimilarMatch(results, 0.5)).toBeNull()
  })

  it('returns the first result that clears the threshold', () => {
    const results = [result('Carbonara', 0.49), result('Alfredo', 0.7)]
    expect(pickSimilarMatch(results, 0.5)).toEqual(results[1])
  })

  it('returns null for undefined results', () => {
    expect(pickSimilarMatch(undefined, 0.5)).toBeNull()
  })
})
