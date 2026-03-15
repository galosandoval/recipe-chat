'use client'

import type { UseFormReturn } from 'react-hook-form'
import type { TasteProfileSchema } from '~/schemas/taste-profile-schema'
import { cn } from '~/lib/utils'

const skillDescriptions = {
  beginner: 'I follow recipes step by step and stick to simple dishes.',
  intermediate:
    'I can improvise a bit, handle multiple dishes, and try new techniques.',
  advanced:
    'I experiment freely, understand flavor science, and tackle complex recipes.'
} as const

export function StepSkill({
  form
}: {
  form: UseFormReturn<TasteProfileSchema>
}) {
  const selected = form.watch('cookingSkill')

  return (
    <div className='flex flex-col gap-4'>
      <h2 className='text-lg font-semibold'>Cooking Skill</h2>
      <p className='text-muted-foreground text-sm'>
        How would you describe your cooking experience?
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
