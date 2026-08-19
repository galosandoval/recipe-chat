'use client'

import { ChevronDownIcon, SendIcon } from 'lucide-react'
import { useTranslations } from '~/hooks/use-translations'
import { Button } from '~/components/button'
import { Reveal } from '~/components/motion/reveal'

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

        <ComposerMock prompt={t.landing.hero.examplePrompt} />

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
 * bar with an example prompt queued up, but nothing here is interactive (the
 * live composer lives in the chat below). Hidden from assistive tech so it isn't
 * announced as a real field.
 */
function ComposerMock({ prompt }: { prompt: string }) {
  return (
    <div
      aria-hidden='true'
      className='bg-accent/55 glass-element flex w-full items-center gap-1.5 rounded-lg p-3'
    >
      <span className='border-input text-muted-foreground flex h-9 flex-1 items-center rounded-md border bg-transparent px-3 text-left text-sm'>
        {prompt}
      </span>
      <span className='border-input text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-md border'>
        <SendIcon className='size-4' />
      </span>
    </div>
  )
}
