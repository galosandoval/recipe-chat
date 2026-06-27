'use client'

import type { UseFormReturn } from 'react-hook-form'
import type { TasteProfileSchema } from '~/schemas/taste-profile-schema'
import { Button } from '~/components/button'
import { PencilIcon } from 'lucide-react'
import { useTranslations } from '~/hooks/use-translations'

export function StepReview({
  form,
  goToStep
}: {
  form: UseFormReturn<TasteProfileSchema>
  goToStep: (step: number) => void
}) {
  const t = useTranslations()
  // Snapshot of current values; the review step reads them once on mount.
  const values = form.getValues()

  const list = (items: string[]) =>
    items.length > 0 ? items.join(', ') : t.onboarding.noneSelected

  const rows = [
    {
      label: t.onboarding.reviewLabels.dietaryRestrictions,
      value: list(values.dietaryRestrictions),
      step: 0
    },
    {
      label: t.onboarding.reviewLabels.cuisinePreferences,
      value: list(values.cuisinePreferences),
      step: 1
    },
    {
      label: t.onboarding.reviewLabels.cookingSkill,
      value: values.cookingSkill,
      step: 2
    },
    {
      label: t.onboarding.reviewLabels.householdSize,
      value: String(values.householdSize),
      step: 3
    },
    {
      label: t.onboarding.reviewLabels.healthGoals,
      value: list(values.healthGoals),
      step: 3
    }
  ]

  return (
    <div className='flex flex-col gap-4'>
      <h2 className='text-lg font-semibold'>{t.onboarding.reviewTitle}</h2>
      <p className='text-muted-foreground text-sm'>
        {t.onboarding.reviewDescription}
      </p>
      <dl className='flex flex-col divide-y'>
        {rows.map((row) => (
          <div
            key={row.label}
            className='flex items-center justify-between gap-4 py-3'
          >
            <div className='flex min-w-0 flex-col gap-0.5'>
              <dt className='text-muted-foreground text-xs'>{row.label}</dt>
              <dd className='truncate text-sm capitalize'>{row.value}</dd>
            </div>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => goToStep(row.step)}
              icon={<PencilIcon className='h-3.5 w-3.5' />}
            >
              {t.onboarding.edit}
            </Button>
          </div>
        ))}
      </dl>
    </div>
  )
}
