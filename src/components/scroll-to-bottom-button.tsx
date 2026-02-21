'use client'

import { useEffect } from 'react'
import ScrollToBottom, {
  useScrollToBottom,
  useAtBottom
} from 'react-scroll-to-bottom'
import { NoSsr } from './no-ssr'
import { cn } from '~/lib/utils'
import { Button } from './button'
import { ArrowDownIcon } from 'lucide-react'

export function ScrollToBottomButton() {
  const scrollToBottom = useScrollToBottom()
  const [atBottom] = useAtBottom()

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
    <div className='mx-auto w-full max-w-2xl px-3'>
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
            <ArrowDownIcon />
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
        className='h-full touch-pan-y overscroll-contain'
        mode='bottom'
      >
        {children}
      </ScrollToBottom>
    </NoSsr>
  )
}
