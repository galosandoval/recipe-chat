import type { SubscriptionTier } from '~/generated/prisma/client'
import { areSubscriptionsEnabled } from '~/lib/billing-config'

const TIER_LEVEL: Record<SubscriptionTier, number> = {
  FREE: 0,
  STARTER: 1,
  PREMIUM: 2
}

export type GatedFeature =
  | 'recipeRemix'
  | 'cookMode'
  | 'basicVideo'
  | 'customVideoEditing'
  | 'householdSync'
  | 'privateClubs'

const FEATURE_TIERS: Record<GatedFeature, SubscriptionTier> = {
  recipeRemix: 'STARTER',
  cookMode: 'STARTER',
  basicVideo: 'STARTER',
  customVideoEditing: 'PREMIUM',
  householdSync: 'PREMIUM',
  privateClubs: 'PREMIUM'
}

/**
 * Grants access to everyone while Subscriptions are disabled, so a feature can
 * be gated in code today without locking production users out of it. Both gate
 * components, both access hooks, and the tier tRPC middleware funnel through
 * here, so the bypass reaches every gating surface at once.
 */
export function hasTierAccess(
  userTier: SubscriptionTier,
  requiredTier: SubscriptionTier
) {
  if (!areSubscriptionsEnabled()) return true

  return TIER_LEVEL[userTier] >= TIER_LEVEL[requiredTier]
}

/** Grants access to everyone while Subscriptions are disabled — see {@link hasTierAccess}. */
export function hasFeatureAccess(
  userTier: SubscriptionTier,
  feature: GatedFeature
) {
  if (!areSubscriptionsEnabled()) return true

  const requiredTier = FEATURE_TIERS[feature]
  return hasTierAccess(userTier, requiredTier)
}

export function getRequiredTier(feature: GatedFeature) {
  return FEATURE_TIERS[feature]
}
