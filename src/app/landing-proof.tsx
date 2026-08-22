'use client'

import { BotMessageSquareIcon, UserCircleIcon } from 'lucide-react'
import { useTranslations } from '~/hooks/use-translations'
import { ChatMessage } from '~/components/chat/message'
import { GenerateRecipeButton } from '~/components/chat/generate-recipe-button'
import { RecipeOptionCard } from '~/components/chat/recipe-option-card'
import { Reveal } from '~/components/motion/reveal'

/** Seconds between two steps of the exchange, so they arrive one after another. */
const STEP_SECONDS = 0.12

/** The reply is the exchange's second step, so the options pick up at the third. */
const FIRST_OPTION_STEP = 2

/** How long the given step of the exchange holds before it rises in. */
function stepDelay(step: number) {
  return step * STEP_SECONDS
}

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

      <Reveal className='w-full max-w-md' delay={stepDelay(1)}>
        <ChatMessage
          content={t.landing.proof.reply}
          icon={<BotMessageSquareIcon />}
        >
          <div className='grid grid-cols-1 items-stretch gap-2 pt-3 sm:grid-cols-2'>
            {options.map((option, index) => (
              <Reveal
                key={option.name}
                trigger='parent'
                delay={stepDelay(FIRST_OPTION_STEP + index)}
                className='h-full'
              >
                <RecipeOptionCard
                  name={option.name}
                  description={option.description}
                  action={<GenerateRecipeButton isDecorative />}
                />
              </Reveal>
            ))}
          </div>
        </ChatMessage>
      </Reveal>
    </section>
  )
}
