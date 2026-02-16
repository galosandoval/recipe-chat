'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { cuid } from '~/lib/createId'
import { CirclePlusIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { BottomBar } from '~/components/bottom-bar'
import { Form } from '~/components/form/form'
import { FormInput } from '~/components/form/form-input'
import { Button } from '~/components/button'
import { useTranslations } from '~/hooks/use-translations'
import { useUserId } from '~/hooks/use-user-id'
import { api } from '~/trpc/react'
import type { Ingredient } from '@prisma/client'
import { toast } from '~/components/toast'

const formSchema = z.object({
  rawLine: z.string().min(1).max(300)
})
type FormValues = z.infer<typeof formSchema>

export function AddToPantryForm() {
  const t = useTranslations()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema)
  })
  const { mutate: addToPantry } = useAddToPantry()
  const onSubmit = (values: FormValues) => {
    const newId = cuid()
    addToPantry({ rawLine: values.rawLine.trim(), id: newId })
    form.reset()
  }
  const isDisabled = !form.formState.isValid

  return (
    <Form
      className='fixed right-0 bottom-0 left-0 flex w-full items-center md:rounded-md'
      onSubmit={onSubmit}
      formId='add-pantry-form'
      form={form}
    >
      <BottomBar>
        <div className='flex w-full'>
          <FormInput
            name='rawLine'
            placeholder={t.pantry.addItemPlaceholder}
            className='bg-background/75 focus:bg-background w-full'
          />
        </div>
        <div>
          <Button disabled={isDisabled} variant='outline'>
            <CirclePlusIcon />
          </Button>
        </div>
      </BottomBar>
    </Form>
  )
}

function useAddToPantry() {
  const userId = useUserId()
  const utils = api.useUtils()
  return api.pantry.add.useMutation({
    onMutate: async (input) => {
      await utils.pantry.byUserId.cancel({ userId })
      const prev = utils.pantry.byUserId.getData({ userId })
      if (!prev) return { prev }
      const optimistic: Ingredient = {
        id: input.id,
        recipeId: null,
        listId: null,
        pantryId: prev.id,
        checked: false,
        quantity: null,
        unit: null,
        unitType: null,
        itemName: null,
        preparation: null,
        rawString: input.rawLine
      }
      utils.pantry.byUserId.setData({ userId }, {
        ...prev,
        ingredients: [...prev.ingredients, optimistic]
      })
      return { prev }
    },
    onSuccess: () => utils.pantry.byUserId.invalidate({ userId }),
    onError: (error, _, ctx) => {
      if (ctx?.prev) utils.pantry.byUserId.setData({ userId }, ctx.prev)
      toast.error(error.message)
    }
  })
}
