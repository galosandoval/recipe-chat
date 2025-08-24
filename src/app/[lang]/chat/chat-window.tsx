'use client'

import { memo, useContext, useEffect, useMemo } from 'react'
import { ScreenLoader } from '~/components/loaders/screen'
import { type QueryStatus } from '@tanstack/react-query'
import { FiltersByUser, useFiltersByUser } from '~/components/recipe-filters'
import { ValueProps } from '~/components/value-props'
import { UserCircleIcon } from '~/components/icons'
import { ChatLoader } from '~/components/loaders/chat'
import { useSession } from 'next-auth/react'
import { useTranslations } from '~/hooks/use-translations'
import { SignUpModal } from '~/components/auth-modals'
import {
  ScrollModeContext,
  ScrollToButtons
} from '~/components/scroll-to-bottom'
import { chatStore } from '~/stores/chat-store'
import { useScrollToTop } from 'react-scroll-to-bottom'
import { ChatsDrawer } from '~/components/chats-drawer'
import { Stream } from './stream'
import type { MessageWithRecipes } from '~/schemas/chats'
import { buildGenerateRecipeContent } from '~/utils/build-generate-recipe-content'
import { api } from '~/trpc/react'
import { GenerateStatusAppMessage } from './app-message'
import { CollapsableRecipe } from './collapsable-recipe'
import { RecipesToGenerate } from './recipes-to-generate'

export const ChatWindow = () => {
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
    <>
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
    </>
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

  if (status === 'error') {
    return <p>Error</p>
  }

  const streamHasContent = stream.content || stream.recipes.length > 0

  return (
    <div className='bg-base-100 flex flex-col gap-4 px-3 pt-4 pb-16'>
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
    return (
      <AssistantMessage
        message={message}
        // handleSaveRecipe={handleSaveRecipe}
        isStreaming={isStreaming}
      />
    )
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
        <ActiveFilters />
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
        <div className='flex w-full justify-start gap-2 self-center'>
          <div>
            <UserCircleIcon />
          </div>

          <div className='bg-base-300 flex flex-col rounded p-3 pb-4'>
            <p className='text-sm whitespace-pre-line'>
              {message.content || ''}
            </p>
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
          </div>
        </div>
      </div>
    </div>
  )
}

function ActiveFilters() {
  const { data: filters, status } = useFiltersByUser()
  const t = useTranslations()

  if (status === 'pending') {
    return null
  }

  if (status === 'error' || !filters) {
    return <div>{t.error.somethingWentWrong}</div>
  }
  const activeFilters = filters.filter((f) => f.checked)

  if (activeFilters.length === 0) {
    return null
  }

  return (
    <div className='flex gap-2 pt-2'>
      <h3 className='mt-0 mb-0 text-sm'>{t.filters.title}:</h3>
      {activeFilters.map((f) => (
        <div className='badge badge-primary badge-outline' key={f.id}>
          {f.name}
        </div>
      ))}
    </div>
  )
}
