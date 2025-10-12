'use client'

import { useForm } from 'react-hook-form'
import { useTranslations } from '~/hooks/use-translations'
import { type LinkedDataRecipeField } from '~/schemas/recipes-schema'
import { api } from '~/trpc/react'
import { FormInput, FormTextarea } from '~/components/form'
import { Form } from '~/components/form'
import { useRouter } from 'next/navigation'
import { Dialog } from '~/components/dialog'
import { PlusIcon } from 'lucide-react'

export type CreateRecipeValues = {
  name: string
  ingredients: string
  instructions: string
  description: string
  prepMinutes: number
  cookMinutes: number
}

export function CreateParsedRecipe({
  data,
  closeModal,
  isAddRecipeOpen
}: {
  data: LinkedDataRecipeField | undefined
  closeModal: () => void
  isAddRecipeOpen: boolean
}) {
  const t = useTranslations()
  const router = useRouter()
  const utils = api.useUtils()
  const {
    description,
    recipeIngredient,
    recipeInstructions,
    name,
    cookMinutes,
    prepMinutes
  } = data ?? ({} as LinkedDataRecipeField)
  const form = useForm<CreateRecipeValues>({
    defaultValues: {
      description,
      ingredients: recipeIngredient?.join('\n'),
      instructions: recipeInstructions?.map((i) => i.text)?.join('\n'),
      name,
      cookMinutes,
      prepMinutes
    },
    values: {
      description: description ?? '',
      ingredients: recipeIngredient?.join('\n') ?? '',
      instructions: recipeInstructions?.map((i) => i.text)?.join('\n') ?? '',
      name: name ?? '',
      cookMinutes: cookMinutes ?? 0,
      prepMinutes: prepMinutes ?? 0
    }
  })
  const { mutate, isPending } = api.recipes.create.useMutation({
    onSuccess: async (data) => {
      router.push(`recipes/${data.id}?name=${encodeURIComponent(data.name)}`)
      await utils.recipes.invalidate()
    }
  })

  const onSubmit = (values: CreateRecipeValues) => {
    console.log('values', values)
    const ingredients = values.ingredients.split('\n')
    const instructions = values.instructions.split('\n')
    mutate({ ...values, ingredients, instructions })
  }

  return (
    <Dialog
      formId='create-recipe'
      cancelText={t.common.cancel}
      submitText={t.common.save}
      title={t.recipes.addParsed}
      description={t.recipes.addParsedDescription}
      buttonType='button'
      open={isAddRecipeOpen}
      onOpenChange={closeModal}
      isLoading={isPending}
      buttonIcon={<PlusIcon className='h-4 w-4' />}
    >
      <Form
        onSubmit={onSubmit}
        className='flex flex-col gap-3'
        formId='create-recipe'
        form={form}
      >
        <FormInput name='name' label={t.recipes.name} />
        <FormInput name='description' label={t.recipes.description} />
        <div className='flex justify-between gap-2'>
          <FormInput name='prepMinutes' label={t.recipes.prepTime} />
          <FormInput name='cookMinutes' label={t.recipes.cookTime} />
        </div>
        <FormTextarea name='ingredients' label={t.recipes.ingredients} />
        <FormTextarea name='instructions' label={t.recipes.instructions} />
      </Form>
    </Dialog>
  )
}
