'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import ScrollToBottom, {
  useScrollToBottom,
  useScrollToTop,
  useSticky
} from 'react-scroll-to-bottom'
import { ArrowSmallDownIcon, ArrowSmallUpIcon } from './icons'
import { NoSsr } from './no-ssr'
import { cn } from '~/lib/utils'
import { useActiveFiltersByUserId } from '~/hooks/use-filters-by-user-id'
import { Button } from './ui/button'

export function ScrollToButtons({ enable }: { enable: boolean }) {
  const scrollToBottom = useScrollToBottom()
  const scrollToTop = useScrollToTop()
  const [sticky] = useSticky()
  const { setScrollMode } = useContext(ScrollModeContext)
  const { data: activeFilters } = useActiveFiltersByUserId()

  useEffect(() => {
    // if at the bottom and not streaming, scroll to bottom
    if (sticky && !enable) {
      setScrollMode('bottom')
      scrollToBottom({ behavior: 'smooth' })
    }
  }, [sticky, enable])

  return (
    <div
      className={cn(
        'fixed right-0 bottom-24 left-4 mx-auto w-full max-w-4xl',
        activeFilters?.length && 'bottom-36'
      )}
    >
      <div className='relative w-full'>
        <div
          className={cn(
            'absolute transition-all duration-300',
            enable ? 'translate-y-0 opacity-100' : 'invisible opacity-0'
          )}
        >
          <Button
            className='glass'
            size='icon'
            variant='ghost'
            onClick={
              sticky
                ? () => scrollToBottom({ behavior: 'smooth' })
                : () => scrollToTop({ behavior: 'smooth' })
            }
          >
            {sticky ? <ArrowSmallDownIcon /> : <ArrowSmallUpIcon />}
          </Button>
        </div>
      </div>
    </div>
  )
}

export const ScrollModeContext = createContext<{
  scrollMode: 'bottom' | 'top'
  setScrollMode: (mode: 'bottom' | 'top') => void
}>({
  scrollMode: 'bottom',
  setScrollMode: () => {}
})

export function ScrollToBottomProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [scrollMode, setScrollMode] = useState<'bottom' | 'top'>('top')

  return (
    <ScrollModeContext.Provider value={{ scrollMode, setScrollMode }}>
      <NoSsr>
        <ScrollToBottom
          followButtonClassName='hidden'
          initialScrollBehavior='auto'
          className='h-full'
          mode={scrollMode}
        >
          {children}
        </ScrollToBottom>
      </NoSsr>
    </ScrollModeContext.Provider>
  )
}
