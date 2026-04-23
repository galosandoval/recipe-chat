'use client'

import { LoadingSpinner } from '~/components/loaders/loading-spinner'
import { RotatingPhrases } from '~/components/loaders/rotating-phrases'

export function AssistantMessageLoader() {
  return (
    <div className='bg-transparent pb-4 pl-4'>
      <div className='mx-auto flex items-center justify-center gap-2'>
        <LoadingSpinner className='text-primary size-4 shrink-0' />
        <RotatingPhrases />
      </div>
    </div>
  )
}
