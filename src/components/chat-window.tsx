'use client'

import { type Chat, type Message as PrismaMessage } from '@prisma/client'
import { transformContentToRecipe, useChat } from '~/hooks/use-chat'
import { memo, useContext, useEffect } from 'react'
import { ScreenLoader } from './loaders/screen'
import { type MutationStatus, type QueryStatus } from '@tanstack/react-query'
import { FiltersByUser, useFiltersByUser } from './recipe-filters'
import { ValueProps } from './value-props'
import { ChatsSection, ChatsSideBarButton } from './chats'
import { ChatBubbleLeftIcon, PlusIcon, UserCircleIcon } from './icons'
import { ChatLoader } from './loaders/chat'
import { Button } from './button'
import { useSession } from 'next-auth/react'
import { useTranslations } from '~/hooks/use-translations'
import { SignUpModal } from './auth-modals'
import { type Message } from 'ai'
import { ScrollModeContext, ScrollToButtons } from './scroll-to-bottom'
import { useSessionChatId } from '~/hooks/use-session-chat-id'
import { useRecipeChat } from '~/hooks/use-recipe-chat'
import { useScrollToTop } from 'react-scroll-to-bottom'

export default function ChatWindow() {
  const {
    // filters,
    handleFillMessage,
    isChatsModalOpen,
    isAuthenticated,
    handleToggleChatsModal,
    handleGoToRecipe,
    handleSaveRecipe,
    handleChangeChat,
    createRecipeStatus,
    handleCloseSignUpModal,
    handleSubmitCreds,
    isSigningUp,
    isSignUpModalOpen,
    onSubmitCreds,
    registerCreds,
    signUpErrors,
    // status: chatsQueryStatus,
    handleGetChatsOnSuccess
  } = useChat()

  const { setScrollMode } = useContext(ScrollModeContext)
  const scrollToTop = useScrollToTop()
  const [chatId] = useSessionChatId()
  const isSessionStorageAvailable =
    typeof window !== 'undefined' && typeof chatId === 'string'

  const {
    messages,
    isSendingMessage,
    chatsFetchStatus,
    chatsQueryStatus,
    setMessages
  } = useRecipeChat()
  const isNewChat = !chatId && !isSendingMessage && messages.length === 0

  const isMessagesSuccess =
    chatsFetchStatus === 'idle' && chatsQueryStatus === 'success'

  const shouldBeLoading =
    isSessionStorageAvailable &&
    (messages.length === 0 || !isMessagesSuccess) &&
    chatsFetchStatus === 'fetching'

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
      setMessages([])
      stop()
      scrollToTop({
        behavior: 'smooth'
      })
    }
  }, [chatId])

  if (isNewChat) {
    return (
      <div className='flex flex-col gap-4'>
        {/*  eslint-disable-next-line @typescript-eslint/no-unsafe-call */}
        <ValueProps handleSendChatExample={handleFillMessage as any}>
          <ChatsSection chatId={chatId} handleChangeChat={handleChangeChat} />

          <FiltersByUser />
        </ValueProps>
      </div>
    )
  }
  if (shouldBeLoading && !isSendingMessage) {
    return <ScreenLoader />
  }

  return (
    <>
      <div className='flex h-full flex-col gap-4'>
        <ChatWindowContent
          saveRecipeStatus={createRecipeStatus}
          handleGoToRecipe={handleGoToRecipe}
          handleSaveRecipe={handleSaveRecipe}
          messages={messages as []}
          chatId={chatId}
          messagesStatus={chatsQueryStatus}
          isChatsModalOpen={isChatsModalOpen}
          isSendingMessage={isSendingMessage}
          isAuthenticated={isAuthenticated}
          handleGetChatsOnSuccess={handleGetChatsOnSuccess}
          handleChangeChat={handleChangeChat}
          handleToggleChatsModal={handleToggleChatsModal}
        />
      </div>

      <ScrollToButtons enable={!isSendingMessage} />

      <SignUpModal
        closeModal={handleCloseSignUpModal}
        errors={signUpErrors}
        handleSubmit={handleSubmitCreds}
        isLoading={isSigningUp}
        isOpen={isSignUpModalOpen}
        onSubmit={onSubmitCreds}
        register={registerCreds}
      />
    </>
  )
}

function ChatWindowContent({
  messages,
  messagesStatus,
  isAuthenticated,
  handleGetChatsOnSuccess,
  handleChangeChat,
  handleToggleChatsModal,
  handleGoToRecipe,
  handleSaveRecipe,
  // filters,
  isChatsModalOpen,
  saveRecipeStatus,
  isSendingMessage,
  chatId
}: {
  messagesStatus?: QueryStatus
  isAuthenticated: boolean
  handleGetChatsOnSuccess?: (
    data: (Chat & {
      messages: PrismaMessage[]
    })[]
  ) => void
  handleChangeChat?: (
    chat: Chat & {
      messages: PrismaMessage[]
    }
  ) => void

  handleToggleChatsModal: () => void
  // filters: Filter[]
  isChatsModalOpen: boolean
  isSendingMessage: boolean
  chatId?: string
  messages: Message[]
  saveRecipeStatus: MutationStatus
  handleGoToRecipe: ({
    recipeId,
    recipeName
  }: {
    recipeId: string | null
    recipeName: string
  }) => void
  handleSaveRecipe: ({
    content,
    messageId
  }: {
    content: string
    messageId?: string | undefined
  }) => void
}) {
  const { data } = useSession()

  if (messages.length || !data?.user?.id) {
    return (
      <div className='bg-base-100 h-full'>
        <MessageList
          saveRecipeStatus={saveRecipeStatus}
          handleGoToRecipe={handleGoToRecipe}
          handleSaveRecipe={handleSaveRecipe}
          data={messages as []}
          chatId={chatId}
          status={messagesStatus}
          isChatsModalOpen={isChatsModalOpen}
          isSendingMessage={isSendingMessage}
          isAuthenticated={isAuthenticated}
          // filters={filters}
          handleGetChatsOnSuccess={handleGetChatsOnSuccess}
          handleChangeChat={handleChangeChat}
          handleToggleChatsModal={handleToggleChatsModal}
        />
      </div>
    )
  }

  return <ScreenLoader />
}

const MessageList = memo(function MessageList({
  data,
  status,
  chatId,
  isChatsModalOpen,
  isAuthenticated,
  isSendingMessage,
  saveRecipeStatus,
  // filters,
  handleGetChatsOnSuccess,
  handleChangeChat,
  handleToggleChatsModal,
  handleGoToRecipe,
  handleSaveRecipe
}: {
  data: PrismaMessage[]
  status?: QueryStatus
  chatId?: string
  isChatsModalOpen: boolean
  isSendingMessage: boolean
  isAuthenticated: boolean
  saveRecipeStatus: MutationStatus
  // filters: Filter[]
  handleChangeChat?: (
    chat: Chat & {
      messages: PrismaMessage[]
    }
  ) => void
  handleToggleChatsModal: () => void
  handleGetChatsOnSuccess?: (
    data: (Chat & {
      messages: PrismaMessage[]
    })[]
  ) => void
  handleGoToRecipe: ({
    recipeId,
    recipeName
  }: {
    recipeId: string | null
    recipeName: string
  }) => void
  handleSaveRecipe: ({
    content,
    messageId
  }: {
    content: string
    messageId?: string | undefined
  }) => void
}) {
  if (status === 'error') {
    return <p>Error</p>
  }

  return (
    <>
      <div className='bg-base-100 pb-2'>
        <div className='prose mx-auto grid grid-cols-3 place-items-center px-2'>
          {handleChangeChat && handleGetChatsOnSuccess && isAuthenticated ? (
            <ChatsSideBarButton
              chatId={chatId}
              isChatsModalOpen={isChatsModalOpen}
              handleChangeChat={handleChangeChat}
              handleToggleChatsModal={handleToggleChatsModal}
              // onSuccess={handleGetChatsOnSuccess}
            />
          ) : (
            <div></div>
          )}

          <div className='flex items-center justify-center gap-2'>
            <h2 className='mt-2 mb-2'>Chat</h2>
            <ChatBubbleLeftIcon />
          </div>

          <button
            // onClick={handleStartNewChat}
            className='btn btn-circle btn-ghost justify-self-end'
          >
            <PlusIcon />
          </button>
        </div>
      </div>

      <div className='bg-base-100 pb-16'>
        {data.map((m, i) => (
          <Message
            message={m}
            key={m?.id || '' + i}
            isSendingMessage={isSendingMessage}
            handleGoToRecipe={handleGoToRecipe}
            handleSaveRecipe={handleSaveRecipe}
            saveRecipeStatus={saveRecipeStatus}
            // filters={filters}
          />
        ))}

        {isSendingMessage && data.at(-1)?.role === 'user' && <ChatLoader />}
      </div>
    </>
  )
})

const Message = function Message({
  message,
  isSendingMessage,
  // filters,
  handleGoToRecipe,
  handleSaveRecipe,
  saveRecipeStatus
}: {
  message: PrismaMessage
  isSendingMessage: boolean
  saveRecipeStatus: MutationStatus
  // filters: Filter[]
  handleGoToRecipe: ({
    recipeId,
    recipeName
  }: {
    recipeId: string | null
    recipeName: string
  }) => void
  handleSaveRecipe: ({
    content,
    messageId
  }: {
    content: string
    messageId?: string | undefined
  }) => void
}) {
  const t = useTranslations()

  if (message.role === 'assistant') {
    const goToRecipe = ({ recipeId }: { recipeId: string | null }) => {
      const recipe = transformContentToRecipe({ content: message.content })
      const recipeName = recipe.name

      handleGoToRecipe({
        recipeId,
        recipeName
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
            {message?.recipeId ? (
              // Go to recipe
              <Button
                className='btn btn-outline'
                onClick={() =>
                  goToRecipe({
                    recipeId: message.recipeId
                  })
                }
              >
                {t.chatWindow.toRecipe}
              </Button>
            ) : !isSendingMessage ? (
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
