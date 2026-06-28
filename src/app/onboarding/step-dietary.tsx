'use client'

import { useState } from 'react'
import { useWatch, type UseFormReturn } from 'react-hook-form'
import type { TasteProfileSchema } from '~/schemas/taste-profile-schema'
import { dietaryRestrictionOptions } from '~/schemas/taste-profile-schema'
import { OptionToggle } from './option-toggle'
import { CustomOptionAdd } from './custom-option-add'
import { useTranslations } from '~/hooks/use-translations'

export function StepDietary({
  form
}: {
  form: UseFormReturn<TasteProfileSchema>
}) {
  const t = useTranslations()
  const selected = useWatch({ control: form.control, name: 'dietaryRestrictions' })
  // Custom values the user typed in, kept so deselected ones stay reselectable.
  const presets: readonly string[] = dietaryRestrictionOptions
  const [customOptions, setCustomOptions] = useState<string[]>(() =>
    form.getValues('dietaryRestrictions').filter((v) => !presets.includes(v))
  )

  const toggle = (value: string) => {
    const current = form.getValues('dietaryRestrictions')
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    form.setValue('dietaryRestrictions', next, { shouldValidate: true })
  }

  const addCustom = (value: string) => {
    setCustomOptions((prev) => (prev.includes(value) ? prev : [...prev, value]))
    toggle(value)
  }

  return (
    <div className='flex flex-col gap-4'>
      <h2 className='text-lg font-semibold'>{t.onboarding.dietaryRestrictionsTitle}</h2>
      <p className='text-muted-foreground text-sm'>
        {t.onboarding.dietaryRestrictionsDescription}
      </p>
      <div className='flex flex-wrap gap-2'>
        {[...dietaryRestrictionOptions, ...customOptions].map((option) => (
          <OptionToggle
            key={option}
            pressed={selected.includes(option)}
            onPressedChange={() => toggle(option)}
          >
            {option}
          </OptionToggle>
        ))}
      </div>
      <CustomOptionAdd
        existing={[...dietaryRestrictionOptions, ...customOptions]}
        onAdd={addCustom}
        label={t.onboarding.dietaryCustomLabel}
        placeholder={t.onboarding.dietaryCustomPlaceholder}
      />
    </div>
  )
}
