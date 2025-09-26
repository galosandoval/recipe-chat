import { zodResolver } from '@hookform/resolvers/zod'
import { createId } from '@paralleldrive/cuid2'
import { CirclePlusIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { BottomBar } from '~/components/bottom-bar'
import { Form, FormInput } from '~/components/form'
import { Button } from '~/components/ui/button'
import { useAddToList } from '~/hooks/use-list'
import { useTranslations } from '~/hooks/use-translations'

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
    const newId = createId()
    addToList({ newIngredientName: values.newIngredientName, id: newId })
    form.reset()
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
