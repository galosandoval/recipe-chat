'use client'

import type { Feature } from '@prisma/client'
import React from 'react'

interface FeatureGateProps {
  feature: Feature
  children: React.ReactNode
  fallback?: React.ReactNode
  userFeatures?: Feature[]
}

/**
 * Simple FeatureGate component that checks if a user has access to a feature
 * based on their onboarding array
 */
export function FeatureGate({
  feature,
  children,
  fallback,
  userFeatures = []
}: FeatureGateProps) {
  const hasFeature = userFeatures.includes(feature)

  if (hasFeature) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return null
}

/**
 * Hook for checking feature access
 */
export function useFeatureAccess(
  feature: Feature,
  userFeatures: Feature[] = []
) {
  return userFeatures.includes(feature)
}
