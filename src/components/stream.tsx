'use client'

import { UserCircleIcon } from './icons'
import { useEffect } from 'react'
import type { GeneratedMessage } from '~/schemas/chats'
import { ChatRecipe } from './chat-recipe'

export function Stream({
  stream,
  isStreaming
}: {
  stream: GeneratedMessage
  isStreaming: boolean
}) {
  useEffect(() => {
    console.log('stream', stream)
  }, [stream])

  if (!isStreaming) {
    return null
  }

  return (
    <div className='flex flex-col p-4'>
      <div className='prose mx-auto w-full'>
        <div className='flex w-full justify-start gap-2 self-center'>
          <div>
            <UserCircleIcon />
          </div>

          <div className='prose flex flex-col pb-4'>
            <p className='mt-0 mb-0 whitespace-pre-line'>{stream.content}</p>
          </div>
        </div>
        <ChatRecipe recipes={stream.recipes} />
      </div>
    </div>
  )
}
