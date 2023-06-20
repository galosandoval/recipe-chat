import { Chat, Message as PrismaMessage } from '@prisma/client'

import { QueryStatus } from '@tanstack/react-query'
import { Button } from 'components/Button'
import { Drawer } from 'components/Drawer'
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
  UserCircleIcon,
  XCircleIcon,
  XIcon
} from 'components/Icons'
import { ValueProps } from 'components/ValueProps'
import { Variants, motion } from 'framer-motion'
import {
  ChatsType,
  UseRecipeFilters,
  useChat,
  useCreateRecipe
} from 'hooks/chatHooks'
import { ChangeEventHandler, FormEvent } from 'react'
import { GeneratedRecipe } from 'server/api/routers/recipe/interface'
import { ChatCompletionRequestMessage } from 'openai-edge'

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
    chatRef,
    recipeFilters,
    state,
    status: messageListStatus,
    chats,
    isChatsModalOpen,
    input,
    messages,

    handleInputChange,
    handleToggleChatsModal,
    handleSubmit,
    handleFillMessage,
    handleScrollIntoView,
    handleChangeChat,
    handleStartNewChat
  } = useChat()
  console.log('messages', messages)
  return (
    <>
      <MyHead title='Listy - Chat' />
      <div>
        <div>
          <div className='prose flex flex-col pb-12'>
            <div className='relative flex flex-col gap-4'>
              {messages.length === 0 ? (
                <ValueProps handleFillMessage={handleFillMessage} />
              ) : (
                <MessageList
                  recipeFilters={recipeFilters}
                  data={messages}
                  chatId={state.chatId}
                  chats={chats}
                  status={messageListStatus}
                  isChatsModalOpen={isChatsModalOpen}
                  handleChangeChat={handleChangeChat}
                  handleStartNewChat={handleStartNewChat}
                  handleToggleChatsModal={handleToggleChatsModal}
                />
              )}
              <div ref={chatRef}></div>
            </div>
            <SubmitMessageForm
              input={input}
              handleScrollIntoView={handleScrollIntoView}
              handleSubmit={handleSubmit}
              handleInputChange={handleInputChange}
            />
          </div>
        </div>
      </div>
    </>
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
  handleChangeChat,
  handleStartNewChat,
  handleToggleChatsModal
}: MessageListProps) {
  if (status === 'error') {
    return <p>Error</p>
  }

  return (
    <div>
      <motion.div
        className='mt-2 grid grid-cols-3 px-2'
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
        <ChatBubble message={m} key={m?.content || '' + i} />
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
      messages: PrismaMessage[]
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
      messages: PrismaMessage[]
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
        {data.length > 0 && (
          <div className='flex items-center justify-center gap-2'>
            <h2 className='mb-0 mt-0'>Recent chats</h2>
            <ListBulletIcon />
          </div>
        )}
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
    messages: PrismaMessage[]
  }
  chatId?: number
  handleChangeChat: (
    chat: Chat & {
      messages: PrismaMessage[]
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
    content?: string
    role: 'user' | 'assistant' | 'system' | 'function'
  }
}) {
  // if (message.isLoading) {
  //   return <ChatBubbleLoader />
  // }

  // if (message.role === 'assistant') {
  //   let recipe: GeneratedRecipe = {
  //     name: 'No recipe found',
  //     cookTime: '',
  //     description: '',
  //     ingredients: [],
  //     instructions: [],
  //     prepTime: ''
  //   }

  // if ('error' in message) {
  //   return (
  //     <div className='flex flex-col items-start bg-primary-content p-5'>
  //       <div className='text-error'>{message.error}</div>
  //     </div>
  //   )
  // } else if (typeof message.content === 'string' && message.content) {
  //   recipe = message.content
  // }

  //   return (
  //     <div className='flex flex-col items-start bg-primary-content p-5'>
  //       <button
  //         onClick={handleOpenModal}
  //         className=''
  //       >
  //         {message?.content || ''}
  //       </button>
  //       <Modal closeModal={handleCloseModal} isOpen={isOpen}>
  //         <SaveRecipeForm handleCloseModal={handleCloseModal} data={recipe} />
  //       </Modal>
  //     </div>
  //   )
  // }

  // if (
  //   message.role === 'user' &&
  //   message?.content &&
  //   typeof message?.content === 'string'
  // ) {
  //   return (
  //     <motion.div
  //       variants={item}
  //       initial='hidden'
  //       animate='visible'
  //       className='flex flex-col items-end bg-base-200 p-5'
  //     >
  //       <div className=''>{message.content}</div>
  //     </motion.div>
  //   )
  // }

  if (message.role === 'assistant') {
    return (
      <div className='flex gap-2 bg-primary-content p-4'>
        <div className=''>
          <UserCircleIcon />
        </div>

        <div className='flex flex-col items-start'>
          <p className='mb-0 mt-0 whitespace-pre-line'>
            {message.content || ''}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-primary-base-100 flex gap-2 p-4'>
      <div className='flex flex-col items-end'>
        <p className='mb-0 mt-0 whitespace-pre-line'>
          {message?.content || ''}
        </p>
      </div>
      <div className=''>
        <UserCircleIcon />
      </div>
    </div>
  )
}

function SubmitMessageForm({
  handleScrollIntoView,
  handleInputChange,
  handleSubmit,
  input
}: {
  handleScrollIntoView: () => void
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  handleInputChange: ChangeEventHandler<HTMLTextAreaElement>
  input: string
}) {
  return (
    <form
      onSubmit={handleSubmit}
      className='fixed bottom-0 flex w-full items-center bg-base-100'
    >
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
          // disabled={!isValid || !isDirty}
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
