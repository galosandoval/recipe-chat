import { Chat, Message } from '@prisma/client'
import { QueryStatus } from '@tanstack/react-query'
import { Button } from 'components/Button'
import { ChatBubbleLoader } from 'components/ChatBubbleLoader'
import { MyHead } from 'components/Head'
import {
  ChatBubbleLeftIcon,
  CheckIcon,
  Cog6ToothIcon,
  EditIcon,
  FunnelIcon,
  ListBulletIcon,
  PlusCircleIcon,
  PlusIcon,
  XCircleIcon,
  XIcon
} from 'components/Icons'
import { Drawer, Modal } from 'components/Modal'
import { Variants, motion } from 'framer-motion'
import {
  ChatsType,
  UseRecipeFilters,
  useChat,
  useCreateRecipe
} from 'hooks/chatHooks'
import { ChatCompletionRequestMessage } from 'openai'
import { MouseEvent, useState } from 'react'
import { UseFormHandleSubmit, UseFormRegister } from 'react-hook-form'
import { GeneratedRecipe } from 'server/api/routers/recipe/interface'

export type FormValues = {
  name: string
  ingredients: string
  instructions: string
  description: string
  prepTime: string
  cookTime: string
}

export default function ChatView() {
  const {
    isDirty,
    isValid,
    chatRef,
    recipeFilters,
    state,
    status: messageListStatus,
    chats,
    isChatsModalOpen,

    handleToggleChatsModal,
    onSubmit,
    handleFillMessage,
    handleScrollIntoView,
    handleChangeChat,
    handleSubmit,
    register,
    handleStartNewChat
  } = useChat()

  return (
    <>
      <MyHead title='Listy - Chat' />
      <div>
        <div>
          <div className='prose flex flex-col pb-12'>
            <div className='relative flex flex-col gap-4'>
              {state.messages.length === 0 && (
                <ValueProps handleFillMessage={handleFillMessage} />
              )}

              <MessageList
                recipeFilters={recipeFilters}
                data={state.messages}
                chatId={state.chatId}
                chats={chats}
                status={messageListStatus}
                isChatsModalOpen={isChatsModalOpen}
                handleChangeChat={handleChangeChat}
                handleStartNewChat={handleStartNewChat}
                handleToggleChatsModal={handleToggleChatsModal}
              />

              <div ref={chatRef}></div>
            </div>
            <SubmitMessageForm
              handleScrollIntoView={handleScrollIntoView}
              handleSubmit={handleSubmit}
              onSubmit={onSubmit}
              register={register}
              isValid={isValid}
              isDirty={isDirty}
            />
          </div>
        </div>
      </div>
    </>
  )
}

function ValueProps({
  handleFillMessage
}: {
  handleFillMessage: (e: MouseEvent<HTMLButtonElement>) => void
}) {
  return (
    <div className='flex flex-col items-center justify-center overflow-y-auto px-4'>
      <div className='flex flex-1 flex-col items-center justify-center'>
        <div className='flex items-center gap-2'>
          <h2 className='mb-2 mt-2'>Examples</h2>
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
              d='M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z'
            />
          </svg>
        </div>
        <div className='flex flex-col items-center gap-4'>
          <Button className='btn-primary btn' onClick={handleFillMessage}>
            What should I make for dinner tonight?
          </Button>
          <Button className='btn-primary btn' onClick={handleFillMessage}>
            Which salad recipe will go well with my steak and potatoes?
          </Button>
          <Button className='btn-primary btn' onClick={handleFillMessage}>
            What&apos;s a the best risotto recipe?
          </Button>
        </div>
      </div>
    </div>
  )
}

function RecipeFilters({
  filtersArr,
  handleSubmit,
  onSubmit,
  filters,
  register,
  handleCheck,
  isBtnDisabled,
  canDelete,
  handleRemoveFilter,
  handleToggleCanDelete
}: UseRecipeFilters) {
  return (
    <div className='mt-2 flex flex-col items-center justify-center gap-2 px-2'>
      <div className='flex items-center gap-2'>
        <h2 className='mb-0 mt-0'>Filters</h2>
        <FunnelIcon />
      </div>

      <div className='flex flex-wrap gap-2'>
        {filtersArr.length > 0 && (
          <button
            onClick={handleToggleCanDelete}
            className={`badge badge-ghost flex h-fit items-center gap-1 py-0`}
          >
            <span>
              {canDelete ? <XIcon size={5} /> : <EditIcon size={5} />}
            </span>
          </button>
        )}

        {filtersArr.map((filter) => {
          const checked = filters[filter] && !canDelete
          return (
            <button
              onClick={
                canDelete
                  ? () => handleRemoveFilter(filter)
                  : () => handleCheck(filter)
              }
              key={filter}
              className={`badge flex h-fit items-center gap-1 py-0 ${
                canDelete
                  ? 'badge-error badge-outline'
                  : checked
                  ? 'badge-primary badge-outline'
                  : 'badge-ghost'
              }`}
            >
              <span className='flex items-center'>
                {checked && <CheckIcon />}
                <span className=''>{filter}</span>
                {canDelete && <XCircleIcon size={5} />}
              </span>
            </button>
          )
        })}
      </div>

      <form className='join' onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register('name')}
          className='input-bordered input input-sm join-item'
          placeholder='New filter'
        />
        <button
          type='submit'
          disabled={isBtnDisabled}
          className='no-animation btn-sm join-item btn rounded-r-full'
        >
          <PlusCircleIcon />
        </button>
      </form>
    </div>
  )
}

const container: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 1,
      duration: 1
    }
  }
}

type MessageListProps = {
  data: ChatCompletionRequestMessage[]
  status: QueryStatus
  chats: ChatsType
  chatId?: number
  isChatsModalOpen: boolean
  recipeFilters: UseRecipeFilters

  handleChangeChat: (
    chat: Chat & {
      messages: Message[]
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
  handleChangeChat,
  handleStartNewChat,
  handleToggleChatsModal
}: MessageListProps) {
  if (status === 'error') {
    return <p>Error</p>
  }

  return (
    <div className='px-2'>
      <motion.div
        className='grid grid-cols-3'
        variants={container}
        initial='hidden'
        animate='visible'
      >
        <ChatsPopoverButton
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
      </motion.div>

      {data.map((m, i) => (
        <ChatBubble message={m} key={m.content + i} />
      ))}
    </div>
  )
}

export function ChatsPopoverButton({
  chats,
  chatId,
  isChatsModalOpen,
  recipeFilters,
  handleToggleChatsModal,
  handleChangeChat
}: {
  chats: ChatsType
  chatId?: number
  isChatsModalOpen: boolean
  recipeFilters: UseRecipeFilters
  handleChangeChat: (
    chat: Chat & {
      messages: Message[]
    }
  ) => void
  handleToggleChatsModal: () => void
}) {
  return (
    <>
      <button
        onClick={handleToggleChatsModal}
        className="justify-self-start' btn-ghost btn-circle btn"
      >
        <Cog6ToothIcon />
      </button>

      <Drawer closeModal={handleToggleChatsModal} isOpen={isChatsModalOpen}>
        <div className='flex h-full flex-col justify-between'>
          <RecipeFilters {...recipeFilters} />

          <ChatList
            chats={chats}
            chatId={chatId}
            handleChangeChat={handleChangeChat}
          />
        </div>
      </Drawer>
    </>
  )
}

function ChatList({
  chats,
  chatId,
  handleChangeChat
}: {
  chats: ChatsType
  chatId?: number
  handleChangeChat: (
    chat: Chat & {
      messages: Message[]
    }
  ) => void
}) {
  const { data, status } = chats

  if (status === 'error') {
    return <div>Error</div>
  }
  if (status === 'success') {
    return (
      <div className='flex h-full flex-col justify-end gap-2 pb-8'>
        <div className='flex items-center justify-center gap-2'>
          <h2 className='mb-0 mt-0'>Recent chats</h2>
          <ListBulletIcon />
        </div>
        {[...data].reverse().map((chat) => (
          <ChatOption
            key={chat.id}
            chat={chat}
            chatId={chatId}
            handleChangeChat={handleChangeChat}
          />
        ))}
      </div>
    )
  }

  return <div>Error</div>
}

function ChatOption({
  chat,
  chatId,
  handleChangeChat
}: {
  chat: Chat & {
    messages: Message[]
  }
  chatId?: number
  handleChangeChat: (
    chat: Chat & {
      messages: Message[]
    }
  ) => void
}) {
  const { content, role } = chat.messages[0]

  let message = content

  if (role === 'assistant') {
    message = JSON.parse(content).name
  }

  return (
    <div
      className={`flex flex-col px-2 py-2 ${
        chatId === chat.id ? 'bg-primary-content' : ''
      }`}
    >
      <div
        onClick={() => handleChangeChat(chat)}
        className={`flex items-center gap-2 ${
          chatId === chat.id ? 'text-primary' : ''
        }`}
        //  ${
        //   active || selected ? 'text-primary' : ''
        // }`}
      >
        <span
          className={`text-base-content ${
            chatId === chat.id ? 'text-primary' : ''
          }`}
        >
          {message}
        </span>
      </div>

      <span className='self-end text-xs text-primary'>
        {dateTimeFormat().format(chat.updatedAt)}
      </span>
    </div>
  )
}

function dateTimeFormat() {
  return Intl.DateTimeFormat('en-US')
}

export const item: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 1,
      duration: 1
    }
  }
}

function ChatBubble({
  message
}: {
  message: {
    content: string | GeneratedRecipe
    role: 'user' | 'assistant' | 'system'
    error?: string
    isLoading?: boolean
  }
}) {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpenModal = () => {
    setIsOpen(true)
  }

  const handleCloseModal = () => {
    setIsOpen(false)
  }

  if (message.isLoading) {
    return <ChatBubbleLoader />
  }

  if (message.role === 'assistant') {
    let recipe: GeneratedRecipe

    if ('error' in message) {
      return (
        <div className='chat chat-start'>
          <div className='chat-bubble chat-bubble-error'>{message.error}</div>
        </div>
      )
    } else if (typeof message.content === 'string') {
      recipe = JSON.parse(message.content) as GeneratedRecipe
    } else {
      recipe = message.content
    }

    return (
      <div className='chat chat-start'>
        <button
          onClick={handleOpenModal}
          className='chat-bubble link-primary link bg-primary-content'
        >
          {recipe.name}
        </button>
        <Modal closeModal={handleCloseModal} isOpen={isOpen}>
          <SaveRecipeForm handleCloseModal={handleCloseModal} data={recipe} />
        </Modal>
      </div>
    )
  }

  if (
    message.role === 'user' &&
    message?.content &&
    typeof message?.content === 'string'
  ) {
    return (
      <motion.div
        variants={item}
        initial='hidden'
        animate='visible'
        className='chat chat-end'
      >
        <div className='chat-bubble chat-bubble-primary'>{message.content}</div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={item}
      initial='hidden'
      animate='visible'
      className='chat chat-end'
    >
      <div className='chat-bubble chat-bubble-primary'>
        {message.content as string}
      </div>
    </motion.div>
  )
}

function SubmitMessageForm({
  handleSubmit,
  onSubmit,
  register,
  handleScrollIntoView,
  isValid,
  isDirty
}: {
  handleSubmit: UseFormHandleSubmit<{
    message: string
  }>
  handleScrollIntoView: () => void

  onSubmit: (values: { message: string }) => void
  register: UseFormRegister<{
    message: string
  }>
  isValid: boolean
  isDirty: boolean
}) {
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='fixed bottom-0 flex w-full items-center bg-base-100'
    >
      <div className='flex w-full px-2 py-1'>
        <textarea
          {...register('message')}
          placeholder='Ask about a recipe'
          className='input-bordered input relative w-full resize-none pt-2'
          onFocus={() => handleScrollIntoView()}
        />
      </div>
      <div className='mr-1'>
        <Button
          type='submit'
          disabled={!isValid || !isDirty}
          className='btn-accent btn'
        >
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
        </Button>
      </div>
    </form>
  )
}

function SaveRecipeForm({
  data,
  handleCloseModal
}: {
  data: GeneratedRecipe
  handleCloseModal: () => void
}) {
  const { handleSubmit, getValues, register, onSubmit, isSuccess, isLoading } =
    useCreateRecipe(data)

  const ingredientsRowSize = (getValues('ingredients') || '').split('\n').length
  const instructionsRowSize = (getValues('instructions') || '').split(
    '\n'
  ).length

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col'>
      <div className='mt-2 flex max-h-[38rem] flex-col gap-5 overflow-y-auto px-1 pb-1'>
        <div className='flex flex-col'>
          <label htmlFor='name' className='label'>
            <span className='label-text'>Name</span>
          </label>
          <input
            id='name'
            {...register('name')}
            className='input-bordered input'
          />
        </div>
        <div className='flex flex-col'>
          <label htmlFor='description' className='label'>
            <span className='label-text'>Description</span>
          </label>
          <input
            id='description'
            {...register('description')}
            className='input-bordered input'
          />
        </div>

        <div className='flex gap-2'>
          <div className='flex w-1/2 flex-col'>
            <label htmlFor='prepTime' className='label'>
              <span className='label-text'>Prep time</span>
            </label>
            <input
              id='prepTime'
              type='text'
              className='input-bordered input input-sm'
              {...register('prepTime')}
            />
          </div>
          <div className='flex w-1/2 flex-col'>
            <label htmlFor='cookTime' className='label'>
              <span className='label-text'>Cook time</span>
            </label>
            <input
              id='cookTime'
              type='text'
              className='input-bordered input input-sm mr-2'
              {...register('cookTime')}
            />
          </div>
        </div>
        <div className='flex flex-col'>
          <label htmlFor='ingredients' className='label'>
            <span className='label-text'>Ingredients</span>
          </label>
          <textarea
            id='ingredients'
            rows={ingredientsRowSize}
            {...register('ingredients')}
            className='textarea-bordered textarea resize-none'
          />
        </div>
        <div className='flex flex-col'>
          <label htmlFor='instructions' className='label'>
            <span className='label-text'>Instructions</span>
          </label>
          <textarea
            id='instructions'
            rows={instructionsRowSize}
            {...register('instructions')}
            className='textarea-bordered textarea resize-none'
          />
        </div>
      </div>
      <div className='flex w-full gap-1 px-2 py-2'>
        {isSuccess ? (
          <Button className='btn-ghost btn w-1/2' onClick={handleCloseModal}>
            Return
          </Button>
        ) : (
          <>
            <Button
              type='button'
              onClick={handleCloseModal}
              className='btn-ghost btn w-1/2'
            >
              Cancel
            </Button>
            <Button
              isLoading={isLoading}
              className='btn-primary btn w-1/2'
              type='submit'
            >
              Save
            </Button>
          </>
        )}
      </div>
    </form>
  )
}
