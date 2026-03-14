import type { SubscriptionTier } from '@prisma/client'

const TIER_LEVEL: Record<SubscriptionTier, number> = {
  FREE: 0,
  STARTER: 1,
  PREMIUM: 2
}

export type GatedFeature =
  | 'recipeRemix'
  | 'basicVideo'
  | 'customVideoEditing'
  | 'householdSync'
  | 'privateClubs'

const FEATURE_TIERS: Record<GatedFeature, SubscriptionTier> = {
  recipeRemix: 'STARTER',
  basicVideo: 'STARTER',
  customVideoEditing: 'PREMIUM',
  householdSync: 'PREMIUM',
  privateClubs: 'PREMIUM'
}

export function hasTierAccess(
  userTier: SubscriptionTier,
  requiredTier: SubscriptionTier
) {
  return TIER_LEVEL[userTier] >= TIER_LEVEL[requiredTier]
}

export function hasFeatureAccess(
  userTier: SubscriptionTier,
  feature: GatedFeature
) {
  const requiredTier = FEATURE_TIERS[feature]
  return hasTierAccess(userTier, requiredTier)
}

export function getRequiredTier(feature: GatedFeature) {
  return FEATURE_TIERS[feature]
}
