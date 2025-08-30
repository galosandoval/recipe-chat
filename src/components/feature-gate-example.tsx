'use client'

import React from 'react'
import { FeatureGate } from './feature-gate'
import { Feature } from '@prisma/client'

/**
 * Example component showing how to use the simple Feature enum and FeatureGate
 */
export function FeatureGateExample() {
  // Example user features - in real app this would come from the user's onboarding array
  const userFeatures: Feature[] = [Feature.chat, Feature.chatFilters]

  return (
    <div className='space-y-6 p-6'>
      <h1 className='text-2xl font-bold'>Recipe Chat Features</h1>

      {/* Basic feature - user has this */}
      <FeatureGate feature={Feature.chatFilters} userFeatures={userFeatures}>
        <div className='rounded-lg border border-green-200 bg-green-50 p-4'>
          <h3 className='font-semibold text-green-800'>Basic Recipe Search</h3>
          <p className='mb-3 text-sm text-green-700'>
            Search and view basic recipes. This feature is available.
          </p>
          <button className='rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700'>
            Search Recipes
          </button>
        </div>
      </FeatureGate>

      {/* Advanced feature - user has this */}
      <FeatureGate feature={Feature.chat} userFeatures={userFeatures}>
        <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
          <h3 className='font-semibold text-blue-800'>AI Chat</h3>
          <p className='mb-3 text-sm text-blue-700'>
            Chat with our AI about recipes and cooking tips.
          </p>
          <button className='rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700'>
            Start Chat
          </button>
        </div>
      </FeatureGate>

      {/* Premium feature - user doesn't have this */}
      <FeatureGate
        feature={Feature.savedRecipes}
        userFeatures={userFeatures}
        fallback={
          <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
            <h3 className='font-semibold text-gray-800'>Saved Recipes</h3>
            <p className='text-sm text-gray-700'>
              Complete onboarding to unlock saved recipes feature.
            </p>
          </div>
        }
      >
        <div className='rounded-lg border border-purple-200 bg-purple-50 p-4'>
          <h3 className='font-semibold text-purple-800'>Saved Recipes</h3>
          <p className='mb-3 text-sm text-purple-700'>
            Save and organize your favorite recipes.
          </p>
          <button className='rounded bg-purple-600 px-3 py-1 text-sm text-white hover:bg-purple-700'>
            View Saved
          </button>
        </div>
      </FeatureGate>

      {/* Feature status display */}
      <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
        <h3 className='mb-2 font-semibold text-gray-800'>
          Feature Access Status
        </h3>
        <div className='space-y-2 text-sm'>
          <div className='flex justify-between'>
            <span>Basic Recipes:</span>
            <span
              className={
                userFeatures.includes(Feature.chatFilters)
                  ? 'text-green-600'
                  : 'text-red-600'
              }
            >
              {userFeatures.includes(Feature.chatFilters)
                ? '✅ Available'
                : '❌ Locked'}
            </span>
          </div>
          <div className='flex justify-between'>
            <span>AI Chat:</span>
            <span
              className={
                userFeatures.includes(Feature.chat)
                  ? 'text-green-600'
                  : 'text-red-600'
              }
            >
              {userFeatures.includes(Feature.chat)
                ? '✅ Available'
                : '❌ Locked'}
            </span>
          </div>
          <div className='flex justify-between'>
            <span>Saved Recipes:</span>
            <span
              className={
                userFeatures.includes(Feature.savedRecipes)
                  ? 'text-green-600'
                  : 'text-red-600'
              }
            >
              {userFeatures.includes(Feature.savedRecipes)
                ? '✅ Available'
                : '❌ Locked'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
