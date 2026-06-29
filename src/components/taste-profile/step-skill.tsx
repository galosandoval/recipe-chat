'use client'

import { useWatch, type UseFormReturn } from 'react-hook-form'
import type { TasteProfileSchema } from '~/schemas/taste-profile-schema'
import { OptionToggle } from './option-toggle'
import { useTranslations } from '~/hooks/use-translations'

export function StepSkill({
  form
}: {
  form: UseFormReturn<TasteProfileSchema>
}) {
  const t = useTranslations()
  const selected = useWatch({ control: form.control, name: 'cookingSkill' })

  const skillDescriptions = {
    beginner: t.onboarding.skillDescriptions.beginner,
    intermediate: t.onboarding.skillDescriptions.intermediate,
    advanced: t.onboarding.skillDescriptions.advanced
  } as const

  return (
    <div className='flex flex-col gap-4'>
      <h2 className='text-lg font-semibold'>
        {t.onboarding.cookingSkillTitle}
      </h2>
      <p className='text-muted-foreground text-sm'>
        {t.onboarding.cookingSkillDescription}
      </p>
      <div className='flex flex-col gap-3'>
        {(
          Object.entries(skillDescriptions) as [
            keyof typeof skillDescriptions,
            string
          ][]
        ).map(([level, description]) => (
          <OptionToggle
            key={level}
            shape='card'
            pressed={selected === level}
            onPressedChange={() =>
              form.setValue('cookingSkill', level, { shouldValidate: true })
            }
          >
            <span className='text-sm font-medium capitalize'>{level}</span>
            <span className='text-muted-foreground group-data-[state=on]:text-primary-foreground/80 text-xs'>
              {description}
            </span>
          </OptionToggle>
        ))}
      </div>
    </div>
  )
}
