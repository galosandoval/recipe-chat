'use client'

import type { SubscriptionTier } from '@prisma/client'
import type { ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import {
  hasFeatureAccess,
  hasTierAccess,
  type GatedFeature
} from '~/lib/tier-config'

export function useFeatureAccess(feature: GatedFeature) {
  const { data: session } = useSession()
  const userTier = (session?.user?.subscriptionTier ?? 'FREE') as SubscriptionTier
  return hasFeatureAccess(userTier, feature)
}

export function useTierAccess(requiredTier: SubscriptionTier) {
  const { data: session } = useSession()
  const userTier = (session?.user?.subscriptionTier ?? 'FREE') as SubscriptionTier
  return hasTierAccess(userTier, requiredTier)
}

export function FeatureGate({
  feature,
  children,
  fallback = null
}: {
  feature: GatedFeature
  children: ReactNode
  fallback?: ReactNode
}) {
  const hasAccess = useFeatureAccess(feature)
  return hasAccess ? <>{children}</> : <>{fallback}</>
}

export function TierGate({
  requiredTier,
  children,
  fallback = null
}: {
  requiredTier: SubscriptionTier
  children: ReactNode
  fallback?: ReactNode
}) {
  const hasAccess = useTierAccess(requiredTier)
  return hasAccess ? <>{children}</> : <>{fallback}</>
}
