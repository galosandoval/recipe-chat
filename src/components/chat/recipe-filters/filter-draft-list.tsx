'use client'

import { XIcon } from 'lucide-react'
import type { FieldArrayWithId } from 'react-hook-form'
import { Button } from '~/components/button'
import { FormInput } from '~/components/form/form-input'
import { useTranslations } from '~/hooks/use-translations'
import type { ManageFiltersForm } from './manage-filters-dialog'

/**
 * Renders each staged filter as a validated name input (inline errors via the
 * surrounding form) plus a remove (X) control. Edits and removals mutate the
 * form draft only — no network calls happen here.
 */
export function FilterDraftList({
  fields,
  onRemove
}: {
  fields: FieldArrayWithId<ManageFiltersForm, 'filters', 'fieldId'>[]
  onRemove: (index: number) => void
}) {
  const t = useTranslations()

  if (fields.length === 0) {
    return <div className='text-muted-foreground'>{t.filters.noFilters}</div>
  }

  return (
    <ul className='flex flex-col gap-2'>
      {fields.map((field, index) => (
        <li key={field.fieldId} className='flex items-start gap-2'>
          <FormInput<ManageFiltersForm>
            name={`filters.${index}.name`}
            aria-label={t.filters.title}
          />
          <Button
            type='button'
            variant='ghost'
            size='icon'
            aria-label={`${t.common.delete} ${field.name}`}
            onClick={() => onRemove(index)}
            icon={<XIcon className='size-4' />}
          />
        </li>
      ))}
    </ul>
  )
}
