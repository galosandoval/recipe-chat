'use client'

import { useEffect, useRef } from 'react'
import { FunnelIcon, PencilSquareIcon, XIcon } from '~/components/icons'
import { ValuePropsHeader } from '../value-props'
import { useTranslations } from '~/hooks/use-translations'

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
    <ValuePropsHeader
      icon={<FunnelIcon />}
      label={t.filters.title}
      actionIcon={
        <EditButton
          canDelete={canDelete}
          onToggleCanDelete={onToggleCanDelete}
          filterBadgesRef={filterBadgesRef}
        />
      }
    />
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

  const handleClickOutside = (e: MouseEvent) => {
    console.log('clicked outside')
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

  const handleOnClick = () => {
    onToggleCanDelete()
  }

  useEffect(() => {
    if (canDelete) {
      document.addEventListener('click', handleClickOutside)
    } else {
      document.removeEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [canDelete])

  return (
    <button
      ref={buttonRef}
      onClick={handleOnClick}
      className={`btn btn-circle btn-sm badge-outline ml-auto`}
    >
      <span>
        {canDelete ? <XIcon size={5} /> : <PencilSquareIcon size={5} />}
      </span>
    </button>
  )
}
