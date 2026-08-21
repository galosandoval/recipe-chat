'use client'

import { BotMessageSquareIcon, SendIcon, UserCircleIcon } from 'lucide-react'
import { useTranslations } from '~/hooks/use-translations'
import { Button } from '~/components/button'
import { ChatMessage } from '~/components/chat/message'
import { RecipeOptionCard } from '~/components/chat/recipe-option-card'
import { Reveal } from '~/components/motion/reveal'
import { RevealItem } from '~/components/motion/reveal-item'

/** Seconds between two steps of the exchange, so they arrive one after another. */
const STEP_S = 0.12

/** The reply is the exchange's second step, so the options pick up at the third. */
const FIRST_OPTION_STEP = 2

/**
 * The landing page's aha moment, directly below the hero: a staged exchange
 * showing what the assistant actually returns before the visitor has typed
 * anything — their ask, the reply, and two Recipe Options, each step rising in
 * after the last off the single moment the section scrolls into view.
 *
 * Built from the chat's own {@link ChatMessage} and {@link RecipeOptionCard} so
 * it reads as the real product rather than a picture of one. Entirely static:
 * the copy comes from the translation catalog and nothing here calls the model.
 * {@link Reveal} carries the reduced-motion handling — the whole section renders
 * settled and static when the visitor asks for less motion.
 */
export function LandingProof() {
  const t = useTranslations()
  const options = [
    t.landing.proof.options.first,
    t.landing.proof.options.second
  ]

  return (
    <section className='flex flex-col items-center gap-6 px-4 py-16'>
      <Reveal className='flex w-full max-w-md flex-col gap-6'>
        <h2 className='text-center text-2xl font-semibold tracking-tight text-balance sm:text-3xl'>
          {t.landing.proof.heading}
        </h2>

        <ChatMessage
          content={t.landing.proof.ask}
          icon={<UserCircleIcon />}
          isUserMessage
        />
      </Reveal>

      <Reveal className='w-full max-w-md' delay={STEP_S}>
        <ChatMessage
          content={t.landing.proof.reply}
          icon={<BotMessageSquareIcon />}
        >
          <div className='grid grid-cols-1 items-stretch gap-2 pt-3 sm:grid-cols-2'>
            {options.map((option, index) => (
              <RevealItem
                key={option.name}
                delay={(FIRST_OPTION_STEP + index) * STEP_S}
                className='h-full'
              >
                <RecipeOptionCard
                  name={option.name}
                  description={option.description}
                  action={<GenerateButtonMock />}
                />
              </RevealItem>
            ))}
          </div>
        </ChatMessage>
      </Reveal>
    </section>
  )
}

/**
 * The Recipe Option's Generate button itself, with nothing behind it — the real
 * one needs a chat session, and the live chat below is where a visitor presses
 * it for real. Rendering the actual button rather than a lookalike is what keeps
 * this card indistinguishable from the chat's as `Button` changes. Hidden from
 * assistive tech and out of the tab order so it isn't offered as pressable.
 */
function GenerateButtonMock() {
  const t = useTranslations()

  return (
    <Button
      aria-hidden='true'
      tabIndex={-1}
      size='sm'
      variant='outline'
      icon={<SendIcon className='size-4' />}
    >
      {t.chat.generate}
    </Button>
  )
}
