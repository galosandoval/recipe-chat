'use client'

import React from 'react'

// Feature enum from Prisma schema
export enum Feature {
  BASIC_RECIPES = 'basic_recipes',
  CHAT = 'chat',
  FILTERS = 'filters',
  LISTS = 'lists',
  SAVED_RECIPES = 'saved_recipes',
  ADVANCED_SEARCH = 'advanced_search',
  MEAL_PLANNING = 'meal_planning',
  SHOPPING_LISTS = 'shopping_lists'
}

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
