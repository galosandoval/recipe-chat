import { useRouter } from 'next/router'
import { Ingredient, Instruction, Recipe } from '@prisma/client'
import { useDeleteRecipe, useEditRecipe, useRecipe } from 'hooks/use-recipe'
import { MyHead } from 'components/head'
import { UseFormHandleSubmit, useForm } from 'react-hook-form'
import { Button } from 'components/button'
import { UpdateRecipe } from 'server/api/routers/recipe/interface'
import { FormValues } from 'hooks/use-chat'
import { CheckIcon, TrashIcon } from 'components/icons'
import { ChangeEvent, FormEvent, useRef, useState } from 'react'
import { Modal } from 'components/modal'
import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'hooks/use-translation'
import Image from 'next/image'
import { api } from 'utils/api'
import { BlobAccessError, PutBlobResult } from '@vercel/blob'
import toast from 'react-hot-toast'

export const getServerSideProps = (async ({ locale }) => {
  const localeFiles = ['common']

  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', localeFiles))
      // Will be passed to the page component as props
    }
  }
}) satisfies GetServerSideProps

export default function EditByIdView() {
  const router = useRouter()
  const { id, name } = router.query

  return (
    <>
      <MyHead title={`Edit ${name}`} />
      <div className='pt-16 sm:flex sm:justify-center'>
        <EditById id={id as string} />
      </div>
    </>
  )
}

export function EditById({ id }: { id: string }) {
  const t = useTranslation()

  const { data, status } = useRecipe(id)

  if (status === 'error')
    return <div className=''>{t('error.something-went-wrong')}</div>

  if (status === 'success' && data) {
    return <FoundRecipe data={data} />
  }

  return <div>{t('loading.screen')}</div>
}

function FoundRecipe({
  data
}: {
  data: Recipe & {
    ingredients: Ingredient[]
    instructions: Instruction[]
  }
}) {
  const utils = api.useContext()
  const router = useRouter()

  const {
    ingredients,
    description,
    instructions,
    name,
    prepTime,
    cookTime,
    notes,
    imgUrl,
    id
  } = data

  const {
    register,
    handleSubmit,
    formState: { isDirty, isValid }
  } = useForm<FormValues>({
    defaultValues: {
      cookTime: cookTime || '',
      description: description || '',
      ingredients: ingredients.map((i) => i.name).join('\n') || '',
      instructions: instructions.map((i) => i.description).join('\n') || '',
      name: name || '',
      prepTime: prepTime || '',
      notes: notes || ''
    }
  })

  const { mutate: editRecipe, isLoading } = api.recipe.edit.useMutation({
    onSuccess: async (data, { newName }) => {
      await utils.recipe.byId.invalidate({ id: data })
      await router.push(`/recipes/${data}?name=${encodeURIComponent(newName)}`)
    }
  })

  const onSubmit = (values: FormValues) => {
    const newIngredients = values.ingredients
      .split('\n')
      .filter((i) => i.length > 2)
    const oldIngredients = [...ingredients]

    const maxIngredientsLength = Math.max(
      newIngredients.length,
      oldIngredients.length
    )
    const ingredientsToChange: { id: string; name: string; listId?: string }[] =
      []

    for (let i = 0; i < maxIngredientsLength; i++) {
      const newIngredient = newIngredients[i]
      const oldIngredient = oldIngredients[i]

      if (!!newIngredient) {
        const changedIngredient = {
          id: oldIngredient?.id || '',
          name: newIngredient || '',
          listId: oldIngredient?.listId || undefined
        }
        ingredientsToChange.push(changedIngredient)
      }
    }

    const newInstructions = values.instructions.split('\n')
    const oldInstructions = [...instructions]

    const maxInstructionLength = Math.max(
      newInstructions.length,
      oldInstructions.length
    )

    const instructionsToChange: { id: string; description: string }[] = []

    for (let i = 0; i < maxInstructionLength; i++) {
      const newInstruction = newInstructions[i]
      const oldInstruction = oldInstructions[i]

      if (!!newInstruction) {
        instructionsToChange.push({
          id: oldInstruction?.id || '',
          description: newInstruction || ''
        })
      }
    }

    const params: Partial<UpdateRecipe> = { id }
    if (name !== values.name) {
      params.name = values.name
    }
    if (description !== values.description) {
      params.description = values.description
    }

    editRecipe({
      newIngredients: ingredientsToChange,
      newName: values.name,
      newDescription: values.description,
      id,
      newInstructions: instructionsToChange,
      ingredients: oldIngredients,
      instructions: oldInstructions,
      newCookTime: values.cookTime,
      newPrepTime: values.prepTime,
      cookTime: cookTime || '',
      prepTime: prepTime || '',
      name: name || '',
      description: description || '',
      notes,
      newNotes: values.notes
    })
  }

  return (
    <div className='flex flex-col gap-4'>
      <UpdateImage imgUrl={imgUrl} id={id} name={name} />

      <MutateRecipeIngredientsAndInstructions
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        data={data}
        register={register}
        isLoading={isLoading}
        isDirty={isDirty}
        isValid={isValid}
      />
    </div>
  )
}

function UpdateImage({
  imgUrl,
  id,
  name
}: {
  imgUrl: string | null
  id: string
  name: string
}) {
  const utils = api.useContext()
  const t = useTranslation()
  const router = useRouter()

  const [uploadImgButtonLabel, setUploadImgButtonLabel] = useState<
    'update-image' | 'upload-image' | 'uploading-image'
  >('update-image')

  const { mutate: updateImgUrl, status } = api.recipe.updateImgUrl.useMutation({
    onMutate: async ({ id, imgUrl }) => {
      await utils.recipe.byId.cancel({ id })

      const previousData = utils.recipe.byId.getData({ id })

      if (!previousData) return previousData

      utils.recipe.byId.setData({ id }, (old) => {
        if (!old) return old

        return {
          ...old,
          imgUrl
        }
      })

      return { previousData }
    },

    onSuccess: async () => {
      await utils.recipe.byId.invalidate({ id })

      toast.success(t('recipes.by-id.update-image-success'))
      router.push(`/recipes/${id}?name=${encodeURIComponent(name)}`)
    },

    onError: (error, _, context) => {
      const previousData = context?.previousData

      if (previousData && previousData) {
        utils.recipe.byId.setData({ id }, previousData)
      }

      toast.error(error.message)
    }
  })

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return

    const fileList = event.target.files

    if (!fileList) {
      const fileInput = document.querySelector(
        '#file-input'
      ) as HTMLInputElement | null

      if (fileInput) {
        fileInput.click()
      }
    } else if (fileList.length) {
      setUploadImgButtonLabel('uploading-image')

      try {
        if (!fileList?.length) {
          throw Error(t('recipes.by-id.no-file'))
        }

        const file = fileList[0]

        const response = await fetch(`/api/upload?filename=${file.name}`, {
          method: 'POST',
          body: file
        })

        const newBlob = (await response.json()) as PutBlobResult

        updateImgUrl({ id, imgUrl: newBlob.url, oldUrl: imgUrl ?? undefined })
      } catch (error) {
        // handle a recognized error
        if (error instanceof BlobAccessError || error instanceof Error) {
          toast.error(error.message)
        } else if (error instanceof Error) {
          toast.error(error.message)
        } else {
          // handle an unrecognized error
          toast.error(t('error.something-went-wrong'))
        }
      }
      setUploadImgButtonLabel('upload-image')
    }
  }

  return (
    <div className=''>
      {imgUrl && (
        <div className='relative w-full' onSubmit={handleFileChange}>
          <Image
            className='mx-auto rounded'
            src={imgUrl}
            alt='recipe'
            width={300}
            height={300}
          />
          <span className='absolute inset-0 flex flex-col items-center justify-center gap-4 rounded bg-primary-content/70 backdrop-blur-sm'>
            <div className='px-5'>
              <input
                id='file-input'
                type='file'
                name='file'
                className='hidden'
                onChange={handleFileChange}
              />
            </div>

            <div className='flex w-full justify-center'>
              <Button
                isLoading={status === 'loading'}
                className='btn btn-primary'
                onClick={() => {
                  const fileInput = document.querySelector(
                    '#file-input'
                  ) as HTMLInputElement | null

                  if (fileInput) {
                    fileInput.click()
                  }
                }}
              >
                {/* {t('recipes.by-id.update-image')} */}
                {t(`recipes.by-id.${uploadImgButtonLabel}`)}
              </Button>
            </div>
          </span>
        </div>
      )}
    </div>
  )
}

function MutateRecipeIngredientsAndInstructions({
  handleSubmit,
  onSubmit,
  register,
  data,
  isLoading,
  isDirty,
  isValid
}: {
  handleSubmit: UseFormHandleSubmit<FormValues, undefined>
  onSubmit: (values: FormValues) => void
  data: Recipe & {
    ingredients: Ingredient[]
    instructions: Instruction[]
  }
  register: any
  isLoading: boolean
  isDirty: boolean
  isValid: boolean
}) {
  const t = useTranslation()

  const { mutate: deleteRecipe, status: deleteStatus } = useDeleteRecipe()
  const [isOpen, setIsOpen] = useState(false)

  const handleCloseConfirmationModal = () => {
    setIsOpen(false)
  }

  const handleDelete = (id: string) => {
    deleteRecipe({ id })
  }
  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='prose mx-2 flex flex-col items-center pb-12 md:mx-auto'
      >
        <div className='flex w-full flex-col'>
          <label htmlFor='name' className='label'>
            <span className='label-text'>{t('recipes.name')}</span>
          </label>
          <input
            id='name'
            {...register('name')}
            className='input input-bordered'
          />
        </div>

        <div className='flex w-full flex-col'>
          <label htmlFor='description' className='label'>
            <span className='label-text'>{t('recipes.description')}</span>
          </label>
          <textarea
            id='description'
            rows={4}
            {...register('description')}
            className='textarea textarea-bordered resize-none'
          />
        </div>

        <div className='flex w-full gap-2'>
          <div className='flex w-1/2 flex-col'>
            <label htmlFor='prepTime' className='label'>
              <span className='label-text'>{t('recipes.prep-time')}</span>
            </label>
            <input
              id='prepTime'
              type='text'
              className='input input-bordered'
              {...register('prepTime')}
            />
          </div>

          <div className='flex w-1/2 flex-col'>
            <label htmlFor='cookTime' className='label'>
              <span className='label-text'>{t('recipes.cook-time')}</span>
            </label>
            <input
              id='cookTime'
              type='text'
              className='input input-bordered pr-2'
              {...register('cookTime')}
            />
          </div>
        </div>

        <div className='flex w-full flex-col'>
          <label htmlFor='ingredients' className='label'>
            <span className='label-text'>{t('recipes.ingredients')}</span>
          </label>

          <textarea
            id='ingredients'
            rows={4}
            {...register('ingredients')}
            className='textarea textarea-bordered resize-none'
          />
        </div>

        <div className='flex w-full flex-col'>
          <label htmlFor='instructions' className='label'>
            <span className='label-text'>{t('recipes.instructions')}</span>
          </label>

          <textarea
            id='instructions'
            rows={4}
            {...register('instructions')}
            className='textarea textarea-bordered resize-none'
          />
        </div>

        <div className='flex w-full flex-col'>
          <label htmlFor='notes' className='label'>
            <span className='label-text'>{t('recipes.notes')}</span>
          </label>

          <textarea
            id='notes'
            rows={4}
            {...register('notes')}
            className='textarea textarea-bordered resize-none'
          />
        </div>
        <div className='fixed bottom-0 w-full bg-base-100/80'>
          <div className='mx-auto grid max-w-sm grid-cols-2 gap-2 px-1 py-2'>
            <Button
              disabled={isLoading}
              className='btn btn-error'
              type='button'
              onClick={() => setIsOpen(true)}
            >
              <TrashIcon /> Delete
            </Button>

            <Button
              isLoading={isLoading}
              disabled={!isDirty || !isValid}
              className='btn btn-success'
              type='submit'
            >
              <CheckIcon /> {t('recipes.save')}
            </Button>
          </div>
        </div>
      </form>

      <Modal isOpen={isOpen} closeModal={handleCloseConfirmationModal}>
        <div className='mx-2 my-1'>
          <div className=''>
            <h1 className='mb-0 text-xl'>{t('recipes.by-id.delete.title')}</h1>
          </div>

          <div className=''>
            <p className=''>{t('recipes.by-id.delete.message')}</p>
          </div>
          <div className='flex justify-end'>
            <Button
              className='btn btn-ghost w-1/4'
              onClick={handleCloseConfirmationModal}
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
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </Button>

            <Button
              onClick={() => handleDelete(data.id)}
              isLoading={deleteStatus === 'loading'}
              className='btn btn-error w-1/4'
            >
              <TrashIcon />
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
