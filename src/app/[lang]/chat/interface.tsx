'use client'

import { memo, useEffect } from 'react'
import { ScreenLoader } from '~/components/loaders/screen'
import { type QueryStatus } from '@tanstack/react-query'
import { FiltersByUser } from '~/app/[lang]/chat/recipe-filters/recipe-filters'
import { ValueProps } from './value-props'
import { AssistantMessageLoader } from '~/components/loaders/assistant-message'
import { useSession } from 'next-auth/react'
import {
  ScrollToBottomProvider,
  ScrollToBottomButton
} from '~/components/scroll-to-bottom-buttons'
import { chatStore } from '~/stores/chat-store'
import { Stream } from './stream'
import type { MessageWithRecipes } from '~/schemas/chats-schema'
import { api } from '~/trpc/react'
import { useUserId } from '~/hooks/use-user-id'
import { cn } from '~/lib/utils'
import { Message } from './message'

export const Interface = () => {
  const { messages, reset, chatId, streamingStatus } = chatStore()
  const session = useSession()
  const isStreaming = streamingStatus !== 'idle'

  const isNewChat = !chatId && !isStreaming && messages.length === 0

  useEffect(() => {
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
      <div className={cn('flex-1 pt-20', !session.data && 'pt-14')}>
        <div className='flex h-full flex-col gap-4'>
          <ChatWindowContent
            messages={messages}
            messagesStatus={'success' as QueryStatus}
            isStreaming={isStreaming}
          />
        </div>

        <ScrollToBottomButton />
      </div>
    </ScrollToBottomProvider>
  )
}

function ChatWindowContent({
  messages,
  messagesStatus,
  isStreaming
}: {
  messagesStatus?: QueryStatus
  isStreaming: boolean
  messages: MessageWithRecipes[]
}) {
  const { data } = useSession()
  if (messages.length || !data?.user?.id) {
    return (
      <div className='bg-background h-full'>
        <Messages
          data={messages as []}
          status={messagesStatus}
          isStreaming={isStreaming}
        />
      </div>
    )
  }

  return <ScreenLoader />
}

const Messages = memo(function Messages({
  data,
  status,
  isStreaming
}: {
  data: MessageWithRecipes[]
  status?: QueryStatus
  isStreaming: boolean
}) {
  const { stream } = chatStore()
  const utils = api.useUtils()
  const userId = useUserId()
  const filters = utils.filters.getByUserId.getData({ userId })

  if (status === 'error') {
    return <p>Error</p>
  }

  const streamHasContent = stream.content || stream.recipes.length > 0

  return (
    <div
      className={cn(
        'bg-background mx-auto flex max-w-3xl flex-col gap-4 px-3 pt-4 pb-16 sm:pb-24',
        filters?.length && 'pb-24 sm:pb-28'
      )}
    >
      {data.map((m, i) => (
        <Message
          message={m}
          key={m?.id || '' + i}
          isStreaming={isStreaming}
          isLastMessage={i === data.length - 1}
        />
      ))}

      {isStreaming && !streamHasContent && data.at(-1)?.role === 'user' && (
        <AssistantMessageLoader />
      )}
      <Stream stream={stream} isStreaming={isStreaming} />
    </div>
  )
})
