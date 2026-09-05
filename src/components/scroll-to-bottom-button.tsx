'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import { cn } from '~/lib/utils'
import { Button } from './button'
import { ArrowDownIcon } from 'lucide-react'
import {
  isAtBottom,
  reduceFollow,
  type FollowState,
  type ScrollEvent
} from './scroll-to-bottom-follow'

type ScrollToBottomContextValue = {
  scrollToBottom: () => void
  atBottom: boolean
}

const ScrollToBottomContext = createContext<ScrollToBottomContextValue>({
  scrollToBottom: () => {},
  atBottom: true
})

/**
 * The one scroller every chat surface gets, in every state: the `/chat` route
 * and the chat drawer both mount it, and both branches of the chat interface —
 * welcome screen and messages — render inside it, so scrolling does not change
 * character when the first message is sent.
 *
 * Owns only the DOM wiring; {@link reduceFollow} owns the follow-the-stream
 * decisions.
 */
export function ScrollToBottomProvider({
  children,
  startAtBottom
}: {
  children: React.ReactNode
  /**
   * Whether the view should open pinned to the newest content. True for a chat
   * that already has messages; false for the welcome screen, which reads from
   * the top. Re-pins when it flips, so sending the first message lands on the
   * reply rather than wherever the welcome screen was scrolled to.
   */
  startAtBottom: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const followRef = useRef<FollowState>('following')
  const [atBottom, setAtBottom] = useState(true)

  const dispatch = useCallback((event: ScrollEvent) => {
    const container = containerRef.current
    if (!container) return

    const { state, scrollToBottom } = reduceFollow(followRef.current, event)
    followRef.current = state

    // Jumps are instant, not smooth: a smooth scroll fires `scroll` events all
    // the way down, each one reporting "not at bottom", which would detach the
    // follow state the jump just re-attached.
    if (scrollToBottom) container.scrollTop = container.scrollHeight
    setAtBottom(isAtBottom(container))
  }, [])

  useEffect(() => {
    const container = containerRef.current
    const content = contentRef.current
    if (!container || !content) return

    // The button follows `atBottom` directly rather than the follow state, so
    // it clears the moment the user reaches the bottom.
    const handleScroll = () =>
      dispatch({ type: 'scrolled', atBottom: isAtBottom(container) })

    container.addEventListener('scroll', handleScroll, { passive: true })

    // Content growth is a size change. Watching mutations instead caught
    // route-transition and message-entrance animation churn that brings no new
    // content with it.
    let isFirstObservation = true
    const observer = new ResizeObserver(() => {
      // `observe()` calls back once with the content's current size, which is
      // not growth — acting on it would open the welcome screen at its end.
      if (isFirstObservation) {
        isFirstObservation = false
        setAtBottom(isAtBottom(container))
        return
      }
      dispatch({ type: 'contentResized' })
    })
    observer.observe(content)

    return () => {
      container.removeEventListener('scroll', handleScroll)
      observer.disconnect()
    }
  }, [dispatch])

  useEffect(() => {
    if (startAtBottom) dispatch({ type: 'jumpToBottomRequested' })
  }, [startAtBottom, dispatch])

  const scrollToBottom = () => dispatch({ type: 'jumpToBottomRequested' })

  return (
    <ScrollToBottomContext.Provider value={{ scrollToBottom, atBottom }}>
      <div className='relative h-full'>
        <div
          ref={containerRef}
          // Focusable so the keyboard can scroll a long chat: a scrollable
          // `div` is not in the tab order on its own in Chrome or Safari.
          tabIndex={0}
          className='h-full touch-pan-y overflow-y-auto overscroll-contain'
        >
          <div ref={contentRef}>{children}</div>
        </div>
        <ScrollToBottomButton />
      </div>
    </ScrollToBottomContext.Provider>
  )
}

function ScrollToBottomButton() {
  const { scrollToBottom, atBottom } = useContext(ScrollToBottomContext)

  return (
    <div className='absolute bottom-4 z-10 mx-auto w-full max-w-2xl px-3 md:max-w-3xl'>
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
