'use client'

import { useEffect, useRef } from 'react'
import { PencilSquareIcon, XIcon } from '~/components/icons'

export function RecipeFilterControls({
  canDelete,
  onToggleCanDelete
}: {
  canDelete: boolean
  onToggleCanDelete: () => void
}) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleClickOutside = (e: MouseEvent) => {
    console.log('clicked outside')
    if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
      const filterBadges = document.querySelector('#filter-badges')
      const hasFilterBadges = buttonRef.current.contains(filterBadges)
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
