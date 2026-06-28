'use client'

import { useState } from 'react'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/button'
import { PlusIcon } from 'lucide-react'
import { useTranslations } from '~/hooks/use-translations'

/**
 * Free-text add control shared by the dietary and cuisine steps. Trims input,
 * rejects blanks and case-insensitive duplicates of `existing`, and calls
 * `onAdd` with the cleaned value on Enter or the Add button.
 */
export function CustomOptionAdd({
  existing,
  onAdd,
  label,
  placeholder
}: {
  existing: string[]
  onAdd: (value: string) => void
  label: string
  placeholder: string
}) {
  const t = useTranslations()
  const [value, setValue] = useState('')

  const trimmed = value.trim()
  const isDuplicate = existing.some(
    (v) => v.toLowerCase() === trimmed.toLowerCase()
  )
  const canAdd = trimmed.length > 0 && !isDuplicate

  const add = () => {
    if (!canAdd) return
    onAdd(trimmed)
    setValue('')
  }

  return (
    <div className='flex gap-2 px-1 py-2'>
      <Input
        type='text'
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            add()
          }
        }}
      />
      <Button
        type='button'
        variant='outline'
        onClick={add}
        disabled={!canAdd}
        icon={<PlusIcon className='h-4 w-4' />}
      >
        {t.onboarding.add}
      </Button>
    </div>
  )
}
