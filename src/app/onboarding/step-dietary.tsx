'use client'

import { useWatch, type UseFormReturn } from 'react-hook-form'
import type { TasteProfileSchema } from '~/schemas/taste-profile-schema'
import { dietaryRestrictionOptions } from '~/schemas/taste-profile-schema'
import { OptionToggle } from './option-toggle'
import { useTranslations } from '~/hooks/use-translations'

export function StepDietary({
  form
}: {
  form: UseFormReturn<TasteProfileSchema>
}) {
  const t = useTranslations()
  const selected = useWatch({ control: form.control, name: 'dietaryRestrictions' })

  const toggle = (value: string) => {
    const current = form.getValues('dietaryRestrictions')
    if (value === 'none') {
      form.setValue('dietaryRestrictions', ['none'], { shouldValidate: true })
      return
    }
    const withoutNone = current.filter((v) => v !== 'none')
    const next = withoutNone.includes(value)
      ? withoutNone.filter((v) => v !== value)
      : [...withoutNone, value]
    form.setValue('dietaryRestrictions', next, { shouldValidate: true })
  }

  return (
    <div className='flex flex-col gap-4'>
      <h2 className='text-lg font-semibold'>{t.onboarding.dietaryRestrictionsTitle}</h2>
      <p className='text-muted-foreground text-sm'>
        {t.onboarding.dietaryRestrictionsDescription}
      </p>
      <div className='flex flex-wrap gap-2'>
        {dietaryRestrictionOptions.map((option) => (
          <OptionToggle
            key={option}
            pressed={selected.includes(option)}
            onPressedChange={() => toggle(option)}
          >
            {option}
          </OptionToggle>
        ))}
      </div>
    </div>
  )
}
