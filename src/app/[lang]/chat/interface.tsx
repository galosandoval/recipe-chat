'use client'

import { memo, useLayoutEffect } from 'react'
import { ScreenLoader } from '~/components/loaders/screen'
import { FiltersByUser } from '~/app/[lang]/chat/recipe-filters/recipe-filters'
import { ValueProps } from './value-props'
import { AssistantMessageLoader } from '~/components/loaders/assistant-message'
import { useSession } from 'next-auth/react'
import {
  ScrollToBottomProvider,
  ScrollToBottomButton
} from '~/components/scroll-to-bottom-button'
import { chatStore } from '~/stores/chat-store'
import { Stream } from './stream'
import type { MessageWithRecipes } from '~/schemas/chats-schema'
import { cn } from '~/lib/utils'
import { Message } from './message'
import { useActiveFiltersByUserId } from '~/hooks/use-filters-by-user-id'

export const Interface = () => {
  const { messages, reset, chatId } = chatStore()
  const session = useSession()
  const isNewChat = !chatId && messages.length === 0

  useLayoutEffect(() => {
    if (!chatId) {
      reset()
    }
  }, [chatId, reset])

  if (isNewChat) {
    return (
      <div className='flex flex-col gap-4'>
        <ValueProps>
          <FiltersByUser />
        </ValueProps>
      </div>
    )
  }

  return (
    <ScrollToBottomProvider>
      <div className={cn('flex-1 pt-[4.8rem]', !session.data && 'pt-14')}>
        <div className='flex h-full flex-col gap-4'>
          <Chat messages={messages} />
        </div>

        <ScrollToBottomButton />
      </div>
    </ScrollToBottomProvider>
  )
}

function Chat({ messages }: { messages: MessageWithRecipes[] }) {
  if (messages.length) {
    return (
      <div className='bg-background h-full'>
        <Messages data={messages as []} />
      </div>
    )
  }

  return <ScreenLoader />
}

const Messages = memo(function Messages({
  data
}: {
  data: MessageWithRecipes[]
}) {
  const { stream } = chatStore()
  const { data: filters } = useActiveFiltersByUserId()
  const isStreaming = !!stream

  return (
    <div
      className={cn(
        'bg-background mx-auto flex max-w-3xl flex-col gap-4 px-3 pt-4 pb-[5.25rem] sm:pb-20',
        filters?.length && 'pb-[6.5rem] sm:pb-28'
      )}
    >
      {data.map((m, i) => (
        <Message
          message={m}
          key={m?.id || '' + i}
          isLastMessage={i === data.length - 1}
        />
      ))}

      {!isStreaming && data.at(-1)?.role === 'user' ? (
        <AssistantMessageLoader />
      ) : stream ? (
        <Stream stream={stream} />
      ) : null}
    </div>
  )
})
