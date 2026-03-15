'use client'

import type { UseFormReturn } from 'react-hook-form'
import type { TasteProfileSchema } from '~/schemas/taste-profile-schema'
import { healthGoalOptions } from '~/schemas/taste-profile-schema'
import { cn } from '~/lib/utils'
import { MinusIcon, PlusIcon } from 'lucide-react'
import { Button } from '~/components/button'

export function StepHouseholdGoals({
  form
}: {
  form: UseFormReturn<TasteProfileSchema>
}) {
  const householdSize = form.watch('householdSize')
  const selectedGoals = form.watch('healthGoals')

  const toggleGoal = (value: string) => {
    const current = form.getValues('healthGoals')
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    form.setValue('healthGoals', next, { shouldValidate: true })
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-4'>
        <h2 className='text-lg font-semibold'>Household Size</h2>
        <p className='text-muted-foreground text-sm'>
          How many people do you usually cook for?
        </p>
        <div className='flex items-center gap-4'>
          <Button
            type='button'
            variant='outline'
            size='icon'
            onClick={() =>
              form.setValue(
                'householdSize',
                Math.max(1, householdSize - 1),
                { shouldValidate: true }
              )
            }
            disabled={householdSize <= 1}
          >
            <MinusIcon className='h-4 w-4' />
          </Button>
          <span className='text-2xl font-semibold tabular-nums'>
            {householdSize}
          </span>
          <Button
            type='button'
            variant='outline'
            size='icon'
            onClick={() =>
              form.setValue(
                'householdSize',
                Math.min(10, householdSize + 1),
                { shouldValidate: true }
              )
            }
            disabled={householdSize >= 10}
          >
            <PlusIcon className='h-4 w-4' />
          </Button>
        </div>
      </div>

      <div className='flex flex-col gap-4'>
        <h2 className='text-lg font-semibold'>Health Goals</h2>
        <p className='text-muted-foreground text-sm'>
          Select any health goals you'd like us to consider (optional).
        </p>
        <div className='flex flex-wrap gap-2'>
          {healthGoalOptions.map((option) => {
            const isSelected = selectedGoals.includes(option)
            return (
              <button
                key={option}
                type='button'
                onClick={() => toggleGoal(option)}
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
    </div>
  )
}
