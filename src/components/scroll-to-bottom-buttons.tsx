'use client'

import { useEffect } from 'react'
import ScrollToBottom, {
  useScrollToBottom,
  useAtBottom
} from 'react-scroll-to-bottom'
import { ArrowSmallDownIcon } from './icons'
import { NoSsr } from './no-ssr'
import { cn } from '~/lib/utils'
import { useActiveFiltersByUserId } from '~/hooks/use-filters-by-user-id'
import { Button } from './ui/button'

export function ScrollToBottomButton() {
  const scrollToBottom = useScrollToBottom()
  const [atBottom] = useAtBottom()
  const { data: activeFilters } = useActiveFiltersByUserId()

  const handleClick = () => {
    scrollToBottom({ behavior: 'smooth' })
  }

  useEffect(() => {
    // if at the bottom and not streaming, scroll to bottom
    if (atBottom) {
      scrollToBottom({ behavior: 'smooth' })
    }
  }, [atBottom])

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
            atBottom && 'translate-y-1 opacity-0'
          )}
        >
          <Button
            className='glass-element rounded-full'
            size='icon'
            variant='ghost'
            onClick={handleClick}
          >
            <ArrowSmallDownIcon />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ScrollToBottomProvider({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <NoSsr>
      <ScrollToBottom
        followButtonClassName='hidden'
        initialScrollBehavior='auto'
        className='h-full'
        mode='bottom'
      >
        {children}
      </ScrollToBottom>
    </NoSsr>
  )
}
