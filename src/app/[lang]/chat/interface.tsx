'use client'

import { memo, useEffect } from 'react'
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
      <div className={cn('flex-1 pt-[4.8rem]', !session.data && 'pt-14')}>
        <div className='flex h-full flex-col gap-4'>
          <ChatWindowContent messages={messages} />
        </div>

        <ScrollToBottomButton />
      </div>
    </ScrollToBottomProvider>
  )
}

function ChatWindowContent({ messages }: { messages: MessageWithRecipes[] }) {
  const { data } = useSession()
  if (messages.length || !data?.user?.id) {
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
  const streamHasContent = !!stream.content

  useEffect(() => {
    console.log('streamHasContent', streamHasContent)
  }, [streamHasContent])

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
          isStreaming={streamHasContent}
          isLastMessage={i === data.length - 1}
        />
      ))}

      {!streamHasContent && data.at(-1)?.role === 'user' && (
        <AssistantMessageLoader />
      )}
      <Stream stream={stream} isStreaming={streamHasContent} />
    </div>
  )
})
