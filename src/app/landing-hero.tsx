'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDownIcon, SendIcon } from 'lucide-react'
import { useReducedMotion } from 'motion/react'
import { useTranslations } from '~/hooks/use-translations'
import { useObervationObserver } from '~/hooks/use-observation-observer'
import { Button } from '~/components/button'
import { Reveal } from '~/components/motion/reveal'
import { cn } from '~/lib/utils'

/** How long each example prompt holds on screen before the next rises in. */
const PROMPT_HOLD_MS = 3200

/**
 * Signed-out first screen on `/`. A full-height marketing hero that sits above
 * the live chat: an outcome-led headline, the one-line mechanism, a
 * non-functional composer mock previewing a real prompt, the primary call to
 * action, a secondary sign-up link, and a scroll cue.
 *
 * It owns none of the scroll/focus wiring — `onStart` (the call to action) and
 * `onScrollCue` are supplied by {@link Landing}, which holds the chat ref.
 */
export function LandingHero({
  onStart,
  onScrollCue,
  signUp
}: {
  onStart: () => void
  onScrollCue: () => void
  signUp: React.ReactNode
}) {
  const t = useTranslations()

  return (
    <section className='relative flex min-h-full flex-col items-center justify-center gap-8 px-6 py-16 text-center'>
      <Reveal className='flex w-full max-w-md flex-col items-center gap-6'>
        <div className='flex flex-col gap-3'>
          <h1 className='text-3xl font-semibold tracking-tight text-balance sm:text-4xl'>
            {t.landing.hero.headline}
          </h1>
          <p className='text-muted-foreground text-base text-balance'>
            {t.landing.hero.tagline}
          </p>
        </div>

        <ComposerMock
          prompts={Object.values(t.landing.hero.examplePrompts) as string[]}
        />

        <div className='flex w-full flex-col items-center gap-3'>
          <Button className='w-full' size='lg' onClick={onStart}>
            {t.landing.hero.cta}
          </Button>
          <p className='text-muted-foreground text-sm'>
            {t.landing.hero.signUpPrompt} {signUp}
          </p>
        </div>
      </Reveal>

      <button
        type='button'
        onClick={onScrollCue}
        aria-label={t.landing.hero.scrollCue}
        className='text-muted-foreground hover:text-foreground absolute bottom-6 flex size-11 items-center justify-center transition-colors'
      >
        <ChevronDownIcon className='motion-safe:animate-bounce' />
      </button>
    </section>
  )
}

/**
 * A static, inert preview of the chat composer — it looks like the real input
 * bar with example prompts queued up, but nothing here is interactive (the live
 * composer lives in the chat below). Hidden from assistive tech so it isn't
 * announced as a real field.
 */
function ComposerMock({ prompts }: { prompts: string[] }) {
  return (
    <div
      aria-hidden='true'
      className='bg-accent/55 glass-element flex w-full items-center gap-1.5 rounded-lg p-3'
    >
      <div className='border-input flex h-9 flex-1 items-center rounded-md border bg-transparent px-3'>
        <CyclingPrompt prompts={prompts} />
      </div>
      <span className='border-input text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-md border'>
        <SendIcon className='size-4' />
      </span>
    </div>
  )
}

/**
 * Cycles the composer mock through the real example prompts to show, within a
 * few seconds, that the assistant understands natural asks. Each prompt rises
 * in, holds long enough to read ({@link PROMPT_HOLD_MS}), then slides out as the
 * next arrives — reusing the app's `phrase-enter`/`phrase-exit` keyframes.
 *
 * Cycling pauses whenever it can't be seen: `prefers-reduced-motion` stops it
 * entirely (one prompt shows, static), and scrolling the hero out of view parks
 * it until the mock returns, so it never animates off-screen.
 */
function CyclingPrompt({ prompts }: { prompts: string[] }) {
  const prefersReducedMotion = useReducedMotion()
  const [ref, observation] = useObervationObserver()
  const isInView = observation ? observation.isIntersecting : true

  const indexRef = useRef(0)
  const [current, setCurrent] = useState(0)
  const [incoming, setIncoming] = useState<number | null>(null)

  const shouldCycle = !prefersReducedMotion && isInView && prompts.length > 1

  useEffect(() => {
    if (!shouldCycle) return

    const timer = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % prompts.length
      setIncoming(indexRef.current)
    }, PROMPT_HOLD_MS)

    return () => clearInterval(timer)
  }, [shouldCycle, prompts.length])

  // The incoming phrase has finished rising in — settle it as the current one.
  function handleIncomingSettled() {
    if (incoming === null) return
    setCurrent(incoming)
    setIncoming(null)
  }

  const spanClassName =
    'text-muted-foreground absolute inset-0 flex items-center text-left text-sm'

  return (
    <div ref={ref} className='relative h-full flex-1 overflow-hidden'>
      <span className={cn(spanClassName, incoming !== null && 'phrase-exit')}>
        {prompts[current]}
      </span>
      {incoming !== null && (
        <span
          className={cn(spanClassName, 'phrase-enter')}
          onAnimationEnd={handleIncomingSettled}
        >
          {prompts[incoming]}
        </span>
      )}
    </div>
  )
}
