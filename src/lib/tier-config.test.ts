import { hasFeatureAccess, hasTierAccess, getRequiredTier } from './tier-config'

const original = process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED

afterEach(() => {
  process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED = original
})

describe('cookMode feature gating', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED = 'true'
  })

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

describe('gating while subscriptions are disabled', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED
  })

  it.each([
    'recipeRemix',
    'cookMode',
    'basicVideo',
    'customVideoEditing',
    'householdSync',
    'privateClubs'
  ] as const)('grants %s to a FREE user', (feature) => {
    expect(hasFeatureAccess('FREE', feature)).toBe(true)
  })

  it.each(['FREE', 'STARTER', 'PREMIUM'] as const)(
    'grants a FREE user access to the %s tier',
    (requiredTier) => {
      expect(hasTierAccess('FREE', requiredTier)).toBe(true)
    }
  )

  it('still reports the tier a feature would require', () => {
    expect(getRequiredTier('cookMode')).toBe('STARTER')
  })
})
