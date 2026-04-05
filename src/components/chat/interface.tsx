'use client'

import { useLayoutEffect } from 'react'
import { ScreenLoader } from '~/components/loaders/screen'
import { ChatWelcome } from './chat-welcome'
import { AssistantMessageLoader } from '~/components/loaders/assistant-message'
import { ScrollToBottomProvider } from '~/components/scroll-to-bottom-button'
import { useChatStore } from '~/stores/chat-store'
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
        <ChatWelcome />
      </div>
    )
  }

  return (
    <ScrollToBottomProvider>
      <div className='flex flex-1 flex-col gap-4'>
        <Chat messages={messages} />
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

function Messages({ data }: { data: MessageWithRecipes[] }) {
  const isStreaming = useChatStore((s) => s.isStreaming)
  const lastUserMessageIndex = data.reduceRight(
    (found, msg, j) => (found !== -1 ? found : msg.role === 'user' ? j : -1),
    -1
  )

  return (
    <div className='bg-background mx-auto flex max-w-3xl flex-col gap-4 px-3 pt-4 pb-4'>
      {data.map((m, i) => (
        <Message
          message={m}
          key={m?.id || '' + i}
          isLastMessage={lastUserMessageIndex === i}
        />
      ))}

      {isStreaming && data.at(-1)?.role === 'user' ? (
        <AssistantMessageLoader />
      ) : null}
    </div>
  )
}
