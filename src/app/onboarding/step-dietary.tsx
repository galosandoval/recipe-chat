'use client'

import type { UseFormReturn } from 'react-hook-form'
import type { TasteProfileSchema } from '~/schemas/taste-profile-schema'
import { dietaryRestrictionOptions } from '~/schemas/taste-profile-schema'
import { cn } from '~/lib/utils'

export function StepDietary({
  form
}: {
  form: UseFormReturn<TasteProfileSchema>
}) {
  const selected = form.watch('dietaryRestrictions')

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
      <h2 className='text-lg font-semibold'>Dietary Restrictions</h2>
      <p className='text-muted-foreground text-sm'>
        Select any that apply to you, or choose &ldquo;None&rdquo;.
      </p>
      <div className='flex flex-wrap gap-2'>
        {dietaryRestrictionOptions.map((option) => {
          const isSelected = selected.includes(option)
          return (
            <button
              key={option}
              type='button'
              onClick={() => toggle(option)}
              className={cn(
                'rounded-full border px-4 py-2 text-sm capitalize transition-colors',
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
    </div>
  )
}
