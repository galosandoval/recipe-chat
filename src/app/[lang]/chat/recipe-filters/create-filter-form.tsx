import { Controller, useForm } from 'react-hook-form'
import z from 'zod'
import { toast } from '~/components/toast'
import { useTranslations } from '~/hooks/use-translations'
import { useUserId } from '~/hooks/use-user-id'
import { api } from '~/trpc/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { createId } from '@paralleldrive/cuid2'
import { PlusCircleIcon } from '~/components/icons'
import { ErrorMessage } from '~/components/error-message-content'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'

export function CreateFilterForm({ disabled }: { disabled?: boolean }) {
  const t = useTranslations()
  const { onSubmit, handleSubmit, control, errors, isDirty, touchedFields } =
    useCreateFilterForm()

  return (
    <>
      <form className='flex w-full gap-2' onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name='name'
          control={control}
          disabled={disabled}
          render={({ field }) => (
            <Input {...field} placeholder={t.filters.placeholder} />
          )}
        />
        <Button
          type='submit'
          variant='outline'
          className='no-animation'
          disabled={disabled}
        >
          <PlusCircleIcon />
          <span>{t.filters.add}</span>
        </Button>
      </form>
      {errors.name && isDirty && touchedFields.name && (
        <ErrorMessage name='name' errors={errors} align='center' />
      )}
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

export const filterSchema = (t: any) =>
  z.object({
    name: z.string().min(3, t.filters.minChars3).max(50, t.filters.maxChars50)
  })

type CreateFilter = z.infer<ReturnType<typeof filterSchema>>

function useCreateFilterForm() {
  const t = useTranslations()
  const { mutate } = useCreateFilter()

  const {
    handleSubmit,
    resetField,
    control,
    formState: { errors, isDirty, touchedFields }
  } = useForm<CreateFilter>({
    resolver: zodResolver(filterSchema(t)),
    defaultValues: {
      name: ''
    }
  })

  const handleCreateFilter = (data: CreateFilter) => {
    const id = createId()
    mutate({
      name: data.name,
      filterId: id
    })
    resetField('name')
  }

  const onSubmit = (data: CreateFilter) => {
    handleCreateFilter(data)
  }

  return { handleSubmit, control, errors, isDirty, touchedFields, onSubmit }
}
