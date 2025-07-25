'use client'

import { usePathname } from 'next/navigation'
import { createContext, useState, useContext } from 'react'

export const CURRENT_CHAT_ID = 'currentChatId'

export const ChatIdContext = createContext<{
  chatId: string
  changeChatId: (chatId: string) => void
}>({
  chatId: '',
  changeChatId: () => {}
})

export function SessionChatIdProvider({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const hasSession =
    typeof window != 'undefined' &&
    typeof sessionStorage?.getItem(CURRENT_CHAT_ID) === 'string'

  const [chatId, setChatId] = useState<string>(
    hasSession
      ? JSON.parse(sessionStorage.getItem(CURRENT_CHAT_ID) as string)
      : ''
  )

  const changeChatId = (chatId: string) => {
    setChatId(chatId)
    sessionStorage.setItem(CURRENT_CHAT_ID, JSON.stringify(chatId))
  }

  if (!pathname.includes('chat')) {
    return children
  }

  return (
    <ChatIdContext.Provider value={{ chatId, changeChatId }}>
      {children}
    </ChatIdContext.Provider>
  )
}

// Custom hook to use the ChatIdContext
export function useSessionChatId() {
  const context = useContext(ChatIdContext)
  if (!context) {
    throw new Error('useSessionChatId must be used within a ChatIdProvider')
  }
  return [context.chatId, context.changeChatId] as const
}
