'use client'

import {
  createContext,
  useContext,
  useEffect,
  useRef
} from 'react'
import { useInView } from 'react-intersection-observer'
import { cn } from '~/lib/utils'
import { Button } from './button'
import { ArrowDownIcon } from 'lucide-react'

type ScrollToBottomContextValue = {
  scrollToBottom: () => void
  atBottom: boolean
}

const ScrollToBottomContext = createContext<ScrollToBottomContextValue>({
  scrollToBottom: () => {},
  atBottom: true
})

export function ScrollToBottomProvider({
  children
}: {
  children: React.ReactNode
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const atBottomRef = useRef(true)

  const { ref: sentinelRef, inView: atBottom } = useInView({ threshold: 0 })

  // Keep ref in sync for MutationObserver callback
  useEffect(() => {
    atBottomRef.current = atBottom
  }, [atBottom])

  const scrollToBottom = () => {
    const container = containerRef.current
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
    }
  }

  // Auto-scroll when content changes (e.g. streaming) if user is at bottom
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new MutationObserver(() => {
      if (atBottomRef.current) {
        container.scrollTop = container.scrollHeight
      }
    })

    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true
    })

    return () => observer.disconnect()
  }, [])

  return (
    <ScrollToBottomContext.Provider value={{ scrollToBottom, atBottom }}>
      <div
        ref={containerRef}
        className='h-full touch-pan-y overflow-y-auto overscroll-contain'
      >
        {children}
        <div ref={sentinelRef} className='h-px' />
      </div>
    </ScrollToBottomContext.Provider>
  )
}

export function ScrollToBottomButton() {
  const { scrollToBottom, atBottom } = useContext(ScrollToBottomContext)

  return (
    <div className='sticky bottom-4 z-10 mx-auto w-full max-w-2xl px-3'>
      <div
        className={cn(
          'w-fit transition-all duration-300',
          atBottom
            ? 'pointer-events-none translate-y-1 opacity-0'
            : 'pointer-events-auto'
        )}
      >
        <Button
          className='glass-element rounded-full'
          size='icon'
          variant='ghost'
          onClick={scrollToBottom}
        >
          <ArrowDownIcon />
        </Button>
      </div>
    </div>
  )
}
