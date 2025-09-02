import z from 'zod'
import { toast } from '~/components/toast'
import { useTranslations } from '~/hooks/use-translations'
import { useUserId } from '~/hooks/use-user-id'
import { api } from '~/trpc/react'
import { createId } from '@paralleldrive/cuid2'
import { Button } from '~/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { Form, FormInput } from '~/components/form'

export function CreateFilterForm({ disabled }: { disabled?: boolean }) {
  const t = useTranslations()
  const { onSubmit } = useCreateFilterForm()

  return (
    <Form
      schema={filterSchema}
      onSubmit={onSubmit}
      defaultValues={{ name: '' }}
      className='flex items-center gap-2'
      formId='create-filter-form'
    >
      <FormInput
        name='name'
        inputProps={{ placeholder: t.filters.placeholder }}
      />
      <Button
        type='submit'
        variant='outline'
        className='no-animation'
        disabled={disabled}
      >
        <PlusCircle />
        <span>{t.filters.add}</span>
      </Button>
    </Form>
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

export const filterSchema = z.object({
  name: z
    .string()
    .min(3, 'minChars3')
    .max(50, 'maxChars50')
    .refine((data) => !data.includes('_'), {
      message: 'charNotAllowed',
      params: {
        char: '_'
      }
    })
})

type CreateFilter = z.infer<typeof filterSchema>

function useCreateFilterForm() {
  const { mutate } = useCreateFilter()

  const handleCreateFilter = (data: CreateFilter) => {
    const id = createId()
    mutate({
      name: data.name,
      filterId: id
    })
  }

  const onSubmit = (data: CreateFilter) => {
    handleCreateFilter(data)
  }

  return { onSubmit }
}
