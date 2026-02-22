'use client'

import { useLayoutEffect } from 'react'
import { ScreenLoader } from '~/components/loaders/screen'
import { FiltersByUser } from './recipe-filters/recipe-filters'
import { ValueProps } from './value-props'
import { AssistantMessageLoader } from '~/components/loaders/assistant-message'
import {
  ScrollToBottomProvider,
  ScrollToBottomButton
} from '~/components/scroll-to-bottom-button'
import { useChatStore } from '~/stores/chat-store'
import { Stream } from './stream'
import type { MessageWithRecipes } from '~/schemas/chats-schema'
import { Message } from './message'

export const Interface = () => {
  const { messages, reset, chatId } = useChatStore()
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
      <div className='flex flex-1 flex-col gap-4'>
        <Chat messages={messages} />
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

function Messages({
  data
}: {
  data: MessageWithRecipes[]
}) {
  const { stream } = useChatStore()
  const isStreaming = !!stream

  return (
    <div className='bg-background mx-auto flex max-w-3xl flex-col gap-4 px-3 pt-4 pb-4'>
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
}
