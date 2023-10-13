import ScrollToBottom, {
  useScrollToBottom,
  useScrollToTop,
  useSticky
} from 'react-scroll-to-bottom'
import { Chat, Filter, Message, Message as PrismaMessage } from '@prisma/client'
import { ChatType } from 'hooks/useChat'
import { memo, useEffect } from 'react'
import { ScreenLoader } from './loaders/screen'
import { MutationStatus, QueryStatus } from '@tanstack/react-query'
import { Filters } from './recipe-filters'
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
import { useTranslation } from 'hooks/useTranslation'
import { useRouter } from 'next/router'
import { SignUpModal } from './auth-modals'

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
    filters,
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
    handleClose,
    handleSubmitRegister,
    isLoading,
    isOpen,
    onSubmit,
    register,
    registerErrors,
    fetchStatus: chatsFetchStatus,
    status: chatsQueryStatus,
    handleGetChatsOnSuccess
  } = props

  const { data } = filters
  const scrollToBottom = useScrollToBottom()
  const scrollToTop = useScrollToTop()
  const [sticky] = useSticky()

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
      <div className='flex flex-col gap-4 pb-16 pt-16'>
        <ValueProps handleFillMessage={handleFillMessage}>
          <Filters {...filters} />
        </ValueProps>
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
          filters={data || []}
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

      <SignUpModal
        closeModal={handleClose}
        errors={registerErrors}
        handleSubmit={handleSubmitRegister}
        isLoading={isLoading}
        isOpen={isOpen}
        onSubmit={onSubmit}
        register={register}
      />
    </>
  )
})

function ChatWindowContent({
  messages,
  messagesStatus,
  isAuthenticated,
  handleGetChatsOnSuccess,
  handleChangeChat,
  handleStartNewChat,
  handleToggleChatsModal,
  handleGoToRecipe,
  handleSaveRecipe,
  filters,
  isChatsModalOpen,
  saveRecipeStatus,
  isSendingMessage,
  chatId
}: {
  messagesStatus?: QueryStatus
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
  filters: Filter[]
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

  if (messages.length || isSendingMessage || !data?.user?.id) {
    return (
      <div className='h-full bg-primary-content'>
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
          filters={filters}
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
  isChatsModalOpen,
  isAuthenticated,
  isSendingMessage,
  saveRecipeStatus,
  filters,
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
  isSendingMessage: boolean
  isAuthenticated: boolean
  saveRecipeStatus: MutationStatus
  filters: Filter[]
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
            filters={filters}
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
  filters,
  handleGoToRecipe,
  handleSaveRecipe,
  saveRecipeStatus
}: {
  message: PrismaMessage
  isSendingMessage: boolean
  saveRecipeStatus: MutationStatus
  filters: Filter[]
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
  const t = useTranslation()
  const router = useRouter()

  let name = 'name:'
  if (router.locale === 'es') {
    name = 'nombre:'
  }

  let recipeName = ''
  const nameIdx = message.content.toLowerCase().indexOf(name)

  if (nameIdx !== -1) {
    const endIdx = message.content.indexOf('\n', nameIdx)

    if (endIdx !== -1) {
      recipeName = message.content.slice(nameIdx + name.length + 1, endIdx)
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
                className='btn-outline btn'
                onClick={() =>
                  handleGoToRecipe({
                    recipeId: message.recipeId,
                    recipeName: recipeName
                  })
                }
              >
                {t('chat-window.to-recipe')}
              </Button>
            ) : !isSendingMessage ? (
              // Save
              <Button
                className='btn btn-outline'
                isLoading={saveRecipeStatus === 'loading'}
                onClick={() =>
                  handleSaveRecipe({
                    content: message.content || '',
                    messageId: message.id
                  })
                }
              >
                {t('chat-window.save')}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  // user message

  const activeFilters = filters.filter((f) => f.checked)

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
        {activeFilters.length ? <ActiveFilters data={activeFilters} /> : null}
      </div>
    </div>
  )
}

function ActiveFilters({ data }: { data: Filter[] }) {
  const t = useTranslation()

  return (
    <div className='flex gap-2 pt-2'>
      <h3 className='text-sm mb-0 mt-0'>{t('filters.title')}:</h3>
      {data.map((f) => (
        <div className='badge badge-primary badge-outline' key={f.id}>
          {f.name}
        </div>
      ))}
    </div>
  )
}
