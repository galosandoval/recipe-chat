'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ChefHatIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ListChecksIcon,
  TimerIcon,
  XIcon
} from 'lucide-react'
import type { Ingredient } from '@prisma/client'
import { Button } from '~/components/button'
import { toast } from '~/components/toast'
import { useRegisterFab } from '~/components/fab-stack/use-register-fab'
import { useFeatureAccess } from '~/components/feature-gate'
import { useTranslations } from '~/hooks/use-translations'
import { useRecipe } from '~/hooks/use-recipe'
import { getIngredientDisplayText } from '~/lib/ingredient-display'
import {
  formatCountdown,
  parseStepTimers,
  type StepTimer
} from './cook-mode-timer'

/**
 * Cook Mode: a full-screen, distraction-free view for cooking a Recipe with
 * large text, step-by-step navigation, per-step timers, and an ingredients
 * overlay. Gated behind the STARTER tier — the trigger only mounts for users
 * with access. Screen-wake is already handled by the recipe page's `useNoSleep`.
 */
export function CookMode() {
  const { data: recipe } = useRecipe()
  const [isOpen, setIsOpen] = useState(false)

  if (!recipe) return null

  return (
    <>
      {/* TODO: Think about what permission this should be{hasAccess && <CookModeFab onOpen={() => setIsOpen(true)} />} */}
      <CookModeFab onOpen={() => setIsOpen(true)} />
      {isOpen && (
        <CookModeOverlay recipe={recipe} onExit={() => setIsOpen(false)} />
      )}
    </>
  )
}

function CookModeFab({ onOpen }: { onOpen: () => void }) {
  const t = useTranslations()

  useRegisterFab({
    id: 'cook-mode',
    priority: 3,
    ariaLabel: t.recipes.cookMode.open,
    icon: <ChefHatIcon />,
    onClick: onOpen
  })

  return null
}

function CookModeOverlay({
  recipe,
  onExit
}: {
  recipe: {
    name: string
    instructions: { id: string; description: string }[]
    ingredients: Ingredient[]
  }
  onExit: () => void
}) {
  const t = useTranslations()
  const [stepIndex, setStepIndex] = useState(0)
  const [showIngredients, setShowIngredients] = useState(false)

  const total = recipe.instructions.length
  const step = recipe.instructions[stepIndex]
  const timers = useMemo(
    () => parseStepTimers(step?.description ?? ''),
    [step?.description]
  )

  const isFirst = stepIndex === 0
  const isLast = stepIndex === total - 1

  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-label={t.recipes.cookMode.title}
      className='bg-background fixed inset-0 z-50 flex flex-col'
    >
      <header className='flex items-center justify-between border-b px-4 py-3'>
        <h2 className='truncate text-lg font-bold'>{recipe.name}</h2>
        <Button
          variant='ghost'
          size='icon'
          aria-label={t.recipes.cookMode.exit}
          onClick={onExit}
          icon={<XIcon />}
        />
      </header>

      <main className='mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-y-auto px-6 py-8'>
        <p className='text-muted-foreground mb-6 text-center text-lg font-semibold tracking-wide uppercase'>
          {t.recipes.cookMode.replace(
            'stepOf',
            String(stepIndex + 1),
            String(total)
          )}
        </p>
        <p className='text-2xl leading-relaxed font-medium sm:text-3xl'>
          {step?.description}
        </p>

        {timers.length > 0 && (
          <div className='mt-8 flex flex-col gap-3'>
            {timers.map((timer, index) => (
              <StepTimerButton key={`${timer.label}-${index}`} timer={timer} />
            ))}
          </div>
        )}
      </main>

      <footer className='flex items-center justify-between gap-3 border-t px-4 py-4'>
        <Button
          variant='outline'
          size='lg'
          disabled={isFirst}
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          icon={<ChevronLeftIcon />}
        >
          {t.recipes.cookMode.previous}
        </Button>
        <Button
          variant='outline'
          size='lg'
          onClick={() => setShowIngredients(true)}
          icon={<ListChecksIcon />}
        >
          {t.recipes.cookMode.showIngredients}
        </Button>
        <Button
          size='lg'
          disabled={isLast}
          onClick={() => setStepIndex((i) => Math.min(total - 1, i + 1))}
          icon={<ChevronRightIcon />}
        >
          {t.recipes.cookMode.next}
        </Button>
      </footer>

      {showIngredients && (
        <IngredientsPanel
          ingredients={recipe.ingredients}
          onClose={() => setShowIngredients(false)}
        />
      )}
    </div>
  )
}

function IngredientsPanel({
  ingredients,
  onClose
}: {
  ingredients: Ingredient[]
  onClose: () => void
}) {
  const t = useTranslations()

  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-label={t.recipes.cookMode.ingredients}
      className='bg-background/95 absolute inset-0 z-10 flex flex-col backdrop-blur'
    >
      <header className='flex items-center justify-between border-b px-4 py-3'>
        <h3 className='text-lg font-bold'>{t.recipes.cookMode.ingredients}</h3>
        <Button
          variant='ghost'
          size='icon'
          aria-label={t.recipes.cookMode.hideIngredients}
          onClick={onClose}
          icon={<XIcon />}
        />
      </header>
      <ul className='flex flex-col gap-2 overflow-y-auto px-6 py-6 text-lg'>
        {ingredients.map((ingredient) => (
          <li key={ingredient.id}>{getIngredientDisplayText(ingredient)}</li>
        ))}
      </ul>
    </div>
  )
}

function StepTimerButton({ timer }: { timer: StepTimer }) {
  const t = useTranslations()
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    if (remaining === null || remaining <= 0) return
    const id = setTimeout(() => setRemaining((r) => (r ?? 0) - 1), 1000)
    return () => clearTimeout(id)
  }, [remaining])

  const isFinished = remaining === 0
  useEffect(() => {
    if (isFinished) {
      toast.success(t.recipes.cookMode.replace('timerDone', timer.label))
    }
  }, [isFinished, t, timer.label])

  if (remaining === null) {
    return (
      <Button
        variant='secondary'
        size='lg'
        onClick={() => setRemaining(timer.seconds)}
        icon={<TimerIcon />}
      >
        {t.recipes.cookMode.replace('setTimer', timer.label)}
      </Button>
    )
  }

  return (
    <div className='bg-accent flex items-center justify-center gap-2 rounded-md p-4 text-3xl font-bold tabular-nums'>
      <TimerIcon className='size-6' />
      {formatCountdown(remaining)}
    </div>
  )
}
