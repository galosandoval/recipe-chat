import { hasFeatureAccess, getRequiredTier } from './tier-config'

describe('cookMode feature gating', () => {
  it('requires the STARTER tier', () => {
    expect(getRequiredTier('cookMode')).toBe('STARTER')
  })

  it('is denied to FREE users', () => {
    expect(hasFeatureAccess('FREE', 'cookMode')).toBe(false)
  })

  it('is granted to STARTER and PREMIUM users', () => {
    expect(hasFeatureAccess('STARTER', 'cookMode')).toBe(true)
    expect(hasFeatureAccess('PREMIUM', 'cookMode')).toBe(true)
  })
})
