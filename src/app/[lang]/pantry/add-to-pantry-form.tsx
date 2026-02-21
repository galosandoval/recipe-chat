'use client'

import { cuid } from '~/lib/createId'
import { CirclePlusIcon } from 'lucide-react'
import z from 'zod'
import { useAppForm } from '~/hooks/use-app-form'
import { BottomBar } from '~/components/bottom-bar'
import { Form } from '~/components/form/form'
import { FormInput } from '~/components/form/form-input'
import { Button } from '~/components/button'
import { useTranslations } from '~/hooks/use-translations'

const formSchema = z.object({
  rawLine: z.string().min(1).max(300)
})
type FormValues = z.infer<typeof formSchema>

export function AddToPantryForm({
  addToPantry
}: {
  addToPantry: (
    input: { rawLine: string; id: string },
    options?: { onSuccess?: () => void }
  ) => void
}) {
  const t = useTranslations()
  const form = useAppForm(formSchema, {
    defaultValues: { rawLine: '' }
  })
  const onSubmit = (values: FormValues) => {
    const newId = cuid()
    addToPantry(
      { rawLine: values.rawLine.trim(), id: newId },
      {
        onSuccess: () => {
          form.reset()
        }
      }
    )
  }
  const isDisabled = !form.formState.isValid

  return (
    <Form
      className='flex w-full items-center md:rounded-md'
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
