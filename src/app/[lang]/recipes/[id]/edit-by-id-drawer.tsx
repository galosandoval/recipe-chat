'use client'

import { useParams, useRouter } from 'next/navigation'
import { useDeleteRecipe } from '~/hooks/use-recipe'
import { useForm } from 'react-hook-form'
import { type ChangeEvent, useState } from 'react'
import { useTranslations } from '~/hooks/use-translations'
import Image from 'next/image'
import { api } from '~/trpc/react'
import { BlobAccessError, type PutBlobResult } from '@vercel/blob'
import { toast } from '~/components/toast'
import {
  editRecipeFormValues,
  type EditRecipeFormValues,
  type RecipeToEdit
} from '~/schemas/recipes-schema'
import { DrawerDialog } from '~/components/drawer-dialog'
import { SquarePen } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { FormInput, FormTextarea, Form } from '~/components/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { submitEditRecipe } from '~/lib/submit-edit-recipe'
import { Dialog } from '~/components/dialog'

export function EditByIdDrawer() {
  const { id } = useParams()
  const { data: recipe } = api.recipes.byId.useQuery({ id: id as string })
  if (!recipe)
    return (
      <Button variant='outline' disabled size='icon'>
        <SquarePen />
      </Button>
    )
  return <EditByIdForm recipe={recipe} />
}

const FORM_ID = 'edit-recipe-form'

function EditByIdForm({ recipe }: { recipe: RecipeToEdit }) {
  return (
    <DrawerDialog
      cancelText='Cancel'
      submitText='Save'
      title='recipes.byId.edit'
      description='Edit the recipe'
      formId={FORM_ID}
      trigger={
        <Button type='button' variant='outline' size='icon'>
          <SquarePen />
        </Button>
      }
    >
      <EditById recipe={recipe} />
    </DrawerDialog>
  )
}

function EditById({ recipe }: { recipe: RecipeToEdit }) {
  const { id } = useParams()

  if (!recipe) return null
  const { name, imgUrl } = recipe
  return (
    <div className='flex flex-col gap-4 overflow-y-auto'>
      <UpdateImage imgUrl={imgUrl} id={id as string} name={name} />
      <EditForm data={recipe} />
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
  const utils = api.useUtils()
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
          <span className='absolute inset-0 flex flex-col items-center justify-center gap-4 rounded backdrop-blur-sm'>
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
                // isLoading={status === 'pending'}
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

function EditForm({ data }: { data: RecipeToEdit }) {
  const t = useTranslations()
  const {
    cookMinutes,
    description,
    ingredients,
    instructions,
    name,
    prepMinutes,
    notes
  } = data
  const utils = api.useUtils()
  const router = useRouter()
  const { mutate: deleteRecipe, status: deleteStatus } = useDeleteRecipe()
  const { mutate: editRecipe, isPending } = api.recipes.edit.useMutation({
    onSuccess: async (data, { newName }) => {
      await utils.recipes.byId.invalidate({ id: data })
      router.push(`/recipes/${data}?name=${encodeURIComponent(newName)}`)
    }
  })
  const form = useForm<EditRecipeFormValues>({
    defaultValues: {
      cookMinutes: cookMinutes || undefined,
      description: description || '',
      ingredients: ingredients.map((i) => i.name).join('\n') || '',
      instructions: instructions.map((i) => i.description).join('\n') || '',
      name: name || '',
      prepMinutes: prepMinutes || undefined,
      notes: notes || ''
    },
    resolver: zodResolver(editRecipeFormValues)
  })

  const handleDelete = (id: string) => {
    deleteRecipe({ id })
  }

  const onSubmit = (values: EditRecipeFormValues) => {
    const params = submitEditRecipe(data, values)
    editRecipe(params)
  }
  return (
    <Form
      className='h-[70svh] space-y-4 overflow-y-auto'
      formId={FORM_ID}
      form={form}
      onSubmit={onSubmit}
    >
      <FormInput name='name' label={t.recipes.name} />
      <FormTextarea name='description' label={t.recipes.description} />
      <div className='flex justify-between gap-2'>
        <FormInput
          inputProps={{ type: 'number' }}
          name='prepMinutes'
          label={t.recipes.prepTime}
        />
        <FormInput
          inputProps={{ type: 'number' }}
          name='cookMinutes'
          label={t.recipes.cookTime}
        />
      </div>
      <FormTextarea name='ingredients' label={t.recipes.ingredients} />
      <FormTextarea name='instructions' label={t.recipes.instructions} />
      <FormTextarea name='notes' label={t.recipes.notes} />
      <Dialog
        form='delete-recipe-form'
        type='button'
        isLoading={deleteStatus === 'pending'}
        onClick={() => handleDelete(data.id)}
        cancelText={t.common.cancel}
        submitText={t.common.delete}
        title={t.recipes.byId.delete.title}
        description={t.recipes.byId.delete.message}
        trigger={<Button type='button'>{t.common.delete}</Button>}
      >
        {null}
      </Dialog>
    </Form>
  )
}
