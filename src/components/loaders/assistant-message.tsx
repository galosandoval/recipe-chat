'use client'

import { LoadingSpinner } from '~/components/loaders/loading-spinner'
import { RotatingPhrases } from '~/components/loaders/rotating-phrases'
import { FadeIn } from '~/components/motion/fade-in'
import { useTranslations } from '~/hooks/use-translations'

export function AssistantMessageLoader() {
  const t = useTranslations()

  // `FadeIn` gives the loader a fade-and-rise entrance when it pops up at the
  // start of a response, matching the message-bubble entrance. (Phrase-to-phrase
  // swaps are handled inside `RotatingPhrases`.)
  return (
    <FadeIn className='bg-transparent pb-4 pl-4'>
      <div className='mx-auto flex items-center justify-center gap-2'>
        <LoadingSpinner className='text-primary size-4 shrink-0' />
        <RotatingPhrases
          phrases={Object.values(t.loaders.cookingPhrases) as string[]}
        />
      </div>
    </FadeIn>
  )
}
