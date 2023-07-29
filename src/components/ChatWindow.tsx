import ScrollToBottom, {
  useScrollToBottom,
  useSticky
} from 'react-scroll-to-bottom'
import { Chat, Message, Message as PrismaMessage } from '@prisma/client'
import { ChatType, useSaveRecipe } from 'hooks/chatHooks'
import { memo, useEffect, useMemo } from 'react'
import { ScreenLoader } from './loaders/ScreenLoader'
import { QueryStatus } from '@tanstack/react-query'
import { RecipeFiltersType } from './RecipeFilters'
import { ValueProps } from './ValueProps'
import { ChatsSideBarButton } from './ChatsSideBar'
import {
  ArrowSmallDownIcon,
  BookmarkOutlineIcon,
  BookmarkSolidIcon,
  ChatBubbleLeftIcon,
  PlusIcon,
  UserCircleIcon
} from './Icons'
import { ChatLoader } from './loaders/ChatLoader'
import { Button } from './Button'
import { useSession } from 'next-auth/react'
import NoSsr from './NoSsr'

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
    state,
    recipeFilters,
    handleFillMessage,
    messages,
    isChatsModalOpen,
    isSendingMessage,
    handleStartNewChat,
    handleToggleChatsModal,
    fetchStatus: chatsFetchStatus,
    status: chatsQueryStatus
  } = props

  const scrollToBottom = useScrollToBottom()
  const [sticky] = useSticky()

  const momoizedRecipeFilters = useMemo(() => recipeFilters, [])

  const isLocalStorageAvailable =
    typeof window !== 'undefined' &&
    typeof localStorage.currentChatId === 'string' &&
    JSON.parse(localStorage.currentChatId) === 0

  const isMessagesSuccess =
    chatsFetchStatus === 'idle' && chatsQueryStatus === 'success'

  const shouldBeLoading = isLocalStorageAvailable && !isMessagesSuccess

  useEffect(() => {
    if (isMessagesSuccess) {
      scrollToBottom({ behavior: 'auto' })
    }
  }, [chatsFetchStatus, chatsQueryStatus])

  if (
    (messages.length === 0 || !messages.length) &&
    chatsQueryStatus !== 'success'
  ) {
    return (
      <div className='flex h-full flex-col gap-4 pb-16 pt-16'>
        <ValueProps handleFillMessage={handleFillMessage} />
      </div>
    )
  }

  if (
    ('status' in props &&
      chatsQueryStatus === 'loading' &&
      'fetchStatus' in props &&
      chatsFetchStatus !== 'idle') ||
    (shouldBeLoading && messages.length === 0)
  ) {
    return <ScreenLoader />
  }

  return (
    <>
      <div className='flex h-full flex-col gap-4 pb-16 pt-16'>
        <ChatWindowContent
          recipeFilters={momoizedRecipeFilters}
          messages={messages as []}
          chatId={state?.chatId}
          messagesStatus={'status' in props ? chatsQueryStatus : undefined}
          isChatsModalOpen={isChatsModalOpen}
          isSendingMessage={isSendingMessage}
          handleGetChatsOnSuccess={
            'handleGetChatsOnSuccess' in props
              ? props.handleGetChatsOnSuccess
              : undefined
          }
          handleChangeChat={
            'handleChangeChat' in props ? props.handleChangeChat : undefined
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
    </>
  )
})

function ChatWindowContent({
  messages,
  messagesStatus,
  recipeFilters,
  handleGetChatsOnSuccess,
  handleChangeChat,
  handleStartNewChat,
  handleToggleChatsModal,
  isChatsModalOpen,
  isSendingMessage,
  chatId
}: {
  messagesStatus?: QueryStatus
  recipeFilters: RecipeFiltersType
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
  chatId?: number
  messages: Message[]
}) {
  const { data } = useSession()

  if (messages.length || isSendingMessage || !data?.user?.id) {
    return (
      <div className='h-full bg-primary-content'>
        <MessageList
          recipeFilters={recipeFilters}
          data={messages as []}
          chatId={chatId}
          status={messagesStatus}
          isChatsModalOpen={isChatsModalOpen}
          isSendingMessage={isSendingMessage}
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

type MessageListProps = {
  data: PrismaMessage[]
  status?: QueryStatus
  chatId?: number
  isChatsModalOpen: boolean
  recipeFilters: RecipeFiltersType
  isSendingMessage: boolean

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
}

const MessageList = memo(function MessageList({
  data,
  status,
  chatId,
  recipeFilters,
  isChatsModalOpen,
  isSendingMessage,
  handleGetChatsOnSuccess,
  handleChangeChat,
  handleStartNewChat,
  handleToggleChatsModal
}: MessageListProps) {
  if (status === 'error') {
    return <p>Error</p>
  }

  return (
    <>
      <div className='bg-base-100 py-2 '>
        <div className='prose mx-auto grid grid-cols-3 px-2'>
          {handleChangeChat && handleGetChatsOnSuccess ? (
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
      {data.map((m, i) => (
        <Message
          message={m}
          key={m?.content || '' + i}
          isSendingMessage={isSendingMessage}
          chatId={chatId}
        />
      ))}
      {isSendingMessage && data.at(-1)?.role === 'user' && <ChatLoader />}
    </>
  )
})

const Message = function Message({
  message,
  isSendingMessage,
  chatId
}: {
  message: PrismaMessage
  isSendingMessage: boolean
  chatId?: number
}) {
  const { handleGoToRecipe, handleSaveRecipe, status } = useSaveRecipe(chatId)

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
      <div className='flex flex-col bg-primary-content p-4 pb-20'>
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
                className='btn-ghost btn-circle btn text-success'
                onClick={() =>
                  handleGoToRecipe({
                    recipeId: message.recipeId,
                    recipeName: recipeName
                  })
                }
              >
                <BookmarkSolidIcon />
              </Button>
            ) : !isSendingMessage ? (
              // Save
              <Button
                className='btn-ghost btn-circle btn'
                isLoading={status === 'loading'}
                onClick={() =>
                  handleSaveRecipe({
                    content: message.content || '',
                    messageId: Number.isNaN(Number(message.id))
                      ? undefined
                      : message.id
                  })
                }
              >
                <BookmarkOutlineIcon />
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
