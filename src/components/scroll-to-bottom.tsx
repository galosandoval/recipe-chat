'use client'

import { createContext, useState } from 'react'
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
  return (
    <>
      <div
        className={`absolute right-4 bottom-20 duration-300 transition-all${
          !sticky
            ? 'translate-y-0 opacity-100'
            : 'invisible translate-y-4 opacity-0'
        }`}
      >
        <button
          className='btn btn-circle glass'
          onClick={() => scrollToBottom({ behavior: 'smooth' })}
        >
          <ArrowSmallDownIcon />
        </button>
      </div>
      <div
        className={`absolute bottom-20 left-4 duration-300 transition-all${
          sticky && enable
            ? 'translate-y-0 opacity-100'
            : 'invisible translate-y-4 opacity-0'
        }`}
      >
        <button
          className='btn btn-circle glass'
          onClick={() => scrollToTop({ behavior: 'smooth' })}
        >
          <ArrowSmallUpIcon />
        </button>
      </div>
    </>
  )
}

export const ScrollModeContext = createContext<{
  scrollMode: 'bottom' | 'top'
  setScrollMode: (mode: 'bottom' | 'top') => void
}>({
  scrollMode: 'top',
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
