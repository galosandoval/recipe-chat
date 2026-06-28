'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFormState, type UseFormReturn } from 'react-hook-form'
import { useAppForm } from '~/hooks/use-app-form'
import {
  tasteProfileSchema,
  tasteProfileDefaults,
  type TasteProfileSchema
} from '~/schemas/taste-profile-schema'
import { api, type RouterOutputs } from '~/trpc/react'
import { Button } from '~/components/button'
import { StepDietary } from './step-dietary'
import { StepCuisines } from './step-cuisines'
import { StepSkill } from './step-skill'
import { StepHouseholdGoals } from './step-household-goals'
import { StepReview } from './step-review'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  Loader2Icon,
  SkipForwardIcon
} from 'lucide-react'
import { useTranslations } from '~/hooks/use-translations'
import { StepTransition } from '~/components/motion/step-transition'

const TOTAL_STEPS = 5

/** Fields validated when leaving each step; the review step (last) validates nothing. */
const stepFields: (keyof TasteProfileSchema)[][] = [
  ['dietaryRestrictions'],
  ['cuisinePreferences'],
  ['cookingSkill'],
  ['householdSize', 'healthGoals'],
  []
]

type ExistingProfile = RouterOutputs['tasteProfile']['get']

/**
 * Outer container: fetches the existing profile and shows a loader until the
 * query settles, so the inner form only ever mounts with stable initial data.
 */
export function TasteProfileQuiz() {
  const t = useTranslations()
  const { data: existing, isPending } = api.tasteProfile.get.useQuery()

  if (isPending) {
    return (
      <div className='flex min-h-[300px] items-center justify-center gap-2'>
        <Loader2Icon className='text-muted-foreground h-5 w-5 animate-spin' />
        <span className='text-muted-foreground text-sm'>
          {t.onboarding.loading}
        </span>
      </div>
    )
  }

  return <TasteProfileForm initialProfile={existing ?? null} />
}

/** Build stable initial form values from an existing profile (or shared defaults). */
function toDefaultValues(existing: ExistingProfile): TasteProfileSchema {
  if (!existing) {
    // Fresh arrays so the shared defaults object is never mutated by reference.
    return {
      ...tasteProfileDefaults,
      dietaryRestrictions: [...tasteProfileDefaults.dietaryRestrictions],
      cuisinePreferences: [...tasteProfileDefaults.cuisinePreferences],
      healthGoals: [...tasteProfileDefaults.healthGoals]
    }
  }
  return {
    // Legacy profiles may still contain 'none'; strip it so it's never shown
    // as a custom chip or re-submitted — an empty array means "no restrictions".
    dietaryRestrictions: existing.dietaryRestrictions.filter((r) => r !== 'none'),
    cuisinePreferences: existing.cuisinePreferences,
    cookingSkill: existing.cookingSkill as TasteProfileSchema['cookingSkill'],
    householdSize: existing.householdSize,
    healthGoals: existing.healthGoals
  }
}

/**
 * Inner form: initialized once from stable `defaultValues`. No reactive `values`
 * prop, so selections are never reset out from under the user.
 */
function TasteProfileForm({
  initialProfile
}: {
  initialProfile: ExistingProfile
}) {
  const t = useTranslations()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const router = useRouter()

  const form = useAppForm(tasteProfileSchema, {
    defaultValues: toDefaultValues(initialProfile)
  })

  const utils = api.useUtils()
  const upsert = api.tasteProfile.upsert.useMutation({
    onSuccess: async () => {
      await utils.tasteProfile.get.invalidate()
      router.push('/chat')
    }
  })
  const skip = api.tasteProfile.skip.useMutation({
    onSuccess: async () => {
      await utils.tasteProfile.get.invalidate()
      router.push('/chat')
    }
  })

  const goToStep = (next: number) => {
    setDirection(next >= step ? 'forward' : 'back')
    setStep(next)
  }

  const handleNext = async () => {
    const valid = await form.trigger(stepFields[step])
    if (!valid) return
    if (step < TOTAL_STEPS - 1) {
      goToStep(step + 1)
    } else {
      upsert.mutate(form.getValues())
    }
  }

  const handleBack = () => {
    if (step > 0) goToStep(step - 1)
  }

  const handleSkip = () => {
    skip.mutate()
  }

  const isSubmitting = upsert.status === 'pending' || skip.status === 'pending'
  const isLastStep = step === TOTAL_STEPS - 1

  return (
    <div className='mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-8'>
      <ProgressBar
        step={step}
        total={TOTAL_STEPS}
        stepOfLabel={t.onboarding.stepOf}
      />

      <div className='min-h-[300px] overflow-hidden'>
        <StepTransition stepKey={step} direction={direction}>
          {step === 0 && <StepDietary form={form} />}
          {step === 1 && <StepCuisines form={form} />}
          {step === 2 && <StepSkill form={form} />}
          {step === 3 && <StepHouseholdGoals form={form} />}
          {step === 4 && <StepReview form={form} goToStep={goToStep} />}
        </StepTransition>
      </div>

      <StepError form={form} fields={stepFields[step]} />

      <NavButtons
        isFirstStep={step === 0}
        isLastStep={isLastStep}
        isSubmitting={isSubmitting}
        isSkipping={skip.status === 'pending'}
        isFinishing={upsert.status === 'pending'}
        onBack={handleBack}
        onSkip={handleSkip}
        onNext={handleNext}
      />
    </div>
  )
}

/**
 * Shared validation feedback for the current step. Surfaces the first error
 * among the step's fields so a failed Next is never silent, and announces it to
 * assistive tech. Clears automatically once the offending field revalidates.
 */
function StepError({
  form,
  fields
}: {
  form: UseFormReturn<TasteProfileSchema>
  fields: (keyof TasteProfileSchema)[]
}) {
  const { errors } = useFormState({ control: form.control })
  const message = fields.map((field) => errors[field]?.message).find(Boolean)
  if (!message) return null

  return (
    <p role='alert' aria-live='polite' className='text-destructive text-sm'>
      {String(message)}
    </p>
  )
}

function NavButtons({
  isFirstStep,
  isLastStep,
  isSubmitting,
  isSkipping,
  isFinishing,
  onBack,
  onSkip,
  onNext
}: {
  isFirstStep: boolean
  isLastStep: boolean
  isSubmitting: boolean
  isSkipping: boolean
  isFinishing: boolean
  onBack: () => void
  onSkip: () => void
  onNext: () => void
}) {
  const t = useTranslations()

  return (
    <div className='flex items-center justify-between gap-2'>
      {isFirstStep ? (
        <Button
          type='button'
          variant='ghost'
          onClick={onSkip}
          disabled={isSubmitting}
          isLoading={isSkipping}
          icon={<SkipForwardIcon className='h-4 w-4' />}
        >
          {t.onboarding.skip}
        </Button>
      ) : (
        <Button
          type='button'
          variant='ghost'
          onClick={onBack}
          disabled={isSubmitting}
          icon={<ArrowLeftIcon className='h-4 w-4' />}
        >
          {t.onboarding.back}
        </Button>
      )}

      <Button
        type='button'
        onClick={onNext}
        disabled={isSubmitting}
        isLoading={isFinishing}
        icon={
          isLastStep ? (
            <CheckIcon className='h-4 w-4' />
          ) : (
            <ArrowRightIcon className='h-4 w-4' />
          )
        }
      >
        {isLastStep ? t.onboarding.finish : t.onboarding.next}
      </Button>
    </div>
  )
}

function ProgressBar({
  step,
  total,
  stepOfLabel
}: {
  step: number
  total: number
  stepOfLabel: string
}) {
  const progress = ((step + 1) / total) * 100
  const label = stepOfLabel
    .replace('$1', String(step + 1))
    .replace('$2', String(total))

  return (
    <div className='flex flex-col gap-2'>
      <span className='text-muted-foreground text-sm'>{label}</span>
      <div className='bg-muted h-2 w-full overflow-hidden rounded-full'>
        <div
          className='bg-primary h-full rounded-full transition-all duration-300'
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
