'use client'

import { useRef } from 'react'
import { Chat } from './chat'
import { LandingHero } from './landing-hero'
import { SignUpDrawerDialog } from '~/components/auth/auth-drawer-dialogs'
import { CHAT_COMPOSER_INPUT_ID } from '~/components/chat/generate-message-form'
import { useTranslations } from '~/hooks/use-translations'

/**
 * Signed-out `/`: a marketing hero stacked above the live chat, both full-height
 * so the visitor reads the pitch first and scrolls into a working chat. The
 * chat's composer is `sticky` inside its own full-height section, so it pins to
 * the bottom only while the chat is on screen and never floats over the hero.
 *
 * Signed-in users never see this — they're redirected to `/chat` (see the `/`
 * page), which keeps the Onboarding Tour's first spotlight above the fold.
 */
export function Landing() {
  const t = useTranslations()
  const chatRef = useRef<HTMLDivElement>(null)

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
    <div className='h-full'>
      <LandingHero
        onStart={startChat}
        onScrollCue={scrollToChat}
        signUp={signUp}
      />
      <div ref={chatRef} className='flex min-h-full flex-col'>
        <Chat />
      </div>
    </div>
  )
}
