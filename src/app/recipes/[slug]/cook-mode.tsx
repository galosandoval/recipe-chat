'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ChefHatIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ListChecksIcon,
  TimerIcon,
  XIcon
} from 'lucide-react'
import type { Ingredient } from '~/generated/prisma/client'
import { Button } from '~/components/button'
import { toast } from '~/components/toast'
import { useRegisterFab } from '~/components/fab-stack/use-register-fab'
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
 * large text, per-step timers, and an ingredients overlay. Instructions are a
 * vertical scroll-snap list — the user flicks through them with a thumb and
 * each Instruction snaps to the top — with Previous/Next as a precise
 * alternative. Screen-wake is already handled by the recipe page's `useNoSleep`.
 *
 * TODO: not tier-gated yet — every user gets the trigger. Decide which tier
 * (and permission check) should gate this before launch.
 */
export function CookMode() {
  const { data: recipe } = useRecipe()
  const [isOpen, setIsOpen] = useState(false)

  if (!recipe) return null

  return (
    <>
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
  const scrollRef = useRef<HTMLOListElement>(null)
  const stepRefs = useRef<(HTMLElement | null)[]>([])

  const total = recipe.instructions.length
  useActiveStepOnScroll({ scrollRef, stepRefs, total, setStepIndex })

  const goToStep = useCallback(
    (index: number) => {
      const clamped = Math.min(total - 1, Math.max(0, index))
      setStepIndex(clamped)
      stepRefs.current[clamped]?.scrollIntoView?.({
        behavior: 'smooth',
        block: 'start'
      })
    },
    [total]
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
      <header className='flex items-center justify-between gap-3 border-b px-4 py-3'>
        <h2 className='truncate text-lg font-bold'>{recipe.name}</h2>
        <Button
          variant='ghost'
          size='icon'
          aria-label={t.recipes.cookMode.exit}
          onClick={onExit}
          icon={<XIcon />}
        />
      </header>

      {/* The scroll container is the list itself so each step's `min-h-full`
          resolves against a definite height. */}
      <ol
        ref={scrollRef}
        className='flex-1 snap-y snap-mandatory overflow-y-auto overscroll-contain'
      >
        {recipe.instructions.map((instruction, index) => (
          <StepSection
            key={instruction.id}
            ref={(node) => {
              stepRefs.current[index] = node
            }}
            index={index}
            total={total}
            description={instruction.description}
            isActive={index === stepIndex}
          />
        ))}
      </ol>

      <footer className='flex items-center justify-between gap-2 border-t px-3 py-3 sm:gap-3 sm:px-4 sm:py-4'>
        <Button
          variant='outline'
          size='lg'
          disabled={isFirst}
          onClick={() => goToStep(stepIndex - 1)}
          icon={<ChevronLeftIcon />}
        >
          <span className='sr-only sm:not-sr-only'>
            {t.recipes.cookMode.previous}
          </span>
        </Button>
        <Button
          variant='outline'
          size='lg'
          onClick={() => setShowIngredients(true)}
          icon={<ListChecksIcon />}
        >
          <span className='sr-only sm:not-sr-only'>
            {t.recipes.cookMode.showIngredients}
          </span>
        </Button>
        <Button
          size='lg'
          disabled={isLast}
          onClick={() => goToStep(stepIndex + 1)}
          icon={<ChevronRightIcon />}
        >
          <span className='sr-only sm:not-sr-only'>
            {t.recipes.cookMode.next}
          </span>
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

/**
 * One Instruction, sized to fill the scroll area so it snaps to the top on its
 * own. Taller steps (long text plus timers) simply overflow and scroll.
 */
function StepSection({
  ref,
  index,
  total,
  description,
  isActive
}: {
  ref: (node: HTMLLIElement | null) => void
  index: number
  total: number
  description: string
  isActive: boolean
}) {
  const t = useTranslations()
  const timers = useMemo(() => parseStepTimers(description), [description])

  return (
    <li
      ref={ref}
      data-step-index={index}
      aria-current={isActive ? 'step' : undefined}
      className='mx-auto flex min-h-full w-full max-w-2xl snap-start flex-col justify-center px-6 py-8 sm:px-8'
    >
      <p className='text-muted-foreground mb-4 text-sm font-semibold tracking-wide uppercase'>
        {t.recipes.cookMode.replace('stepOf', String(index + 1), String(total))}
      </p>
      <p
        className={`text-2xl leading-relaxed font-medium transition-opacity sm:text-3xl ${
          isActive ? 'opacity-100' : 'opacity-40'
        }`}
      >
        {description}
      </p>

      {timers.length > 0 && (
        <div className='mt-8 flex flex-col gap-3'>
          {timers.map((timer, timerIndex) => (
            <StepTimerButton
              key={`${timer.label}-${timerIndex}`}
              timer={timer}
            />
          ))}
        </div>
      )}
    </li>
  )
}

/**
 * Mirrors the user's scrolling back into `stepIndex` so the highlighted step
 * and the Previous/Next buttons stay in sync with whatever is on screen.
 */
function useActiveStepOnScroll({
  scrollRef,
  stepRefs,
  total,
  setStepIndex
}: {
  scrollRef: React.RefObject<HTMLOListElement | null>
  stepRefs: React.RefObject<(HTMLElement | null)[]>
  total: number
  setStepIndex: (index: number) => void
}) {
  useEffect(() => {
    const root = scrollRef.current
    if (!root || typeof IntersectionObserver === 'undefined') return

    const ratios = new Array<number>(total).fill(0)
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number(
            (entry.target as HTMLElement).dataset.stepIndex ?? -1
          )
          if (index >= 0) ratios[index] = entry.intersectionRatio
        }
        let best = 0
        for (let i = 1; i < ratios.length; i++) {
          if (ratios[i] > ratios[best]) best = i
        }
        setStepIndex(best)
      },
      { root, threshold: [0, 0.25, 0.5, 0.75, 1] }
    )

    for (const node of stepRefs.current) {
      if (node) observer.observe(node)
    }
    return () => observer.disconnect()
  }, [scrollRef, stepRefs, total, setStepIndex])
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
