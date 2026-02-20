import { type SubscriptionTier } from '@prisma/client'

export const PRICE_ID_TO_TIER: Record<string, SubscriptionTier> = {
  [process.env.STRIPE_STARTER_PRICE_ID]: 'STARTER',
  [process.env.STRIPE_PREMIUM_PRICE_ID]: 'PREMIUM'
}

export const TIER_TO_PRICE_ID: Partial<Record<SubscriptionTier, string>> = {
  STARTER: process.env.STRIPE_STARTER_PRICE_ID,
  PREMIUM: process.env.STRIPE_PREMIUM_PRICE_ID
}

export const TIER_PRICES: Record<SubscriptionTier, number> = {
  FREE: 0,
  STARTER: 100,
  PREMIUM: 300
}

export function formatTierPrice(tier: SubscriptionTier, locale: string): string {
  const cents = TIER_PRICES[tier]
  const amount = cents / 100
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}
