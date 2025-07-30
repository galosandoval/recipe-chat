'use client'

import { UserCircleIcon } from './icons'
import type { GeneratedMessage } from '~/schemas/chats'
import { CollaplableRecipe } from './collapsable-recipe'
import { RecipesToGenerate } from './recipes-to-generate'

export function Stream({
  stream,
  isStreaming
}: {
  stream: GeneratedMessage
  isStreaming: boolean
}) {
  if (!isStreaming || !stream.content) return null

  return (
    <div className='flex flex-col'>
      <div className='mx-auto w-full'>
        <div className='flex w-full justify-start gap-2 self-center'>
          <div>
            <UserCircleIcon />
          </div>

          <div className='bg-base-300 flex flex-col rounded p-3 pb-4'>
            <p className='text-sm whitespace-pre-line'>{stream.content}</p>
            {stream.recipes?.length === 1 && (
              <CollaplableRecipe
                recipe={{ ...stream.recipes[0], id: '' }}
                isStreaming={isStreaming}
              />
            )}
            {stream.recipes && stream.recipes?.length > 1 && (
              <RecipesToGenerate
                recipes={stream.recipes}
                isStreaming={isStreaming}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
