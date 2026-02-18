'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Interface } from './interface'
import { chatStore } from '~/stores/chat-store'

export default function Chat() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Initialize chatId from session storage after hydration
  useEffect(() => {
    chatStore.getState().initializeFromStorage()
  }, [])

  // Prefill input from query (e.g. pantry "Use in chat" link)
  useEffect(() => {
    const prompt = searchParams.get('prompt')
    if (prompt) {
      chatStore.getState().setInput(decodeURIComponent(prompt))
      router.replace(pathname, { scroll: false })
    }
  }, [pathname, router, searchParams])

  return (
    <div className='relative flex h-full w-full flex-1 flex-col'>
      <Interface />
    </div>
  )
}
