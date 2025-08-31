import type { Filter } from '@prisma/client'
import { useEffect, useRef, useState } from 'react'
import { selectActiveFilters } from '~/hooks/use-filters-by-user-id'
import { useTranslations } from '~/hooks/use-translations'
import { cn } from '~/lib/utils'

// 550ms is the duration of the bounce animation
const ANIMATION_DURATION = 550

export function ActiveCount({ data }: { data: Filter[] }) {
  const t = useTranslations()
  const [isBouncing, setIsBouncing] = useState(false)
  const renderCountRef = useRef(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const activeFiltersCount = selectActiveFilters(data).length

  useEffect(() => {
    renderCountRef.current++
    if (renderCountRef.current > 2) {
      setIsBouncing(true)
      timeoutRef.current = setTimeout(() => {
        setIsBouncing(false)
      }, ANIMATION_DURATION)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [activeFiltersCount])
  return (
    <div className='self-start'>
      <small className='text-xs'>{t.filters.active}</small>
      <span
        className={cn(
          'text-base-content relative inline-block pl-1 text-xs',
          isBouncing && 'animate-bounce'
        )}
      >
        {activeFiltersCount}
      </span>
    </div>
  )
}
