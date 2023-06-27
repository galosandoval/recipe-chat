import { Chat, Message as PrismaMessage } from '@prisma/client'
import { QueryStatus } from '@tanstack/react-query'
import { Button } from 'components/Button'
import { MyHead } from 'components/Head'
import {
  BookmarkOutlineIcon,
  BookmarkSolidIcon,
  ChatBubbleLeftIcon,
  PlusIcon,
  UserCircleIcon
} from 'components/Icons'
import { ValueProps } from 'components/ValueProps'
import { ChatsType, SaveRecipe, useChat, useSaveRecipe } from 'hooks/chatHooks'
import { ChangeEventHandler, FormEvent } from 'react'
import { ChatsSideBarButton } from 'components/ChatsSideBar'
import { ChatLoader } from 'components/loaders/ChatBubbleLoader'
import { RecipeFiltersType } from 'components/RecipeFilters'
import { ScreenLoader } from 'components/loaders/ScreenLoader'

export default function ChatView() {
  return (
    <>
      <MyHead title='Listy - Chat' />
      <Chat />
    </>
  )
}

function Chat() {
  const {
    chatRef,
    recipeFilters,
    state,
    status: messageListStatus,
    chats,
    isChatsModalOpen,
    input,
    messages,
    isSendingMessage,

    handleInputChange,
    handleToggleChatsModal,
    handleSubmit,
    handleFillMessage,
    handleScrollIntoView,
    handleChangeChat,
    handleStartNewChat
  } = useChat()

  const saveRecipe = useSaveRecipe(state.chatId)

  if (chats.status === 'loading' || messageListStatus === 'loading') {
    return <ScreenLoader />
  }

  return (
    <div className='mx-auto flex flex-col pb-12'>
      <div className='relative flex flex-col gap-4'>
        {messages.length === 0 ? (
          <ValueProps handleFillMessage={handleFillMessage} />
        ) : (
          <MessageList
            saveRecipe={saveRecipe}
            recipeFilters={recipeFilters}
            data={messages as []}
            chatId={state.chatId}
            chats={chats}
            status={messageListStatus}
            isChatsModalOpen={isChatsModalOpen}
            isSendingMessage={isSendingMessage}
            handleChangeChat={handleChangeChat}
            handleStartNewChat={handleStartNewChat}
            handleToggleChatsModal={handleToggleChatsModal}
          />
        )}
        <div ref={chatRef}></div>
      </div>
      <SubmitMessageForm
        input={input}
        isSendingMessage={isSendingMessage}
        handleScrollIntoView={handleScrollIntoView}
        handleSubmit={handleSubmit}
        handleInputChange={handleInputChange}
      />
    </div>
  )
}

type MessageListProps = {
  data: PrismaMessage[]
  status: QueryStatus
  chats: ChatsType
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
}

function MessageList({
  data,
  status,
  chats,
  chatId,
  recipeFilters,
  isChatsModalOpen,
  isSendingMessage,
  saveRecipe,
  handleChangeChat,
  handleStartNewChat,
  handleToggleChatsModal
}: MessageListProps) {
  if (status === 'error') {
    return <p>Error</p>
  }

  return (
    <div>
      <div className='prose mx-auto mt-2 grid grid-cols-3 px-2'>
        <ChatsSideBarButton
          chatId={chatId}
          chats={chats}
          isChatsModalOpen={isChatsModalOpen}
          recipeFilters={recipeFilters}
          handleChangeChat={handleChangeChat}
          handleToggleChatsModal={handleToggleChatsModal}
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
    </div>
  )
}

function Message({
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
        <div className='flex justify-start gap-2 self-center'>
          <div>
            <UserCircleIcon />
          </div>

          <div className='prose flex flex-col'>
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
  handleScrollIntoView,
  handleInputChange,
  handleSubmit,
  isSendingMessage,
  input
}: {
  handleScrollIntoView: () => void
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  handleInputChange: ChangeEventHandler<HTMLTextAreaElement>
  input: string
  isSendingMessage: boolean
}) {
  return (
    <form
      onSubmit={handleSubmit}
      className='fixed bottom-0 flex w-full items-center'
    >
      <div className='prose mx-auto flex w-full items-center bg-base-300/75 md:mb-2 md:rounded-lg'>
        <div className='flex w-full px-2 py-1'>
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder='Ask about a recipe'
            className='input-bordered input relative w-full resize-none pt-2'
            onFocus={() => handleScrollIntoView()}
          />
        </div>

        <div className='mr-1'>
          <Button
            type='submit'
            disabled={input.length < 5}
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
