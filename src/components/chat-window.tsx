import ScrollToBottom, {
  useScrollToBottom,
  useScrollToTop,
  useSticky
} from 'react-scroll-to-bottom'
import { Chat, Message, Message as PrismaMessage } from '@prisma/client'
import { ChatType } from 'hooks/chat'
import { memo, useEffect, useMemo } from 'react'
import { ScreenLoader } from './loaders/screen'
import { MutationStatus, QueryStatus } from '@tanstack/react-query'
import { RecipeFiltersType } from './recipe-filters'
import { ValueProps } from './value-props'
import { ChatsSideBarButton } from './chat-sidebar'
import {
  ArrowSmallDownIcon,
  ArrowSmallUpIcon,
  ChatBubbleLeftIcon,
  PlusIcon,
  UserCircleIcon
} from './icons'
import { ChatLoader } from './loaders/chat'
import { Button } from './button'
import { useSession } from 'next-auth/react'
import NoSsr from './no-ssr'

type MessageContentProps = Omit<
  ChatType,
  'input' | 'handleSubmit' | 'handleInputChange'
>

export default function ChatWindow(props: MessageContentProps) {
  return (
    // NoSsr prevents ScrollToBottom from creating class name on server side
    <NoSsr>
      <ScrollToBottom
        followButtonClassName='hidden'
        initialScrollBehavior='auto'
        className='h-full'
      >
        <Content {...props} />
      </ScrollToBottom>
    </NoSsr>
  )
}

const Content = memo(function Content(props: MessageContentProps) {
  const {
    chatId,
    recipeFilters,
    handleFillMessage,
    messages,
    isChatsModalOpen,
    isSendingMessage,
    isAuthenticated,
    handleStartNewChat,
    handleToggleChatsModal,
    handleGoToRecipe,
    handleSaveRecipe,
    handleChangeChat,
    saveRecipeStatus,
    fetchStatus: chatsFetchStatus,
    status: chatsQueryStatus,
    handleGetChatsOnSuccess
  } = props

  const scrollToBottom = useScrollToBottom()
  const scrollToTop = useScrollToTop()
  const [sticky] = useSticky()

  const momoizedRecipeFilters = useMemo(() => recipeFilters, [])

  const currentChatId = JSON.parse(
    sessionStorage.getItem('currentChatId') as string
  )

  const isSessionStorageAvailable =
    typeof window !== 'undefined' && typeof currentChatId === 'string'

  const isNewChat =
    (currentChatId === '' || currentChatId === null) &&
    !isSendingMessage &&
    messages.length === 0

  const isMessagesSuccess =
    chatsFetchStatus === 'idle' && chatsQueryStatus === 'success'

  const shouldBeLoading =
    isSessionStorageAvailable &&
    (messages.length === 0 || !isMessagesSuccess) &&
    chatsFetchStatus === 'fetching'

  useEffect(() => {
    if (isMessagesSuccess) {
      scrollToBottom({ behavior: 'auto' })
    }
  }, [chatsFetchStatus, chatsQueryStatus])

  if (isNewChat) {
    return (
      <div className='flex h-full flex-col gap-4 pb-16 pt-16'>
        <ValueProps handleFillMessage={handleFillMessage} />
      </div>
    )
  }
  if (shouldBeLoading && !isSendingMessage) {
    return <ScreenLoader />
  }

  return (
    <>
      <div className='flex h-full flex-col gap-4 pb-16 pt-16'>
        <ChatWindowContent
          saveRecipeStatus={saveRecipeStatus}
          handleGoToRecipe={handleGoToRecipe}
          handleSaveRecipe={handleSaveRecipe}
          recipeFilters={momoizedRecipeFilters}
          messages={messages as []}
          chatId={chatId}
          messagesStatus={'status' in props ? chatsQueryStatus : undefined}
          isChatsModalOpen={isChatsModalOpen}
          isSendingMessage={isSendingMessage}
          isAuthenticated={isAuthenticated}
          handleGetChatsOnSuccess={
            'handleGetChatsOnSuccess' in props
              ? handleGetChatsOnSuccess
              : undefined
          }
          handleChangeChat={
            'handleChangeChat' in props ? handleChangeChat : undefined
          }
          handleStartNewChat={handleStartNewChat}
          handleToggleChatsModal={handleToggleChatsModal}
        />
      </div>
      <div
        className={`absolute bottom-20 right-4 duration-300 transition-all${
          !sticky
            ? ' translate-y-0 opacity-100'
            : ' invisible translate-y-4 opacity-0'
        }`}
      >
        <button
          className='glass btn-circle btn'
          onClick={() => scrollToBottom({ behavior: 'smooth' })}
        >
          <ArrowSmallDownIcon />
        </button>
      </div>
      <div
        className={`absolute bottom-20 left-4 duration-300 transition-all${
          sticky && !isSendingMessage
            ? ' translate-y-0 opacity-100'
            : ' invisible translate-y-4 opacity-0'
        }`}
      >
        <button
          className='glass btn-circle btn'
          onClick={() => scrollToTop({ behavior: 'smooth' })}
        >
          <ArrowSmallUpIcon />
        </button>
      </div>
    </>
  )
})

function ChatWindowContent({
  messages,
  messagesStatus,
  recipeFilters,
  isAuthenticated,
  handleGetChatsOnSuccess,
  handleChangeChat,
  handleStartNewChat,
  handleToggleChatsModal,
  handleGoToRecipe,
  handleSaveRecipe,
  isChatsModalOpen,
  saveRecipeStatus,
  isSendingMessage,
  chatId
}: {
  messagesStatus?: QueryStatus
  recipeFilters: RecipeFiltersType
  isAuthenticated: boolean
  handleGetChatsOnSuccess?: (
    data: (Chat & {
      messages: Message[]
    })[]
  ) => void
  handleChangeChat?: (
    chat: Chat & {
      messages: PrismaMessage[]
    }
  ) => void

  handleStartNewChat: () => void
  handleToggleChatsModal: () => void
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
  console.log(messages.length)
  console.log(isSendingMessage)
  console.log(!data?.user?.id)

  if (messages.length || isSendingMessage || !data?.user?.id) {
    return (
      <div className='h-full bg-primary-content'>
        <MessageList
          saveRecipeStatus={saveRecipeStatus}
          handleGoToRecipe={handleGoToRecipe}
          handleSaveRecipe={handleSaveRecipe}
          recipeFilters={recipeFilters}
          data={messages as []}
          chatId={chatId}
          status={messagesStatus}
          isChatsModalOpen={isChatsModalOpen}
          isSendingMessage={isSendingMessage}
          isAuthenticated={isAuthenticated}
          handleGetChatsOnSuccess={handleGetChatsOnSuccess}
          handleChangeChat={handleChangeChat}
          handleStartNewChat={handleStartNewChat}
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
  recipeFilters,
  isChatsModalOpen,
  isAuthenticated,
  isSendingMessage,
  saveRecipeStatus,
  handleGetChatsOnSuccess,
  handleChangeChat,
  handleStartNewChat,
  handleToggleChatsModal,
  handleGoToRecipe,
  handleSaveRecipe
}: {
  data: PrismaMessage[]
  status?: QueryStatus
  chatId?: string
  isChatsModalOpen: boolean
  recipeFilters: RecipeFiltersType
  isSendingMessage: boolean
  isAuthenticated: boolean
  saveRecipeStatus: MutationStatus
  handleChangeChat?: (
    chat: Chat & {
      messages: PrismaMessage[]
    }
  ) => void
  handleStartNewChat: () => void
  handleToggleChatsModal: () => void
  handleGetChatsOnSuccess?: (
    data: (Chat & {
      messages: Message[]
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
      <div className='bg-base-100 py-2 '>
        <div className='prose mx-auto grid grid-cols-3 px-2'>
          {handleChangeChat && handleGetChatsOnSuccess && isAuthenticated ? (
            <ChatsSideBarButton
              chatId={chatId}
              isChatsModalOpen={isChatsModalOpen}
              recipeFilters={recipeFilters}
              handleChangeChat={handleChangeChat}
              handleToggleChatsModal={handleToggleChatsModal}
              onSuccess={handleGetChatsOnSuccess}
            />
          ) : (
            <div></div>
          )}
          <div className='flex items-center justify-center gap-2'>
            <h2 className='mb-2 mt-2'>Chat</h2>
            <ChatBubbleLeftIcon />
          </div>
          <button
            onClick={handleStartNewChat}
            className='btn-ghost btn-circle btn justify-self-end'
          >
            <PlusIcon />
          </button>
        </div>
      </div>
      <div className='pb-16 bg-primary-content'>
        {data.map((m, i) => (
          <Message
            message={m}
            key={m?.content || '' + i}
            isSendingMessage={isSendingMessage}
            handleGoToRecipe={handleGoToRecipe}
            handleSaveRecipe={handleSaveRecipe}
            saveRecipeStatus={saveRecipeStatus}
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
  handleGoToRecipe,
  handleSaveRecipe,
  saveRecipeStatus
}: {
  message: PrismaMessage
  isSendingMessage: boolean
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
  let recipeName = ''
  const nameIdx = message.content.toLowerCase().indexOf('name:')
  if (nameIdx !== -1) {
    const endIdx = message.content.indexOf('\n', nameIdx)
    if (endIdx !== -1) {
      recipeName = message.content.slice(nameIdx + 6, endIdx)
    }
  }

  if (message.role === 'assistant') {
    return (
      <div className='flex flex-col p-4'>
        <div className='prose mx-auto w-full'>
          <div className='flex w-full justify-start gap-2 self-center'>
            <div>
              <UserCircleIcon />
            </div>

            <div className='prose flex flex-col pb-12'>
              <p className='mb-0 mt-0 whitespace-pre-line'>
                {message.content || ''}
              </p>
            </div>
          </div>
          <div className='prose grid w-full grid-flow-col place-items-end gap-2 self-center'>
            {message?.recipeId ? (
              // Go to recipe
              <Button
                className='btn-ghost btn'
                onClick={() =>
                  handleGoToRecipe({
                    recipeId: message.recipeId,
                    recipeName: recipeName
                  })
                }
              >
                {/* <BookmarkSolidIcon /> */}
                Go to recipe
              </Button>
            ) : !isSendingMessage ? (
              // Save
              <Button
                className='btn-ghost btn'
                isLoading={saveRecipeStatus === 'loading'}
                onClick={() =>
                  handleSaveRecipe({
                    content: message.content || '',
                    messageId: message.id
                  })
                }
              >
                {/* <BookmarkOutlineIcon /> */}
                Save
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col items-center self-center bg-base-200 p-4'>
      <div className='prose mx-auto w-full'>
        <div className='flex justify-end gap-2'>
          <div className='flex flex-col items-end'>
            <p className='mb-0 mt-0 whitespace-pre-line'>
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
}
