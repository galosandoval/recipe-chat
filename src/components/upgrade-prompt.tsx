import type { SubscriptionTier } from '@prisma/client'
import Link from 'next/link'

export function UpgradePrompt({
  requiredTier,
  featureDescription
}: {
  requiredTier: SubscriptionTier
  featureDescription: string
}) {
  return (
    <div className='rounded-lg border border-amber-200 bg-amber-50 p-4'>
      <p className='text-sm font-medium text-amber-800'>
        {featureDescription} requires a {requiredTier.toLowerCase()} plan.
      </p>
      <Link
        href='/subscription'
        className='mt-2 inline-block text-sm font-medium text-amber-700 underline hover:text-amber-900'
      >
        View plans
      </Link>
    </div>
  )
}
