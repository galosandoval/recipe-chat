'use client'

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
  type RecipeToEdit,
  type UpdateRecipe
} from '~/schemas/recipes-schema'
import { DrawerDialog } from '~/components/drawer-dialog'
import { Button } from '~/components/button'
import { FormTextarea, Form } from '~/components/form/form'
import { FormInput } from '~/components/form/form-input'
import { zodResolver } from '@hookform/resolvers/zod'
import { submitEditRecipe } from '~/lib/submit-edit-recipe'
import { getIngredientDisplayText } from '~/lib/ingredient-display'
import { useRecipe } from '~/hooks/use-recipe'
import { SaveIcon } from 'lucide-react'
import { useRecipeSlug } from '~/hooks/use-recipe-slug'

export function EditByIdDrawer({
  open,
  onOpenChange
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { data: recipe } = useRecipe()
  if (!recipe) return null
  return (
    <EditByIdForm recipe={recipe} open={open} onOpenChange={onOpenChange} />
  )
}

const FORM_ID = 'edit-recipe-form'

function EditByIdForm({
  recipe,
  open,
  onOpenChange
}: {
  recipe: RecipeToEdit
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useTranslations()
  const utils = api.useUtils()
  const { mutate: editRecipe, isPending } = api.recipes.edit.useMutation({
    onSuccess: async (slug) => {
      await utils.recipes.bySlug.invalidate({ slug })
      onOpenChange(false)
    }
  })

  return (
    <DrawerDialog
      submitIcon={<SaveIcon className='h-4 w-4' />}
      cancelText={t.common.cancel}
      submitText={t.common.save}
      title={t.recipes.byId.edit}
      description={t.recipes.byId.editDescription}
      formId={FORM_ID}
      open={open}
      onOpenChange={onOpenChange}
      isLoading={isPending}
    >
      <EditById recipe={recipe} editRecipe={editRecipe} />
    </DrawerDialog>
  )
}

function EditById({
  recipe,
  editRecipe
}: {
  recipe: RecipeToEdit
  editRecipe: (params: UpdateRecipe) => void
}) {
  if (!recipe) return null
  const { imgUrl } = recipe
  return (
    <div className='flex max-h-[70svh] flex-col gap-4 overflow-y-auto'>
      <UpdateImage imgUrl={imgUrl} id={recipe.id} />
      <EditForm data={recipe} editRecipe={editRecipe} />
    </div>
  )
}

function UpdateImage({ imgUrl, id }: { imgUrl: string | null; id: string }) {
  const utils = api.useUtils()
  const t = useTranslations()
  const slug = useRecipeSlug()

  const [uploadImgButtonLabel, setUploadImgButtonLabel] = useState<
    'updateImage' | 'uploadImage' | 'uploadingImage'
  >('updateImage')

  const { mutate: updateImgUrl } = api.recipes.updateImgUrl.useMutation({
    onMutate: async ({ imgUrl }) => {
      await utils.recipes.bySlug.cancel({ slug: slug as string })

      const previousData = utils.recipes.bySlug.getData({
        slug: slug as string
      })

      if (!previousData) return previousData

      utils.recipes.bySlug.setData({ slug: slug as string }, (old) => {
        if (!old) return old

        return {
          ...old,
          imgUrl
        }
      })

      return { previousData }
    },

    onSuccess: async () => {
      await utils.recipes.bySlug.invalidate({ slug })

      toast.success(t.recipes.byId.updateImageSuccess)
    },

    onError: (error, _, context) => {
      const previousData = context?.previousData

      if (previousData && previousData) {
        utils.recipes.bySlug.setData({ slug }, previousData)
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

function EditForm({
  data,
  editRecipe
}: {
  data: RecipeToEdit
  editRecipe: (params: UpdateRecipe) => void
}) {
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

  const form = useForm<EditRecipeFormValues>({
    defaultValues: {
      cookMinutes: cookMinutes || undefined,
      description: description || '',
      ingredients: ingredients.map((i) => getIngredientDisplayText(i)).join('\n') || '',
      instructions: instructions.map((i) => i.description).join('\n') || '',
      name: name || '',
      prepMinutes: prepMinutes || undefined,
      notes: notes || ''
    },
    resolver: zodResolver(editRecipeFormValues)
  })

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
          type='number'
          name='prepMinutes'
          label={t.recipes.prepTime}
        />
        <FormInput
          type='number'
          name='cookMinutes'
          label={t.recipes.cookTime}
        />
      </div>
      <FormTextarea name='ingredients' label={t.recipes.ingredients} />
      <FormTextarea name='instructions' label={t.recipes.instructions} />
      <FormTextarea name='notes' label={t.recipes.notes} />
    </Form>
  )
}
