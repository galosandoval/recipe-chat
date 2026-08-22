import { stepDelay } from './landing-step-delay'

describe('stepDelay', () => {
  it('holds a section entrance for no time at all', () => {
    expect(stepDelay(0)).toBe(0)
  })

  it('spaces later steps evenly behind the first', () => {
    const first = stepDelay(1)

    expect(first).toBeGreaterThan(0)
    expect(stepDelay(2)).toBeCloseTo(first * 2)
    expect(stepDelay(3)).toBeCloseTo(first * 3)
  })
})
