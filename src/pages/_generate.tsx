import { Button } from 'components/Button'
import { Modal } from 'components/Modal'
import { api } from 'utils/api'
import { FormSkeleton } from 'components/FormSkeleton'
import { GeneratedRecipe } from 'server/api/routers/recipe/interface'
import {
  useCreateGeneratedRecipe,
  useGeneratedRecipe
} from 'hooks/generateHooks'

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
    enableCloseModal,
    genRecipe,
    isDirty,
    isGenRecipeOpen,
    isValid,
    messages,
    onSubmit,
    handleCloseModal,
    handleEnableCloseModal,
    handleFillMessage,
    handleSubmit,
    register
  } = useGeneratedRecipe()

  return (
    <>
      <div className='relative flex flex-col'>
        <div className='prose flex flex-col items-center justify-center overflow-y-auto px-4 pb-16'>
          <h1>RecipeBot</h1>
          <div className='flex flex-1 flex-col items-center justify-center'>
            <h2>Examples</h2>
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

        {messages.length ? (
          <div className='flex flex-col'>
            {messages.map((m) => {
              if (m.from === 'me') {
                return (
                  <p
                    className='chat-bubble chat-bubble-primary ml-auto'
                    key={m.timeStamp}
                  >
                    {m.value}
                  </p>
                )
              }
              return (
                <p className='chat-bubble mr-auto' key={m.timeStamp}>
                  {m.value}
                </p>
              )
            })}
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className='fixed bottom-0 flex w-full items-center bg-base-100'
        >
          <div className='w-full px-2'>
            <textarea
              {...register('message')}
              placeholder='Generate recipe...'
              className='input relative w-full resize-none pt-2'
            />
          </div>
          <div className=''>
            <Button
              isLoading={genRecipe.isLoading}
              type='submit'
              disabled={!isValid || !isDirty}
              className='btn-accent btn mb-1'
            >
              Generate
            </Button>
          </div>
        </form>
      </div>

      <Modal
        closeModal={
          enableCloseModal
            ? handleCloseModal
            : () => {
                return
              }
        }
        isOpen={isGenRecipeOpen}
      >
        <SaveGeneratedRecipe
          handleEnableCloseModal={handleEnableCloseModal}
          handleCloseModal={handleCloseModal}
          recipe={genRecipe}
        />
      </Modal>
    </>
  )
}

function SaveGeneratedRecipe(props: {
  recipe: ReturnType<typeof api.recipe.generate.useMutation>
  handleEnableCloseModal: () => void
  handleCloseModal: () => void
}) {
  const { status, data } = props.recipe

  if (status === 'error') {
    props.handleEnableCloseModal()
    return <p className=''>Please try again.</p>
  }

  if (status === 'success') {
    props.handleEnableCloseModal()
    return <Form handleCloseModal={props.handleCloseModal} data={data} />
  }

  return <FormSkeleton />
}

function Form({
  data,
  handleCloseModal
}: {
  data: GeneratedRecipe
  handleCloseModal: () => void
}) {
  const { handleSubmit, getValues, register, onSubmit, isSuccess, isLoading } =
    useCreateGeneratedRecipe(data)

  const ingredientsRowSize =
    Math.min((getValues('ingredients') || '').split('\n').length, 12) || 5
  const instructionsRowSize =
    Math.min((getValues('instructions') || '').split('\n').length, 12) || 5

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col p-5'>
      <div className='mt-2 flex flex-col gap-5'>
        <div className='flex flex-col'>
          <label htmlFor='name' className='label'>
            <span className='label-text'>Name</span>
          </label>
          <input id='name' {...register('name')} className='input' />
        </div>
        <div className='flex flex-col'>
          <label htmlFor='description' className='label'>
            <span className='label-text'>Description</span>
          </label>
          <input
            id='description'
            {...register('description')}
            className='input'
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
              className='input'
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
              className='input'
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
            className='textarea resize-none'
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
            className='textarea resize-none'
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
