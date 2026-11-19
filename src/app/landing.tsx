'use client'

import { useRef } from 'react'
import { ChevronUpIcon } from 'lucide-react'
import { useReducedMotion } from 'motion/react'
import { Chat } from './chat'
import { LandingHero } from './landing-hero'
import { LandingProof } from './landing-proof'
import { LandingKitchen } from './landing-kitchen'
import { LandingLoop } from './landing-loop'
import { SignUpDrawerDialog } from '~/components/auth/auth-drawer-dialogs'
import { CHAT_COMPOSER_INPUT_ID } from '~/components/chat/generate-message-form'
import { useTranslations } from '~/hooks/use-translations'

/**
 * Signed-out `/`: a marketing hero, then the "ask → answer" proof section, the
 * kitchen-context cards and the Grocery List → Pantry loop, stacked above the
 * live chat — the hero and the chat both full-height, so the
 * visitor reads the pitch first and scrolls into a working chat. The
 * chat's composer is `sticky` inside its own full-height section, so it pins to
 * the bottom only while the chat is on screen and never floats over the hero.
 *
 * The chat section is `h-full`, not `min-h-full`: a `min-height`-only section is
 * still auto-height, and an auto-height column flex container sizes to its
 * items' max-content (a `flex-1 basis-0` child does not collapse there). The
 * section grew to the full message list, the chat's own scroller went inert, and
 * the tail of the last message sat permanently under the sticky composer.
 *
 * Signed-in users never see this — they're redirected to `/chat` (see the `/`
 * page), which keeps the Onboarding Tour's first spotlight above the fold.
 */
export function Landing() {
  const t = useTranslations()
  const prefersReducedMotion = useReducedMotion()
  const landingRef = useRef<HTMLDivElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  const scrollToHero = () => {
    const landing = landingRef.current
    landing?.focus({ preventScroll: true })
    landing?.closest('[data-landing-scroll]')?.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'instant' : 'smooth'
    })
  }

  const scrollToChat = () => {
    chatRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const startChat = () => {
    scrollToChat()
    // Focus without a second jump-scroll so the smooth scroll above is what the
    // visitor sees; the composer sits at the bottom of the now-visible chat.
    const composer = document.getElementById(CHAT_COMPOSER_INPUT_ID)
    composer?.focus({ preventScroll: true })
  }

  const signUp = (
    <SignUpDrawerDialog
      trigger={
        <button
          type='button'
          className='text-foreground font-medium underline underline-offset-4'
        >
          {t.landing.hero.signUp}
        </button>
      }
    />
  )

  return (
    <div ref={landingRef} tabIndex={-1} className='h-full outline-none'>
      <LandingHero
        onStart={startChat}
        onScrollCue={scrollToChat}
        signUp={signUp}
      />
      <LandingProof />
      <LandingKitchen />
      <LandingLoop />
      <div ref={chatRef} className='flex h-full flex-col'>
        <Chat
          aboveComposer={
            <button
              type='button'
              aria-label={t.landing.hero.backToTop}
              onClick={scrollToHero}
              className='text-muted-foreground hover:text-foreground mb-8 flex size-11 shrink-0 items-center justify-center self-center rounded-md transition-colors'
            >
              <ChevronUpIcon aria-hidden='true' />
            </button>
          }
        />
      </div>
    </div>
  )
}
