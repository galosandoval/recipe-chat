'use client'

import { useState } from 'react'
import { useTranslations } from '~/hooks/use-translations'
import { useUserId } from '~/hooks/use-user-id'
import { api } from '~/trpc/react'
import { Button } from '~/components/button'
import { toast } from '~/components/toast'

export function BulkAddPantry() {
  const t = useTranslations()
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)
  const userId = useUserId()
  const utils = api.useUtils()
  const { mutate: bulkAdd, isPending } = api.pantry.bulkAdd.useMutation({
    onSuccess: (created) => {
      utils.pantry.byUserId.invalidate({ userId })
      setText('')
      setOpen(false)
      toast.success(
        created.length === 1
          ? '1 item added'
          : `${created.length} items added`
      )
    },
    onError: (err) => toast.error(err.message)
  })

  const handleSubmit = () => {
    const rawLines = text
      .split(/\n/)
      .map((l) => l.trim())
      .filter(Boolean)
    if (rawLines.length === 0) {
      toast.error('Enter at least one ingredient per line')
      return
    }
    bulkAdd({ rawLines })
  }

  if (!open) {
    return (
      <Button
        variant='outline'
        size='sm'
        onClick={() => setOpen(true)}
      >
        {t.pantry.bulkAdd}
      </Button>
    )
  }

  return (
    <div className='bg-background border-muted flex w-full flex-col gap-2 rounded-md border p-2'>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t.pantry.bulkAddPlaceholder}
        className='text-foreground placeholder:text-muted-foreground min-h-[80px] w-full resize-y rounded border border-input bg-transparent px-3 py-2 text-sm'
        rows={4}
      />
      <div className='flex gap-2'>
        <Button
          size='sm'
          onClick={handleSubmit}
          disabled={isPending || !text.trim()}
        >
          {isPending ? 'Adding…' : 'Add all'}
        </Button>
        <Button size='sm' variant='ghost' onClick={() => setOpen(false)}>
          {t.common.cancel}
        </Button>
      </div>
    </div>
  )
}
