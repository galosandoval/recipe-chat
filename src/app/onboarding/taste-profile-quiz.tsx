'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppForm } from '~/hooks/use-app-form'
import {
  tasteProfileSchema,
  type TasteProfileSchema
} from '~/schemas/taste-profile-schema'
import { api } from '~/trpc/react'
import { Button } from '~/components/button'
import { StepDietary } from './step-dietary'
import { StepCuisines } from './step-cuisines'
import { StepSkill } from './step-skill'
import { StepHouseholdGoals } from './step-household-goals'
import { ArrowLeftIcon, ArrowRightIcon, SkipForwardIcon } from 'lucide-react'

const TOTAL_STEPS = 4

const stepFields: (keyof TasteProfileSchema)[][] = [
  ['dietaryRestrictions'],
  ['cuisinePreferences'],
  ['cookingSkill'],
  ['householdSize', 'healthGoals']
]

export function TasteProfileQuiz() {
  const [step, setStep] = useState(0)
  const router = useRouter()
  const { data: existing } = api.tasteProfile.get.useQuery()

  const form = useAppForm(tasteProfileSchema, {
    defaultValues: {
      dietaryRestrictions: [],
      cuisinePreferences: [],
      cookingSkill: 'intermediate',
      householdSize: 2,
      healthGoals: []
    },
    values: existing
      ? {
          dietaryRestrictions: existing.dietaryRestrictions,
          cuisinePreferences: existing.cuisinePreferences,
          cookingSkill: existing.cookingSkill as TasteProfileSchema['cookingSkill'],
          householdSize: existing.householdSize,
          healthGoals: existing.healthGoals
        }
      : undefined
  })

  const upsert = api.tasteProfile.upsert.useMutation({
    onSuccess: () => router.push('/chat')
  })
  const skip = api.tasteProfile.skip.useMutation({
    onSuccess: () => router.push('/chat')
  })

  const handleNext = async () => {
    const fields = stepFields[step]
    const valid = await form.trigger(fields)
    if (!valid) return
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1)
    } else {
      upsert.mutate(form.getValues())
    }
  }

  const handleBack = () => {
    if (step > 0) setStep(step - 1)
  }

  const handleSkip = () => {
    skip.mutate()
  }

  const isSubmitting = upsert.status === 'pending' || skip.status === 'pending'

  return (
    <div className='mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-8'>
      <ProgressBar step={step} total={TOTAL_STEPS} />

      <div className='min-h-[300px]'>
        {step === 0 && <StepDietary form={form} />}
        {step === 1 && <StepCuisines form={form} />}
        {step === 2 && <StepSkill form={form} />}
        {step === 3 && <StepHouseholdGoals form={form} />}
      </div>

      <div className='flex items-center justify-between gap-2'>
        {step > 0 ? (
          <Button
            type='button'
            variant='ghost'
            onClick={handleBack}
            disabled={isSubmitting}
          >
            <ArrowLeftIcon className='h-4 w-4' />
            Back
          </Button>
        ) : (
          <Button
            type='button'
            variant='ghost'
            onClick={handleSkip}
            disabled={isSubmitting}
            isLoading={skip.status === 'pending'}
          >
            <SkipForwardIcon className='h-4 w-4' />
            Skip
          </Button>
        )}

        <Button
          type='button'
          onClick={handleNext}
          disabled={isSubmitting}
          isLoading={upsert.status === 'pending'}
        >
          {step === TOTAL_STEPS - 1 ? 'Finish' : 'Next'}
          {step < TOTAL_STEPS - 1 && <ArrowRightIcon className='h-4 w-4' />}
        </Button>
      </div>
    </div>
  )
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  const progress = ((step + 1) / total) * 100

  return (
    <div className='flex flex-col gap-2'>
      <span className='text-muted-foreground text-sm'>
        Step {step + 1} of {total}
      </span>
      <div className='bg-muted h-2 w-full overflow-hidden rounded-full'>
        <div
          className='bg-primary h-full rounded-full transition-all duration-300'
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
