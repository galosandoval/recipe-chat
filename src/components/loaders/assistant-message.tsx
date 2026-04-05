'use client'

import { LoadingSpinner } from '~/components/loaders/loading-spinner'
import { RotatingPhrases } from '~/components/loaders/rotating-phrases'
import { useTranslations } from '~/hooks/use-translations'

export function AssistantMessageLoader() {
  const t = useTranslations()

  return (
    <div className='bg-transparent pb-4 pl-4'>
      <div className='mx-auto flex items-center justify-center gap-2'>
        <LoadingSpinner className='text-primary size-4 shrink-0' />
        <RotatingPhrases
          phrases={t.loaders.cookingPhrases as unknown as string[]}
        />
      </div>
    </div>
  )
}
