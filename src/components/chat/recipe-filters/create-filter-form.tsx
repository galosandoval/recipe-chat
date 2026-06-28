import z from 'zod'
import { PlusIcon } from 'lucide-react'
import { useTranslations } from '~/hooks/use-translations'
import { Button } from '~/components/button'
import { Form } from '~/components/form/form'
import { useAppForm } from '~/hooks/use-app-form'
import { FormInput } from '~/components/form/form-input'

/**
 * Bottom-of-dialog input for staging a brand-new filter. Validates the name and
 * rejects duplicates against the current draft, then hands the trimmed name to
 * the parent via `onAdd` — no network call happens here.
 */
export function CreateFilterForm({
  existingNames,
  onAdd,
  disabled
}: {
  existingNames: string[]
  onAdd: (name: string) => void
  disabled?: boolean
}) {
  const t = useTranslations()
  const form = useAppForm(createFilterSchema, {
    defaultValues: { name: '' }
  })

  const addFilter = (data: CreateFilter) => {
    const name = data.name.trim()
    const isDuplicate = existingNames.some(
      (existing) => existing.toLowerCase() === name.toLowerCase()
    )
    if (isDuplicate) {
      form.setError('name', { message: t.filters.nameAlreadyExists })
      return
    }
    onAdd(name)
    form.reset()
  }

  return (
    <Form onSubmit={addFilter} form={form} formId='create-filter-form'>
      <div className='flex items-start gap-2'>
        <FormInput
          name='name'
          placeholder={t.filters.placeholder}
          disabled={disabled}
        />
        <Button type='submit' disabled={disabled} icon={<PlusIcon />}>
          {t.filters.add}
        </Button>
      </div>
    </Form>
  )
}

export const createFilterSchema = z.object({
  name: z
    .string()
    .min(3, 'filters.minChars3')
    .max(50, 'filters.maxChars50')
    .refine((data) => !data.includes('_'), {
      message: 'filters.charNotAllowedUnderscore'
    })
})

type CreateFilter = z.infer<typeof createFilterSchema>
