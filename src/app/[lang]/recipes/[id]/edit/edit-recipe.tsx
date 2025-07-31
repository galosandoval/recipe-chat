'use client'

import { useRouter } from 'next/navigation'
import { type Ingredient, type Instruction, type Recipe } from '@prisma/client'
import { useDeleteRecipe } from '~/hooks/use-recipe'
import { type UseFormHandleSubmit, useForm } from 'react-hook-form'
import { Button } from '~/components/button'
import { type UpdateRecipe } from '~/server/api/schemas/recipes'
import { CheckIcon, TrashIcon } from '~/components/icons'
import { type ChangeEvent, useState } from 'react'
import { Modal } from '~/components/modal'
import { useTranslations } from '~/hooks/use-translations'
import Image from 'next/image'
import { api, type RouterOutputs } from '~/trpc/react'
import { BlobAccessError, type PutBlobResult } from '@vercel/blob'
import { toast } from '~/components/toast'

type FormValues = {
  name: string
  ingredients: string
  instructions: string
  description: string
  prepTime: string
  cookTime: string
  notes: string
}

export function EditById({
  data
}: {
  data: NonNullable<RouterOutputs['recipes']['byId']>
}) {
  const { data: recipe } = api.recipes.byId.useQuery(
    { id: data.id },
    { initialData: data }
  )

  if (!recipe) return null

  return <FoundRecipe data={recipe} />
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

  const { mutate: editRecipe, isPending } = api.recipes.edit.useMutation({
    onSuccess: async (data, { newName }) => {
      await utils.recipes.byId.invalidate({ id: data })
      router.push(`/recipes/${data}?name=${encodeURIComponent(newName)}`)
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
    <div className='flex flex-col gap-4 overflow-y-auto pt-20'>
      <UpdateImage imgUrl={imgUrl} id={id} name={name} />

      <MutateRecipeIngredientsAndInstructions
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        data={data}
        register={register}
        isPending={isPending}
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
  const t = useTranslations()
  const router = useRouter()

  const [uploadImgButtonLabel, setUploadImgButtonLabel] = useState<
    'updateImage' | 'uploadImage' | 'uploadingImage'
  >('updateImage')

  const { mutate: updateImgUrl } = api.recipes.updateImgUrl.useMutation({
    onMutate: async ({ id, imgUrl }) => {
      await utils.recipes.byId.cancel({ id })

      const previousData = utils.recipes.byId.getData({ id })

      if (!previousData) return previousData

      utils.recipes.byId.setData({ id }, (old) => {
        if (!old) return old

        return {
          ...old,
          imgUrl
        }
      })

      return { previousData }
    },

    onSuccess: async () => {
      await utils.recipes.byId.invalidate({ id })

      toast.success(t.recipes.byId.updateImageSuccess)
      router.push(`/recipes/${id}?name=${encodeURIComponent(name)}`)
    },

    onError: (error, _, context) => {
      const previousData = context?.previousData

      if (previousData && previousData) {
        utils.recipes.byId.setData({ id }, previousData)
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
      setUploadImgButtonLabel('uploadingImage')

      try {
        if (!fileList?.length) {
          throw Error(t.recipes.byId.noFile)
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
          toast.error(t.error.somethingWentWrong)
        }
      }
      setUploadImgButtonLabel('uploadImage')
    }
  }

  return (
    <div>
      {imgUrl && (
        <div className='relative w-full' onSubmit={handleFileChange}>
          <Image
            className='mx-auto rounded'
            src={imgUrl}
            alt='recipe'
            width={300}
            height={300}
          />
          <span className='bg-primary-content/70 absolute inset-0 flex flex-col items-center justify-center gap-4 rounded backdrop-blur-sm'>
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
                isLoading={status === 'pending'}
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
                {String(
                  t.recipes.byId[
                    uploadImgButtonLabel as keyof typeof t.recipes.byId
                  ]
                )}
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
  isPending,
  isDirty,
  isValid
}: {
  handleSubmit: UseFormHandleSubmit<FormValues>
  onSubmit: (values: FormValues) => void
  data: Recipe & {
    ingredients: Ingredient[]
    instructions: Instruction[]
  }
  register: any
  isPending: boolean
  isDirty: boolean
  isValid: boolean
}) {
  const t = useTranslations()

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
        className='prose mx-2 flex flex-col items-center gap-4 pb-20 md:mx-auto'
      >
        <div className='flex w-full flex-col'>
          <label htmlFor='name' className='label'>
            <span className='label-text'>{t.recipes.name}</span>
          </label>
          <input
            id='name'
            {...register('name')}
            className='input input-bordered'
          />
        </div>

        <div className='flex w-full flex-col'>
          <label htmlFor='description' className='label'>
            <span className='label-text'>{t.recipes.description}</span>
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
              <span className='label-text'>{t.recipes.prepTime}</span>
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
              <span className='label-text'>{t.recipes.cookTime}</span>
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
            <span className='label-text'>{t.recipes.ingredients}</span>
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
            <span className='label-text'>{t.recipes.instructions}</span>
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
            <span className='label-text'>{t.recipes.notes}</span>
          </label>

          <textarea
            id='notes'
            rows={4}
            {...register('notes')}
            className='textarea textarea-bordered resize-none'
          />
        </div>
        <div className='bg-base-100/80 fixed bottom-0 w-full'>
          <div className='mx-auto grid max-w-sm grid-cols-2 gap-2 px-1 py-2'>
            <Button
              disabled={isPending}
              className='btn btn-error'
              type='button'
              onClick={() => setIsOpen(true)}
            >
              <TrashIcon /> Delete
            </Button>

            <Button
              isLoading={isPending}
              disabled={!isDirty || !isValid}
              className='btn btn-success'
              type='submit'
            >
              <CheckIcon /> {t.recipes.save}
            </Button>
          </div>
        </div>
      </form>

      <Modal isOpen={isOpen} closeModal={handleCloseConfirmationModal}>
        <div className='mx-2 my-1'>
          <div className=''>
            <h1 className='mb-0 text-xl'>{t.recipes.byId.delete.title}</h1>
          </div>

          <div className=''>
            <p className=''>{t.recipes.byId.delete.message}</p>
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
              isLoading={deleteStatus === 'pending'}
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
