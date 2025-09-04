import z from 'zod'
import { toast } from '~/components/toast'
import { useTranslations } from '~/hooks/use-translations'
import { useUserId } from '~/hooks/use-user-id'
import { api } from '~/trpc/react'
import { createId } from '@paralleldrive/cuid2'
import { Button } from '~/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { Form, FormInput } from '~/components/form'
import { useForm, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFiltersByUserId } from '~/hooks/use-filters-by-user-id'

const defaultValues = { name: '' }

export function CreateFilterForm({ disabled }: { disabled?: boolean }) {
  const { mutate } = useCreateFilter()
  const { data: filters, isLoading } = useFiltersByUserId()
  const t = useTranslations()
  const form = useForm<CreateFilter>({
    defaultValues,
    resolver: zodResolver(createFilterSchema)
  })

  const createFilter = (data: CreateFilter) => {
    if (!filters) return

    const id = createId()
    if (filters.some((filter) => filter.name === data.name)) {
      form.setError('name', { message: t.filters.nameAlreadyExists })
      return
    }
    mutate({
      name: data.name,
      filterId: id
    })
  }

  return (
    <Form
      onSubmit={createFilter}
      form={form}
      className='flex items-center gap-2'
      formId='create-filter-form'
    >
      <FormContent disabled={disabled || isLoading} />
    </Form>
  )
}

function FormContent({ disabled }: { disabled?: boolean }) {
  const t = useTranslations()
  return (
    <>
      <FormInput
        name='name'
        inputProps={{ placeholder: t.filters.placeholder }}
      />
      <Button
        type='submit'
        variant='outline'
        className='self-start'
        disabled={disabled}
      >
        <PlusCircle />
        {t.filters.add}
      </Button>
    </>
  )
}

function useCreateFilter() {
  const userId = useUserId()
  const utils = api.useUtils()
  const { mutate } = api.filters.create.useMutation({
    onMutate: async (input) => {
      await utils.filters.getByUserId.cancel({ userId })

      const previousFilters = utils.filters.getByUserId.getData({ userId })

      if (!previousFilters) return previousFilters

      utils.filters.getByUserId.setData({ userId }, (old) => {
        if (!old) return old

        return [
          ...old,
          {
            ...input,
            userId,
            checked: true,
            id: input.filterId,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      })

      return { previousFilters }
    },

    onSuccess: async () => {
      await utils.filters.getByUserId.invalidate({ userId })
    },

    onError: (error, _, ctx) => {
      const previousFilters = ctx?.previousFilters
      if (previousFilters) {
        utils.filters.getByUserId.setData({ userId }, previousFilters)
      }
      toast.error(error.message)
    }
  })

  return { mutate }
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
