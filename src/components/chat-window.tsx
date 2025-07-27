'use client'

import { type Message as PrismaMessage } from '@prisma/client'
import { memo, useContext, useEffect } from 'react'
import { ScreenLoader } from './loaders/screen'
import { type QueryStatus } from '@tanstack/react-query'
import { FiltersByUser, useFiltersByUser } from './recipe-filters'
import { ValueProps } from './value-props'
import { UserCircleIcon } from './icons'
import { ChatLoader } from './loaders/chat'
import { Button } from './button'
import { useSession } from 'next-auth/react'
import { useTranslations } from '~/hooks/use-translations'
import {
  SignUpModal,
  transformContentToRecipe,
  useAuthModal
} from './auth-modals'
import { type Message } from 'ai'
import { ScrollModeContext, ScrollToButtons } from './scroll-to-bottom'
import { useSessionChatId } from '~/hooks/use-session-chat-id'
import { chatStore } from '~/stores/chat'
import { useScrollToTop } from 'react-scroll-to-bottom'
import { useRouter } from 'next/navigation'
import { infoToastOptions } from './toast'
import toast from 'react-hot-toast'
import { api } from '~/trpc/react'
import { ChatsDrawer } from './chats-drawer'
import type { GeneratedMessage } from '~/schemas/chats'

export default function ChatWindow({
  aiSubmit,
  aiStop,
  aiIsLoading
}: {
  aiSubmit?: (input: string) => void
  aiStop?: () => void
  aiIsLoading?: boolean
}) {
  const { setScrollMode } = useContext(ScrollModeContext)
  const scrollToTop = useScrollToTop()
  const [chatId] = useSessionChatId()
  const isSessionStorageAvailable =
    typeof window !== 'undefined' && typeof chatId === 'string'

  const { messages, isSendingMessage, reset } = chatStore()

  const isNewChat =
    !chatId && !isSendingMessage && !aiIsLoading && messages.length === 0

  // don't scroll to bottom when showing value props
  useEffect(() => {
    if (isNewChat) {
      setScrollMode('top')
    } else {
      setScrollMode('bottom')
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
        <ValueProps aiSubmit={aiSubmit}>
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
          messages={messages as []}
          messagesStatus={'success' as QueryStatus}
          isSendingMessage={isSendingMessage || (aiIsLoading ?? false)}
        />
      </div>

      <ScrollToButtons enable={!isSendingMessage && !(aiIsLoading ?? false)} />

      <SignUpModal />
      <ChatsDrawer />
    </>
  )
}

function ChatWindowContent({
  messages,
  messagesStatus,
  isSendingMessage
}: {
  messagesStatus?: QueryStatus
  isSendingMessage: boolean
  messages: Message[]
}) {
  const { data } = useSession()

  if (messages.length || !data?.user?.id) {
    return (
      <div className='bg-base-100 h-full'>
        <MessageList
          data={messages as []}
          status={messagesStatus}
          isSendingMessage={isSendingMessage}
        />
      </div>
    )
  }

  return <ScreenLoader />
}

const MessageList = memo(function MessageList({
  data,
  status,
  isSendingMessage
}: {
  data: PrismaMessage[]
  status?: QueryStatus
  isSendingMessage: boolean
}) {
  const { stream } = chatStore()

  useEffect(() => {
    console.log('stream', stream)
  }, [stream])

  if (status === 'error') {
    return <p>Error</p>
  }

  const streamHasContent = stream.content || stream.recipes.length > 0

  return (
    <div className='bg-base-100 pt-2 pb-16'>
      {data.map((m, i) => (
        <Message
          message={m}
          key={m?.id || '' + i}
          isSendingMessage={isSendingMessage}
        />
      ))}

      {isSendingMessage &&
        !streamHasContent &&
        data.at(-1)?.role === 'user' && <ChatLoader />}
      <Stream stream={stream} />
    </div>
  )
})

function Stream({ stream }: { stream: GeneratedMessage }) {
  if (!stream.content && stream.recipes.length === 0) {
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
        <div className='prose grid w-full grid-flow-col place-items-end gap-2 self-center'></div>
      </div>
    </div>
  )
}

const Message = function Message({
  message,
  isSendingMessage
}: {
  message: PrismaMessage
  isSendingMessage: boolean
}) {
  if (message.role === 'assistant') {
    return (
      <AssistantMessage
        message={message}
        // handleSaveRecipe={handleSaveRecipe}
        isSendingMessage={isSendingMessage}
      />
    )
  }

  return (
    <div className='bg-base-200 flex flex-col items-center self-center p-4'>
      <div className='prose mx-auto w-full'>
        <div className='flex justify-end gap-2'>
          <div className='flex flex-col items-end'>
            <p className='mt-0 mb-0 whitespace-pre-line'>
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
}

function AssistantMessage({
  message,
  isSendingMessage
}: {
  message: PrismaMessage
  isSendingMessage: boolean
}) {
  const t = useTranslations()
  const router = useRouter()
  const { handleOpenSignUp } = useAuthModal()
  const { status: authStatus } = useSession()
  const isAuthenticated = authStatus === 'authenticated'
  const utils = api.useUtils()
  const { mutate: createRecipe, status: saveRecipeStatus } =
    api.recipes.create.useMutation({
      async onSuccess(_newRecipe, _messageId) {
        await utils.recipes.invalidate()
        // Since the relationship is Recipe -> Message (via messageId),
        // we don't need to update the message object
        // The recipe will be linked to the message via the messageId field

        toast.success(t.chatWindow.saveSuccess)
      },
      onError: (error) => {
        toast.error('Error: ' + error.message)
      }
    })

  const handleSaveRecipe = ({
    content,
    messageId
  }: {
    content: string
    messageId?: string
  }) => {
    if (!content) return

    if (!isAuthenticated) {
      handleOpenSignUp()

      toast(t.toast.signUp, infoToastOptions)
      return
    }

    const recipe = transformContentToRecipe({
      content
    })

    createRecipe({
      ...recipe,
      messageId
    })
  }

  return (
    <div className='flex flex-col p-4'>
      <div className='prose mx-auto w-full'>
        <div className='flex w-full justify-start gap-2 self-center'>
          <div>
            <UserCircleIcon />
          </div>

          <div className='prose flex flex-col pb-4'>
            <p className='mt-0 mb-0 whitespace-pre-line'>
              {removeBracketsAndQuotes(message.content) || ''}
            </p>
          </div>
        </div>
        <div className='prose grid w-full grid-flow-col place-items-end gap-2 self-center'>
          {!isSendingMessage ? (
            // Save
            <Button
              className='btn btn-outline'
              isLoading={saveRecipeStatus === 'pending'}
              onClick={() =>
                handleSaveRecipe({
                  content: message.content || '',
                  messageId: message.id
                })
              }
            >
              {t.chatWindow.save}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function removeBracketsAndQuotes(str: string) {
  // removes {} and [] and "" and , from string
  return str.replace(/[{}[\]""]/g, '').replace(/,/g, ' ')
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
