'use client'

import { DialogTitle } from '@headlessui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ErrorMessage } from '~/components/error-message-content'
import { PlusIcon } from '~/components/icons'
import { FormLoader } from '~/components/loaders/form'
import { Modal } from '~/components/modal'
import { Button } from '~/components/ui/button'
import { useCreateRecipe } from '~/hooks/use-recipe'
import { useTranslations } from '~/hooks/use-translations'
import {
  recipeUrlSchema,
  type LinkedDataRecipeField,
  type RecipeUrlSchemaType
} from '~/schemas/recipes-schema'
import { api } from '~/trpc/react'

export function useParseRecipe() {
  const [isOpen, setIsOpen] = useState(false)
  const { mutate, status, data, reset } =
    api.recipes.parseRecipeUrl.useMutation()

  function closeModal() {
    setIsOpen(false)
    setTimeout(() => {
      reset()
    }, 200)
  }

  function openModal() {
    setIsOpen(true)
  }

  function onSubmitUrl(values: RecipeUrlSchemaType) {
    mutate(values.url)
  }

  return {
    isOpen,
    status,
    data,
    openModal,
    closeModal,
    onSubmitUrl
  }
}

export function CreateRecipeButton() {
  const { isOpen, status, data, openModal, closeModal, onSubmitUrl } =
    useParseRecipe()

  let modalContent = <UploadRecipeUrlForm onSubmit={onSubmitUrl} />

  if (status === 'error') {
    modalContent = (
      <progress
        className='progress progress-error w-full'
        value='100'
        max='100'
      ></progress>
    )
  }

  if (status === 'success') {
    modalContent = <FormLoader />
  }

  if (status === 'success' && data) {
    modalContent = <CreateRecipe data={data} closeModal={closeModal} />
  }

  return (
    <>
      <Button
        type='button'
        onClick={openModal}
        className='rounded-full'
        variant='ghost'
        size='icon'
      >
        <PlusIcon size={6} />
      </Button>
      <Modal closeModal={closeModal} isOpen={isOpen}>
        {modalContent}
      </Modal>
    </>
  )
}

function UploadRecipeUrlForm({
  onSubmit
}: {
  onSubmit(values: RecipeUrlSchemaType): void
}) {
  const t = useTranslations()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RecipeUrlSchemaType>({
    resolver: zodResolver(recipeUrlSchema(t))
  })

  return (
    <div className='min-w-sm'>
      <DialogTitle as='h3' className='mt-0'>
        {t.recipes.url}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} className=''>
        <div className='mt-2 flex flex-col gap-1'>
          <label htmlFor='url' className='label'>
            <span className='label-text'>{t.recipes.paste}</span>
          </label>
          <input
            {...register('url')}
            className='input input-bordered select-auto'
            autoFocus
          />
          <ErrorMessage errors={errors} name='url' />
        </div>
        <div className='mt-4'>
          <Button className='w-full' type='submit'>
            {t.recipes.generate}
          </Button>
        </div>
      </form>
    </div>
  )
}

function CreateRecipe({
  data,
  closeModal
}: {
  data: LinkedDataRecipeField
  closeModal: () => void
}) {
  const t = useTranslations()

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
            <span className='label-text'>{t.recipes.name}</span>
          </label>
          <input
            id='name'
            {...register('name')}
            className='input input-bordered'
          />
        </div>
        <div className='flex flex-col'>
          <label htmlFor='description' className='label'>
            <span className='label-text'>{t.recipes.description}</span>
          </label>
          <input
            id='description'
            {...register('description')}
            className='input input-bordered'
          />
        </div>

        <div className='flex gap-2'>
          <div className='flex w-1/2 flex-col'>
            <label htmlFor='prepMinutes' className='label'>
              <span className='label-text'>{t.recipes.prepTime}</span>
            </label>
            <input
              id='prepMinutes'
              type='text'
              className='input input-bordered input-sm'
              {...register('prepMinutes')}
            />
          </div>
          <div className='flex w-1/2 flex-col'>
            <label htmlFor='cookMinutes' className='label'>
              <span className='label-text'>{t.recipes.cookTime}</span>
            </label>
            <input
              id='cookMinutes'
              type='text'
              className='input input-bordered input-sm pr-2'
              {...register('cookMinutes')}
            />
          </div>
        </div>
        <div className='flex flex-col'>
          <label htmlFor='ingredients' className='label'>
            <span className='label-text'>{t.recipes.ingredients}</span>
          </label>
          <textarea
            id='ingredients'
            rows={ingredientsRowSize}
            {...register('ingredients')}
            className='textarea textarea-bordered resize-none'
          />
        </div>
        <div className='flex flex-col'>
          <label htmlFor='instructions' className='label'>
            <span className='label-text'>{t.recipes.instructions}</span>
          </label>
          <textarea
            id='instructions'
            rows={instructionsRowSize}
            {...register('instructions')}
            className='textarea textarea-bordered resize-none'
          />
        </div>
      </div>
      <div className='flex w-full gap-1 px-2 py-2'>
        {isSuccess ? (
          <Button className='w-1/2' variant='ghost' onClick={closeModal}>
            Return
          </Button>
        ) : (
          <>
            <Button
              type='button'
              onClick={closeModal}
              className='w-1/2'
              variant='ghost'
            >
              {t.recipes.cancel}
            </Button>
            <Button isLoading={isLoading} className='w-1/2' type='submit'>
              {t.common.save}
            </Button>
          </>
        )}
      </div>
    </form>
  )
}
