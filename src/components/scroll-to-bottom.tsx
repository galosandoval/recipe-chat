'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import ScrollToBottom, {
  useScrollToBottom,
  useScrollToTop,
  useSticky
} from 'react-scroll-to-bottom'
import { ArrowSmallDownIcon, ArrowSmallUpIcon } from './icons'
import { NoSsr } from './no-ssr'

export function ScrollToButtons({ enable }: { enable: boolean }) {
  const scrollToBottom = useScrollToBottom()
  const scrollToTop = useScrollToTop()
  const [sticky] = useSticky()
  const { setScrollMode } = useContext(ScrollModeContext)

  useEffect(() => {
    // if at the bottom and not streaming, scroll to bottom
    if (sticky && !enable) {
      setScrollMode('bottom')
      scrollToBottom({ behavior: 'smooth' })
    }
  }, [sticky, enable])

  return (
    <>
      <div
        className={`absolute bottom-20 left-4 duration-300 transition-all${
          !sticky ? 'translate-y-0 opacity-100' : 'invisible opacity-0'
        }`}
      >
        <button
          className='btn btn-circle glass'
          onClick={() => scrollToTop({ behavior: 'smooth' })}
        >
          <ArrowSmallUpIcon />
        </button>
      </div>
      <div
        className={`absolute bottom-20 left-4 duration-300 transition-all${
          sticky && enable ? 'translate-y-0 opacity-100' : 'invisible opacity-0'
        }`}
      >
        <button
          className='btn btn-circle glass'
          onClick={() => scrollToBottom({ behavior: 'smooth' })}
        >
          <ArrowSmallDownIcon />
        </button>
      </div>
    </>
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
