'use client'

import type { UseFormReturn } from 'react-hook-form'
import type { TasteProfileSchema } from '~/schemas/taste-profile-schema'
import { cuisineOptions } from '~/schemas/taste-profile-schema'
import { cn } from '~/lib/utils'
import { useTranslations } from '~/hooks/use-translations'

export function StepCuisines({
  form
}: {
  form: UseFormReturn<TasteProfileSchema>
}) {
  const t = useTranslations()
  const selected = form.watch('cuisinePreferences')
  const error = form.formState.errors.cuisinePreferences?.message

  const toggle = (value: string) => {
    const current = form.getValues('cuisinePreferences')
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    form.setValue('cuisinePreferences', next, { shouldValidate: true })
  }

  return (
    <div className='flex flex-col gap-4'>
      <h2 className='text-lg font-semibold'>{t.onboarding.cuisinePreferencesTitle}</h2>
      <p className='text-muted-foreground text-sm'>
        {t.onboarding.cuisinePreferencesDescription}
      </p>
      <div className='grid grid-cols-2 gap-2'>
        {cuisineOptions.map((option) => {
          const isSelected = selected.includes(option)
          return (
            <button
              key={option}
              type='button'
              onClick={() => toggle(option)}
              className={cn(
                'rounded-lg border px-4 py-3 text-sm transition-colors',
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground hover:bg-muted border-border'
              )}
            >
              {option}
            </button>
          )
        })}
      </div>
      {error && <p className='text-destructive text-sm'>{error}</p>}
    </div>
  )
}
