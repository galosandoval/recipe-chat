import { Chat, Message as PrismaMessage } from '@prisma/client'
import { QueryStatus } from '@tanstack/react-query'
import { Button } from 'components/Button'
import { MyHead } from 'components/Head'
import { ChatBubbleLeftIcon, PlusIcon, UserCircleIcon } from 'components/Icons'
import { ValueProps } from 'components/ValueProps'
import { Variants, motion } from 'framer-motion'
import { ChatsType, UseRecipeFilters, useChat } from 'hooks/chatHooks'
import { ChangeEventHandler, FormEvent } from 'react'
import { ChatCompletionRequestMessage } from 'openai-edge'
import { ChatsSideBarButton } from 'components/ChatsSideBar'
import { ChatLoader } from 'components/loaders/ChatBubbleLoader'

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
    isSendingMessage,

    handleInputChange,
    handleToggleChatsModal,
    handleSubmit,
    handleFillMessage,
    handleScrollIntoView,
    handleChangeChat,
    handleStartNewChat
  } = useChat()
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
        </div>
      </div>
    </>
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
  isSendingMessage: boolean

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
      </motion.div>
      {data.map((m, i) => (
        <Message message={m} key={m?.content || '' + i} />
      ))}
      {isSendingMessage && data.at(-1)?.role === 'user' && <ChatLoader />}
    </div>
  )
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

function Message({
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
      <div className='flex justify-start gap-2 bg-primary-content p-4'>
        <div>
          <UserCircleIcon />
        </div>

        <div className='flex flex-col'>
          <p className='mb-0 mt-0 whitespace-pre-line'>
            {message.content || ''}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-primary-base-100 flex justify-end gap-2 p-4'>
      <div className='flex flex-col items-end'>
        <p className='mb-0 mt-0 whitespace-pre-line'>
          {message?.content || ''}
        </p>
      </div>
      <div>
        <UserCircleIcon />
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
    </form>
  )
}

// function SaveRecipeForm({
//   data,
//   handleCloseModal
// }: {
//   data: GeneratedRecipe
//   handleCloseModal: () => void
// }) {
//   const { handleSubmit, getValues, register, onSubmit, isSuccess, isLoading } =
//     useCreateRecipe(data)

//   const ingredientsRowSize = (getValues('ingredients') || '').split('\n').length
//   const instructionsRowSize = (getValues('instructions') || '').split(
//     '\n'
//   ).length

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col'>
//       <div className='mt-2 flex max-h-[38rem] flex-col gap-5 overflow-y-auto px-1 pb-1'>
//         <div className='flex flex-col'>
//           <label htmlFor='name' className='label'>
//             <span className='label-text'>Name</span>
//           </label>
//           <input
//             id='name'
//             {...register('name')}
//             className='input-bordered input'
//           />
//         </div>
//         <div className='flex flex-col'>
//           <label htmlFor='description' className='label'>
//             <span className='label-text'>Description</span>
//           </label>
//           <input
//             id='description'
//             {...register('description')}
//             className='input-bordered input'
//           />
//         </div>

//         <div className='flex gap-2'>
//           <div className='flex w-1/2 flex-col'>
//             <label htmlFor='prepTime' className='label'>
//               <span className='label-text'>Prep time</span>
//             </label>
//             <input
//               id='prepTime'
//               type='text'
//               className='input-bordered input input-sm'
//               {...register('prepTime')}
//             />
//           </div>
//           <div className='flex w-1/2 flex-col'>
//             <label htmlFor='cookTime' className='label'>
//               <span className='label-text'>Cook time</span>
//             </label>
//             <input
//               id='cookTime'
//               type='text'
//               className='input-bordered input input-sm mr-2'
//               {...register('cookTime')}
//             />
//           </div>
//         </div>
//         <div className='flex flex-col'>
//           <label htmlFor='ingredients' className='label'>
//             <span className='label-text'>Ingredients</span>
//           </label>
//           <textarea
//             id='ingredients'
//             rows={ingredientsRowSize}
//             {...register('ingredients')}
//             className='textarea-bordered textarea resize-none'
//           />
//         </div>
//         <div className='flex flex-col'>
//           <label htmlFor='instructions' className='label'>
//             <span className='label-text'>Instructions</span>
//           </label>
//           <textarea
//             id='instructions'
//             rows={instructionsRowSize}
//             {...register('instructions')}
//             className='textarea-bordered textarea resize-none'
//           />
//         </div>
//       </div>
//       <div className='flex w-full gap-1 px-2 py-2'>
//         {isSuccess ? (
//           <Button className='btn-ghost btn w-1/2' onClick={handleCloseModal}>
//             Return
//           </Button>
//         ) : (
//           <>
//             <Button
//               type='button'
//               onClick={handleCloseModal}
//               className='btn-ghost btn w-1/2'
//             >
//               Cancel
//             </Button>
//             <Button
//               isLoading={isLoading}
//               className='btn-primary btn w-1/2'
//               type='submit'
//             >
//               Save
//             </Button>
//           </>
//         )}
//       </div>
//     </form>
//   )
// }
