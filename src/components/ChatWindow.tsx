import ScrollToBottom, {
  useScrollToBottom,
  useSticky
} from 'react-scroll-to-bottom'
import { Chat, Message, Message as PrismaMessage } from '@prisma/client'
import { ChatType, SaveRecipe, useSaveRecipe } from 'hooks/chatHooks'
import { ChangeEventHandler, FormEvent, MouseEvent, memo, useMemo } from 'react'
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
import { ChatLoader } from './loaders/ChatBubbleLoader'
import { Button } from './Button'

type MessageContentProps = Omit<
  ChatType,
  'input' | 'handleSubmit' | 'handleInputChange'
>

export default function ChatWindow(props: MessageContentProps) {
  return (
    <ScrollToBottom
      initialScrollBehavior='auto'
      followButtonClassName='hidden'
      className='h-full'
    >
      <Content {...props} />
    </ScrollToBottom>
  )
}

const Content = memo(function Content({
  state,
  recipeFilters,
  status: messageListStatus,
  handleFillMessage,
  messages,
  isChatsModalOpen,
  isSendingMessage,
  handleGetChatsOnSuccess,
  handleChangeChat,
  handleStartNewChat,
  handleToggleChatsModal
}: MessageContentProps) {
  const scrollToBottom = useScrollToBottom()
  const [sticky] = useSticky()

  const { ...saveRecipe } = useSaveRecipe(state.chatId)

  const memoizedSaveRecipe = useMemo(() => saveRecipe, [])
  const momoizedRecipeFilters = useMemo(() => recipeFilters, [])

  if (messageListStatus === 'loading' && !!state.chatId) {
    return <ScreenLoader />
  }

  return (
    <>
      <div className='flex flex-col gap-4 pb-16'>
        <ChatWindowContent
          handleFillMessage={handleFillMessage}
          saveRecipe={memoizedSaveRecipe}
          recipeFilters={momoizedRecipeFilters}
          messages={messages as []}
          chatId={state.chatId}
          messagesStatus={messageListStatus}
          messagesLength={messages.length}
          isChatsModalOpen={isChatsModalOpen}
          isSendingMessage={isSendingMessage}
          handleGetChatsOnSuccess={handleGetChatsOnSuccess}
          handleChangeChat={handleChangeChat}
          handleStartNewChat={handleStartNewChat}
          handleToggleChatsModal={handleToggleChatsModal}
        />
      </div>
      <div
        className={`absolute bottom-20 left-4 duration-300 transition-all${
          !sticky ? ' translate-y-0 opacity-100' : ' translate-y-4 opacity-0'
        }`}
      >
        <button
          className='glass btn-circle btn'
          onClick={() => scrollToBottom()}
        >
          <ArrowSmallDownIcon />
        </button>
      </div>
    </>
  )
})
function ChatWindowContent({
  messagesLength,
  messages,
  messagesStatus,
  saveRecipe,
  recipeFilters,
  handleGetChatsOnSuccess,
  handleChangeChat,
  handleStartNewChat,
  handleToggleChatsModal,
  isChatsModalOpen,
  isSendingMessage,
  chatId,
  handleFillMessage
}: {
  messagesLength: number
  messagesStatus: QueryStatus
  recipeFilters: RecipeFiltersType
  handleFillMessage: (e: MouseEvent<HTMLButtonElement>) => void
  saveRecipe: SaveRecipe
  handleGetChatsOnSuccess: (
    data: (Chat & {
      messages: Message[]
    })[]
  ) => void
  handleChangeChat: (
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
  if (messagesLength === 0) {
    return <ValueProps handleFillMessage={handleFillMessage} />
  }

  if (messagesStatus === 'success' || isSendingMessage || messagesLength > 0) {
    return (
      <div className='h-full'>
        <MessageList
          saveRecipe={saveRecipe}
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
  status: QueryStatus
  chatId?: number
  isChatsModalOpen: boolean
  recipeFilters: RecipeFiltersType
  isSendingMessage: boolean
  saveRecipe: SaveRecipe

  handleChangeChat: (
    chat: Chat & {
      messages: PrismaMessage[]
    }
  ) => void
  handleStartNewChat: () => void
  handleToggleChatsModal: () => void
  handleGetChatsOnSuccess: (
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
  saveRecipe,
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
      <div className='mx-auto mt-2 grid grid-cols-3 px-2'>
        <ChatsSideBarButton
          chatId={chatId}
          isChatsModalOpen={isChatsModalOpen}
          recipeFilters={recipeFilters}
          handleChangeChat={handleChangeChat}
          handleToggleChatsModal={handleToggleChatsModal}
          onSuccess={handleGetChatsOnSuccess}
        />

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
      {data.map((m, i) => (
        <Message
          message={m}
          key={m?.content || '' + i}
          saveRecipe={saveRecipe}
          isSendingMessage={isSendingMessage}
        />
      ))}
      {isSendingMessage && data.at(-1)?.role === 'user' && <ChatLoader />}
    </>
  )
})

const Message = function Message({
  message,
  saveRecipe,
  isSendingMessage
}: {
  message: PrismaMessage
  saveRecipe: SaveRecipe
  isSendingMessage: boolean
}) {
  const { handleGoToRecipe, handleSaveRecipe, status } = saveRecipe

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
      <div className='flex flex-col bg-primary-content p-4'>
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
                  messageId: Number(message.id)
                })
              }
            >
              <BookmarkOutlineIcon />
            </Button>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col items-start self-center bg-base-200 p-4'>
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

function SubmitMessageForm({
  handleInputChange,
  handleSubmit,
  isSendingMessage,
  input
}: {
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  handleInputChange: ChangeEventHandler<HTMLTextAreaElement>
  input: string
  isSendingMessage: boolean
}) {
  return (
    <form
      onSubmit={handleSubmit}
      className={`fixed bottom-0 flex w-full items-center`}
    >
      <div className='prose mx-auto flex w-full items-center bg-base-300/75 py-1 md:mb-2 md:rounded-lg'>
        <div className='flex w-full px-2 py-1'>
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder='Ask about a recipe'
            className='input-bordered input relative w-full resize-none pt-2'
          />
        </div>

        <div className='mr-1'>
          <Button
            type='submit'
            disabled={input.length < 5 && !isSendingMessage}
            className={` btn ${isSendingMessage ? 'btn-error' : 'btn-accent'}`}
          >
            {isSendingMessage ? (
              // stop icon
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='h-6 w-6'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z'
                />
              </svg>
            ) : (
              // plane icon
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='h-6 w-6'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5'
                />
              </svg>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
