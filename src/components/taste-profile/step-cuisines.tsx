'use client'

import { useState } from 'react'
import { useWatch, type UseFormReturn } from 'react-hook-form'
import type { TasteProfileSchema } from '~/schemas/taste-profile-schema'
import { cuisineOptions } from '~/schemas/taste-profile-schema'
import { OptionToggle } from './option-toggle'
import { CustomOptionAdd } from './custom-option-add'
import { useTranslations } from '~/hooks/use-translations'

export function StepCuisines({
  form
}: {
  form: UseFormReturn<TasteProfileSchema>
}) {
  const t = useTranslations()
  const selected = useWatch({
    control: form.control,
    name: 'cuisinePreferences'
  })
  // Custom values the user typed in, kept so deselected ones stay reselectable.
  const presets: readonly string[] = cuisineOptions
  const [customOptions, setCustomOptions] = useState<string[]>(() =>
    form.getValues('cuisinePreferences').filter((v) => !presets.includes(v))
  )

  const toggle = (value: string) => {
    const current = form.getValues('cuisinePreferences')
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    form.setValue('cuisinePreferences', next, { shouldValidate: true })
  }

  const addCustom = (value: string) => {
    setCustomOptions((prev) => (prev.includes(value) ? prev : [...prev, value]))
    toggle(value)
  }

  return (
    <div className='flex flex-col gap-4'>
      <h2 className='text-lg font-semibold'>
        {t.onboarding.cuisinePreferencesTitle}
      </h2>
      <p className='text-muted-foreground text-sm'>
        {t.onboarding.cuisinePreferencesDescription}
      </p>
      <div className='grid grid-cols-2 gap-2'>
        {[...cuisineOptions, ...customOptions].map((option) => (
          <OptionToggle
            key={option}
            shape='block'
            pressed={selected.includes(option)}
            onPressedChange={() => toggle(option)}
          >
            {option}
          </OptionToggle>
        ))}
      </div>
      <CustomOptionAdd
        existing={[...cuisineOptions, ...customOptions]}
        onAdd={addCustom}
        label={t.onboarding.cuisineCustomLabel}
        placeholder={t.onboarding.cuisineCustomPlaceholder}
      />
    </div>
  )
}
