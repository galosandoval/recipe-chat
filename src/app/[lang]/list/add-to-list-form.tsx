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
  newIngredientName: z.string().min(3).max(50)
})
type FormValues = z.infer<typeof formSchema>

export function AddToListForm() {
  const t = useTranslations()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema)
  })
  const { mutate: addToList } = useAddToList()
  const onSubmitNewIngredient = (values: FormValues) => {
    const newId = cuid()
    addToList(
      { newIngredientName: values.newIngredientName, id: newId },
      { onSuccess: () => form.reset() }
    )
  }
  const isDisabled = !form.formState.isValid
  return (
    <Form
      className='fixed right-0 bottom-0 left-0 flex w-full items-center md:rounded-md'
      onSubmit={onSubmitNewIngredient}
      formId='add-ingredient-form'
      form={form}
    >
      <BottomBar>
        <div className='flex w-full'>
          <FormInput
            name='newIngredientName'
            placeholder={t.list.addToList}
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

function useAddToList() {
  const userId = useUserId()
  const utils = api.useUtils()
  return api.lists.add.useMutation({
    onMutate: async (input) => {
      await utils.lists.byUserId.cancel({ userId })

      const prevList = utils.lists.byUserId.getData({ userId })

      let ingredients: Ingredient[] = []

      if (prevList) {
        ingredients = [
          ...prevList.ingredients,
          {
            id: input.id,
            checked: false,
            listId: null,
            recipeId: null,
            pantryId: null,
            quantity: null,
            unit: null,
            unitType: null,
            itemName: null,
            preparation: null,
            rawString: input.newIngredientName
          }
        ]
      }

      utils.lists.byUserId.setData({ userId }, () => ({ ingredients }))
      return { prevList }
    },

    onSuccess: async () => {
      await utils.lists.byUserId.invalidate({ userId })
    },

    onError: (error, _, ctx) => {
      const prevList = ctx?.prevList
      if (prevList) {
        utils.lists.byUserId.setData({ userId }, prevList)
      }
      toast.error(error.message)
    }
  })
}
