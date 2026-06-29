'use client'

import { useWatch, type UseFormReturn } from 'react-hook-form'
import type { TasteProfileSchema } from '~/schemas/taste-profile-schema'
import { healthGoalOptions } from '~/schemas/taste-profile-schema'
import { OptionToggle } from './option-toggle'
import { MinusIcon, PlusIcon } from 'lucide-react'
import { Button } from '~/components/button'
import { useTranslations } from '~/hooks/use-translations'

export function StepHouseholdGoals({
  form
}: {
  form: UseFormReturn<TasteProfileSchema>
}) {
  const t = useTranslations()
  const householdSize = useWatch({ control: form.control, name: 'householdSize' })
  const selectedGoals = useWatch({ control: form.control, name: 'healthGoals' })

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
        <h2 className='text-lg font-semibold'>{t.onboarding.householdSizeTitle}</h2>
        <p className='text-muted-foreground text-sm'>
          {t.onboarding.householdSizeDescription}
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
        <h2 className='text-lg font-semibold'>{t.onboarding.healthGoalsTitle}</h2>
        <p className='text-muted-foreground text-sm'>
          {t.onboarding.healthGoalsDescription}
        </p>
        <div className='flex flex-wrap gap-2'>
          {healthGoalOptions.map((option) => (
            <OptionToggle
              key={option}
              pressed={selectedGoals.includes(option)}
              onPressedChange={() => toggleGoal(option)}
            >
              {option}
            </OptionToggle>
          ))}
        </div>
      </div>
    </div>
  )
}
