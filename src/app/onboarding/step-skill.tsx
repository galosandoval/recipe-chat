'use client'

import type { UseFormReturn } from 'react-hook-form'
import type { TasteProfileSchema } from '~/schemas/taste-profile-schema'
import { cn } from '~/lib/utils'
import { useTranslations } from '~/hooks/use-translations'

export function StepSkill({
  form
}: {
  form: UseFormReturn<TasteProfileSchema>
}) {
  const t = useTranslations()
  const selected = form.watch('cookingSkill')

  const skillDescriptions = {
    beginner: t.onboarding.skillDescriptions.beginner,
    intermediate: t.onboarding.skillDescriptions.intermediate,
    advanced: t.onboarding.skillDescriptions.advanced,
  } as const

  return (
    <div className='flex flex-col gap-4'>
      <h2 className='text-lg font-semibold'>{t.onboarding.cookingSkillTitle}</h2>
      <p className='text-muted-foreground text-sm'>
        {t.onboarding.cookingSkillDescription}
      </p>
      <div className='flex flex-col gap-3'>
        {(
          Object.entries(skillDescriptions) as [
            keyof typeof skillDescriptions,
            string
          ][]
        ).map(([level, description]) => {
          const isSelected = selected === level
          return (
            <button
              key={level}
              type='button'
              onClick={() =>
                form.setValue('cookingSkill', level, { shouldValidate: true })
              }
              className={cn(
                'flex flex-col items-start rounded-lg border p-4 text-left transition-colors',
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground hover:bg-muted border-border'
              )}
            >
              <span className='text-sm font-medium capitalize'>{level}</span>
              <span
                className={cn(
                  'text-xs',
                  isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                )}
              >
                {description}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
