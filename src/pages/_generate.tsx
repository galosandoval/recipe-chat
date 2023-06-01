import { Button } from 'components/Button'
import { Modal } from 'components/Modal'
import { api } from 'utils/api'
import { GeneratedRecipe, Message } from 'server/api/routers/recipe/interface'
import {
  UseGenerate,
  useCreateGeneratedRecipe,
  useGenerateRecipe
} from 'hooks/generateHooks'
import { useState } from 'react'
import { ChatBubbleLoader } from 'components/ChatBubbleLoader'
import { ChatCompletionRequestMessage } from 'openai'

export type FormValues = {
  name: string
  ingredients: string
  instructions: string
  description: string
  prepTime: string
  cookTime: string
}

export default function GenerateRecipe() {
  const {
    isDirty,
    isValid,
    chatBubbles,
    conversation,
    prompt,
    onSubmit,
    handleFillMessage,
    handleSubmit,
    register
  } = useGenerateRecipe()

  return (
    <>
      <div className='relative flex flex-col'>
        <div className='flex flex-col items-center justify-center overflow-y-auto px-4 pb-16'>
          <div className='flex flex-1 flex-col items-center justify-center'>
            <h2 className='mt-2'>Examples</h2>
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

        <Chat
          chatBubbles={chatBubbles}
          conversation={conversation}
          prompt={prompt}
        />

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
          <div className=''>
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
      </div>
    </>
  )
}

export const Chat = ({
  chatBubbles,
  conversation,
  prompt
}: {
  chatBubbles: ChatCompletionRequestMessage[]
  prompt: string | null
  conversation: Pick<UseGenerate, 'data' | 'status'>
}) => {
  console.log('conversation', conversation)

  const { data, status } = conversation

  if (data) {
    return (
      <>
        {data.messages.map((m, i) => (
          <ChatBubble message={m} key={m.content + i} />
        ))}
        {status === 'loading' && <ChatBubbleLoader />}
      </>
    )
  }

  console.log('data', data)
  return (
    <>
      {chatBubbles.length ? (
        <div className='px-2'>
          {chatBubbles.map((m, i) => {
            if (m.role === 'user') {
              return (
                <div key={m.content + i} className='chat chat-end'>
                  <div className='chat-bubble chat-bubble-primary ml-auto'>
                    {m.content}
                  </div>
                </div>
              )
            }
            return (
              <div key={m.content + i} className='chat chat-start'>
                <div className='chat-bubble'>{m.content}</div>
              </div>
            )
          })}
        </div>
      ) : null}

      {status === 'loading' && <ChatBubbleLoader />}
    </>
  )
}

function ChatBubble({
  message
}: {
  message: {
    content: string | GeneratedRecipe
    role: 'user' | 'assistant' | 'system'
  }
}) {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpenModal = () => {
    setIsOpen(true)
  }

  const handleCloseModal = () => {
    setIsOpen(false)
  }

  if (message.role === 'assistant') {
    let recipe: GeneratedRecipe
    if (typeof message.content === 'string') {
      recipe = JSON.parse(message.content) as GeneratedRecipe
    } else {
      recipe = message.content
    }
    console.log('parsed recipe', recipe)
    return (
      <div className='chat chat-start'>
        <button
          onClick={handleOpenModal}
          className='chat-bubble link-primary link'
        >
          {recipe.name}
        </button>
        <Modal closeModal={handleCloseModal} isOpen={isOpen}>
          <Form handleCloseModal={handleCloseModal} data={recipe} />
        </Modal>
      </div>
    )
  }

  if (message.role === 'user' && typeof message.content === 'string') {
    return (
      <div className='chat chat-end'>
        <div className='chat-bubble chat-bubble-primary'>{message.content}</div>
      </div>
    )
  }
  return (
    <div className='chat chat-end'>
      <div className='chat-bubble chat-bubble-primary'>
        {message.content as string}
      </div>
    </div>
  )
}

// export const RecipeChatBubble = ({
//   // messages,
//   prompt,
//   messages
// }: // handleAddToMessages
// {
//   // messages: Message[]
//   prompt: string
//   messages: Message[] | undefined
//   // handleAddToMessages: (prompt: Message) => void
// }) => {
//   const utils = api.useContext()
//   // const { data, status } = api.recipe.generate.useQuery(
//   //   { content: prompt },
//   //   {
//   //     enabled: !!prompt || !!messages?.length,
//   //     onSuccess: (data) => {
//   //       // handleAddToMessages({ content: JSON.stringify(data), role: 'assistant' })
//   //     }
//   //   }
//   // )

//   const [isOpen, setIsOpen] = useState(false)

//   const handleOpenModal = () => {
//     setIsOpen(true)
//   }

//   const handleCloseModal = () => {
//     setIsOpen(false)
//   }

//   if (status === 'success' && data) {
//     const { recipe } = data
//     return (
//       <div>
//         <button onClick={handleOpenModal} className='link-primary link'>
//           {recipe.name}
//         </button>
//         <Modal closeModal={handleCloseModal} isOpen={isOpen}>
//           <Form handleCloseModal={handleCloseModal} data={recipe} />
//         </Modal>
//       </div>
//     )
//   }
//   return <p>Please try rephrasing your question.</p>
// }

function Form({
  data,
  handleCloseModal
}: {
  data: GeneratedRecipe
  handleCloseModal: () => void
}) {
  const { handleSubmit, getValues, register, onSubmit, isSuccess, isLoading } =
    useCreateGeneratedRecipe(data)

  const ingredientsRowSize = (getValues('ingredients') || '').split('\n').length
  const instructionsRowSize = (getValues('instructions') || '').split(
    '\n'
  ).length

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='py-t flex flex-col px-1'>
      <div className='mt-2 flex max-h-[38rem] flex-col gap-5 overflow-y-auto'>
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
