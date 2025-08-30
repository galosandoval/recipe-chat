'use client'

import { memo, useContext, useEffect, useMemo } from 'react'
import { ScreenLoader } from '~/components/loaders/screen'
import { type QueryStatus } from '@tanstack/react-query'
import { FiltersByUser } from '~/app/[lang]/chat/recipe-filters/recipe-filters'
import { ValueProps } from './value-props'
import { UserCircleIcon } from '~/components/icons'
import { ChatLoader } from '~/components/loaders/chat'
import { useSession } from 'next-auth/react'
import { useTranslations } from '~/hooks/use-translations'
import {
  ScrollModeContext,
  ScrollToBottomProvider,
  ScrollToButtons
} from '~/components/scroll-to-bottom-buttons'
import { chatStore } from '~/stores/chat-store'
import { useScrollToTop } from 'react-scroll-to-bottom'
import { ChatsDrawer } from '~/components/chats-drawer'
import { Stream } from './stream'
import type { MessageWithRecipes } from '~/schemas/chats-schema'
import { buildGenerateRecipeContent } from '~/utils/build-generate-recipe-content'
import { api } from '~/trpc/react'
import { GenerateStatusAppMessage } from './app-message'
import { CollapsableRecipe } from './collapsable-recipe'
import { RecipesToGenerate } from './recipes-to-generate'
import { useUserId } from '~/hooks/use-user-id'
import { cn } from '~/utils/cn'
import { SignUpModal } from '~/components/auth/auth-modals'
import { ChatMessage } from '~/app/[lang]/chat/message'

export const Interface = () => {
  const { setScrollMode } = useContext(ScrollModeContext)
  const scrollToTop = useScrollToTop()

  const { messages, reset, chatId, streamingStatus } = chatStore()
  const isStreaming = streamingStatus !== 'idle'

  const isNewChat = !chatId && !isStreaming && messages.length === 0

  // don't scroll to bottom when showing value props
  useEffect(() => {
    if (isNewChat) {
      setScrollMode('top')
    }
  }, [isNewChat])

  useEffect(() => {
    if (!chatId) {
      reset()
      scrollToTop({
        behavior: 'auto'
      })
    }
  }, [chatId, reset])

  if (isNewChat) {
    return (
      <div className='flex flex-col gap-4'>
        <ValueProps>
          <FiltersByUser />
        </ValueProps>
        <ChatsDrawer />
      </div>
    )
  }

  return (
    <ScrollToBottomProvider>
      <div className='flex-1 pt-20'>
        <div className='flex h-full flex-col gap-4'>
          <ChatWindowContent
            messages={messages}
            messagesStatus={'success' as QueryStatus}
            isStreaming={isStreaming}
          />
        </div>

        <ScrollToButtons enable={!isStreaming} />

        <SignUpModal />
        <ChatsDrawer />
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
      <div className='bg-base-100 h-full'>
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
        'bg-base-100 mx-auto flex max-w-3xl flex-col gap-4 px-3 pt-4 pb-16 sm:pb-24',
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
        <ChatLoader />
      )}
      <Stream stream={stream} isStreaming={isStreaming} />
    </div>
  )
})

const Message = function Message({
  message,
  isStreaming,
  isLastMessage
}: {
  message: MessageWithRecipes
  isStreaming: boolean
  isLastMessage: boolean
}) {
  if (message.role === 'assistant') {
    return <AssistantMessage message={message} isStreaming={isStreaming} />
  }

  return (
    <UserMessage
      message={message}
      isStreaming={isStreaming}
      isLastMessage={isLastMessage}
    />
  )
}

const UserMessage = memo(function UserMessage({
  message,
  isStreaming,
  isLastMessage
}: {
  message: MessageWithRecipes
  isStreaming: boolean
  isLastMessage: boolean
}) {
  const t = useTranslations()
  const utils = api.useUtils()
  const foundMessage = useMemo(() => {
    const chatId = chatStore.getState().chatId
    const data = utils.chats.getMessagesById.getData({ chatId: chatId ?? '' })
    const allRecipes =
      data?.messages.flatMap((m) => m.recipes)?.flatMap((r) => r.recipe) ?? []

    return allRecipes.find(
      (r) =>
        message.content ===
        buildGenerateRecipeContent(
          t.chatWindow.generateRecipe,
          r.name ?? '',
          r.description ?? ''
        )
    )
  }, [message.content])

  if (foundMessage) {
    return (
      <GenerateStatusAppMessage
        recipeName={foundMessage.name}
        isStreaming={isStreaming && isLastMessage}
      />
    )
  }

  return (
    <div className='flex flex-col items-center self-end'>
      <div className='mx-auto w-full'>
        <div className='flex justify-end gap-2'>
          <div className='flex flex-col items-end'>
            <p className='bg-primary text-primary-content rounded p-3 text-sm whitespace-pre-line'>
              {message?.content || ''}
            </p>
          </div>
          <div>
            <UserCircleIcon />
          </div>
        </div>
      </div>
    </div>
  )
})

function AssistantMessage({
  message,
  isStreaming
}: {
  message: MessageWithRecipes
  isStreaming: boolean
}) {
  return (
    <div className='flex flex-col'>
      <div className='mx-auto w-full'>
        <ChatMessage
          content={message.content}
          icon={<UserCircleIcon />}
          bubbleContent={
            <>
              {message.recipes?.length === 1 && (
                <CollapsableRecipe
                  isStreaming={isStreaming}
                  recipe={message.recipes[0]}
                />
              )}
              {message.recipes && message.recipes?.length > 1 && (
                <RecipesToGenerate
                  isStreaming={isStreaming}
                  recipes={message.recipes}
                />
              )}
            </>
          }
        />
      </div>
    </div>
  )
}
