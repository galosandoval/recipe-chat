'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useFieldArray } from 'react-hook-form'
import { SaveIcon, PencilIcon } from 'lucide-react'
import type { Filter } from '@prisma/client'
import { DrawerDialog } from '~/components/drawer-dialog'
import { Dialog } from '~/components/dialog'
import { Button } from '~/components/button'
import { toast } from '~/components/toast'
import { Form } from '~/components/form/form'
import { useAppForm } from '~/hooks/use-app-form'
import { useTranslations } from '~/hooks/use-translations'
import { useUserId } from '~/hooks/use-user-id'
import { useFiltersByUserId } from '~/hooks/use-filters-by-user-id'
import { api } from '~/trpc/react'
import { cuid } from '~/lib/createId'
import { FilterDraftList } from './filter-draft-list'
import { CreateFilterForm, createFilterSchema } from './create-filter-form'

const MANAGE_FILTERS_FORM_ID = 'manage-filters-form'

/**
 * The dialog's editable draft: each row reuses the add form's name validation
 * (length / no underscore), plus a cross-row check that flags a duplicate name
 * inline on the offending row.
 */
const manageFiltersSchema = z.object({
  filters: z
    .array(z.object({ id: z.string(), name: createFilterSchema.shape.name }))
    .superRefine((filters, ctx) => {
      const seenAtIndex = new Map<string, number>()
      filters.forEach((filter, index) => {
        const key = filter.name.trim().toLowerCase()
        if (seenAtIndex.has(key)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'filters.nameAlreadyExists',
            path: [index, 'name']
          })
        } else {
          seenAtIndex.set(key, index)
        }
      })
    })
})
export type ManageFiltersForm = z.infer<typeof manageFiltersSchema>

/**
 * Staged editor for a user's recipe filters. Adds, removes, and renames update a
 * local form draft only; Save commits the full desired set in one `filters.save`
 * call. A dirty draft prompts a discard confirmation before the dialog closes.
 */
export function ManageFiltersDialog() {
  const t = useTranslations()
  const { data } = useFiltersByUserId()
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { mutate: save, isPending } = useSaveFilters()

  const form = useAppForm(manageFiltersSchema, {
    defaultValues: { filters: [] }
  })
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'filters',
    keyName: 'fieldId'
  })
  const isDirty = form.formState.isDirty
  const stagedNames = form.watch('filters').map((f) => f.name)

  const handleOpenChange = (next: boolean) => {
    if (next) {
      form.reset({ filters: toDraft(data ?? []) })
      setOpen(true)
      return
    }
    if (isDirty) {
      setConfirmOpen(true)
      return
    }
    setOpen(false)
  }

  const handleSave = (values: ManageFiltersForm) => {
    if (!isDirty) {
      setOpen(false)
      return
    }
    save(
      { filters: values.filters.map((f) => ({ id: f.id, name: f.name.trim() })) },
      { onSuccess: () => setOpen(false) }
    )
  }

  const confirmDiscard = () => {
    setConfirmOpen(false)
    setOpen(false)
  }

  return (
    <>
      <DrawerDialog
        open={open}
        onOpenChange={handleOpenChange}
        trigger={
          <Button variant='ghost' size='sm' aria-label={t.filters.manage}>
            <PencilIcon className='text-muted-foreground' />
          </Button>
        }
        title={t.filters.manage}
        description={t.filters.manageDescription}
        formId={MANAGE_FILTERS_FORM_ID}
        submitIcon={<SaveIcon />}
        submitText={t.common.save}
        cancelText={t.common.cancel}
        isLoading={isPending}
      >
        <Form form={form} formId={MANAGE_FILTERS_FORM_ID} onSubmit={handleSave}>
          <FilterDraftList fields={fields} onRemove={remove} />
        </Form>
        <div className='pt-4'>
          <CreateFilterForm
            existingNames={stagedNames}
            onAdd={(name) => append({ id: cuid(), name })}
            disabled={isPending}
          />
        </div>
      </DrawerDialog>

      <Dialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t.filters.discardTitle}
        description={t.filters.discardDescription}
        cancelText={t.filters.discardKeep}
        submitText={t.filters.discardConfirm}
        primaryButtonType='button'
        onClickConfirm={confirmDiscard}
      />
    </>
  )
}

/**
 * Seeds the draft from persisted filters using their stored names. Stock
 * filters keep their slug (e.g. `under-30-minutes`) rather than the localized
 * label, so an unrelated Save never rewrites the slug and the badge list's
 * label lookup stays intact.
 */
function toDraft(filters: Filter[]) {
  return filters.map((f) => ({ id: f.id, name: f.name }))
}

function useSaveFilters() {
  const userId = useUserId()
  const utils = api.useUtils()

  return api.filters.save.useMutation({
    onSuccess: async () => {
      await utils.filters.getByUserId.invalidate({ userId })
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })
}
