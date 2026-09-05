'use client'

import { useLayoutEffect } from 'react'
import { ScreenLoader } from '~/components/loaders/screen'
import { ChatWelcome } from './chat-welcome'
import { AssistantMessageLoader } from '~/components/loaders/assistant-message'
import { ScrollToBottomProvider } from '~/components/scroll-to-bottom-button'
import { useChatStore } from './chat-store'
import type { MessageWithRecipes } from '~/schemas/chats-schema'
import { Message } from './message'
import { AnimatePresence } from '~/components/motion/animate-presence'

export const Interface = () => {
  const { messages, reset, chatId } = useChatStore()
  const isNewChat = !chatId && messages.length === 0

  useLayoutEffect(() => {
    if (!chatId) {
      reset()
    }
  }, [chatId, reset])

  return (
    <ScrollToBottomProvider startAtBottom={!isNewChat}>
      <InterfaceContent isNewChat={isNewChat} messages={messages} />
    </ScrollToBottomProvider>
  )
}

/**
 * The chat's two states — welcome screen and messages — both rendered inside
 * the one scroller. The welcome screen used to render outside it with no
 * scroller of its own, so its overflow escaped the fixed-height chat wrapper
 * and slid under the composer.
 */
function InterfaceContent({
  isNewChat,
  messages
}: {
  isNewChat: boolean
  messages: MessageWithRecipes[]
}) {
  if (isNewChat) {
    return <ChatWelcome />
  }

  if (!messages.length) {
    return <ScreenLoader />
  }

  return <Messages data={messages} />
}

function Messages({ data }: { data: MessageWithRecipes[] }) {
  const isStreaming = useChatStore((s) => s.isStreaming)
  const lastUserMessageIndex = data.reduceRight(
    (found, msg, j) => (found !== -1 ? found : msg.role === 'user' ? j : -1),
    -1
  )
  const last = data.at(-1)
  const isLoading =
    isStreaming &&
    !!last &&
    (last.role === 'user' ||
      (last.role === 'assistant' && !last.content && !last.recipes?.length))

  return (
    <div className='bg-background mx-auto flex max-w-3xl flex-col gap-4 px-3 pt-4 pb-4'>
      {/* `initial={false}` makes messages already present on mount appear
          instantly; only messages added afterward fade-and-rise in, so the
          animation reads as "new" rather than firing on every re-render. Each
          `Message` wraps its own output in `FadeIn`, so a message that renders
          nothing stays absent (no empty flex gap). */}
      <AnimatePresence initial={false}>
        {data.map((m, i) => (
          <Message
            message={m}
            key={m?.id || '' + i}
            isLastMessage={lastUserMessageIndex === i}
          />
        ))}
      </AnimatePresence>

      {isLoading && <AssistantMessageLoader />}
    </div>
  )
}
