'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations, useLocale } from '~/hooks/use-translations'
import { api } from '~/trpc/react'
import { toast } from '~/components/toast'
import { CheckIcon } from 'lucide-react'
import { Button } from '~/components/button'
import { formatTierPrice } from '~/lib/stripe-config'

const TIERS = ['FREE', 'STARTER', 'PREMIUM'] as const
type Tier = (typeof TIERS)[number]

const TIER_ORDER: Record<Tier, number> = { FREE: 0, STARTER: 1, PREMIUM: 2 }

function useRidirectIfNotLoggedIn() {
  const router = useRouter()
  const session = useSession()

  if (!session.data) {
    // router.
  }
}

export default function SubscriptionPage() {
  const t = useTranslations()
  const session = useSession()
  const searchParams = useSearchParams()
  const lang = useLocale()
  const localeMap: Record<string, string> = { en: 'en-US', es: 'es-MX' }
  const locale = localeMap[lang] ?? 'en-US'

  const { data: info, isLoading } = api.subscription.getInfo.useQuery(undefined, {
    enabled: !!session.data
  })

  const checkout = api.subscription.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) window.location.assign(data.url)
    },
    onError: (err) => toast.error(err.message)
  })

  const portal = api.subscription.createPortalSession.useMutation({
    onSuccess: (data) => {
      if (data.url) window.location.assign(data.url)
    },
    onError: (err) => toast.error(err.message)
  })

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success(t.subscription.successMessage)
    }
    if (searchParams.get('canceled') === 'true') {
      toast.info(t.subscription.canceledMessage)
    }
  }, [searchParams, t])

  if (!session.data) {
    return (
      <main className='mx-auto w-full max-w-3xl px-4 py-8'>
        <p className='text-muted-foreground text-center'>{t.auth.signUpInfo}</p>
      </main>
    )
  }

  const currentTier = (info?.subscriptionTier ?? 'FREE') as Tier

  const tiers: {
    tier: Tier
    name: string
    price: string
    features: string[]
  }[] = [
    {
      tier: 'FREE',
      name: t.subscription.free,
      price: t.subscription.replace('pricePerMonth', formatTierPrice('FREE', locale)),
      features: t.subscription.freeFeatures.split(', ')
    },
    {
      tier: 'STARTER',
      name: t.subscription.starter,
      price: t.subscription.replace('pricePerMonth', formatTierPrice('STARTER', locale)),
      features: t.subscription.starterFeatures.split(', ')
    },
    {
      tier: 'PREMIUM',
      name: t.subscription.premium,
      price: t.subscription.replace('pricePerMonth', formatTierPrice('PREMIUM', locale)),
      features: t.subscription.premiumFeatures.split(', ')
    }
  ]

  return (
    <main className='mx-auto w-full max-w-3xl px-4 py-8'>
      <h1 className='mb-2 text-2xl font-bold'>{t.subscription.title}</h1>
      <p className='text-muted-foreground mb-6'>
        {t.subscription.currentPlan}: {tiers.find((t) => t.tier === currentTier)?.name}
      </p>

      {info?.subscriptionStatus === 'PAST_DUE' && (
        <div className='mb-6 rounded-md border border-yellow-500 bg-yellow-50 p-4 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200'>
          {t.subscription.pastDueWarning}
        </div>
      )}

      <div className='grid gap-4 sm:grid-cols-3'>
        {tiers.map(({ tier, name, price, features }) => {
          const isCurrent = tier === currentTier
          const tierOrder = TIER_ORDER[tier]
          const currentOrder = TIER_ORDER[currentTier]

          return (
            <div
              key={tier}
              className={`rounded-lg border p-5 ${isCurrent ? 'border-primary ring-primary ring-1' : 'border-border'}`}
            >
              <h2 className='text-lg font-semibold'>{name}</h2>
              <p className='mt-1 text-2xl font-bold'>{price}</p>

              <ul className='mt-4 space-y-2'>
                {features.map((feature) => (
                  <li key={feature} className='flex items-start gap-2 text-sm'>
                    <CheckIcon className='text-primary mt-0.5 h-4 w-4 shrink-0' />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className='mt-6'>
                {isCurrent ? (
                  <Button variant='outline' className='w-full' disabled>
                    {t.subscription.current}
                  </Button>
                ) : tier === 'FREE' ? (
                  <Button
                    variant='outline'
                    className='w-full'
                    onClick={() => portal.mutate()}
                    disabled={portal.status === 'pending' || currentTier === 'FREE'}
                  >
                    {t.subscription.downgrade}
                  </Button>
                ) : (
                  <TierActionButton
                    tier={tier}
                    tierOrder={tierOrder}
                    currentTier={currentTier}
                    currentOrder={currentOrder}
                    isLoading={isLoading}
                    onCheckout={(t) => checkout.mutate({ tier: t })}
                    onPortal={() => portal.mutate()}
                    checkoutPending={checkout.status === 'pending'}
                    portalPending={portal.status === 'pending'}
                    t={t}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {info?.stripeCustomerId && (
        <div className='mt-8 text-center'>
          <Button
            variant='link'
            onClick={() => portal.mutate()}
            disabled={portal.status === 'pending'}
          >
            {t.subscription.manageBilling}
          </Button>
        </div>
      )}
    </main>
  )
}

function TierActionButton({
  tier,
  tierOrder,
  currentTier,
  currentOrder,
  isLoading,
  onCheckout,
  onPortal,
  checkoutPending,
  portalPending,
  t
}: {
  tier: 'STARTER' | 'PREMIUM'
  tierOrder: number
  currentTier: Tier
  currentOrder: number
  isLoading: boolean
  onCheckout: (tier: 'STARTER' | 'PREMIUM') => void
  onPortal: () => void
  checkoutPending: boolean
  portalPending: boolean
  t: ReturnType<typeof useTranslations>
}) {
  if (currentTier === 'FREE') {
    return (
      <Button
        className='w-full'
        onClick={() => onCheckout(tier)}
        disabled={isLoading || checkoutPending}
      >
        {t.subscription.subscribe}
      </Button>
    )
  }

  if (tierOrder > currentOrder) {
    return (
      <Button
        className='w-full'
        onClick={() => onPortal()}
        disabled={portalPending}
      >
        {t.subscription.upgrade}
      </Button>
    )
  }

  return (
    <Button
      variant='outline'
      className='w-full'
      onClick={() => onPortal()}
      disabled={portalPending}
    >
      {t.subscription.downgrade}
    </Button>
  )
}
