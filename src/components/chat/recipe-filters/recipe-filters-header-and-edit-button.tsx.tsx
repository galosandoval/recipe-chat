'use client'

import { useEffect, useRef } from 'react'
import { useTranslations } from '~/hooks/use-translations'
import { PenSquareIcon, XIcon } from 'lucide-react'
import { Button } from '~/components/button'

export function FilterHeaderAndEditButton({
  canDelete,
  onToggleCanDelete,
  filterBadgesRef
}: {
  canDelete: boolean
  onToggleCanDelete: () => void
  filterBadgesRef: React.RefObject<HTMLDivElement | null>
}) {
  const t = useTranslations()
  return (
    <div className='flex w-full items-center justify-between px-4 pb-1'>
      <p className='text-muted-foreground text-xs font-medium uppercase tracking-wide'>
        {t.filters.title}
      </p>
      <EditButton
        canDelete={canDelete}
        onToggleCanDelete={onToggleCanDelete}
        filterBadgesRef={filterBadgesRef}
      />
    </div>
  )
}

function EditButton({
  canDelete,
  onToggleCanDelete,
  filterBadgesRef
}: {
  canDelete: boolean
  onToggleCanDelete: () => void
  filterBadgesRef: React.RefObject<HTMLDivElement | null>
}) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleOnClick = () => {
    onToggleCanDelete()
  }

  useEffect(() => {
    if (!canDelete) return

    const handleClickOutside = (e: MouseEvent) => {
      const node = e.target as Node
      const buttonClicked = buttonRef.current?.contains(node) ?? false
      const filterBadges = filterBadgesRef.current
      if (!buttonClicked) {
        const hasFilterBadges = filterBadges?.contains(node)
        if (hasFilterBadges) {
          return
        }
        onToggleCanDelete()
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [canDelete, onToggleCanDelete, filterBadgesRef])

  return (
    <Button
      ref={buttonRef}
      onClick={handleOnClick}
      variant='outline'
    >
      <span>{canDelete ? <XIcon size={5} /> : <PenSquareIcon size={5} />}</span>
    </Button>
  )
}
