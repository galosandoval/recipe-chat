import { Button } from 'components/Button'
import { Modal } from 'components/Modal'
import { GeneratedRecipe } from 'server/api/routers/recipe/interface'
import { useCreateRecipe, AddMessage } from 'hooks/chatHooks'
import { useState } from 'react'
import { ChatBubbleLoader } from 'components/ChatBubbleLoader'
import { ChatCompletionRequestMessage } from 'openai'
import { UseFormHandleSubmit, UseFormRegister } from 'react-hook-form'
import { motion } from 'framer-motion'

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
    chatBubbles,
    chatRef,
    onSubmit,
    handleFillMessage,
    handleSubmit,
    register
  } = AddMessage()

  return (
    <div className='prose flex flex-col pb-16'>
      <div className='relative flex flex-col'>
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

        <RecipeFilters filters={['vegan', 'high protein']} />

        <Chat chatBubbles={chatBubbles.messages} />
        <div ref={chatRef}></div>
      </div>
      <SubmitMessageForm
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        register={register}
        isValid={isValid}
        isDirty={isDirty}
      />
    </div>
  )
}

type Filter = string

function RecipeFilters({ filters }: { filters: Filter[] }) {
  return (
    <div className='flex flex-col items-center justify-center'>
      <div className='flex items-center gap-2'>
        <h2 className='mb-2 mt-2'>Filters</h2>
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
            d='M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z'
          />
        </svg>
      </div>
      <div className='flex gap-2'>
        {filters.map((filter) => (
          <div
            key={filter}
            className='badge-primary badge-outline badge flex items-center gap-1'
          >
            <span className=''>{filter}</span>
            <button className='btn-ghost btn p-0 hover:bg-transparent'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='h-4 w-4'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>
        ))}

        <div className='badge-primary badge-outline badge flex items-center gap-1'>
          <input type='' className='input-ghost input input-xs h-4' />
          <button className='btn-ghost btn p-0 hover:bg-transparent'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='h-4 w-4'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M12 4.5v15m7.5-7.5h-15'
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function SubmitMessageForm({
  handleSubmit,
  onSubmit,
  register,
  isValid,
  isDirty
}: {
  handleSubmit: UseFormHandleSubmit<{
    message: string
  }>
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
      <div className='w-full px-2'>
        <textarea
          {...register('message')}
          placeholder='Ask about a recipe'
          className='input-bordered input relative w-full resize-none pt-2'
        />
      </div>
      <div className='mr-1'>
        <Button
          type='submit'
          disabled={!isValid || !isDirty}
          className='btn-accent btn mb-1'
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

const container = {
  hidden: { opacity: 1, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2
    }
  }
}

function Chat({
  chatBubbles
}: {
  chatBubbles: ChatCompletionRequestMessage[]
}) {
  return (
    <>
      <div className='px-2'>
        {!!chatBubbles.length && (
          <>
            <motion.div
              variants={container}
              initial='hidden'
              animate='visible'
              className='divider text-left'
            >
              Chat
            </motion.div>

            {chatBubbles.map((m, i) => (
              <ChatBubble message={m} key={m.content + i} />
            ))}
          </>
        )}
      </div>
    </>
  )
}

export const item = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
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
          <div className='chat-bubble'>{message.error}</div>
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
          className='chat-bubble link-primary link'
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
    <form onSubmit={handleSubmit(onSubmit)} className='py-t flex flex-col px-1'>
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
              className='input-bordered input input-sm'
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
      <div className='flex w-full py-2'>
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
